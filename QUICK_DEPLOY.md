# Quick Deployment Guide

## Deploy to Vercel in 5 Steps

### 1. Push to GitHub ✅
```bash
git add .
git commit -m "Ready for deployment"
git push
```

### 2. Connect to Vercel
- Go to https://vercel.com/new
- Click "Import" on your `PropMan` repository
- Click "Deploy" (we'll add env vars next)

### 3. Add Environment Variables
Go to **Settings** → **Environment Variables** and add:

```env
MONGODB_URI=your-mongodb-connection-string
NEXTAUTH_SECRET=your-secret-key-minimum-32-chars
NEXTAUTH_URL=https://your-app.vercel.app
UPLOADTHING_TOKEN=your-uploadthing-token
```

> **Note:** Don't add `NODE_ENV` - Vercel sets this automatically!
> 
> **UploadThing Token:** Get this from your [UploadThing Dashboard](https://uploadthing.com/dashboard) under "API Keys". Use the token that starts with `sk_live_` for production.


### 4. Redeploy
- Go to **Deployments** tab
- Click "Redeploy" on the latest deployment

### 5. Seed the Database (One-Time)
```bash
# Set your production MongoDB URI
$env:MONGODB_URI="your-production-mongodb-uri"

# Run the production seed script
npm run seed:prod
```

## That's It! 🎉

Your app should now be live at `https://your-app.vercel.app`

---

## Need Help?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions and troubleshooting.
