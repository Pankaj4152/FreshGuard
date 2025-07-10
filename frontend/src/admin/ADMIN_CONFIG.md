# FreshGuard Admin Panel Configuration

## Environment Variables

The following environment variables can be configured for different deployment environments:

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Base URL for the backend API | `http://localhost:5000` |
| `REACT_APP_USE_MOCK_DATA` | Whether to use mock data instead of real API calls | `true` |

## Mock Data

The admin panel can operate in two modes:

1. **Development Mode** (default): Uses mock data from JSON files in `src/admin/data/`
2. **Production Mode**: Makes real API calls to the backend

To change between modes, set the `REACT_APP_USE_MOCK_DATA` environment variable to `true` or `false`.

## Admin Users

In development mode, the following admin users are available:

1. **Store Admin**
   - Username: `admin`
   - Password: `walmart123`
   - Full access to all admin features

2. **Store Manager**
   - Username: `manager`
   - Password: `manager456`
   - Limited access (can't edit pricing, users, or settings)

You can add more admin users by editing the `src/admin/data/admins.json` file.

## Deployment

To deploy the admin panel to production:

1. Set the appropriate environment variables in `.env.production`
2. Build the app with `npm run build`
3. Deploy the build files to your web server

## Security Considerations

In a production environment, you should:

1. Implement proper JWT token authentication
2. Use HTTPS for all API calls
3. Implement role-based access control on the backend
4. Set appropriate CORS policies
5. Consider adding rate limiting for login attempts
