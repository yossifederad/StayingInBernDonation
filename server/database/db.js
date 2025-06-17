const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dataDir, 'donations.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
    initDatabase();
  }
});

// Initialize database tables
function initDatabase() {
  const createDonationsTable = `
    CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      message TEXT,
      payment_type TEXT NOT NULL CHECK(payment_type IN ('donation', 'deposit')),
      stripe_payment_intent_id TEXT UNIQUE,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed', 'refunded')),
      refunded BOOLEAN DEFAULT FALSE,
      refund_amount DECIMAL(10,2),
      refund_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createAdminLogsTable = `
    CREATE TABLE IF NOT EXISTS admin_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      details TEXT,
      admin_email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.serialize(() => {
    db.run(createDonationsTable, (err) => {
      if (err) {
        console.error('Error creating donations table:', err.message);
      } else {
        console.log('✅ Donations table ready');
      }
    });

    db.run(createAdminLogsTable, (err) => {
      if (err) {
        console.error('Error creating admin_logs table:', err.message);
      } else {
        console.log('✅ Admin logs table ready');
      }
    });
  });
}

// Helper functions for database operations
const dbHelpers = {
  // Get all donations with optional filters
  getAllDonations: (filters = {}) => {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM donations';
      const params = [];
      
      if (filters.status) {
        query += ' WHERE status = ?';
        params.push(filters.status);
      }
      
      if (filters.payment_type) {
        query += filters.status ? ' AND payment_type = ?' : ' WHERE payment_type = ?';
        params.push(filters.payment_type);
      }
      
      query += ' ORDER BY created_at DESC';
      
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  // Get donation by ID
  getDonationById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM donations WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  // Get donation by Stripe payment intent ID
  getDonationByStripeId: (stripeId) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM donations WHERE stripe_payment_intent_id = ?', [stripeId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  // Create new donation
  createDonation: (donationData) => {
    return new Promise((resolve, reject) => {
      const { name, email, amount, message, payment_type, stripe_payment_intent_id } = donationData;
      const query = `
        INSERT INTO donations (name, email, amount, message, payment_type, stripe_payment_intent_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      db.run(query, [name, email, amount, message, payment_type, stripe_payment_intent_id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...donationData });
        }
      });
    });
  },

  // Update donation status
  updateDonationStatus: (id, status) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE donations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, status, changes: this.changes });
          }
        }
      );
    });
  },

  // Process refund
  processRefund: (id, refundAmount) => {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE donations 
         SET refunded = TRUE, refund_amount = ?, refund_date = CURRENT_TIMESTAMP, 
             status = 'refunded', updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [refundAmount, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, refundAmount, changes: this.changes });
          }
        }
      );
    });
  },

  // Log admin action
  logAdminAction: (action, details, adminEmail = null) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO admin_logs (action, details, admin_email) VALUES (?, ?, ?)',
        [action, details, adminEmail],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID });
          }
        }
      );
    });
  },

  // Get admin logs
  getAdminLogs: (limit = 50) => {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT ?',
        [limit],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  },

  // Get statistics
  getStats: () => {
    return new Promise((resolve, reject) => {
      const stats = {};
      
      // Total donations
      db.get('SELECT COUNT(*) as count, SUM(amount) as total FROM donations WHERE status = "completed"', (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        stats.totalDonations = row.count || 0;
        stats.totalAmount = row.total || 0;
        
        // Donations vs deposits
        db.get('SELECT COUNT(*) as count, SUM(amount) as total FROM donations WHERE payment_type = "donation" AND status = "completed"', (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          
          stats.donations = row.count || 0;
          stats.donationsAmount = row.total || 0;
          
          // Deposits
          db.get('SELECT COUNT(*) as count, SUM(amount) as total FROM donations WHERE payment_type = "deposit" AND status = "completed"', (err, row) => {
            if (err) {
              reject(err);
              return;
            }
            
            stats.deposits = row.count || 0;
            stats.depositsAmount = row.total || 0;
            
            // Refunds
            db.get('SELECT COUNT(*) as count, SUM(refund_amount) as total FROM donations WHERE refunded = TRUE', (err, row) => {
              if (err) {
                reject(err);
                return;
              }
              
              stats.refunds = row.count || 0;
              stats.refundsAmount = row.total || 0;
              
              resolve(stats);
            });
          });
        });
      });
    });
  }
};

module.exports = { db, dbHelpers }; 