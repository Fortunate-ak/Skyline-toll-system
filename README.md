# ZimPass Flow - Smart Toll Payment System

A modern, elegant web application that enables vehicle owners to register, manage their vehicles, and pay toll fees digitally with automatic toll verification and prepaid wallet payments.

## Features

### User Authentication & Registration
- **Secure Sign Up**: Register with full name, national ID, phone number, and email
- **OAuth Login**: Seamless Manus OAuth integration for secure authentication
- **Password Reset**: Easy password recovery flow
- **Session Management**: Secure session handling with JWT tokens

### Vehicle Management
- **Multi-Vehicle Support**: Register and manage multiple vehicles per user
- **Vehicle Details**: Store plate number, type (car, truck, bus, etc.), brand, model, and color
- **Edit & Delete**: Easily update or remove vehicle information
- **Vehicle Overview**: Quick view of all registered vehicles on dashboard

### Digital Wallet System
- **Balance Display**: Real-time wallet balance tracking
- **Top-Up Functionality**: Quick wallet top-ups with preset amounts ($10, $20, $50, $100)
- **Transaction History**: Complete record of all wallet transactions
- **Automatic Deduction**: Seamless toll fee deduction when passing tollgates
- **Low Balance Alerts**: Notifications when wallet balance falls below threshold

### Toll Transaction Management
- **Transaction History**: Detailed records including date, tollgate name, vehicle plate, and amount
- **Recent Transactions**: Quick view of latest 10 transactions on dashboard
- **Full History**: Access complete transaction history with filtering capabilities
- **Transaction Details**: Clear breakdown of toll payments and wallet top-ups

### Notification System
- **Toll Payment Alerts**: Instant notifications for successful toll payments
- **Low Balance Warnings**: Alerts when wallet balance is critically low
- **Vehicle Updates**: Notifications for vehicle registration and management events
- **Unread Count**: Badge showing number of unread notifications

### User Interface
- **Elegant Design**: Modern, professional dashboard with gradient accents
- **Responsive Layout**: Fully responsive design optimized for desktop and mobile
- **Sidebar Navigation**: Easy navigation between Overview, Vehicles, Wallet, and Transactions
- **Dark/Light Theme**: Theme support for user preference
- **Smooth Animations**: Polished micro-interactions and transitions

## Technology Stack

### Frontend
- **React 19**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development with full type checking
- **TailwindCSS 4**: Utility-first CSS framework with custom design system
- **tRPC**: End-to-end type-safe API communication
- **Wouter**: Lightweight routing library
- **Lucide React**: Beautiful icon library

### Backend
- **Express.js**: Fast, minimal web framework
- **tRPC**: Type-safe RPC framework for API procedures
- **Drizzle ORM**: Type-safe database access
- **MySQL 2**: Database driver with connection pooling

### Database
- **MySQL**: Relational database with comprehensive schema
- **Tables**: users, vehicles, wallets, transactions, notifications

### Testing
- **Vitest**: Fast unit test framework
- **15 Passing Tests**: Comprehensive test coverage for all features

## Project Structure

```
zimpass-flow/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Auth.tsx          # Authentication pages
│   │   │   └── Dashboard.tsx     # Main dashboard
│   │   ├── components/
│   │   │   ├── VehicleModal.tsx  # Vehicle management modal
│   │   │   ├── WalletModal.tsx   # Wallet top-up modal
│   │   │   └── ...
│   │   ├── App.tsx               # Route configuration
│   │   └── index.css             # Global styles
│   └── public/
├── server/
│   ├── routers.ts                # tRPC procedure definitions
│   ├── db.ts                     # Database query helpers
│   ├── features.test.ts          # Feature tests
│   └── auth.logout.test.ts       # Auth tests
├── drizzle/
│   ├── schema.ts                 # Database schema
│   └── migrations/               # Database migrations
└── shared/
    └── const.ts                  # Shared constants
```

## Getting Started

### Prerequisites
- Node.js 22.13.0+
- pnpm package manager
- MySQL database

### Installation

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment variables**:
   - Database connection string
   - OAuth credentials
   - Session secret

3. **Run database migrations**:
   ```bash
   pnpm drizzle-kit generate
   pnpm drizzle-kit migrate
   ```

4. **Start development server**:
   ```bash
   pnpm dev
   ```

5. **Run tests**:
   ```bash
   pnpm test
   ```

## API Endpoints

### Authentication
- `auth.me` - Get current user
- `auth.logout` - Logout user

### Vehicles
- `vehicles.list` - Get all user vehicles
- `vehicles.get` - Get specific vehicle
- `vehicles.add` - Add new vehicle
- `vehicles.update` - Update vehicle details
- `vehicles.delete` - Remove vehicle

### Wallet
- `wallet.getBalance` - Get wallet balance
- `wallet.topup` - Top up wallet
- `wallet.deductToll` - Deduct toll fee

### Transactions
- `transactions.list` - Get all transactions
- `transactions.recent` - Get recent transactions

### Notifications
- `notifications.list` - Get all notifications
- `notifications.markAsRead` - Mark notification as read
- `notifications.unreadCount` - Get unread count

## Database Schema

### Users Table
- id (PK)
- openId (unique)
- name
- email
- phoneNumber
- nationalId
- role
- loginMethod
- createdAt, updatedAt, lastSignedIn

### Vehicles Table
- id (PK)
- userId (FK)
- plateName
- vehicleType
- brand
- model
- color
- isActive
- createdAt, updatedAt

### Wallets Table
- id (PK)
- userId (FK, unique)
- balance (decimal)
- createdAt, updatedAt

### Transactions Table
- id (PK)
- userId (FK)
- type (topup | toll_deduction)
- amount
- vehicleId (FK)
- tollgateName
- status
- description
- createdAt, updatedAt

### Notifications Table
- id (PK)
- userId (FK)
- type (toll_payment | low_balance | vehicle_update)
- title
- message
- isRead
- createdAt

## Design System

### Color Palette
- **Primary Accent**: Blue (#3B82F6) to Cyan (#06B6D4)
- **Background**: Clean white with subtle gradients
- **Text**: Dark gray for readability
- **Borders**: Light gray for subtle separation
- **Success**: Green for positive actions
- **Warning**: Red for alerts

### Typography
- **Headings**: Poppins font family (bold, -0.02em letter-spacing)
- **Body**: Inter font family (regular weight)
- **Font Sizes**: Responsive scaling from mobile to desktop

### Components
- **Buttons**: Primary (accent bg), Secondary (accent border), Ghost (transparent)
- **Cards**: Elegant rounded corners with subtle shadows
- **Inputs**: Rounded with accent focus state
- **Modals**: Centered dialogs with smooth animations

## Testing

The project includes comprehensive test coverage:

```bash
# Run all tests
pnpm test

# Test Results: 15 tests passing
# - Wallet Features (3 tests)
# - Vehicle Features (5 tests)
# - Transaction Features (2 tests)
# - Notification Features (2 tests)
# - Authentication (2 tests)
# - Auth Logout (1 test)
```

## Performance Optimizations

- **Code Splitting**: Route-based code splitting with Vite
- **Image Optimization**: Lazy loading for images
- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Response caching for frequently accessed data
- **Minification**: Automatic minification in production builds

## Security Features

- **OAuth Authentication**: Secure Manus OAuth integration
- **Session Management**: Secure session cookies with httpOnly flag
- **Type Safety**: End-to-end type safety with TypeScript and tRPC
- **Input Validation**: Zod schema validation for all inputs
- **CORS Protection**: Proper CORS configuration
- **SQL Injection Prevention**: Parameterized queries with Drizzle ORM

## Future Enhancements

- Real-time toll gate integration
- Mobile app version (React Native)
- Advanced analytics and reporting
- Recurring payment plans
- Vehicle insurance integration
- Multi-currency support
- Admin dashboard for toll operators
- SMS/Email notifications
- Payment gateway integration (Stripe, PayPal)

## Contributing

Contributions are welcome! Please follow these guidelines:
1. Create a feature branch
2. Make your changes
3. Add tests for new features
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For support, please contact support@zimpassflow.com or open an issue on GitHub.

---

**Version**: 1.0.0  
**Last Updated**: March 7, 2026  
**Status**: MVP Complete
