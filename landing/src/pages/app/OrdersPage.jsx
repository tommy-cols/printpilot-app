import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { useTrialConfig } from '../../lib/TrialContext';
import {
  FileText,
  Search,
  Filter,
  Download,
  AlertCircle,
  Plus
} from 'lucide-react';

function OrdersPage() {
  const { license } = useAuth();
  const { showTrialFeatures } = useTrialConfig();

  const isTrial = license?.plan === 'trial';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Trial Banner */}
      {showTrialFeatures && isTrial && (
        <div className="mb-6 p-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-medium">Trial Mode</p>
              <p className="text-sm text-primary-100">Limited to {license?.extractions_limit} extractions</p>
            </div>
          </div>
          <Link
            to="/pricing"
            className="px-4 py-2 bg-white text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors"
          >
            Upgrade
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-600">View and manage your extracted orders</p>
        </div>
        <Link
          to="/app/download"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Extraction
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4 mr-2 text-slate-500" />
            Filters
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4 mr-2 text-slate-500" />
            Export
          </button>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No orders yet</h3>
        <p className="text-slate-600 max-w-md mx-auto mb-6">
          Orders extracted using the desktop app will appear here. Download the app to get started.
        </p>
        <Link
          to="/app/download"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Desktop App
        </Link>
      </div>

      {/* Example Table Structure (hidden when empty) */}
      {false && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Order</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Customer</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Items</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Total</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* Order rows would go here */}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
