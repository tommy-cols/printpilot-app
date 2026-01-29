import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Menu, X } from 'lucide-react';

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);
  
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">PrintPilot</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/#features" className="text-slate-600 hover:text-slate-900 transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="text-slate-600 hover:text-slate-900 transition-colors">
              Pricing
            </Link>
            <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">
              Docs
            </a>
          </div>
          
          {/* Auth Buttons */}
          {!isAuthPage && (
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Log in
              </Link>
              <Link 
                to="/signup" 
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          )}
          
          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100">
            <div className="flex flex-col space-y-4">
              <Link to="/#features" className="text-slate-600 hover:text-slate-900">Features</Link>
              <Link to="/pricing" className="text-slate-600 hover:text-slate-900">Pricing</Link>
              <a href="#" className="text-slate-600 hover:text-slate-900">Docs</a>
              <hr className="border-slate-200" />
              <Link to="/login" className="text-slate-600 hover:text-slate-900">Log in</Link>
              <Link to="/signup" className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium text-center">
                Start Free Trial
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
