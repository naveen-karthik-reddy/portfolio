# Deployment Guide

This guide will help you deploy your portfolio to GitHub Pages.

## Prerequisites

1. A GitHub account
2. A repository on GitHub (either `portfolio` or `naveen-portfolio`)
3. Node.js and npm installed locally

## Step-by-Step Deployment

### Method 1: Using gh-pages (Manual Deployment)

1. **Verify Repository Name**
   - Check your GitHub repository name (e.g., `portfolio`, `naveen-portfolio`)
   
2. **Update `vite.config.js`**
   - Open `vite.config.js`
   - Update the `base` path to match your repository name:
     ```js
     base: '/your-repo-name'
     ```
   - Examples:
     - If repo is `portfolio`: `base: '/portfolio'`
     - If repo is `naveen-portfolio`: `base: '/naveen-portfolio'`
     - If repo is `username.github.io` (root): `base: '/'`

3. **Update `package.json`**
   - Open `package.json`
   - Update the `homepage` field:
     ```json
     "homepage": "https://naveen-karthik-reddy.github.io/your-repo-name"
     ```

4. **Enable GitHub Pages in Repository Settings**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under **Source**, select **Branch: gh-pages** and **folder: / (root)**
   - Click **Save**

5. **Deploy**
   ```bash
   npm run deploy
   ```

6. **Verify**
   - Wait a few minutes for GitHub Pages to update
   - Visit: `https://naveen-karthik-reddy.github.io/your-repo-name`

### Method 2: Using GitHub Actions (Automatic Deployment)

This method automatically deploys on every push to the `main` branch.

1. **Verify Repository Name**
   - Same as Method 1, step 1

2. **Update Configuration Files**
   - Same as Method 1, steps 2-3

3. **Enable GitHub Pages with GitHub Actions**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - The workflow file (`.github/workflows/deploy.yml`) is already set up

4. **Push Your Code**
   ```bash
   git add .
   git commit -m "Setup GitHub Pages deployment"
   git push origin main
   ```

5. **Monitor Deployment**
   - Go to **Actions** tab in your repository
   - Watch the workflow run
   - Once complete, your site will be live

6. **Verify**
   - Visit: `https://naveen-karthik-reddy.github.io/your-repo-name`

## Troubleshooting

### Assets Not Loading (404 Errors)

**Problem**: Images, CSS, or JS files return 404 errors.

**Solution**: 
- Verify the `base` path in `vite.config.js` matches your repository name exactly
- Make sure there's a leading slash: `base: '/portfolio'` not `base: 'portfolio'`
- Rebuild and redeploy: `npm run build && npm run deploy`

### Blank Page or 404 on Main Page

**Problem**: GitHub Pages shows 404 or blank page.

**Solution**:
- Check that `index.html` is in the `dist` folder after build
- Verify the `homepage` in `package.json` matches your actual GitHub Pages URL
- Clear browser cache and try again

### Cached Old Version

**Problem**: Changes not appearing after deployment.

**Solution**:
- GitHub Pages can take a few minutes to update
- Hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)
- Check the Actions tab to ensure deployment completed successfully

## Quick Reference

**For repository named `portfolio`:**
```js
// vite.config.js
base: '/portfolio'

// package.json
"homepage": "https://naveen-karthik-reddy.github.io/portfolio"
```

**For repository named `naveen-portfolio`:**
```js
// vite.config.js
base: '/naveen-portfolio'

// package.json
"homepage": "https://naveen-karthik-reddy.github.io/naveen-portfolio"
```

**For root deployment (`username.github.io` repository):**
```js
// vite.config.js
base: '/'

// package.json
"homepage": "https://naveen-karthik-reddy.github.io"
```

## Need Help?

- Check GitHub Pages documentation: https://docs.github.com/en/pages
- Verify your repository settings under Settings → Pages
- Check the Actions tab for deployment errors

