# Naveen Karthik - Portfolio

A modern, responsive portfolio website showcasing my experience, projects, and skills as a Frontend-Focused Full Stack Developer.

## 🚀 Features

- **Modern Design**: Beautiful UI with glassmorphism effects and smooth animations
- **Dark/Light Mode**: Toggle between dark and light themes
- **Responsive**: Fully responsive design that works on all devices
- **Smooth Animations**: Framer Motion powered animations for a polished experience
- **Interactive Sections**: Collapsible experience cards and animated components
- **Navigation**: Smooth scroll navigation between sections

## 🛠️ Tech Stack

- **React 19** - Latest React features
- **Vite** - Fast build tool and dev server
- **Material-UI (MUI)** - Component library
- **Framer Motion** - Animation library
- **GitHub Pages** - Hosting

## 📦 Installation

```bash
# Install dependencies
npm install
```

## 🏃‍♂️ Development

```bash
# Start development server
npm run dev
```

## 🏗️ Build

```bash
# Build for production
npm run build
```

## 🚀 Deployment to GitHub Pages

### Option 1: Using gh-pages (Current Setup)

1. **Update the repository name in `package.json`**:
   - If your repo is named `portfolio`, keep the homepage as is: `"https://naveen-karthik-reddy.github.io/portfolio"`
   - If your repo is named `naveen-portfolio`, change it to: `"https://naveen-karthik-reddy.github.io/naveen-portfolio"`

2. **Update `vite.config.js` base path** to match your repository name:
   ```js
   base: '/your-repo-name'  // or '/' if deploying to username.github.io
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

   This will:
   - Build your project
   - Deploy to the `gh-pages` branch
   - Your site will be live at the URL specified in `homepage`

### Option 2: Using GitHub Actions (Recommended)

GitHub Actions workflow is set up for automatic deployment on every push to `main` branch.

1. Push your code to GitHub
2. GitHub Actions will automatically build and deploy
3. Your site will be live at: `https://naveen-karthik-reddy.github.io/your-repo-name`

### Important Notes

- **Repository Name**: Make sure the `base` in `vite.config.js` matches your repository name (without the username)
- **Root Deployment**: If deploying to `username.github.io` repository, set `base: '/'` in `vite.config.js`
- **Homepage URL**: Update the `homepage` field in `package.json` to match your actual GitHub Pages URL

## 📝 Customization

- Update personal information in `src/App.jsx` under the `data` object
- Replace `src/assets/profilePick.jpeg` with your own profile image
- Modify colors and styling in the theme configuration

## 📄 License

This project is open source and available under the MIT License.
