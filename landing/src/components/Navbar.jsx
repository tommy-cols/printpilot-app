import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Menu, X, User, LogOut, LayoutDashboard, Download, ChevronDown } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const isAuthPage = ['/login', '/signup'].includes(location.pathname);
  const isAppPage = location.pathname.startsWith('/app') || location.pathname === '/dashboard';

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  // Navigation links for marketing pages (not logged in or on marketing pages)
  const marketingLinks = (
    <>
      <Link to="/#features" className="text-slate-600 hover:text-slate-900 transition-colors">
        Features
      </Link>
      <Link to="/pricing" className="text-slate-600 hover:text-slate-900 transition-colors">
        Pricing
      </Link>
      <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">
        Docs
      </a>
    </>
  );

  // Navigation links for app pages (logged in and in app)
  const appLinks = (
    <>
      <Link to="/app" className="text-slate-600 hover:text-slate-900 transition-colors">
        Dashboard
      </Link>
      <Link to="/app/orders" className="text-slate-600 hover:text-slate-900 transition-colors">
        Orders
      </Link>
      <Link to="/app/download" className="text-slate-600 hover:text-slate-900 transition-colors">
        Desktop App
      </Link>
    </>
  );

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? "/app" : "/"} className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">PrintPilot</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated && isAppPage ? appLinks : marketingLinks}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              /* Logged in - show user menu */
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {user?.full_name || user?.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                    <Link
                      to="/app"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/app/download"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Download className="w-4 h-4" />
                      <span>Desktop App</span>
                    </Link>
                    <hr className="my-1 border-slate-200" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Not logged in - show login/signup */
              !isAuthPage && (
                <>
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
                </>
              )
            )}
          </div>

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
              {isAuthenticated && isAppPage ? (
                <>
                  <Link to="/app" className="text-slate-600 hover:text-slate-900">Dashboard</Link>
                  <Link to="/app/orders" className="text-slate-600 hover:text-slate-900">Orders</Link>
                  <Link to="/app/download" className="text-slate-600 hover:text-slate-900">Desktop App</Link>
                  <hr className="border-slate-200" />
                  <button onClick={handleLogout} className="text-slate-600 hover:text-slate-900 text-left">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/#features" className="text-slate-600 hover:text-slate-900">Features</Link>
                  <Link to="/pricing" className="text-slate-600 hover:text-slate-900">Pricing</Link>
                  <a href="#" className="text-slate-600 hover:text-slate-900">Docs</a>
                  <hr className="border-slate-200" />
                  {isAuthenticated ? (
                    <>
                      <Link to="/app" className="text-slate-600 hover:text-slate-900">Dashboard</Link>
                      <button onClick={handleLogout} className="text-slate-600 hover:text-slate-900 text-left">
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="text-slate-600 hover:text-slate-900">Log in</Link>
                      <Link to="/signup" className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium text-center">
                        Start Free Trial
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
