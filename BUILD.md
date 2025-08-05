# IdleCity Build Guide

## Development vs Production

### Current Setup (Development)
The game currently uses Tailwind CSS via CDN for rapid development. This is perfect for development but not recommended for production.

### For Production Deployment

#### Option 1: Tailwind CLI (Recommended)
1. Install Tailwind CSS:
```bash
npm install -D tailwindcss
npx tailwindcss init
```

2. Configure `tailwind.config.js`:
```javascript
module.exports = {
  content: ["./index.html", "./js/**/*.js"],
  theme: {
    extend: {
      colors: {
        'game-primary': '#3b82f6',
        'game-secondary': '#10b981',
        'game-accent': '#f59e0b',
        'game-danger': '#ef4444',
        'game-dark': '#1f2937',
        'game-light': '#f9fafb'
      }
    }
  },
  plugins: [],
}
```

3. Create `src/input.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

4. Build CSS:
```bash
npx tailwindcss -i ./src/input.css -o ./css/tailwind.css --watch
```

5. Replace CDN link in `index.html`:
```html
<link href="./css/tailwind.css" rel="stylesheet">
```

#### Option 2: PostCSS Plugin
Follow the [Tailwind CSS PostCSS installation guide](https://tailwindcss.com/docs/installation/using-postcss).

#### Option 3: Keep CDN for Simple Deployment
For simple GitHub Pages deployment, the CDN version works fine. The warning can be ignored for small projects.

## Current File Structure
```
IdleCity/
├── index.html          # Main game file
├── css/
│   └── styles.css      # Custom styles
├── js/
│   ├── game.js         # Core game logic
│   ├── ui.js           # UI management
│   ├── storage.js      # Save/load system
│   └── testing.js      # Testing framework
└── BUILD.md           # This file
```

## Deployment
The game is ready for deployment to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Any web server

Simply upload all files and access `index.html`.