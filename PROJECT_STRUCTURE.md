# MONQ2 Project Structure

## Overview
This is a **static website** project for MONQ (premium monk fruit sweetener). The project is organized with clear **frontend** and **backend** directories, though currently only the frontend contains active code.

> **Important:** This is a pure static HTML/CSS/JS site. Do not convert to Next.js or React—that approach was tried and permanently removed.

---

## Directory Structure

```
MONQ2/
├── 📁 frontend/                          # All frontend code
│   ├── 📁 pages/                         # HTML pages
│   │   ├── index.html                    # Homepage
│   │   ├── blog.html                     # Blog listing
│   │   ├── blog-*.html                   # Individual blog posts
│   │   ├── cart.html                     # Shopping cart
│   │   ├── checkout.html                 # Checkout page
│   │   ├── faq.html                      # FAQ
│   │   ├── privacy-policy.html           # Privacy policy
│   │   ├── terms.html                    # Terms of service
│   │   ├── shipping-*.html               # Shipping & delivery info
│   │   ├── return-refund-policy.html     # Returns & refunds
│   │   └── track-order.html              # Order tracking
│   │
│   ├── 📁 assets/                        # Static assets
│   │   ├── 📁 css/
│   │   │   └── style.css                 # Main stylesheet
│   │   ├── 📁 js/
│   │   │   ├── main.js                   # Main JavaScript
│   │   │   ├── pourAnim.js               # Pour animation
│   │   │   ├── viewer3d.js               # 3D viewer
│   │   │   └── 📁 vendor/
│   │   │       └── three/                # Three.js 3D library
│   │   └── 📁 img/
│   │       ├── logo.png                  # Logo files
│   │       ├── hero-sachets.png          # Hero images
│   │       └── 📁 hero/                  # Hero animation frames
│   │
│   └── 📁 components/                    # Component documentation
│       ├── navbar.md                     # Navigation component
│       ├── navbar2.md                    # Alternative navbar
│       ├── testimonials.md               # Testimonials component
│       └── signin.md                     # Sign-in component
│
├── 📁 backend/                           # Backend code (empty - for future use)
│
├── 📁 docs/                              # Additional documentation
│
├── 📁 .claude/                           # Claude Code configuration
│
├── 📄 README.md                          # Project readme
├── 📄 MONQ-CONTENT-STRATEGY.md           # Content strategy
├── 📄 PROJECT_STRUCTURE.md               # This file
│
├── 📁 ui-ux-pro-max-skill/               # Design tool (separate)
│
└── 🖼️  Miscellaneous image files         # Screenshots, etc.
```

---

## Frontend Structure Explained

### 1. **pages/** 
Contains all HTML pages of the website. Each page is a complete, standalone HTML file.
- **Main pages**: index.html (homepage)
- **Blog pages**: blog.html + individual blog post pages
- **Shop pages**: cart.html, checkout.html
- **Info pages**: faq.html, policies, shipping, tracking

### 2. **assets/**
All static resources used by the pages.

- **css/**: Stylesheet that styles all pages
- **js/**: JavaScript for interactivity
  - `main.js` - Global scripts
  - `pourAnim.js` - Pour animation effect
  - `viewer3d.js` - 3D product viewer (uses Three.js)
  - `vendor/three/` - Three.js library and controls
- **img/**: All images
  - Logo files and branding images
  - Hero images and animation frames

### 3. **components/**
Documentation and specifications for reusable UI components.
- Markdown files describing navbar, testimonials, sign-in components
- Used for design consistency across pages

---

## Backend Directory

Currently empty, ready for future backend code if needed:
- REST APIs
- Server logic
- Database integration
- Authentication systems

---

## Development Guidelines

### Adding New Pages
1. Create a new HTML file in `frontend/pages/`
2. Reference assets from `../assets/` (relative paths)
3. Keep the same HTML structure as existing pages
4. Follow the CSS classes in style.css

### Updating Styles
- Edit `frontend/assets/css/style.css`
- Changes apply to all pages automatically

### Adding Scripts
- Add to `frontend/assets/js/main.js` for global code
- Or create a new JS file and reference it in pages
- Reference from pages: `<script src="../assets/js/yourfile.js"></script>`

### Adding Images
1. Place in `frontend/assets/img/`
2. Reference in HTML: `<img src="../assets/img/yourimage.png" alt="description">`

---

## File Paths Reference

When working in **pages**, use these relative paths to reference assets:
```html
<!-- CSS (in <head>) -->
<link rel="stylesheet" href="../assets/css/style.css">

<!-- JavaScript -->
<script src="../assets/js/main.js"></script>

<!-- Images -->
<img src="../assets/img/logo.png" alt="Logo">
```

---

## Important Notes

⚠️ **This is a static site only**
- No Node.js server required
- No build process needed
- Open any HTML file in a browser to preview
- Suitable for deployment to static hosting (GitHub Pages, Netlify, etc.)

✅ **Each page is independent**
- All HTML is self-contained
- Minimal JavaScript dependencies
- Works without a build tool

---

## Quick Navigation

| What | Where |
|------|-------|
| Homepage | `frontend/pages/index.html` |
| Styles | `frontend/assets/css/style.css` |
| JavaScript | `frontend/assets/js/` |
| Images/Icons | `frontend/assets/img/` |
| Component Specs | `frontend/components/` |

---

## Next Steps

1. **To run the site**: Open `frontend/pages/index.html` in your browser
2. **To deploy**: Upload the entire `frontend/` folder to a static host
3. **To modify**: Edit files directly and refresh your browser
4. **For backend features**: Use the `backend/` directory when needed

