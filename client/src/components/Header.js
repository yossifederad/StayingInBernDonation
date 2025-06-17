import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Star } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-bern-500 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Staying in Bern</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-bern-500 transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              to="/donate" 
              className="text-gray-600 hover:text-bern-500 transition-colors duration-200"
            >
              Donate
            </Link>
            <a 
              href={process.env.REACT_APP_GOOGLE_REVIEWS_URL || "#"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-gray-600 hover:text-bern-500 transition-colors duration-200"
            >
              <Star className="w-4 h-4" />
              <span>Reviews</span>
            </a>
          </nav>

          {/* Trust Badges */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="trust-badge">
              <Shield className="w-4 h-4" />
              <span>Secure Payments</span>
            </div>
            <div className="trust-badge">
              <Heart className="w-4 h-4" />
              <span>100% Refundable</span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-bern-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 