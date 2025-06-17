import React from 'react';
import { Link } from 'react-router-dom';
import { useDonation } from '../context/DonationContext';
import { Heart, Shield, Star, Users, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';

const HomePage = () => {
  const { stats, recentDonations, loading } = useDonation();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-shadow">
              Welcome to Staying in Bern
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Supporting our community through transparent donations and secure deposits. 
              We promise to give your money back - unless you don't come.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/donate" className="btn-primary text-lg px-8 py-4">
                Make a Donation
              </Link>
              <a 
                href={process.env.REACT_APP_GOOGLE_REVIEWS_URL || "#"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-outline text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-bern-500"
              >
                Read Our Reviews
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Trust Us?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We believe in transparency, security, and community. Here's why people choose to support us.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-bern-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-bern-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-gray-600">
                All payments are processed securely through Stripe, ensuring your financial information is protected.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-bern-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-bern-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">100% Refundable</h3>
              <p className="text-gray-600">
                Deposits are fully refundable. We only keep your money if you don't show up to our events.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-bern-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-bern-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Trusted</h3>
              <p className="text-gray-600">
                Join hundreds of satisfied community members who have supported our mission.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Impact
            </h2>
            <p className="text-lg text-gray-600">
              See how our community has grown and the impact of your support.
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bern-500 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="card text-center">
                <div className="w-12 h-12 bg-bern-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-bern-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {stats.totalDonations}
                </h3>
                <p className="text-gray-600">Total Contributions</p>
              </div>
              
              <div className="card text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {formatCurrency(stats.totalAmount)}
                </h3>
                <p className="text-gray-600">Total Amount</p>
              </div>
              
              <div className="card text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {stats.donations}
                </h3>
                <p className="text-gray-600">Donations</p>
              </div>
              
              <div className="card text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {stats.deposits}
                </h3>
                <p className="text-gray-600">Deposits</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Recent Donations */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Recent Supporters
            </h2>
            <p className="text-lg text-gray-600">
              Thank you to our recent contributors for their support.
            </p>
          </div>
          
          {recentDonations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentDonations.slice(0, 6).map((donation, index) => (
                <div key={index} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{donation.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      donation.payment_type === 'donation' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {donation.payment_type === 'donation' ? 'Donation' : 'Deposit'}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-bern-600 mb-2">
                    {formatCurrency(donation.amount)}
                  </p>
                  {donation.message && (
                    <p className="text-gray-600 text-sm italic">"{donation.message}"</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent donations to display.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-bern-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Support Our Community?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Choose between making a donation to support our mission or placing a deposit 
            that you can get back when you attend our events.
          </p>
          <Link to="/donate" className="btn-primary text-lg px-8 py-4 inline-flex items-center">
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 