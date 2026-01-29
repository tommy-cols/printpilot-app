import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { 
  Sparkles, 
  Download, 
  CreditCard, 
  LogOut,
  FileText,
  Zap
} from 'lucide-react';

function Dashboard() {
  const { user, license, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {user.full_name || user.email}!
          </h1>
          <p className="text-slate-600">Manage your PrintPilot account</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </div>
      
      {/* License Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Your License</h2>
          {license && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              license.status === 'active' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-amber-100 text-amber-700'
            }`}>
              {license.status === 'active' ? 'Active' : license.status}
            </span>
          )}
        </div>
        
        {license ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-500">Plan</p>
                <p className="font-semibold text-slate-900 capitalize">{license.plan}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">License Key</p>
                <p className="font-mono text-sm text-slate-900">{license.license_key}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Extractions Used</p>
                <p className="font-semibold text-slate-900">
                  {license.extractions_used} / {license.extractions_limit}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Remaining</p>
                <p className="font-semibold text-slate-900">{license.extractions_remaining}</p>
              </div>
            </div>
            
            {/* Usage bar */}
            <div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${Math.min(100, (license.extractions_used / license.extractions_limit) * 100)}%` 
                  }}
                />
              </div>
            </div>
            
            {license.plan === 'trial' && (
              <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <p className="text-primary-800 text-sm">
                  <strong>Trial expires soon!</strong> Upgrade to keep using PrintPilot.
                </p>
                <Link 
                  to="/pricing" 
                  className="inline-block mt-2 text-primary-600 font-medium hover:text-primary-700"
                >
                  View pricing →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-600 mb-4">No active license found.</p>
            <Link 
              to="/pricing" 
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Get a License
            </Link>
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900">Download App</h3>
          </div>
          <p className="text-slate-600 text-sm mb-4">
            Get the PrintPilot desktop app for Mac or Windows.
          </p>
          <div className="flex space-x-3">
            <a 
              href="#" 
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
            >
              Mac (Apple Silicon)
            </a>
            <a 
              href="#" 
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
            >
              Windows
            </a>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900">Documentation</h3>
          </div>
          <p className="text-slate-600 text-sm mb-4">
            Learn how to set up and use PrintPilot effectively.
          </p>
          <a 
            href="#" 
            className="inline-block px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
          >
            View Docs
          </a>
        </div>
      </div>
      
      {/* Setup Instructions */}
      <div className="mt-6 bg-slate-50 rounded-2xl p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Quick Setup</h3>
        <ol className="space-y-3 text-sm text-slate-700">
          <li className="flex items-start">
            <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center mr-3 mt-0.5">1</span>
            <span>Download and install the PrintPilot app</span>
          </li>
          <li className="flex items-start">
            <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center mr-3 mt-0.5">2</span>
            <span>Enter your license key: <code className="bg-white px-2 py-0.5 rounded border">{license?.license_key || 'N/A'}</code></span>
          </li>
          <li className="flex items-start">
            <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center mr-3 mt-0.5">3</span>
            <span>Connect your Printavo account (Settings → Printavo API)</span>
          </li>
          <li className="flex items-start">
            <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center mr-3 mt-0.5">4</span>
            <span>Start extracting orders with AI!</span>
          </li>
        </ol>
      </div>
    </div>
  );
}

export default Dashboard;
