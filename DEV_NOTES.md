# Development Notes

## TypeScript Errors

If you see TypeScript errors about missing type definitions for 'mongoose', 'bcryptjs', or 'node':

**Solution**: Restart the TypeScript server in VS Code
1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type "TypeScript: Restart TS Server"
3. Press Enter

Or simply close and reopen VS Code.

The types are installed, TypeScript just needs to reload them.

## CSS Warnings

Tailwind CSS directives (`@tailwind`, `@apply`) are valid - any warnings are false positives from the CSS linter. These have been suppressed in `.vscode/settings.json`.

## Running the Project

```bash
# Install dependencies
npm install --legacy-peer-deps

# Setup environment (.env.local)
# See .env.example for required variables

# Create demo users
npm run seed

# Start development
npm run dev
```

## Building for Production

```bash
npm run build
npm start
```

## Common Issues

- **MongoDB connection errors**: Check your `MONGODB_URI` in `.env.local`
- **Port 3000 in use**: Run `npm run dev -- -p 3001` to use a different port
- **Module not found**: Delete `node_modules` and `.next`, then run `npm install --legacy-peer-deps`

For more help, see TROUBLESHOOTING.md