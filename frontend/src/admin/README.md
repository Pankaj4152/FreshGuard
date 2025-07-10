# FreshGuard Admin Panel

The FreshGuard Admin Panel is a comprehensive management dashboard for Walmart store administrators to manage inventory, pricing, and view analytics related to the FreshGuard food waste reduction system.

## Features

- **Authentication**: Secure login for store administrators
- **Dashboard**: Sales, inventory, and waste reduction metrics
- **Inventory Management**: Add, edit, and track inventory items
- **Dynamic Pricing**: Set rules for automatic discounts based on expiry
- **User Management**: View customer profiles and order history
- **AI Features Control**: Configure AI-powered suggestion algorithms
- **Reporting & Insights**: Environmental impact and financial metrics

## Architecture

The admin panel is structured as follows:

```
frontend/src/admin/
├── components/        # Reusable UI components
├── context/           # React context providers
├── data/              # Mock data for development
├── pages/             # Admin page components
├── services/          # API services
├── utils/             # Utility functions
├── AdminRoot.js       # Root component for admin panel
└── admin-styles.css   # Admin-specific styles
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Navigate to http://localhost:3000/admin
5. Log in with the default credentials:
   - Username: `admin`
   - Password: `walmart123`

## Development & Deployment

See [ADMIN_CONFIG.md](ADMIN_CONFIG.md) for configuration details.

## Permissions System

The admin panel implements a role-based access control system with the following permissions:

- `dashboard.view`: View the admin dashboard
- `inventory.view`/`inventory.edit`: View/edit inventory
- `pricing.view`/`pricing.edit`: View/edit pricing rules
- `users.view`/`users.edit`: View/edit user data
- `ai-features.view`/`ai-features.edit`: View/configure AI features
- `reports.view`: View reports and analytics
- `settings.view`/`settings.edit`: View/edit system settings

## License

This project is proprietary and confidential.
