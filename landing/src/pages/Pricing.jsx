import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function Pricing() {
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      navigate('/signup?redirect=pricing');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/checkout/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const features = [
    '1,000 AI extractions per month',
    'Unlimited Printavo quotes',
    'Natural language search',
    'Sales rep reports',
    'Bulk status updates',
    'Priority email support',
    'All future features included',
  ];
  
  return (
    <div className="py-20 bg-gradient-to-b from-slate-50 to-white min-h-[calc(100vh-200px)]">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Simple Pricing
          </h1>
          <p className="text-xl text-slate-600">
            One plan. Everything included. Cancel anytime.
          </p>
        </div>
        
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl border-2 border-primary-500 shadow-xl p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">PrintPilot Pro</h2>
              <p className="text-slate-600">Everything you need to supercharge Printavo</p>
            </div>
            
            <div className="text-center mb-8">
              <div className="flex items-baseline justify-center">
                <span className="text-5xl font-bold text-slate-900">$60</span>
                <span className="text-slate-600 ml-2">/month</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">Billed monthly • Cancel anytime</p>
            </div>
            
            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-5 h-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Loading...
                </>
              ) : isAuthenticated ? (
                'Subscribe Now'
              ) : (
                'Get Started'
              )}
            </button>
            
            {!isAuthenticated && (
              <p className="text-center text-sm text-slate-500 mt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:underline">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </div>
        
        <div className="mt-16 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-slate-900 text-center mb-8">
            Common Questions
          </h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">What counts as an extraction?</h4>
              <p className="text-slate-600">Each time you use AI to parse an order file counts as one extraction. Creating quotes and searching do not count.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Do I need a Printavo account?</h4>
              <p className="text-slate-600">Yes, PrintPilot connects to your existing Printavo account via their API.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Can I cancel anytime?</h4>
              <p className="text-slate-600">Yes, cancel with one click from your dashboard. You keep access until the end of your billing period.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-slate-500 text-sm">
            🔒 Secure payment via Stripe
          </p>
        </div>
      </div>
    </div>
  );
}

export default Pricing;
