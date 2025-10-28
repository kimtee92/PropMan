# Quick Setup Guide for PropMan

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Setup MongoDB Atlas
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP (or use 0.0.0.0/0 for all IPs)
5. Get your connection string

### 3. Setup UploadThing
1. Go to [uploadthing.com](https://uploadthing.com)
2. Sign up and create a new app
3. Get your API keys from the dashboard

### 4. Configure Environment Variables
Create a `.env.local` file in the project root:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/propman?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_SECRET=generate-a-random-secret-here
NEXTAUTH_URL=http://localhost:3000

# UploadThing
UPLOADTHING_SECRET=sk_live_your_secret_here
UPLOADTHING_APP_ID=your_app_id_here

# Optional: Resend for emails
RESEND_API_KEY=re_your_key_here
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 5. Seed Demo Users
```bash
npm run seed
```

This creates three demo accounts:
- **Admin**: admin@propman.com / admin123
- **Manager**: manager@propman.com / manager123
- **Viewer**: viewer@propman.com / viewer123

### 6. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 7. Login
Use one of the demo accounts to login and explore the application.

## Deployment to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/propman.git
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables (all from `.env.local`)
5. Click "Deploy"

### 3. Configure Production URLs
After deployment, update these in Vercel:
- `NEXTAUTH_URL` → your-app.vercel.app

## Common Issues

### MongoDB Connection Issues
- Ensure your IP is whitelisted in MongoDB Atlas
- Check connection string format
- Verify database user has correct permissions

### Build Errors
- Use `--legacy-peer-deps` flag when installing packages
- Ensure all environment variables are set

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies and try again

## Next Steps

1. **Create Portfolios**: Login as admin and create your first portfolio
2. **Add Properties**: Add properties to your portfolios
3. **Custom Fields**: Add dynamic financial fields
4. **Upload Documents**: Upload property-related documents
5. **Test Approval Workflow**: Login as manager and make changes, then approve as admin

## Features to Explore

- ✅ Role-based dashboards
- ✅ Portfolio management
- ✅ Property CRUD operations
- ✅ Dynamic field system
- ✅ Approval workflows
- ✅ Document uploads
- ✅ Audit logging
- ✅ Responsive design

## Support

If you encounter issues:
1. Check the browser console for errors
2. Review server logs with `npm run dev`
3. Verify environment variables
4. Check MongoDB Atlas connection
5. Open an issue on GitHub

---

Happy managing! 🏗️