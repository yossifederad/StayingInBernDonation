# Staying in Bern - Donation Platform

A beautiful and trustworthy web application for collecting donations and deposits for the "Staying in Bern" project.

## Features

- **Public Donor Interface**: Professional landing page with donation/deposit form
- **Payment Processing**: Stripe integration for secure payments
- **Admin Dashboard**: Track donations, deposits, and manage refunds
- **Email Templates**: Confirmation emails with refund options
- **Trust Building**: Google reviews integration and clear refund promises

## Project Structure

```
├── client/          # React frontend
├── server/          # Node.js backend
├── email-templates/ # Email templates
└── docs/           # Documentation
```

## Quick Start

1. **Install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env` in both `client/` and `server/` directories
   - Add your Stripe keys and other configuration

3. **Run development servers:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000
   - Admin: http://localhost:3000/admin

## Environment Variables

### Server (.env)
```
PORT=5000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
JWT_SECRET=your-secret-key
ADMIN_PASSWORD=your-admin-password
```

### Client (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Payment Flow

1. **Donor visits the site** and sees project information
2. **Fills donation form** with name, email, amount, and message
3. **Chooses payment type**: Donate (non-refundable) or Deposit (refundable)
4. **Completes payment** via Stripe
5. **Receives confirmation email** with refund options
6. **Admin can track** all transactions in the dashboard

## Refund Process

- Deposits are automatically refundable unless the donor doesn't show up
- Admin can process refunds through the dashboard
- Email notifications are sent for refund confirmations

## Tech Stack

- **Frontend**: React, Tailwind CSS, Stripe Elements
- **Backend**: Node.js, Express, Stripe API
- **Database**: SQLite (MVP), upgradeable to PostgreSQL
- **Payment**: Stripe
- **Email**: Manual templates (upgradeable to automated)

## Deployment

The application can be deployed to:
- **Frontend**: Vercel, Netlify, or any static hosting
- **Backend**: Heroku, Railway, or any Node.js hosting
- **Database**: SQLite for MVP, PostgreSQL for production

## Contributing

This is an MVP focused on simplicity and trust-building. Future enhancements may include:
- Automated email sending
- More payment options
- Advanced admin features
- Multi-language support 