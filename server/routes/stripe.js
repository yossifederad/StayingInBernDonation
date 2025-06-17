const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { dbHelpers } = require('../database/db');

// Create payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'chf', payment_type } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    if (!['donation', 'deposit'].includes(payment_type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment type'
      });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        payment_type: payment_type
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      data: {
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id
      }
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment intent'
    });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      
      case 'charge.refunded':
        await handleRefund(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Handle successful payment
async function handlePaymentSuccess(paymentIntent) {
  try {
    const donation = await dbHelpers.getDonationByStripeId(paymentIntent.id);
    
    if (donation) {
      await dbHelpers.updateDonationStatus(donation.id, 'completed');
      console.log(`Payment completed for donation ${donation.id}`);
    } else {
      console.log(`Payment intent ${paymentIntent.id} not found in database`);
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

// Handle failed payment
async function handlePaymentFailure(paymentIntent) {
  try {
    const donation = await dbHelpers.getDonationByStripeId(paymentIntent.id);
    
    if (donation) {
      await dbHelpers.updateDonationStatus(donation.id, 'failed');
      console.log(`Payment failed for donation ${donation.id}`);
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

// Handle refund
async function handleRefund(charge) {
  try {
    // Find donation by payment intent ID
    const donation = await dbHelpers.getDonationByStripeId(charge.payment_intent);
    
    if (donation && !donation.refunded) {
      const refundAmount = charge.amount_refunded / 100; // Convert from cents
      await dbHelpers.processRefund(donation.id, refundAmount);
      console.log(`Refund processed for donation ${donation.id}`);
    }
  } catch (error) {
    console.error('Error handling refund:', error);
  }
}

// Process refund through Stripe
router.post('/refund/:donation_id', async (req, res) => {
  try {
    const { donation_id } = req.params;
    const { refund_amount } = req.body;

    const donation = await dbHelpers.getDonationById(donation_id);
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        error: 'Donation not found'
      });
    }

    if (donation.refunded) {
      return res.status(400).json({
        success: false,
        error: 'Donation already refunded'
      });
    }

    if (donation.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Can only refund completed payments'
      });
    }

    const refundAmount = refund_amount || donation.amount;
    
    if (refundAmount > donation.amount) {
      return res.status(400).json({
        success: false,
        error: 'Refund amount cannot exceed original amount'
      });
    }

    // Process refund through Stripe
    const refund = await stripe.refunds.create({
      payment_intent: donation.stripe_payment_intent_id,
      amount: Math.round(refundAmount * 100), // Convert to cents
    });

    // Update database
    await dbHelpers.processRefund(donation_id, refundAmount);

    res.json({
      success: true,
      data: {
        refund_id: refund.id,
        amount: refundAmount,
        status: refund.status
      }
    });

  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process refund'
    });
  }
});

// Get payment methods (for future use)
router.get('/payment-methods', async (req, res) => {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      type: 'card',
    });

    res.json({
      success: true,
      data: paymentMethods.data
    });

  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment methods'
    });
  }
});

module.exports = router; 