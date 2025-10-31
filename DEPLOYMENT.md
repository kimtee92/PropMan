# Deploying PropMan to Vercel

This guide will help you deploy PropMan to Vercel with proper database seeding.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. MongoDB Atlas database (or any MongoDB instance)
3. UploadThing account and API keys

## Step 1: Prepare Environment Variables

Create the following environment variables. You'll add these to Vercel in Step 3.

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/propman?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_SECRET=your-super-secret-key-here-minimum-32-characters
NEXTAUTH_URL=https://your-domain.vercel.app

# UploadThing
UPLOADTHING_SECRET=sk_live_xxxxxxxxxxxxx
UPLOADTHING_APP_ID=xxxxxxxxxxxxx

# Node Environment
NODE_ENV=production
```

### Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

Or use Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Step 2: Deploy to Vercel (via GitHub)

### Option A: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Import your GitHub repository (`kimtee92/PropMan`)
3. Configure your project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. Click "Deploy" (don't add environment variables yet - we'll do that next)

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Step 3: Add Environment Variables

1. Go to your project dashboard on Vercel
2. Click **Settings** → **Environment Variables**
3. Add all the environment variables from Step 1
4. Make sure to select **Production**, **Preview**, and **Development** for each variable
5. Click **Save**

## Step 4: Redeploy with Environment Variables

After adding environment variables:

1. Go to **Deployments** tab
2. Click the three dots on the latest deployment
3. Click **Redeploy**
4. Check **Use existing Build Cache** (optional)
5. Click **Redeploy**

## Step 5: Seed the Database (One-Time Setup)

After your first successful deployment, you need to seed the database with demo users.

### Option A: Using Vercel CLI (Recommended)

```bash
# Install dependencies if not already installed
npm install

# Set your production MongoDB URI temporarily
$env:MONGODB_URI="your-production-mongodb-uri-here"

# Run the seed script
npm run seed

# Or run directly
node scripts/seed.js
```

### Option B: Using a One-Time Function

You can also create a temporary API endpoint to seed the database:

1. The seed script is safe to run multiple times (it checks if users already exist)
2. After initial deployment, you can manually trigger it once

## Step 6: Verify Deployment

1. Visit your deployed application: `https://your-domain.vercel.app`
2. Try logging in with the demo credentials:
   - **Admin**: `admin@propman.com` / `admin123`
   - **Manager**: `manager@propman.com` / `manager123`
   - **Viewer**: `viewer@propman.com` / `viewer123`

3. Verify that:
   - Authentication works
   - Database connection is successful
   - File uploads work (UploadThing)
   - All features are functional

## Important Notes

### Demo Credentials in Production

The demo credentials are hidden in production by default (only visible in development). To see them in development:
- Set `NODE_ENV=development` in your `.env.local`

### Continuous Deployment

Once connected to GitHub, Vercel will automatically:
- Deploy on every push to `main` branch
- Create preview deployments for pull requests
- Run build checks before deployment

### Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow the DNS configuration instructions
4. Vercel will automatically provision SSL certificates

## Troubleshooting

### Build Errors

If deployment fails:
1. Check the build logs in Vercel dashboard
2. Verify all environment variables are set correctly
3. Ensure MongoDB URI is accessible from Vercel's servers
4. Check that your MongoDB Atlas cluster allows connections from anywhere (0.0.0.0/0)

### Database Connection Issues

If you get MongoDB connection errors:
1. Check MongoDB Atlas Network Access settings
2. Add `0.0.0.0/0` to IP Access List (for Vercel)
3. Verify your connection string is correct
4. Ensure the database user has proper permissions

### UploadThing Issues

1. Verify your UploadThing API keys are correct
2. Check UploadThing dashboard for any errors
3. Ensure you're using production keys (not dev keys)

### Seed Script Not Working

If seeding fails:
1. Verify MONGODB_URI environment variable is set
2. Check MongoDB Atlas allows connections
3. Run seed script locally first to test: `npm run seed`
4. Check the database directly to see if users were created

## Updating After Deployment

To push updates:

```bash
git add .
git commit -m "Your update message"
git push
```

Vercel will automatically detect the push and redeploy.

## Monitoring

- **Analytics**: Vercel dashboard shows traffic and performance
- **Logs**: Check **Deployments** → **Functions** tab for runtime logs
- **Errors**: Monitor the **Errors** section in your project dashboard

## Security Checklist

- ✅ NEXTAUTH_SECRET is a strong, random value
- ✅ MongoDB connection uses authentication
- ✅ Environment variables are properly set in Vercel
- ✅ UploadThing is configured for production
- ✅ NODE_ENV is set to "production"
- ✅ Demo credentials are hidden (only visible in dev)

## Support

If you encounter issues:
1. Check Vercel documentation: https://vercel.com/docs
2. Check Next.js documentation: https://nextjs.org/docs
3. Review deployment logs in Vercel dashboard
