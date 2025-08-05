# IdleCity - Web-Based Idle Game

A complete browser-based idle/incremental game built with vanilla HTML5, CSS, and JavaScript. Features automatic resource generation, building purchases, upgrades, and persistent progress storage with automated deployment to GitHub Pages.

## 🎮 Game Features

- **Idle Mechanics**: Automatic resource generation over time
- **Building System**: Purchase buildings to increase resource production
- **Upgrade System**: Unlock improvements and multipliers
- **Persistent Progress**: Automatic save/load using localStorage
- **Responsive Design**: Works on desktop and mobile devices
- **Automated Deployment**: Continuous deployment to GitHub Pages

## 🚀 Live Demo

The game is automatically deployed to GitHub Pages at: `https://[username].github.io/IdleCity`

## 🛠️ Development Setup

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Git for version control
- Text editor or IDE

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/[username]/IdleCity.git
cd IdleCity
```

2. Open `index.html` in your web browser or use a local server:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

3. Navigate to `http://localhost:8000` to play the game locally.

### Project Structure

```
IdleCity/
├── index.html          # Main game HTML file
├── css/               # Stylesheets
│   └── styles.css     # Main game styles
├── js/                # JavaScript modules
│   ├── game.js        # Core game logic
│   ├── ui.js          # UI management
│   └── storage.js     # Save/load functionality
├── assets/            # Game assets (images, sounds)
├── .github/           # GitHub Actions workflows
│   └── workflows/
│       └── deploy.yml # Automated deployment
└── README.md          # This file
```

## 🎯 How to Play

1. **Start Playing**: Open the game in your browser
2. **Generate Resources**: Click buttons to manually generate resources
3. **Buy Buildings**: Purchase buildings to automate resource generation
4. **Upgrade**: Unlock upgrades to increase efficiency
5. **Progress**: Watch your city grow automatically over time!

## 🔧 Technologies Used

- **HTML5**: Semantic structure and accessibility
- **CSS3**: Styling with Tailwind CSS utilities
- **Vanilla JavaScript**: Game logic and interactions
- **localStorage**: Client-side save system
- **GitHub Actions**: Automated CI/CD pipeline
- **GitHub Pages**: Static site hosting

## 📦 Deployment

The game uses GitHub Actions for automated deployment:

1. Push code to the `main` branch
2. GitHub Actions automatically builds and deploys to GitHub Pages
3. Game is live at `https://[username].github.io/IdleCity`

### Manual Deployment

If you need to deploy manually:

1. Ensure all files are committed to the `main` branch
2. Enable GitHub Pages in repository settings
3. Select "Deploy from a branch" and choose `main` branch
4. The game will be available at the GitHub Pages URL

## 🧪 Testing

### Manual Testing Checklist

- [ ] Game loads without errors
- [ ] Resources increment automatically
- [ ] Buildings can be purchased when affordable
- [ ] Game state saves and loads correctly
- [ ] Responsive design works on mobile
- [ ] All buttons and interactions work

### Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🎮 Game Design

IdleCity is designed as a simple but engaging idle game where players:

- Start with basic resources (coins, population)
- Purchase buildings that generate resources over time
- Unlock upgrades and new building types
- Progress through different phases of city development
- Experience satisfying incremental growth mechanics

The game emphasizes accessibility, performance, and a smooth user experience across all devices.

## 🔮 Future Features

- Achievement system with rewards
- Prestige mechanics for meta-progression
- Multiple resource types and complex production chains
- Visual improvements and animations
- Sound effects and music
- Offline progress calculation
- Export/import save functionality

---

**Happy Building! 🏗️**