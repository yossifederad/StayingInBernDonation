import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Heart, Shield, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const DonationPage = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    amount: '',
    message: '',
    payment_type: 'deposit'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.');
      return;
    }

    // Validation
    if (!formData.name || !formData.email || !formData.amount) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.amount <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create payment intent
      const paymentIntentResponse = await axios.post('/api/stripe/create-payment-intent', {
        amount: parseFloat(formData.amount),
        payment_type: formData.payment_type
      });

      const { client_secret, payment_intent_id } = paymentIntentResponse.data.data;

      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: formData.name,
            email: formData.email,
          },
        }
      });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Create donation record
        const donationResponse = await axios.post('/api/donations', {
          name: formData.name,
          email: formData.email,
          amount: parseFloat(formData.amount),
          message: formData.message,
          payment_type: formData.payment_type,
          stripe_payment_intent_id: payment_intent_id
        });

        // Redirect to confirmation page
        navigate(`/confirmation/${donationResponse.data.data.id}`);
      }

    } catch (error) {
      console.error('Payment error:', error);
      setError(error.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Support Staying in Bern
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose between making a donation to support our mission or placing a deposit 
            that you can get back when you attend our events.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Type Selection */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Choose Your Payment Type
              </h2>
              
              <div className="space-y-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment_type"
                    value="deposit"
                    checked={formData.payment_type === 'deposit'}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Deposit (Refundable)</div>
                    <div className="text-sm text-gray-600">
                      Place a deposit that you'll get back when you attend our events. 
                      We only keep it if you don't show up.
                    </div>
                  </div>
                </label>
                
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment_type"
                    value="donation"
                    checked={formData.payment_type === 'donation'}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Donation (Non-refundable)</div>
                    <div className="text-sm text-gray-600">
                      Make a donation to support our community mission and ongoing projects.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Why Trust Us?
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-bern-500" />
                  <span className="text-sm text-gray-600">Secure payments via Stripe</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Heart className="w-5 h-5 text-bern-500" />
                  <span className="text-sm text-gray-600">100% refundable deposits</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-bern-500" />
                  <span className="text-sm text-gray-600">Community trusted</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Payment Information
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (CHF) *
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    min="1"
                    step="0.01"
                    className="input-field"
                    required
                  />
                  {formData.amount && (
                    <p className="text-sm text-gray-500 mt-1">
                      {formatCurrency(parseFloat(formData.amount) || 0)}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="3"
                    className="input-field"
                    placeholder="Share why you're supporting us..."
                  />
                </div>
              </div>

              {/* Card Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Information *
                </label>
                <div className="border border-gray-300 rounded-lg p-3">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#374151',
                          '::placeholder': {
                            color: '#9CA3AF',
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !stripe}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    {formData.payment_type === 'deposit' ? 'Place Deposit' : 'Make Donation'}
                  </>
                )}
              </button>

              {/* Security Notice */}
              <p className="text-xs text-gray-500 text-center">
                Your payment information is encrypted and secure. We never store your card details.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationPage; 