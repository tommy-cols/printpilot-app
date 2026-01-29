import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { useTrialConfig } from '../../lib/TrialContext';
import {
  Sparkles,
  Download,
  FileText,
  TrendingUp,
  Clock,
  Zap,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

function AppDashboard() {
  const { user, license } = useAuth();
  const { showTrialFeatures } = useTrialConfig();

  const isTrial = license?.plan === 'trial';
  const usagePercent = license ? Math.min(100, (license.extractions_used / license.extractions_limit) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Trial Banner */}
      {showTrialFeatures && isTrial && (
        <div className="mb-6 p-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-medium">You're on a free trial</p>
              <p className="text-sm text-primary-100">Upgrade to unlock unlimited extractions and all features</p>
            </div>
          </div>
          <Link
            to="/pricing"
            className="px-4 py-2 bg-white text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors"
          >
            Upgrade Now
          </Link>
        </div>
      )}

      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.full_name || user?.email?.split('@')[0]}!
        </h1>
        <p className="text-slate-600">Here's what's happening with your PrintPilot account</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Usage Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            {showTrialFeatures && isTrial && (
              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                Trial
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mb-1">Extractions Used</p>
          <p className="text-2xl font-bold text-slate-900">
            {license?.extractions_used || 0}
            <span className="text-sm font-normal text-slate-500"> / {license?.extractions_limit || 0}</span>
          </p>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${usagePercent > 80 ? 'bg-amber-500' : 'bg-primary-500'}`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-slate-500 mb-1">Orders Processed</p>
          <p className="text-2xl font-bold text-slate-900">--</p>
          <p className="text-sm text-slate-500 mt-1">This month</p>
        </div>

        {/* Time Saved Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-slate-500 mb-1">Time Saved</p>
          <p className="text-2xl font-bold text-slate-900">--</p>
          <p className="text-sm text-slate-500 mt-1">Estimated hours</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Get Started Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Get Started with PrintPilot</h3>
          <p className="text-slate-300 text-sm mb-4">
            Download the desktop app to start extracting orders from your emails and documents with AI.
          </p>
          <Link
            to="/app/download"
            className="inline-flex items-center px-4 py-2 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download App
          </Link>
        </div>

        {/* License Info Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Your License</h3>
          {license ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Plan</span>
                <span className="font-medium text-slate-900 capitalize">{license.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  license.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {license.status === 'active' ? 'Active' : license.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">License Key</span>
                <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{license.license_key}</code>
              </div>
              {showTrialFeatures && isTrial && (
                <Link
                  to="/pricing"
                  className="block text-center mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Upgrade Plan
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-slate-600 mb-3">No active license</p>
              <Link
                to="/pricing"
                className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700"
              >
                Get a license <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity (Placeholder) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
          <Link to="/app/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all
          </Link>
        </div>
        <div className="text-center py-8 text-slate-500">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p>No recent activity</p>
          <p className="text-sm">Start extracting orders to see your activity here</p>
        </div>
      </div>
    </div>
  );
}

export default AppDashboard;
