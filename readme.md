# CJJacob Design Studio

A modern, high-performance portfolio website showcasing web design and development services. Built with clean code, smooth animations, and an intentional focus on user experience.

![CJJacob Design Studio](assets/images/og-image.jpg)

## 🌐 Live Demo

**[cjjacob.com](https://cjjacob.com)**

## ✨ Features

- **Modern Design System** - Clean, minimalist aesthetic with purposeful animations
- **Smooth Scroll Animations** - GSAP-powered interactions and transitions
- **Dark Mode Support** - Automatic theme switching based on sections
- **Fully Responsive** - Optimized for all devices from mobile to desktop
- **Performance Optimized** - Fast load times, lazy loading, and efficient animations
- **Accessibility First** - Semantic HTML, ARIA labels, and keyboard navigation
- **Interactive Process Carousel** - Custom mobile carousel for showcasing workflow
- **Custom Cursor Effects** - Magnetic buttons and interactive work cards
- **Glassmorphism UI** - Modern frosted glass effects throughout

## 🛠️ Built With

- **HTML5** - Semantic, accessible markup
- **CSS3** - Custom properties, Grid, Flexbox, and modern features
- **JavaScript (ES6+)** - Vanilla JS for interactions
- **GSAP 3** - Professional-grade animation library
- **ScrollTrigger** - Scroll-based animations and effects
- **Formspree** - Contact form handling
- **Font Awesome** - Icon system
- **Google Fonts** - Bebas Neue & Barlow typography

## 📁 Project Structure

```
cjjacob-portfolio/
├── assets/
│   ├── css/
│   │   └── styles.css          # Main stylesheet
│   ├── js/
│   │   └── script.js           # Main JavaScript file
│   └── images/
│       ├── og-image.jpg         # Social sharing image
│       ├── easing mind wallpaer home section.png
│       ├── health care .png
│       └── my about image.jpg
├── index.html                   # Main homepage
├── privacy.html                 # Privacy policy page
├── terms.html                   # Terms of service page
├── README.md                    # Project documentation
├── LICENSE                      # MIT License
├── .gitignore                   # Git ignore rules
└── vercel.json                  # Vercel deployment config
```

## 🚀 Getting Started

### Prerequisites

- A modern web browser
- A code editor (VS Code recommended)
- Basic knowledge of HTML/CSS/JavaScript

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cjjacob-portfolio.git
   cd cjjacob-portfolio
   ```

2. **Open in your browser**
   ```bash
   # Using VS Code Live Server
   code .
   # Then right-click index.html and select "Open with Live Server"
   
   # Or simply open index.html in your browser
   open index.html
   ```

3. **No build process required!** This is a static site - just open and edit.

## 🎨 Customization

### Colors

Edit CSS variables in `assets/css/styles.css`:

```css
:root {
  --off-white: #F7F7F5;
  --pure-black: #0a0a0a;
  --signature-blue: #0041A8;
  --hover-blue: #0052D6;
  --dark-grey: #2B2B2B;
}
```

### Content

- **Hero Section** - Update text in `index.html` (line ~88)
- **About Section** - Modify content starting at line ~115
- **Work Projects** - Edit project cards starting at line ~148
- **Process Steps** - Update in both desktop and mobile sections (line ~245)
- **Contact Form** - Already connected to Formspree (line ~396)

### Contact Form

The contact form uses Formspree. To use your own:

1. Sign up at [formspree.io](https://formspree.io)
2. Create a new form and get your endpoint
3. Update the form action in `index.html`:
   ```html
   <form action="https://formspree.io/f/YOUR_FORM_ID" method="post">
   ```

## 📱 Responsive Breakpoints

- **Desktop**: 1440px and above
- **Laptop**: 1024px - 1439px
- **Tablet**: 768px - 1023px
- **Mobile**: Below 768px

## ⚡ Performance

- **Lighthouse Score**: 95+ across all metrics
- **First Contentful Paint**: < 1.2s
- **Time to Interactive**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## 🌍 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Carlos Jacob (CJJacob)**

- Portfolio: [cjjacob.com](https://cjjacob.com)
- Email: cjjacobdesigns@gmail.com
- LinkedIn: [linkedin.com/in/cjjacob](https://linkedin.com/in/cjjacob)
- Instagram: [@carlostashingajacob](https://instagram.com/carlostashingajacob)

## 🙏 Acknowledgments

- GSAP for the amazing animation library
- Formspree for simple form handling
- Font Awesome for the icon system
- Unsplash for placeholder images (if applicable)

## 📧 Contact

Have questions or want to work together? Reach out!

- **Email**: cjjacobdesigns@gmail.com
- **Phone**: +27 75 263 3429
- **WhatsApp**: [Message Me](https://wa.me/27752633429)

---

**Built with ❤️ by CJJacob Design Studio**