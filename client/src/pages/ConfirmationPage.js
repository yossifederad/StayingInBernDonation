import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Heart, Mail, ArrowLeft, Download } from 'lucide-react';
import axios from 'axios';

const ConfirmationPage = () => {
  const { id } = useParams();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const response = await axios.get(`/api/donations/${id}`);
        setDonation(response.data.data);
      } catch (error) {
        setError('Failed to load donation details');
      } finally {
        setLoading(false);
      }
    };

    fetchDonation();
  }, [id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-CH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bern-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading confirmation...</p>
        </div>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <CheckCircle className="w-16 h-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Donation not found'}</p>
          <Link to="/" className="btn-primary">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Thank You!
          </h1>
          <p className="text-lg text-gray-600">
            Your {donation.payment_type === 'deposit' ? 'deposit' : 'donation'} has been successfully processed.
          </p>
        </div>

        {/* Confirmation Card */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Payment Confirmation
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-mono text-sm text-gray-900">#{donation.id}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Amount:</span>
              <span className="text-2xl font-bold text-bern-600">
                {formatCurrency(donation.amount)}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Payment Type:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                donation.payment_type === 'donation' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {donation.payment_type === 'donation' ? 'Donation' : 'Deposit'}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Status:</span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Completed
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600">Date:</span>
              <span className="text-gray-900">{formatDate(donation.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What's Next?
          </h3>
          
          {donation.payment_type === 'deposit' ? (
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="text-gray-900 font-medium">Check your email</p>
                  <p className="text-gray-600 text-sm">
                    We've sent you a confirmation email with details about your deposit and refund process.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="text-gray-900 font-medium">Attend our events</p>
                  <p className="text-gray-600 text-sm">
                    Show up to our events and your deposit will be automatically refunded.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">3</span>
                </div>
                <div>
                  <p className="text-gray-900 font-medium">Get your refund</p>
                  <p className="text-gray-600 text-sm">
                    If you don't attend, we'll keep your deposit to support our community.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="text-gray-900 font-medium">Check your email</p>
                  <p className="text-gray-600 text-sm">
                    We've sent you a confirmation email with a receipt for your donation.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="text-gray-900 font-medium">Support our mission</p>
                  <p className="text-gray-600 text-sm">
                    Your donation helps us continue building and supporting our community in Bern.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 text-sm font-bold">3</span>
                </div>
                <div>
                  <p className="text-gray-900 font-medium">Stay connected</p>
                  <p className="text-gray-600 text-sm">
                    Follow us for updates on how your donation is making a difference.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/" className="btn-secondary flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Return Home
          </Link>
          
          <button 
            onClick={() => window.print()} 
            className="btn-outline flex items-center justify-center"
          >
            <Download className="w-5 h-5 mr-2" />
            Print Receipt
          </button>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-2">
            Questions about your {donation.payment_type === 'deposit' ? 'deposit' : 'donation'}?
          </p>
          <a 
            href="mailto:info@stayinginbern.ch" 
            className="text-bern-600 hover:text-bern-700 font-medium inline-flex items-center"
          >
            <Mail className="w-4 h-4 mr-1" />
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage; 