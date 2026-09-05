# MONQ2 Frontend

Welcome to the MONQ2 frontend! This is a **static HTML/CSS/JavaScript website** for the MONQ brand.

## Quick Start

### 📂 Folder Structure
```
frontend/
├── pages/          → All HTML pages (.html files)
├── assets/         → CSS, JavaScript, Images
│   ├── css/       → Stylesheets
│   ├── js/        → JavaScript files
│   └── img/       → Images and logos
└── components/     → Component documentation (.md files)
```

### 🚀 Open the Site
Simply open any HTML file in your browser:
- **Homepage**: `pages/index.html`
- **Blog**: `pages/blog.html`
- **Shop Pages**: `pages/cart.html`, `pages/checkout.html`

No build tool or server needed!

---

## 📝 Working with Pages

### File Locations
All HTML files are in `pages/` folder. Use these relative paths in your HTML:

```html
<!-- Link to stylesheet -->
<link rel="stylesheet" href="../assets/css/style.css">

<!-- Include JavaScript -->
<script src="../assets/js/main.js"></script>

<!-- Reference images -->
<img src="../assets/img/logo.png" alt="Logo">
```

### Creating a New Page
1. Copy an existing HTML file from `pages/`
2. Edit the content
3. Keep the same `<link>` and `<script>` references

---

## 🎨 Styling

### Edit Styles
All pages use `assets/css/style.css`. Edit this file to:
- Change colors
- Update fonts
- Modify layouts
- Add new styles

Changes apply to **all pages immediately**.

### CSS Organization
- Global styles at the top
- Component styles in the middle
- Utility classes at the bottom

---

## ⚙️ JavaScript

### Files
- **main.js** - Global scripts (runs on every page)
- **pourAnim.js** - Pour animation effect
- **viewer3d.js** - 3D product viewer (uses Three.js)

### Adding New Scripts
Create a new file in `assets/js/` and reference it in your HTML:
```html
<script src="../assets/js/myfeature.js"></script>
```

---

## 🖼️ Images & Assets

### Location
All images go in `assets/img/`

### Subfolders
- `assets/img/hero/` - Hero animation frames
- Add more subfolders as needed

### Using Images
```html
<!-- Hero image -->
<img src="../assets/img/hero-sachets.png" alt="Sachets">

<!-- Logo -->
<img src="../assets/img/logo.png" alt="MONQ Logo">
```

---

## 📦 Static Hosting

This site can be deployed to:
- ✅ GitHub Pages
- ✅ Netlify
- ✅ Vercel (static mode)
- ✅ Any web hosting with FTP

Just upload the entire `frontend/` folder to your host.

---

## 📚 Component Documentation

See `components/` folder for:
- `navbar.md` - Navigation bar specs
- `testimonials.md` - Testimonial component design
- `signin.md` - Sign-in form structure

---

## ⚠️ Important Notes

- ✅ This is a **static site** - all HTML files are independent
- ✅ No build process needed
- ✅ No database or server required
- ✅ Works 100% in the browser
- ❌ Do NOT convert to Next.js or React

---

## 🔗 Related Files

- `../PROJECT_STRUCTURE.md` - Full project structure
- `../README.md` - Main project readme
- `../MONQ-CONTENT-STRATEGY.md` - Content strategy

