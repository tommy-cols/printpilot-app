import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  FileText, 
  Users, 
  RefreshCw, 
  Calendar,
  Zap,
  Shield,
  ArrowRight,
  Check,
  MessageSquare
} from 'lucide-react';

function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by Claude AI
            </div>
            
            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
              Supercharge Your{' '}
              <span className="text-primary-600">Printavo</span>{' '}
              Workflow
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Drop messy order files, get clean quotes in seconds. PrintPilot uses AI to extract orders, 
              answer questions about your data, and automate the tedious stuff.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/signup" 
                className="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <a 
                href="#demo" 
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 rounded-xl font-semibold text-lg border border-slate-300 hover:border-slate-400 transition-colors"
              >
                Watch Demo
              </a>
            </div>
            
            {/* Trust indicators */}
            <p className="mt-6 text-sm text-slate-500">
              No credit card required • 14-day free trial • Works with your existing Printavo account
            </p>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200 rounded-full opacity-20 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl" />
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Three simple steps to transform your quoting process
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Drop Your Files"
              description="Drag and drop PDFs, emails, CSVs, or images. Even messy handwritten orders work."
            />
            <StepCard
              number="2"
              title="AI Extracts Data"
              description="Claude AI reads and understands your order, extracting items, sizes, colors, and quantities."
            />
            <StepCard
              number="3"
              title="Create Quote"
              description="Review the extracted data, pick your customer, and create a Printavo quote with one click."
            />
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Work Faster
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              A suite of AI-powered tools designed specifically for print shops using Printavo
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={FileText}
              title="AI Quote Creator"
              description="Extract order details from any file format and create Printavo quotes automatically."
              badge="Most Popular"
            />
            <FeatureCard
              icon={MessageSquare}
              title="Natural Language Search"
              description="Ask questions like 'What is Acme Corp's last order?' and get instant answers."
            />
            <FeatureCard
              icon={Users}
              title="Sales Rep Reports"
              description="See which rep owns each customer with full revenue breakdowns."
            />
            <FeatureCard
              icon={RefreshCw}
              title="Bulk Status Updates"
              description="Update hundreds of invoices at once. Save hours of clicking."
            />
            <FeatureCard
              icon={Calendar}
              title="Date Validator"
              description="Block holidays and get warnings before scheduling conflicts."
            />
            <FeatureCard
              icon={Shield}
              title="Secure & Private"
              description="Your data never leaves your machine. API keys stored locally with encryption."
            />
          </div>
        </div>
      </section>
      
      {/* Social Proof / Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatCard value="10x" label="Faster Quoting" />
            <StatCard value="500+" label="Print Shops" />
            <StatCard value="50K+" label="Quotes Created" />
            <StatCard value="99.9%" label="Uptime" />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Stop the Copy-Paste Chaos?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join hundreds of print shops already saving hours every week with PrintPilot.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/signup" 
              className="w-full sm:w-auto px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold text-lg hover:bg-primary-50 transition-colors"
            >
              Start Your Free Trial
            </Link>
            <Link 
              to="/pricing" 
              className="w-full sm:w-auto px-8 py-4 bg-primary-500 text-white rounded-xl font-semibold text-lg border border-primary-400 hover:bg-primary-500/80 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function StepCard({ number, title, description }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-bold text-xl flex items-center justify-center mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, badge }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-primary-300 hover:shadow-lg transition-all">
      <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {badge && (
          <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
            {badge}
          </span>
        )}
      </div>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">{value}</div>
      <div className="text-slate-600">{label}</div>
    </div>
  );
}

export default Home;
