"""
PrintPilot Backend - Production Ready
Single pricing tier: $60/month
"""
import os
import json
import logging
from datetime import datetime, timedelta
from typing import Optional, List
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("printpilot")

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import httpx
import anthropic
import stripe
from supabase import create_client, Client

load_dotenv()

# ============================================================
# Configuration
# ============================================================
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
STRIPE_PRICE_ID = os.getenv("STRIPE_PRICE_ID")  # Your $60/month price

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
DEV_MODE = os.getenv("DEV_MODE", "false").lower() == "true"

# Initialize clients
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY) if SUPABASE_URL else None
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY) if SUPABASE_SERVICE_KEY else None

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY

security = HTTPBearer(auto_error=False)

# ============================================================
# Lifespan
# ============================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    missing = []
    if not SUPABASE_URL: missing.append("SUPABASE_URL")
    if not ANTHROPIC_API_KEY: missing.append("ANTHROPIC_API_KEY")
    if missing:
        logger.warning(f"Missing environment variables: {', '.join(missing)}")
    else:
        logger.info("All systems ready")
    yield

app = FastAPI(title="PrintPilot API", version="2.0.0", lifespan=lifespan)

# CORS - update with your actual domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://printpilot.space",
        "https://www.printpilot.space",
        "https://printpilot.io",
        "https://www.printpilot.io",
        FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# Models
# ============================================================
class UserProfile(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None

class License(BaseModel):
    id: str
    license_key: str
    plan: str
    status: str
    extractions_limit: int
    extractions_used: int
    extractions_remaining: int
    expires_at: Optional[str] = None

class LicenseValidateResponse(BaseModel):
    valid: bool
    license: Optional[License] = None
    message: str

class ExtractionResult(BaseModel):
    success: bool
    items: List[dict] = []
    overall_confidence: float = 0.0
    flags: List[str] = []
    extraction_notes: str = ""
    error: Optional[str] = None

class NaturalLanguageRequest(BaseModel):
    query: str
    printavo_email: str
    printavo_token: str

class NaturalLanguageResponse(BaseModel):
    success: bool
    query_type: str = ""
    formatted_response: str = ""
    error: Optional[str] = None

# ============================================================
# Auth Helpers
# ============================================================
async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[UserProfile]:
    if not credentials or not supabase:
        return None
    try:
        token = credentials.credentials
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            return None
        user = user_response.user
        profile = supabase_admin.table('profiles').select('*').eq('id', user.id).single().execute()
        if profile.data:
            return UserProfile(
                id=profile.data['id'],
                email=profile.data['email'],
                full_name=profile.data.get('full_name')
            )
        return UserProfile(id=user.id, email=user.email)
    except Exception as e:
        logger.error(f"Auth error: {e}")
        return None

async def require_auth(user: Optional[UserProfile] = Depends(get_current_user)) -> UserProfile:
    if not user:
        raise HTTPException(401, "Authentication required")
    return user

async def get_user_license(user: UserProfile) -> Optional[License]:
    if not supabase_admin:
        return None
    try:
        result = supabase_admin.table('licenses')\
            .select('*')\
            .eq('user_id', user.id)\
            .eq('status', 'active')\
            .order('created_at', desc=True)\
            .limit(1)\
            .execute()
        if result.data and len(result.data) > 0:
            lic = result.data[0]
            return License(
                id=lic['id'],
                license_key=lic['license_key'],
                plan=lic['plan'],
                status=lic['status'],
                extractions_limit=lic['extractions_limit'],
                extractions_used=lic['extractions_used'],
                extractions_remaining=lic['extractions_limit'] - lic['extractions_used'],
                expires_at=lic.get('current_period_end')
            )
        return None
    except Exception as e:
        logger.error(f"License lookup error: {e}")
        return None

async def require_valid_license(user: UserProfile = Depends(require_auth)) -> tuple[UserProfile, License]:
    license = await get_user_license(user)
    if not license:
        raise HTTPException(403, "No active license. Please subscribe at printpilot.io/pricing")
    if license.extractions_remaining <= 0:
        raise HTTPException(429, "Monthly extraction limit reached. Resets next billing cycle.")
    return user, license

# ============================================================
# Auth Endpoints
# ============================================================
@app.post("/api/auth/signup")
async def signup(email: str = Form(...), password: str = Form(...), full_name: str = Form(None)):
    if not supabase:
        raise HTTPException(500, "Auth not configured")
    try:
        response = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {"data": {"full_name": full_name}}
        })
        if response.user:
            return {"success": True, "message": "Check your email to verify your account."}
        raise HTTPException(400, "Signup failed")
    except Exception as e:
        raise HTTPException(400, str(e))

@app.post("/api/auth/login")
async def login(email: str = Form(...), password: str = Form(...)):
    if not supabase:
        raise HTTPException(500, "Auth not configured")
    try:
        response = supabase.auth.sign_in_with_password({"email": email, "password": password})
        if response.user and response.session:
            return {
                "success": True,
                "access_token": response.session.access_token,
                "refresh_token": response.session.refresh_token,
                "expires_at": response.session.expires_at,
                "user": {"id": response.user.id, "email": response.user.email}
            }
        raise HTTPException(401, "Invalid credentials")
    except Exception as e:
        raise HTTPException(401, "Invalid credentials")

@app.post("/api/auth/logout")
async def logout(user: UserProfile = Depends(require_auth)):
    try:
        supabase.auth.sign_out()
    except Exception as e:
        logger.warning(f"Logout cleanup failed: {e}")
    return {"success": True}

@app.get("/api/auth/me")
async def get_me(user: UserProfile = Depends(require_auth)):
    license = await get_user_license(user)
    return {"user": user.dict(), "license": license.dict() if license else None}

@app.post("/api/auth/refresh")
async def refresh_token(refresh_token: str = Form(...)):
    if not supabase:
        raise HTTPException(500, "Auth not configured")
    try:
        response = supabase.auth.refresh_session(refresh_token)
        if response.session:
            return {
                "success": True,
                "access_token": response.session.access_token,
                "refresh_token": response.session.refresh_token,
                "expires_at": response.session.expires_at
            }
        raise HTTPException(401, "Invalid refresh token")
    except Exception as e:
        logger.warning(f"Token refresh failed: {e}")
        raise HTTPException(401, "Invalid refresh token")

# ============================================================
# License Endpoints
# ============================================================
@app.get("/api/license")
async def get_license(user: UserProfile = Depends(require_auth)):
    license = await get_user_license(user)
    if license:
        return LicenseValidateResponse(valid=True, license=license, message="License active")
    return LicenseValidateResponse(valid=False, message="No active license")

@app.post("/api/validate-license")
async def validate_license_key(license_key: str = Form(...)):
    """Legacy endpoint for desktop app license validation"""
    # Dev license for testing - only available when DEV_MODE is enabled
    if DEV_MODE and license_key == "TEST-0000-0000-0001":
        return LicenseValidateResponse(
            valid=True,
            license=License(
                id="dev", license_key=license_key, plan="pro", status="active",
                extractions_limit=999999, extractions_used=0, extractions_remaining=999999
            ),
            message="Dev license valid"
        )
    
    if not supabase_admin:
        return LicenseValidateResponse(valid=False, message="Database not configured")
    
    try:
        result = supabase_admin.table('licenses')\
            .select('*')\
            .eq('license_key', license_key)\
            .eq('status', 'active')\
            .single()\
            .execute()
        if result.data:
            lic = result.data
            return LicenseValidateResponse(
                valid=True,
                license=License(
                    id=lic['id'], license_key=lic['license_key'], plan=lic['plan'],
                    status=lic['status'], extractions_limit=lic['extractions_limit'],
                    extractions_used=lic['extractions_used'],
                    extractions_remaining=lic['extractions_limit'] - lic['extractions_used'],
                    expires_at=lic.get('current_period_end')
                ),
                message="License valid"
            )
        return LicenseValidateResponse(valid=False, message="Invalid license key")
    except Exception as e:
        logger.error(f"License validation error: {e}")
        return LicenseValidateResponse(valid=False, message="Invalid license key")

# ============================================================
# Stripe Checkout & Webhooks
# ============================================================
@app.post("/api/checkout/create")
async def create_checkout_session(user: UserProfile = Depends(require_auth)):
    """Create Stripe checkout session for $60/month subscription"""
    if not STRIPE_SECRET_KEY or not STRIPE_PRICE_ID:
        raise HTTPException(500, "Payments not configured")
    
    try:
        session = stripe.checkout.Session.create(
            customer_email=user.email,
            payment_method_types=["card"],
            line_items=[{"price": STRIPE_PRICE_ID, "quantity": 1}],
            mode="subscription",
            success_url=f"{FRONTEND_URL}/dashboard?checkout=success",
            cancel_url=f"{FRONTEND_URL}/pricing?checkout=cancelled",
            metadata={"user_id": user.id, "user_email": user.email}
        )
        return {"checkout_url": session.url}
    except Exception as e:
        raise HTTPException(500, f"Failed to create checkout: {e}")

@app.get("/api/billing/portal")
async def create_billing_portal(user: UserProfile = Depends(require_auth)):
    """Create Stripe billing portal for managing subscription"""
    if not STRIPE_SECRET_KEY:
        raise HTTPException(500, "Payments not configured")
    
    # Find customer's Stripe ID
    license = await get_user_license(user)
    if not license:
        raise HTTPException(404, "No active subscription")
    
    try:
        lic_data = supabase_admin.table('licenses')\
            .select('stripe_customer_id')\
            .eq('id', license.id)\
            .single()\
            .execute()
        
        if not lic_data.data or not lic_data.data.get('stripe_customer_id'):
            raise HTTPException(404, "No billing info found")
        
        portal = stripe.billing_portal.Session.create(
            customer=lic_data.data['stripe_customer_id'],
            return_url=f"{FRONTEND_URL}/dashboard"
        )
        return {"portal_url": portal.url}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Failed to create portal: {e}")

@app.post("/api/webhooks/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(500, "Webhook not configured")
    
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except Exception as e:
        raise HTTPException(400, f"Webhook error: {e}")
    
    event_type = event['type']
    data = event['data']['object']
    
    logger.info(f"Stripe webhook received: {event_type}")
    
    if event_type == 'checkout.session.completed':
        # New subscription - create license
        customer_id = data['customer']
        subscription_id = data.get('subscription')
        user_email = data.get('customer_email') or data['customer_details']['email']
        user_id = data['metadata'].get('user_id')
        
        # Find user
        if not user_id:
            user_result = supabase_admin.table('profiles')\
                .select('id').eq('email', user_email).single().execute()
            if user_result.data:
                user_id = user_result.data['id']
        
        if user_id:
            # Deactivate any existing licenses
            supabase_admin.table('licenses')\
                .update({'status': 'cancelled'})\
                .eq('user_id', user_id)\
                .eq('status', 'active')\
                .execute()
            
            # Create new license
            import random, string
            license_key = 'PP-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=12))
            
            supabase_admin.table('licenses').insert({
                'user_id': user_id,
                'license_key': license_key,
                'plan': 'pro',
                'status': 'active',
                'stripe_customer_id': customer_id,
                'stripe_subscription_id': subscription_id,
                'extractions_limit': 1000,  # Generous limit for $60/mo
                'extractions_used': 0,
                'current_period_start': datetime.utcnow().isoformat(),
                'current_period_end': (datetime.utcnow() + timedelta(days=30)).isoformat()
            }).execute()
            logger.info(f"Created license {license_key} for {user_email}")
    
    elif event_type == 'customer.subscription.updated':
        subscription_id = data['id']
        status = data['status']
        
        # Map Stripe status to our status
        status_map = {
            'active': 'active',
            'past_due': 'past_due',
            'canceled': 'cancelled',
            'unpaid': 'past_due',
        }
        new_status = status_map.get(status, 'active')
        
        # Update period dates
        period_end = datetime.fromtimestamp(data['current_period_end']).isoformat()
        
        supabase_admin.table('licenses')\
            .update({
                'status': new_status,
                'current_period_end': period_end,
                'extractions_used': 0  # Reset on renewal
            })\
            .eq('stripe_subscription_id', subscription_id)\
            .execute()
        logger.info(f"Updated subscription {subscription_id} to {new_status}")
    
    elif event_type == 'customer.subscription.deleted':
        subscription_id = data['id']
        supabase_admin.table('licenses')\
            .update({'status': 'cancelled'})\
            .eq('stripe_subscription_id', subscription_id)\
            .execute()
        logger.info(f"Cancelled subscription {subscription_id}")
    
    elif event_type == 'invoice.payment_failed':
        customer_id = data['customer']
        supabase_admin.table('licenses')\
            .update({'status': 'past_due'})\
            .eq('stripe_customer_id', customer_id)\
            .eq('status', 'active')\
            .execute()
        logger.warning(f"Payment failed for customer {customer_id}")
    
    return {"received": True}

# ============================================================
# AI Endpoints
# ============================================================
@app.post("/api/extract", response_model=ExtractionResult)
async def extract_order_data(
    text_content: str = Form(""),
    files: List[UploadFile] = File(default=[]),
    # For desktop app using license key directly
    license_key: Optional[str] = Form(None),
    # For web app using JWT
    auth: Optional[tuple] = Depends(lambda: None)
):
    """Extract order data using Claude AI"""
    if not ANTHROPIC_API_KEY:
        raise HTTPException(500, "AI not configured")
    
    # Validate license (either by key or JWT)
    user_id = None
    license_id = None
    
    if license_key:
        # Desktop app flow
        if DEV_MODE and license_key == "TEST-0000-0000-0001":
            pass  # Dev license, skip tracking
        elif supabase_admin:
            lic_result = supabase_admin.table('licenses')\
                .select('*').eq('license_key', license_key).eq('status', 'active').single().execute()
            if not lic_result.data:
                return ExtractionResult(success=False, error="Invalid or expired license")
            if lic_result.data['extractions_used'] >= lic_result.data['extractions_limit']:
                return ExtractionResult(success=False, error="Monthly extraction limit reached")
            user_id = lic_result.data['user_id']
            license_id = lic_result.data['id']
    
    # Build content for Claude
    content_parts = []
    
    if text_content.strip():
        content_parts.append({"type": "text", "text": f"Order content:\n{text_content}"})
    
    for file in files:
        file_bytes = await file.read()
        if file.content_type and file.content_type.startswith('image/'):
            import base64
            b64 = base64.standard_b64encode(file_bytes).decode('utf-8')
            content_parts.append({
                "type": "image",
                "source": {"type": "base64", "media_type": file.content_type, "data": b64}
            })
        else:
            try:
                text = file_bytes.decode('utf-8')
                content_parts.append({"type": "text", "text": f"File '{file.filename}':\n{text}"})
            except UnicodeDecodeError:
                content_parts.append({"type": "text", "text": f"[Binary file: {file.filename}]"})
    
    if not content_parts:
        return ExtractionResult(success=False, error="No content provided")
    
    content_parts.append({
        "type": "text",
        "text": """Extract all order line items. Return JSON array with objects:
- qty (integer)
- size (string: XS, S, M, L, XL, 2XL, 3XL, 4XL, 5XL, YXS, YS, YM, YL, YXL, or OSFA)
- item_num (string: product/style number)
- color (string)
- confidence (float 0-1)

Return ONLY the JSON array, no other text. If no items found, return []."""
    })
    
    try:
        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            messages=[{"role": "user", "content": content_parts}]
        )
        
        response_text = response.content[0].text.strip()
        
        # Parse JSON
        import re
        if response_text.startswith('['):
            items = json.loads(response_text)
        else:
            json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
            items = json.loads(json_match.group()) if json_match else []
        
        overall_confidence = sum(i.get('confidence', 0.8) for i in items) / len(items) if items else 0
        
        # Track usage
        if license_id and supabase_admin:
            supabase_admin.rpc('increment_extraction', {'p_license_id': license_id}).execute()
            supabase_admin.table('extractions').insert({
                'user_id': user_id,
                'license_id': license_id,
                'input_type': 'mixed' if files else 'text',
                'items_extracted': len(items),
                'confidence_score': round(overall_confidence, 2)
            }).execute()
        
        return ExtractionResult(
            success=True,
            items=items,
            overall_confidence=round(overall_confidence, 2),
            extraction_notes=f"Extracted {len(items)} items"
        )
    except json.JSONDecodeError as e:
        return ExtractionResult(success=False, error=f"Failed to parse response: {e}")
    except Exception as e:
        return ExtractionResult(success=False, error=str(e))

@app.post("/api/natural-query", response_model=NaturalLanguageResponse)
async def natural_language_query(
    request: NaturalLanguageRequest,
    license_key: Optional[str] = Form(None),
):
    """Natural language query about Printavo data"""
    if not ANTHROPIC_API_KEY:
        raise HTTPException(500, "AI not configured")
    
    # Validate license
    if license_key and not (DEV_MODE and license_key == "TEST-0000-0000-0001"):
        if supabase_admin:
            lic = supabase_admin.table('licenses')\
                .select('id').eq('license_key', license_key).eq('status', 'active').single().execute()
            if not lic.data:
                return NaturalLanguageResponse(success=False, error="Invalid license")
    
    prompt = f"""You are a Printavo assistant. User asked: "{request.query}"

Determine the query type and provide a helpful response.
Query types: customer_lookup, invoice_search, analytics, general

Respond with JSON:
{{"query_type": "...", "formatted_response": "Your markdown-formatted response"}}"""

    try:
        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2048,
            messages=[{"role": "user", "content": prompt}]
        )
        
        import re
        response_text = response.content[0].text.strip()
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        result = json.loads(json_match.group()) if json_match else {"query_type": "general", "formatted_response": response_text}
        
        return NaturalLanguageResponse(
            success=True,
            query_type=result.get('query_type', 'general'),
            formatted_response=result.get('formatted_response', '')
        )
    except Exception as e:
        return NaturalLanguageResponse(success=False, error=str(e))

# ============================================================
# Dev/Testing Endpoints (only available in DEV_MODE)
# ============================================================
@app.post("/api/dev/create-test-license")
async def create_test_license(user: UserProfile = Depends(require_auth)):
    """Create a test license for development - only works when DEV_MODE=true"""
    if not DEV_MODE:
        raise HTTPException(403, "Dev endpoints are disabled in production")

    if not supabase_admin:
        raise HTTPException(500, "Database not configured")

    # Check if user already has an active license
    existing = await get_user_license(user)
    if existing:
        return {
            "success": True,
            "message": "You already have an active license",
            "license": existing.dict()
        }

    # Create test license
    import random, string
    license_key = 'PP-TEST-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

    try:
        result = supabase_admin.table('licenses').insert({
            'user_id': user.id,
            'license_key': license_key,
            'plan': 'pro',
            'status': 'active',
            'extractions_limit': 100,
            'extractions_used': 0,
            'current_period_start': datetime.utcnow().isoformat(),
            'current_period_end': (datetime.utcnow() + timedelta(days=30)).isoformat()
        }).execute()

        logger.info(f"Created test license {license_key} for {user.email}")

        return {
            "success": True,
            "message": "Test license created",
            "license_key": license_key,
            "expires_in_days": 30
        }
    except Exception as e:
        logger.error(f"Failed to create test license: {e}")
        raise HTTPException(500, f"Failed to create license: {e}")

# ============================================================
# Health & Info
# ============================================================
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "ai": bool(ANTHROPIC_API_KEY),
        "auth": bool(SUPABASE_URL),
        "payments": bool(STRIPE_SECRET_KEY)
    }

@app.get("/")
async def root():
    return {"service": "PrintPilot API", "version": "2.0.0", "docs": "/docs"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
