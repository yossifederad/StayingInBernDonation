const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbHelpers } = require('../database/db');

// Middleware to verify admin token
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password required'
      });
    }

    // Check against admin password
    const isValid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { role: 'admin', timestamp: Date.now() },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: { token }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Get all donations (admin view)
router.get('/donations', authenticateAdmin, async (req, res) => {
  try {
    const { status, payment_type, page = 1, limit = 50 } = req.query;
    const filters = {};
    
    if (status) filters.status = status;
    if (payment_type) filters.payment_type = payment_type;

    const donations = await dbHelpers.getAllDonations(filters);
    
    // Simple pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedDonations = donations.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        donations: paginatedDonations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: donations.length,
          pages: Math.ceil(donations.length / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch donations'
    });
  }
});

// Get donation details
router.get('/donations/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const donation = await dbHelpers.getDonationById(id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        error: 'Donation not found'
      });
    }

    res.json({
      success: true,
      data: donation
    });

  } catch (error) {
    console.error('Error fetching donation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch donation'
    });
  }
});

// Update donation status
router.patch('/donations/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'completed', 'failed', 'refunded'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const result = await dbHelpers.updateDonationStatus(id, status);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Donation not found'
      });
    }

    // Log admin action
    await dbHelpers.logAdminAction(
      'status_update',
      `Updated donation ${id} status to ${status}`,
      req.admin.email
    );

    res.json({
      success: true,
      data: { id, status }
    });

  } catch (error) {
    console.error('Error updating donation status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update donation status'
    });
  }
});

// Process refund
router.post('/donations/:id/refund', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { refund_amount } = req.body;

    const donation = await dbHelpers.getDonationById(id);
    
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

    const result = await dbHelpers.processRefund(id, refundAmount);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Donation not found'
      });
    }

    // Log admin action
    await dbHelpers.logAdminAction(
      'refund_processed',
      `Refunded ${refundAmount} for donation ${id}`,
      req.admin.email
    );

    res.json({
      success: true,
      data: {
        id,
        refund_amount: refundAmount,
        original_amount: donation.amount
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

// Get statistics
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const stats = await dbHelpers.getStats();
    
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

// Get admin logs
router.get('/logs', authenticateAdmin, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const logs = await dbHelpers.getAdminLogs(parseInt(limit));
    
    res.json({
      success: true,
      data: logs
    });

  } catch (error) {
    console.error('Error fetching admin logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin logs'
    });
  }
});

// Export donations to CSV
router.get('/export', authenticateAdmin, async (req, res) => {
  try {
    const donations = await dbHelpers.getAllDonations();
    
    // Create CSV content
    const csvHeader = 'ID,Name,Email,Amount,Message,Payment Type,Status,Refunded,Refund Amount,Created At\n';
    const csvRows = donations.map(d => 
      `${d.id},"${d.name}","${d.email}",${d.amount},"${d.message || ''}","${d.payment_type}","${d.status}",${d.refunded ? 'Yes' : 'No'},${d.refund_amount || ''},"${d.created_at}"`
    ).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=donations-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvContent);

    // Log export action
    await dbHelpers.logAdminAction(
      'export_donations',
      `Exported ${donations.length} donations to CSV`,
      req.admin.email
    );

  } catch (error) {
    console.error('Error exporting donations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export donations'
    });
  }
});

module.exports = router; 