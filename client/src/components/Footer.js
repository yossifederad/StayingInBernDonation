import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Star, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-bern-500 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Staying in Bern</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Supporting our community through transparent donations and secure deposits. 
              We promise to give your money back - unless you don't come.
            </p>
            <div className="flex space-x-4">
              <a 
                href={process.env.REACT_APP_GOOGLE_REVIEWS_URL || "#"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-gray-300 hover:text-bern-400 transition-colors"
              >
                <Star className="w-4 h-4" />
                <span>Read Reviews</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-300 hover:text-bern-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/donate" 
                  className="text-gray-300 hover:text-bern-400 transition-colors"
                >
                  Donate
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:info@stayinginbern.ch" 
                  className="text-gray-300 hover:text-bern-400 transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Trust & Security */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Trust & Security</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-300">
                <Shield className="w-4 h-4 text-bern-400" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Heart className="w-4 h-4 text-bern-400" />
                <span>100% Refundable</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Star className="w-4 h-4 text-bern-400" />
                <span>Trusted by Community</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Staying in Bern. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a 
              href="mailto:info@stayinginbern.ch" 
              className="text-gray-400 hover:text-bern-400 transition-colors"
            >
              <Mail className="w-4 h-4" />
            </a>
            <a 
              href="tel:+41XXXXXXXXX" 
              className="text-gray-400 hover:text-bern-400 transition-colors"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 