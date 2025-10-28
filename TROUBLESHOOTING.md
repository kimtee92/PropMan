# Troubleshooting Common Issues

## TypeScript Errors

### "Cannot find a declaration file for module 'mongoose'"

**Solution**: Restart your TypeScript server in VS Code
1. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
2. Type "TypeScript: Restart TS Server"
3. Press Enter

Alternatively, close and reopen VS Code.

### "Cannot find type definition file for 'node'"

**Solution**: The @types/node package is installed but TypeScript needs to be restarted. Follow the steps above.

## CSS Errors

### "Unknown at rule @tailwind"

**Cause**: VS Code CSS linter doesn't recognize Tailwind directives.

**Solution**: These are false positives and won't affect functionality. To suppress:
1. Install "Tailwind CSS IntelliSense" extension
2. Or add to VS Code settings:
```json
{
  "css.lint.unknownAtRules": "ignore"
}
```

## Installation Errors

### Peer Dependency Conflicts

**Solution**: Always use `--legacy-peer-deps` flag:
```bash
npm install --legacy-peer-deps
```

### Module Not Found Errors

**Solution**: Ensure all dependencies are installed:
```bash
rm -rf node_modules
rm package-lock.json
npm install --legacy-peer-deps
```

## Runtime Errors

### MongoDB Connection Failed

**Causes & Solutions**:

1. **Invalid connection string**
   - Check `MONGODB_URI` in `.env.local`
   - Ensure format: `mongodb+srv://username:password@cluster.mongodb.net/database`

2. **IP not whitelisted**
   - Go to MongoDB Atlas → Network Access
   - Add your IP or use `0.0.0.0/0` for all IPs

3. **Wrong credentials**
   - Verify database username and password
   - Password must be URL-encoded if it contains special characters

### NextAuth Errors

**"[next-auth][error][SIGNIN_EMAIL_ERROR]"**

**Solution**: Check these:
1. `NEXTAUTH_SECRET` is set in `.env.local`
2. `NEXTAUTH_URL` matches your domain (http://localhost:3000 for dev)
3. Run seed script: `npm run seed`

### UploadThing Errors

**"Invalid API key"**

**Solution**:
1. Verify `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID` in `.env.local`
2. Check [uploadthing.com](https://uploadthing.com) dashboard for correct keys
3. Ensure keys are not wrapped in quotes in `.env.local`

## Build Errors

### Next.js Build Failed

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Vercel Deployment Failed

**Causes & Solutions**:

1. **Missing environment variables**
   - Add all variables from `.env.local` to Vercel dashboard
   - Project Settings → Environment Variables

2. **Build command failed**
   - Check build logs in Vercel dashboard
   - Ensure `vercel.json` is present

3. **Database connection timeout**
   - Whitelist Vercel IPs in MongoDB Atlas: `0.0.0.0/0`

## Development Issues

### Hot Reload Not Working

**Solution**:
```bash
# Stop the dev server (Ctrl+C)
# Clear cache
rm -rf .next

# Restart
npm run dev
```

### Port Already in Use

**Error**: "Port 3000 is already in use"

**Solution**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

Or use a different port:
```bash
npm run dev -- -p 3001
```

### Changes Not Reflecting

**Solution**:
1. Clear browser cache (Ctrl+Shift+R)
2. Restart dev server
3. Check file is saved
4. Verify correct file path

## Database Issues

### Seed Script Fails

**Error**: "Users already exist. Skipping seed."

**Solution**: This is normal if you've already run the seed script.

To reset:
1. Delete all users from MongoDB Atlas
2. Run `npm run seed` again

### Cannot Create Index

**Solution**: Mongoose will automatically create indexes on first run. If it fails:
1. Manually create indexes in MongoDB Atlas
2. Or ignore - the app will work without indexes (just slower)

## Authentication Issues

### Cannot Login

**Checklist**:
1. ✅ Seed script has been run
2. ✅ Using correct email/password
3. ✅ `NEXTAUTH_SECRET` is set
4. ✅ `NEXTAUTH_URL` is correct
5. ✅ MongoDB connection working
6. ✅ No console errors

**Reset**:
```bash
# Clear browser cookies
# Restart dev server
npm run dev
```

### Session Expired Immediately

**Solution**: Check `NEXTAUTH_SECRET` environment variable is set and consistent.

## Performance Issues

### Slow Page Loads

**Solutions**:
1. Check MongoDB Atlas location (closer is faster)
2. Enable indexes in database
3. Implement pagination for large datasets
4. Use `loading.tsx` files for better UX

### API Timeouts

**Solution**:
1. Increase timeout in Vercel project settings
2. Optimize database queries
3. Add caching layer

## Common Mistakes

### 1. Forgot to Copy .env.example

```bash
cp .env.example .env.local
```

### 2. Didn't Run Seed Script

```bash
npm run seed
```

### 3. Wrong Node Version

**Requirement**: Node.js 18+

**Check version**:
```bash
node --version
```

**Update if needed**: Download from [nodejs.org](https://nodejs.org)

### 4. Not Using Legacy Peer Deps

**Always use**:
```bash
npm install --legacy-peer-deps
```

## Still Having Issues?

### Debug Checklist

1. **Check console**: Browser developer tools (F12)
2. **Check terminal**: Server logs
3. **Check environment**: All variables set?
4. **Check MongoDB**: Connection working?
5. **Check versions**: Node 18+, npm 9+?

### Get Help

1. Review error message carefully
2. Check this troubleshooting guide
3. Search error message online
4. Check GitHub issues
5. Ask in Next.js/MongoDB communities

## Quick Fixes

### Nuclear Option (Reset Everything)

```bash
# Stop all running processes
# Delete generated files
rm -rf node_modules
rm -rf .next
rm package-lock.json

# Reinstall
npm install --legacy-peer-deps

# Restart
npm run dev
```

### Fresh Start

```bash
# Keep only source files
git clean -fdx
npm install --legacy-peer-deps
npm run seed
npm run dev
```

## Useful Commands

```bash
# Check what's installed
npm list

# Check for outdated packages
npm outdated

# Clear npm cache
npm cache clean --force

# Verify package.json
npm install --dry-run --legacy-peer-deps

# Check MongoDB connection
# (Add a test script or use MongoDB Compass)
```

## Prevention Tips

1. ✅ Always commit working code
2. ✅ Use version control (Git)
3. ✅ Keep .env.local backed up (securely)
4. ✅ Test locally before deploying
5. ✅ Read error messages carefully
6. ✅ Use --legacy-peer-deps for npm
7. ✅ Restart TS server when adding packages

---

**Remember**: Most errors are configuration issues. Check environment variables first!