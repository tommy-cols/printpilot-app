import React from 'react';
import { useAuth } from '../../lib/AuthContext';
import {
  Download,
  Apple,
  Monitor,
  CheckCircle,
  Copy,
  ExternalLink
} from 'lucide-react';

function DownloadPage() {
  const { license } = useAuth();
  const [copied, setCopied] = React.useState(false);

  const copyLicenseKey = () => {
    if (license?.license_key) {
      navigator.clipboard.writeText(license.license_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-4">
          <Download className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Download PrintPilot</h1>
        <p className="text-slate-600 max-w-md mx-auto">
          Get the desktop app to extract orders from emails and documents with AI-powered automation.
        </p>
      </div>

      {/* Download Buttons */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <a
          href="#"
          className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-primary-300 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-xl bg-slate-900 flex items-center justify-center">
              <Apple className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-500">Download for</p>
              <p className="text-xl font-semibold text-slate-900">macOS</p>
              <p className="text-sm text-slate-500">Apple Silicon (M1/M2/M3)</p>
            </div>
            <Download className="w-5 h-5 text-slate-400 group-hover:text-primary-600 transition-colors" />
          </div>
        </a>

        <a
          href="#"
          className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-primary-300 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center">
              <Monitor className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-500">Download for</p>
              <p className="text-xl font-semibold text-slate-900">Windows</p>
              <p className="text-sm text-slate-500">Windows 10/11 (64-bit)</p>
            </div>
            <Download className="w-5 h-5 text-slate-400 group-hover:text-primary-600 transition-colors" />
          </div>
        </a>
      </div>

      {/* License Key Section */}
      {license && (
        <div className="bg-primary-50 border border-primary-200 rounded-2xl p-6 mb-12">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Your License Key</h3>
          <p className="text-sm text-slate-600 mb-4">
            You'll need this key to activate the desktop app after installation.
          </p>
          <div className="flex items-center space-x-3">
            <code className="flex-1 bg-white px-4 py-3 rounded-lg border border-primary-200 font-mono text-sm">
              {license.license_key}
            </code>
            <button
              onClick={copyLicenseKey}
              className="px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Setup Instructions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Setup Instructions</h3>
        <ol className="space-y-6">
          <li className="flex items-start">
            <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 text-sm font-bold flex items-center justify-center mr-4 flex-shrink-0">
              1
            </span>
            <div>
              <p className="font-medium text-slate-900">Download and install</p>
              <p className="text-sm text-slate-600">
                Download the app for your platform and run the installer. On Mac, drag to Applications.
              </p>
            </div>
          </li>

          <li className="flex items-start">
            <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 text-sm font-bold flex items-center justify-center mr-4 flex-shrink-0">
              2
            </span>
            <div>
              <p className="font-medium text-slate-900">Enter your license key</p>
              <p className="text-sm text-slate-600">
                When prompted, paste your license key: <code className="bg-slate-100 px-2 py-0.5 rounded text-xs">{license?.license_key || 'N/A'}</code>
              </p>
            </div>
          </li>

          <li className="flex items-start">
            <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 text-sm font-bold flex items-center justify-center mr-4 flex-shrink-0">
              3
            </span>
            <div>
              <p className="font-medium text-slate-900">Connect your Printavo account</p>
              <p className="text-sm text-slate-600">
                Go to Settings and enter your Printavo API credentials to enable quote creation.
              </p>
            </div>
          </li>

          <li className="flex items-start">
            <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 text-sm font-bold flex items-center justify-center mr-4 flex-shrink-0">
              4
            </span>
            <div>
              <p className="font-medium text-slate-900">Start extracting!</p>
              <p className="text-sm text-slate-600">
                Paste or drag in emails, PDFs, or images and let AI extract order details automatically.
              </p>
            </div>
          </li>
        </ol>
      </div>

      {/* Help Link */}
      <div className="mt-8 text-center">
        <a href="#" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium">
          <ExternalLink className="w-4 h-4 mr-2" />
          View full documentation
        </a>
      </div>
    </div>
  );
}

export default DownloadPage;
