const express = require('express');
const router = express.Router();
const { dbHelpers } = require('../database/db');

// Get all donations (public stats)
router.get('/stats', async (req, res) => {
  try {
    const stats = await dbHelpers.getStats();
    res.json({
      success: true,
      data: {
        totalDonations: stats.totalDonations,
        totalAmount: stats.totalAmount,
        donations: stats.donations,
        donationsAmount: stats.donationsAmount,
        deposits: stats.deposits,
        depositsAmount: stats.depositsAmount
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch statistics' 
    });
  }
});

// Get recent donations (public)
router.get('/recent', async (req, res) => {
  try {
    const donations = await dbHelpers.getAllDonations({ status: 'completed' });
    const recent = donations.slice(0, 10).map(donation => ({
      name: donation.name,
      amount: donation.amount,
      payment_type: donation.payment_type,
      message: donation.message,
      created_at: donation.created_at
    }));
    
    res.json({
      success: true,
      data: recent
    });
  } catch (error) {
    console.error('Error fetching recent donations:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch recent donations' 
    });
  }
});

// Create donation record (called after successful Stripe payment)
router.post('/', async (req, res) => {
  try {
    const { name, email, amount, message, payment_type, stripe_payment_intent_id } = req.body;

    // Validation
    if (!name || !email || !amount || !payment_type || !stripe_payment_intent_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    if (!['donation', 'deposit'].includes(payment_type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment type'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be greater than 0'
      });
    }

    // Check if payment intent already exists
    const existing = await dbHelpers.getDonationByStripeId(stripe_payment_intent_id);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Payment intent already processed'
      });
    }

    // Create donation record
    const donation = await dbHelpers.createDonation({
      name,
      email,
      amount,
      message: message || '',
      payment_type,
      stripe_payment_intent_id
    });

    res.status(201).json({
      success: true,
      data: {
        id: donation.id,
        name: donation.name,
        email: donation.email,
        amount: donation.amount,
        payment_type: donation.payment_type,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create donation record'
    });
  }
});

// Get donation by ID (for confirmation pages)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const donation = await dbHelpers.getDonationById(id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        error: 'Donation not found'
      });
    }

    // Only return public information
    res.json({
      success: true,
      data: {
        id: donation.id,
        name: donation.name,
        amount: donation.amount,
        payment_type: donation.payment_type,
        status: donation.status,
        created_at: donation.created_at
      }
    });

  } catch (error) {
    console.error('Error fetching donation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch donation'
    });
  }
});

module.exports = router; 