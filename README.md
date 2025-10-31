# PropMan - Property & Portfolio Management System

A modern property and portfolio management web application with role-based access control, approval workflows, and comprehensive audit logging.

## 🚀 Features

- **Role-Based Access**: Admin, Property Manager, and Viewer roles with different permissions
- **Portfolio & Property Management**: Organize and manage multiple properties across portfolios
- **Dynamic Fields**: Custom financial fields (value, revenue, expense, asset) for each property
- **Approval Workflows**: Property manager changes require admin approval
- **Document Management**: Upload and manage property documents
- **Audit Logging**: Complete audit trail of all changes
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, ShadCN UI
- **Backend**: Next.js API Routes (serverless)
- **Database**: MongoDB Atlas with Mongoose
- **Authentication**: NextAuth.js with JWT
- **File Storage**: UploadThing
- **Deployment**: Vercel

## � Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- MongoDB Atlas account
- UploadThing account (for file uploads)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/propman.git
   cd propman
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Setup environment variables**
   
   Create `.env.local` in the root directory:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/propman?retryWrites=true&w=majority
   NEXTAUTH_SECRET=your-super-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   UPLOADTHING_SECRET=sk_live_...
   UPLOADTHING_APP_ID=your-app-id
   ```

   Generate `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

4. **Seed demo users**
   ```bash
   npm run seed
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## 👥 User Roles

### Admin
- Full CRUD access to all data
- Approve/reject property manager changes
- Manage portfolios and users
- View audit logs

### Property Manager
- Add/edit properties within assigned portfolios
- Create dynamic fields (requires approval)
- Upload documents (requires approval)
- Changes require admin approval

### Viewer
- Read-only access to approved data
- View portfolios, properties, and documents
- Cannot make changes

## 📁 Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Protected routes (dashboard, portfolios)
│   ├── api/                  # API endpoints
│   │   ├── auth/             # Authentication
│   │   ├── portfolios/       # Portfolio CRUD
│   │   ├── properties/       # Property CRUD
│   │   ├── approvals/        # Approval workflows
│   │   └── uploadthing/      # File uploads
│   ├── login/                # Login page
│   └── layout.tsx            # Root layout
├── components/
│   ├── ui/                   # ShadCN UI components
│   ├── Navbar.tsx
│   └── PortfolioCard.tsx
├── lib/
│   ├── auth.ts               # NextAuth configuration
│   ├── db.ts                 # MongoDB connection
│   └── utils.ts              # Utility functions
└── models/                   # Mongoose schemas
    ├── User.ts
    ├── Portfolio.ts
    ├── Property.ts
    ├── DynamicField.ts
    ├── Document.ts
    ├── ApprovalRequest.ts
    └── AuditLog.ts
```

## 🎯 Default Fields

When creating a new property, the following default fields are automatically added:

- **Property Value** (category: value, type: currency)
- **Monthly Rent** (category: revenue, type: currency, frequency: monthly)
- **Utilities** (category: expense, type: currency, frequency: monthly)
- **Furniture Asset Value** (category: asset, type: currency)

## 🔐 Authentication

The system uses NextAuth.js with credentials provider. Demo accounts:

- **Admin**: admin@propman.com / admin123
- **Manager**: manager@propman.com / manager123
- **Viewer**: viewer@propman.com / viewer123

## 📊 Database Models

### User
- Stores user credentials and role assignments
- Links to assigned portfolios

### Portfolio
- Groups multiple properties
- Contains owners, managers, and viewers
- Stores default field templates

### Property
- Individual property within a portfolio
- Contains address, status, and metadata
- Links to dynamic fields and documents

### DynamicField
- Custom financial/descriptive fields
- Supports multiple types: number, text, currency, date
- Approval status tracking

### Document
- File metadata for uploaded documents
- Links to properties
- Approval status for manager uploads

### ApprovalRequest
- Tracks change requests from managers
- Stores original and proposed data
- Admin review and comments

### AuditLog
- Complete history of all changes
- Before/after state tracking
- User and timestamp information

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Add environment variables from `.env.local`
   - Deploy

3. **Update environment variables**
   - Set `NEXTAUTH_URL` to your production URL

### MongoDB Atlas Setup

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Whitelist Vercel IPs (use `0.0.0.0/0` for simplicity)
3. Create a database user
4. Copy connection string to `MONGODB_URI`

### UploadThing Setup

1. Sign up at [uploadthing.com](https://uploadthing.com)
2. Create a new app
3. Copy API keys to environment variables

## 📝 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run seed     # Create demo users
npm run lint     # Lint code
```

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🙋 Support

For issues and questions, check the [SETUP.md](SETUP.md) and [TROUBLESHOOTING.md](TROUBLESHOOTING.md) guides.

---

Built with ❤️ using Next.js, MongoDB, and modern web technologies