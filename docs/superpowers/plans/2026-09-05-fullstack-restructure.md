# MONQ2 Full-Stack Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure MONQ2 from a static HTML site into a full-stack e-commerce application with Python backend, PostgreSQL database, RESTful API, and Razorpay payment integration.

**Architecture:** 
- Separate frontend (HTML/static assets) and backend (Python REST API)
- Backend handles authentication, product management, orders, payments, and database operations
- Frontend communicates with backend via REST API calls
- PostgreSQL as central data store
- Razorpay for payment processing

**Tech Stack:** 
- Backend: Python (Flask or Django - to be decided)
- Database: PostgreSQL
- API: RESTful API with JSON
- Payment: Razorpay integration
- Frontend: Keep existing HTML structure, add API client layer

---

## Global Constraints

- Database: PostgreSQL (version 12+)
- Python 3.8+
- Payment gateway: Razorpay
- API response format: JSON
- Authentication: JWT (JSON Web Tokens) for API authentication
- CORS enabled for frontend-backend communication
- All API endpoints require proper error handling and validation

---

## Project Structure

```
monq2/
├── backend/
│   ├── app/
│   │   ├── __init__.py              # Flask/Django app initialization
│   │   ├── config.py                # Configuration settings
│   │   ├── models/                  # Database models
│   │   │   ├── __init__.py
│   │   │   ├── user.py              # User model
│   │   │   ├── product.py           # Product model
│   │   │   ├── order.py             # Order model
│   │   │   ├── payment.py           # Payment transaction model
│   │   │   └── cart.py              # Cart model
│   │   ├── routes/                  # API endpoints
│   │   │   ├── __init__.py
│   │   │   ├── auth.py              # Authentication routes (login, register, logout)
│   │   │   ├── products.py          # Product CRUD routes
│   │   │   ├── cart.py              # Cart management routes
│   │   │   ├── orders.py            # Order routes
│   │   │   ├── payments.py          # Payment routes (Razorpay)
│   │   │   └── users.py             # User profile routes
│   │   ├── services/                # Business logic layer
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py      # Authentication logic
│   │   │   ├── product_service.py   # Product operations
│   │   │   ├── order_service.py     # Order operations
│   │   │   ├── payment_service.py   # Razorpay integration
│   │   │   └── cart_service.py      # Cart operations
│   │   ├── utils/                   # Utility functions
│   │   │   ├── __init__.py
│   │   │   ├── decorators.py        # Auth decorators, validators
│   │   │   ├── errors.py            # Custom error classes
│   │   │   └── helpers.py           # Helper functions
│   │   ├── middleware/              # Custom middleware
│   │   │   ├── __init__.py
│   │   │   └── auth_middleware.py   # JWT validation middleware
│   │   └── requirements.txt         # Python dependencies
│   ├── tests/                       # Test files
│   │   ├── __init__.py
│   │   ├── test_auth.py
│   │   ├── test_products.py
│   │   ├── test_orders.py
│   │   └── test_payments.py
│   ├── migrations/                  # Database migration files
│   ├── .env.example                 # Environment variables template
│   ├── run.py                       # Entry point to start backend
│   ├── wsgi.py                      # WSGI configuration (for deployment)
│   └── README.md                    # Backend documentation
│
├── frontend/
│   ├── index.html                   # Homepage
│   ├── cart.html                    # Cart page
│   ├── checkout.html                # Checkout page
│   ├── blog.html                    # Blog index
│   ├── login.html                   # Login page
│   ├── register.html                # Registration page
│   ├── track-order.html             # Order tracking page
│   ├── product-detail.html          # Product detail page
│   ├── assets/
│   │   ├── css/
│   │   │   ├── styles.css           # Main stylesheet
│   │   │   ├── components.css       # Component styles
│   │   │   └── responsive.css       # Responsive styles
│   │   ├── js/
│   │   │   ├── main.js              # Main app logic
│   │   │   ├── api-client.js        # API communication layer
│   │   │   ├── auth.js              # Authentication logic
│   │   │   ├── cart.js              # Cart management
│   │   │   ├── products.js          # Product loading and display
│   │   │   ├── orders.js            # Order management
│   │   │   ├── payments.js          # Payment processing (Razorpay)
│   │   │   └── utils.js             # Utility functions
│   │   ├── images/                  # Product images, icons
│   │   └── fonts/                   # Custom fonts
│   ├── components/
│   │   ├── header.html              # Header component
│   │   ├── footer.html              # Footer component
│   │   ├── navbar.html              # Navigation bar
│   │   └── product-card.html        # Product card component
│   ├── pages/
│   │   ├── blog/
│   │   │   ├── blog-sweetener-comparison.html
│   │   │   ├── blog-monk-fruit-101.html
│   │   │   ├── blog-sugar-free-baking.html
│   │   │   └── blog-diabetics-guide.html
│   │   └── policies/
│   │       ├── privacy-policy.html
│   │       ├── terms.html
│   │       ├── shipping-policy.html
│   │       └── return-refund-policy.html
│   └── README.md                    # Frontend documentation
│
├── database/
│   ├── schema.sql                   # Database schema initialization
│   ├── seed_data.sql                # Sample data for testing
│   └── README.md                    # Database documentation
│
├── .env.example                     # Global environment variables template
├── .gitignore                       # Git ignore rules
├── docker-compose.yml               # Docker setup (optional)
├── README.md                        # Project root documentation
└── SETUP.md                         # Setup and installation guide
```

---

## Task Breakdown

### Task 1: Project Initialization & Git Setup

**Files:**
- Create: `backend/.env.example`
- Create: `backend/requirements.txt`
- Create: `backend/run.py`
- Create: `backend/README.md`
- Create: `.gitignore`
- Create: `README.md`
- Create: `SETUP.md`

**Interfaces:**
- Produces: Project root structure, dependency list, environment configuration template

- [ ] **Step 1: Create backend directory structure**

```bash
mkdir -p backend/app/{models,routes,services,utils,middleware}
mkdir -p backend/tests
mkdir -p backend/migrations
mkdir -p frontend/assets/{css,js,images,fonts}
mkdir -p frontend/components
mkdir -p frontend/pages/{blog,policies}
mkdir -p database
```

- [ ] **Step 2: Create .gitignore file**

```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Environment variables
.env
.env.local
.env.*.local

# Database
*.db
*.sqlite3
*.sqlite

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Node (if using any frontend tools)
node_modules/
npm-debug.log
yarn-error.log

# Logs
*.log

# Testing
.pytest_cache/
.coverage
htmlcov/

# Payment keys (NEVER commit these)
razorpay_key_id
razorpay_key_secret
```

- [ ] **Step 3: Create backend requirements.txt**

```
Flask==2.3.0
Flask-SQLAlchemy==3.0.5
Flask-Migrate==4.0.4
Flask-JWT-Extended==4.4.4
Flask-CORS==4.0.0
python-dotenv==1.0.0
psycopg2-binary==2.9.6
SQLAlchemy==2.0.12
Razorpay==1.3.0
requests==2.31.0
validators==0.20.0
```

- [ ] **Step 4: Create backend .env.example**

```
# Flask Configuration
FLASK_ENV=development
FLASK_APP=run.py
SECRET_KEY=your_secret_key_here

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/monq2_db
DATABASE_NAME=monq2_db
DATABASE_USER=monq2_user
DATABASE_PASSWORD=your_password_here
DATABASE_HOST=localhost
DATABASE_PORT=5432

# JWT Configuration
JWT_SECRET_KEY=your_jwt_secret_key_here
JWT_ACCESS_TOKEN_EXPIRES=3600

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

- [ ] **Step 5: Create backend/run.py (entry point)**

```python
import os
from app import create_app, db

app = create_app(os.getenv('FLASK_ENV', 'development'))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
```

- [ ] **Step 6: Create root README.md**

```markdown
# MONQ2 - Full-Stack E-Commerce Platform

A complete e-commerce platform for sugar-free sweetener products with payment processing.

## Project Structure

- **backend/** - Python REST API (Flask/Django)
- **frontend/** - Static HTML/CSS/JS frontend
- **database/** - Database schemas and seed data

## Quick Start

1. Clone the repository
2. Follow SETUP.md for installation instructions
3. Backend runs on `http://localhost:5000`
4. Frontend accessible on `http://localhost:3000` (or via file server)

## Technology Stack

- Backend: Python (Flask/Django)
- Database: PostgreSQL
- API: RESTful API with JSON
- Payment: Razorpay
- Frontend: HTML, CSS, JavaScript

## Documentation

- See `backend/README.md` for backend documentation
- See `frontend/README.md` for frontend documentation
- See `SETUP.md` for detailed setup instructions
```

- [ ] **Step 7: Create SETUP.md**

```markdown
# MONQ2 Setup Guide

## Prerequisites

- Python 3.8+
- PostgreSQL 12+
- pip (Python package manager)

## Backend Setup

1. Create virtual environment:
   \`\`\`bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   cd backend
   pip install -r requirements.txt
   \`\`\`

3. Configure environment:
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your settings
   \`\`\`

4. Set up database:
   \`\`\`bash
   # Create PostgreSQL database first
   createdb monq2_db
   \`\`\`

5. Run migrations:
   \`\`\`bash
   flask db upgrade
   \`\`\`

6. Start backend:
   \`\`\`bash
   python run.py
   \`\`\`

Backend will be available at `http://localhost:5000`

## Frontend Setup

1. Serve frontend using Python's built-in server:
   \`\`\`bash
   cd frontend
   python -m http.server 8000
   \`\`\`

Frontend will be available at `http://localhost:8000`

## Environment Variables

Copy `.env.example` to `.env` and update with your actual values:
- Database credentials
- JWT secret key
- Razorpay API keys
- Frontend URL for CORS

## Troubleshooting

- **Database connection error**: Verify PostgreSQL is running and credentials are correct
- **Port already in use**: Change port in run.py or kill existing process
- **Module not found**: Ensure virtual environment is activated and requirements are installed
```

- [ ] **Step 8: Commit initial project structure**

```bash
git add .gitignore README.md SETUP.md backend/requirements.txt backend/run.py backend/.env.example
git commit -m "feat: initialize project structure with directories and configuration files"
```

---

### Task 2: Database Schema Setup

**Files:**
- Create: `database/schema.sql`
- Create: `database/README.md`
- Create: `backend/app/models/__init__.py`
- Create: `backend/app/models/user.py`
- Create: `backend/app/models/product.py`
- Create: `backend/app/models/order.py`
- Create: `backend/app/models/payment.py`
- Create: `backend/app/models/cart.py`

**Interfaces:**
- Produces: SQLAlchemy models for User, Product, Order, Payment, Cart; PostgreSQL schema

- [ ] **Step 1: Create database schema SQL**

```sql
-- database/schema.sql

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(80),
    last_name VARCHAR(80),
    phone_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(80),
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',  -- pending, processing, shipped, delivered, cancelled
    shipping_address TEXT,
    billing_address TEXT,
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create order items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Create payments table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    razorpay_order_id VARCHAR(255) UNIQUE,
    razorpay_payment_id VARCHAR(255) UNIQUE,
    razorpay_signature VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(20) DEFAULT 'pending',  -- pending, success, failed, refunded
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create cart table
CREATE TABLE cart (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create cart items table
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_payments_razorpay_order_id ON payments(razorpay_order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
```

- [ ] **Step 2: Create User model**

```python
# backend/app/models/user.py

from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app import db

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(80))
    last_name = db.Column(db.String(80))
    phone_number = db.Column(db.String(20))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    orders = db.relationship('Order', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    cart = db.relationship('Cart', backref='user', uselist=False, cascade='all, delete-orphan')
    payments = db.relationship('Payment', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone_number': self.phone_number,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
```

- [ ] **Step 3: Create Product model**

```python
# backend/app/models/product.py

from datetime import datetime
from app import db

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    stock_quantity = db.Column(db.Integer, default=0)
    category = db.Column(db.String(80))
    image_url = db.Column(db.String(255))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    order_items = db.relationship('OrderItem', backref='product', lazy='dynamic')
    cart_items = db.relationship('CartItem', backref='product', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': float(self.price),
            'stock_quantity': self.stock_quantity,
            'category': self.category,
            'image_url': self.image_url,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
```

- [ ] **Step 4: Create Order model**

```python
# backend/app/models/order.py

from datetime import datetime
from app import db

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    order_number = db.Column(db.String(50), unique=True, nullable=False)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.String(20), default='pending', index=True)
    shipping_address = db.Column(db.Text)
    billing_address = db.Column(db.Text)
    payment_method = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    items = db.relationship('OrderItem', backref='order', lazy='dynamic', cascade='all, delete-orphan')
    payment = db.relationship('Payment', backref='order', uselist=False, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_number': self.order_number,
            'user_id': self.user_id,
            'total_amount': float(self.total_amount),
            'status': self.status,
            'shipping_address': self.shipping_address,
            'billing_address': self.billing_address,
            'payment_method': self.payment_method,
            'items': [item.to_dict() for item in self.items],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'))
    quantity = db.Column(db.Integer, nullable=False)
    price_at_purchase = db.Column(db.Numeric(10, 2), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'product_name': self.product.name if self.product else None,
            'quantity': self.quantity,
            'price_at_purchase': float(self.price_at_purchase)
        }
```

- [ ] **Step 5: Create Payment model**

```python
# backend/app/models/payment.py

from datetime import datetime
from app import db

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    razorpay_order_id = db.Column(db.String(255), unique=True, index=True)
    razorpay_payment_id = db.Column(db.String(255), unique=True, index=True)
    razorpay_signature = db.Column(db.String(255))
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(3), default='INR')
    status = db.Column(db.String(20), default='pending', index=True)
    payment_method = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'razorpay_order_id': self.razorpay_order_id,
            'razorpay_payment_id': self.razorpay_payment_id,
            'amount': float(self.amount),
            'currency': self.currency,
            'status': self.status,
            'payment_method': self.payment_method,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
```

- [ ] **Step 6: Create Cart model**

```python
# backend/app/models/cart.py

from datetime import datetime
from app import db

class Cart(db.Model):
    __tablename__ = 'cart'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    items = db.relationship('CartItem', backref='cart', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        total_price = sum(float(item.product.price) * item.quantity for item in self.items)
        return {
            'id': self.id,
            'user_id': self.user_id,
            'items': [item.to_dict() for item in self.items],
            'total_price': total_price,
            'item_count': len(list(self.items)),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class CartItem(db.Model):
    __tablename__ = 'cart_items'
    
    id = db.Column(db.Integer, primary_key=True)
    cart_id = db.Column(db.Integer, db.ForeignKey('cart.id'), nullable=False, index=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    added_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'product_name': self.product.name,
            'product_price': float(self.product.price),
            'quantity': self.quantity,
            'subtotal': float(self.product.price) * self.quantity
        }
```

- [ ] **Step 7: Create models __init__.py**

```python
# backend/app/models/__init__.py

from app.models.user import User
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.payment import Payment
from app.models.cart import Cart, CartItem

__all__ = ['User', 'Product', 'Order', 'OrderItem', 'Payment', 'Cart', 'CartItem']
```

- [ ] **Step 8: Create database README.md**

```markdown
# Database Documentation

## Schema Overview

### Users
Stores user account information.

### Products
Product catalog for the e-commerce store.

### Orders
Customer orders with order metadata.

### OrderItems
Individual items in each order (join table).

### Payments
Payment transaction records with Razorpay details.

### Cart
Shopping cart for each user.

### CartItems
Individual items in each cart (join table).

## Setup Instructions

1. Create PostgreSQL database:
   \`\`\`bash
   createdb monq2_db
   \`\`\`

2. Load schema:
   \`\`\`bash
   psql monq2_db < database/schema.sql
   \`\`\`

3. (Optional) Load seed data:
   \`\`\`bash
   psql monq2_db < database/seed_data.sql
   \`\`\`

## Relationships

- User → Orders (one-to-many)
- User → Cart (one-to-one)
- User → Payments (one-to-many)
- Order → OrderItems (one-to-many)
- Order → Payment (one-to-one)
- Product → OrderItems (one-to-many)
- Product → CartItems (one-to-many)
- Cart → CartItems (one-to-many)
```

- [ ] **Step 9: Commit database schema and models**

```bash
git add database/ backend/app/models/
git commit -m "feat: create database schema and SQLAlchemy models for all entities"
```

---

### Task 3: Flask Application Initialization

**Files:**
- Create: `backend/app/__init__.py`
- Create: `backend/app/config.py`
- Modify: `backend/run.py`

**Interfaces:**
- Produces: Flask app factory function, configuration management, app initialization

- [ ] **Step 1: Create app/config.py**

```python
# backend/app/config.py

import os
from datetime import timedelta

class Config:
    """Base configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JSON_SORT_KEYS = False
    
class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'postgresql://user:password@localhost:5432/monq2_db'
    )

class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'postgresql://user:password@localhost:5432/monq2_test_db'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=5)

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')

config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
```

- [ ] **Step 2: Create app/__init__.py**

```python
# backend/app/__init__.py

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from app.config import config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_name='development'):
    """Application factory function"""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config.get(config_name, config['default']))
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Enable CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config.get('FRONTEND_URL', 'http://localhost:3000'),
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Import models to register with SQLAlchemy
    from app.models import User, Product, Order, OrderItem, Payment, Cart, CartItem
    
    # Register blueprints
    from app.routes import auth_bp, products_bp, cart_bp, orders_bp, payments_bp, users_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(products_bp, url_prefix='/api/products')
    app.register_blueprint(cart_bp, url_prefix='/api/cart')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return {'status': 'OK', 'message': 'API is running'}, 200
    
    return app
```

- [ ] **Step 3: Update backend/run.py**

```python
# backend/run.py

import os
from app import create_app, db

def create_db_if_not_exists():
    """Create database tables if they don't exist"""
    from sqlalchemy import inspect
    
    app = create_app(os.getenv('FLASK_ENV', 'development'))
    
    with app.app_context():
        inspector = inspect(db.engine)
        existing_tables = inspector.get_table_names()
        
        if not existing_tables:
            print("Creating database tables...")
            db.create_all()
            print("Database tables created successfully!")
        else:
            print(f"Database already has tables: {existing_tables}")

if __name__ == '__main__':
    create_db_if_not_exists()
    
    app = create_app(os.getenv('FLASK_ENV', 'development'))
    app.run(
        debug=os.getenv('FLASK_ENV') == 'development',
        host='0.0.0.0',
        port=5000
    )
```

- [ ] **Step 4: Commit Flask initialization**

```bash
git add backend/app/__init__.py backend/app/config.py backend/run.py
git commit -m "feat: initialize Flask app with configuration, extensions, and blueprints"
```

---

### Task 4: Authentication Routes (JWT)

**Files:**
- Create: `backend/app/routes/__init__.py`
- Create: `backend/app/routes/auth.py`
- Create: `backend/app/utils/errors.py`
- Create: `backend/app/services/auth_service.py`
- Create: `backend/app/middleware/auth_middleware.py`

**Interfaces:**
- Consumes: User model from Task 2
- Produces: Authentication routes (register, login, logout), JWT token validation middleware

- [ ] **Step 1: Create utils/errors.py**

```python
# backend/app/utils/errors.py

class APIError(Exception):
    """Base API error class"""
    def __init__(self, message, status_code=400):
        self.message = message
        self.status_code = status_code
        super().__init__()

class ValidationError(APIError):
    """Validation error"""
    def __init__(self, message):
        super().__init__(message, 400)

class AuthenticationError(APIError):
    """Authentication error"""
    def __init__(self, message):
        super().__init__(message, 401)

class AuthorizationError(APIError):
    """Authorization error"""
    def __init__(self, message):
        super().__init__(message, 403)

class NotFoundError(APIError):
    """Resource not found error"""
    def __init__(self, message):
        super().__init__(message, 404)

class ConflictError(APIError):
    """Resource conflict error (e.g., duplicate entry)"""
    def __init__(self, message):
        super().__init__(message, 409)
```

- [ ] **Step 2: Create services/auth_service.py**

```python
# backend/app/services/auth_service.py

from app import db
from app.models.user import User
from app.utils.errors import ValidationError, AuthenticationError, ConflictError
import validators

class AuthService:
    """Business logic for authentication"""
    
    @staticmethod
    def register_user(username, email, password, first_name=None, last_name=None):
        """
        Register a new user
        
        Args:
            username: User's username
            email: User's email
            password: User's password (will be hashed)
            first_name: User's first name
            last_name: User's last name
            
        Returns:
            User object
            
        Raises:
            ValidationError: If input is invalid
            ConflictError: If user already exists
        """
        # Validate input
        if not username or len(username) < 3:
            raise ValidationError("Username must be at least 3 characters long")
        
        if not email or not validators.email(email):
            raise ValidationError("Invalid email address")
        
        if not password or len(password) < 6:
            raise ValidationError("Password must be at least 6 characters long")
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            raise ConflictError("Email already registered")
        
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            raise ConflictError("Username already taken")
        
        # Create new user
        user = User(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        return user
    
    @staticmethod
    def authenticate_user(email, password):
        """
        Authenticate user with email and password
        
        Args:
            email: User's email
            password: User's password
            
        Returns:
            User object if authentication successful
            
        Raises:
            AuthenticationError: If credentials are invalid
        """
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            raise AuthenticationError("Invalid email or password")
        
        if not user.is_active:
            raise AuthenticationError("Account is inactive")
        
        return user
    
    @staticmethod
    def get_user_by_id(user_id):
        """Get user by ID"""
        user = User.query.get(user_id)
        if not user:
            from app.utils.errors import NotFoundError
            raise NotFoundError("User not found")
        return user
```

- [ ] **Step 3: Create routes/__init__.py**

```python
# backend/app/routes/__init__.py

from flask import Blueprint

auth_bp = Blueprint('auth', __name__)
products_bp = Blueprint('products', __name__)
cart_bp = Blueprint('cart', __name__)
orders_bp = Blueprint('orders', __name__)
payments_bp = Blueprint('payments', __name__)
users_bp = Blueprint('users', __name__)

# Import route handlers
from app.routes.auth import *
from app.routes.products import *
from app.routes.cart import *
from app.routes.orders import *
from app.routes.payments import *
from app.routes.users import *
```

- [ ] **Step 4: Create routes/auth.py**

```python
# backend/app/routes/auth.py

from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.routes import auth_bp
from app.services.auth_service import AuthService
from app.utils.errors import APIError

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user
    
    Request body:
    {
        "username": "user123",
        "email": "user@example.com",
        "password": "password123",
        "first_name": "John",
        "last_name": "Doe"
    }
    """
    data = request.get_json()
    
    try:
        user = AuthService.register_user(
            username=data.get('username'),
            email=data.get('email'),
            password=data.get('password'),
            first_name=data.get('first_name'),
            last_name=data.get('last_name')
        )
        
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict(),
            'access_token': access_token
        }), 201
    
    except APIError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login user and return JWT token
    
    Request body:
    {
        "email": "user@example.com",
        "password": "password123"
    }
    """
    data = request.get_json()
    
    try:
        user = AuthService.authenticate_user(
            email=data.get('email'),
            password=data.get('password')
        )
        
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token
        }), 200
    
    except APIError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logout user (token invalidation handled on frontend)
    """
    return jsonify({'message': 'Logout successful'}), 200

@auth_bp.route('/verify', methods=['GET'])
@jwt_required()
def verify_token():
    """
    Verify that JWT token is valid
    """
    current_user_id = get_jwt_identity()
    
    try:
        user = AuthService.get_user_by_id(current_user_id)
        return jsonify({
            'message': 'Token is valid',
            'user': user.to_dict()
        }), 200
    except APIError as e:
        return jsonify({'error': e.message}), e.status_code
```

- [ ] **Step 5: Create middleware/auth_middleware.py**

```python
# backend/app/middleware/auth_middleware.py

from flask_jwt_extended import verify_jwt_in_request
from flask import jsonify
from functools import wraps

def token_required(f):
    """Decorator to require JWT token for protected routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Unauthorized: Invalid or missing token'}), 401
    
    return decorated_function
```

- [ ] **Step 6: Create empty route files (to be implemented in later tasks)**

```bash
# Create empty files for other routes
touch backend/app/routes/products.py
touch backend/app/routes/cart.py
touch backend/app/routes/orders.py
touch backend/app/routes/payments.py
touch backend/app/routes/users.py

# Add minimal content to avoid import errors
```

```python
# backend/app/routes/products.py
from app.routes import products_bp

@products_bp.route('/', methods=['GET'])
def get_products():
    return {'message': 'Products endpoint'}, 200
```

```python
# backend/app/routes/cart.py
from app.routes import cart_bp

@cart_bp.route('/', methods=['GET'])
def get_cart():
    return {'message': 'Cart endpoint'}, 200
```

```python
# backend/app/routes/orders.py
from app.routes import orders_bp

@orders_bp.route('/', methods=['GET'])
def get_orders():
    return {'message': 'Orders endpoint'}, 200
```

```python
# backend/app/routes/payments.py
from app.routes import payments_bp

@payments_bp.route('/', methods=['GET'])
def get_payments():
    return {'message': 'Payments endpoint'}, 200
```

```python
# backend/app/routes/users.py
from app.routes import users_bp

@users_bp.route('/', methods=['GET'])
def get_users():
    return {'message': 'Users endpoint'}, 200
```

- [ ] **Step 7: Commit authentication implementation**

```bash
git add backend/app/routes/ backend/app/services/auth_service.py backend/app/utils/errors.py backend/app/middleware/
git commit -m "feat: implement JWT authentication with register, login, and token verification"
```

---

### Task 5: Products Routes (CRUD)

**Files:**
- Modify: `backend/app/routes/products.py`
- Create: `backend/app/services/product_service.py`

**Interfaces:**
- Consumes: Product model from Task 2, auth routes from Task 4
- Produces: Product CRUD endpoints (GET all, GET by ID, POST, PUT, DELETE)

- [ ] **Step 1: Create services/product_service.py**

```python
# backend/app/services/product_service.py

from app import db
from app.models.product import Product
from app.utils.errors import ValidationError, NotFoundError

class ProductService:
    """Business logic for product operations"""
    
    @staticmethod
    def get_all_products(page=1, per_page=20, category=None, active_only=True):
        """Get all products with pagination and filtering"""
        query = Product.query
        
        if active_only:
            query = query.filter_by(is_active=True)
        
        if category:
            query = query.filter_by(category=category)
        
        pagination = query.paginate(page=page, per_page=per_page)
        
        return {
            'items': [p.to_dict() for p in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }
    
    @staticmethod
    def get_product_by_id(product_id):
        """Get product by ID"""
        product = Product.query.get(product_id)
        
        if not product:
            raise NotFoundError("Product not found")
        
        return product
    
    @staticmethod
    def create_product(name, description, price, stock_quantity, category, image_url=None):
        """Create new product"""
        if not name:
            raise ValidationError("Product name is required")
        
        if not price or float(price) <= 0:
            raise ValidationError("Price must be greater than 0")
        
        if stock_quantity is None or stock_quantity < 0:
            raise ValidationError("Stock quantity cannot be negative")
        
        product = Product(
            name=name,
            description=description,
            price=price,
            stock_quantity=stock_quantity,
            category=category,
            image_url=image_url,
            is_active=True
        )
        
        db.session.add(product)
        db.session.commit()
        
        return product
    
    @staticmethod
    def update_product(product_id, **kwargs):
        """Update product"""
        product = ProductService.get_product_by_id(product_id)
        
        # Validate update data
        if 'price' in kwargs and float(kwargs['price']) <= 0:
            raise ValidationError("Price must be greater than 0")
        
        if 'stock_quantity' in kwargs and kwargs['stock_quantity'] < 0:
            raise ValidationError("Stock quantity cannot be negative")
        
        # Update allowed fields
        allowed_fields = ['name', 'description', 'price', 'stock_quantity', 'category', 'image_url', 'is_active']
        for field in allowed_fields:
            if field in kwargs:
                setattr(product, field, kwargs[field])
        
        db.session.commit()
        
        return product
    
    @staticmethod
    def delete_product(product_id):
        """Soft delete product (set is_active to False)"""
        product = ProductService.get_product_by_id(product_id)
        product.is_active = False
        db.session.commit()
        
        return product
```

- [ ] **Step 2: Update backend/app/routes/products.py**

```python
# backend/app/routes/products.py

from flask import request, jsonify
from flask_jwt_extended import jwt_required
from app.routes import products_bp
from app.services.product_service import ProductService
from app.utils.errors import APIError

@products_bp.route('/', methods=['GET'])
def get_products():
    """
    Get all products with pagination
    
    Query parameters:
    - page: Page number (default: 1)
    - per_page: Items per page (default: 20)
    - category: Filter by category
    """
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    category = request.args.get('category')
    
    try:
        result = ProductService.get_all_products(
            page=page,
            per_page=per_page,
            category=category
        )
        return jsonify(result), 200
    except APIError as e:
        return jsonify({'error': e.message}), e.status_code

@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get product by ID"""
    try:
        product = ProductService.get_product_by_id(product_id)
        return jsonify(product.to_dict()), 200
    except APIError as e:
        return jsonify({'error': e.message}), e.status_code

@products_bp.route('/', methods=['POST'])
@jwt_required()
def create_product():
    """
    Create new product (admin only)
    
    Request body:
    {
        "name": "Stevia Sweetener",
        "description": "Pure stevia powder",
        "price": 299.99,
        "stock_quantity": 100,
        "category": "Stevia",
        "image_url": "https://example.com/image.jpg"
    }
    """
    data = request.get_json()
    
    try:
        product = ProductService.create_product(
            name=data.get('name'),
            description=data.get('description'),
            price=data.get('price'),
            stock_quantity=data.get('stock_quantity', 0),
            category=data.get('category'),
            image_url=data.get('image_url')
        )
        
        return jsonify({
            'message': 'Product created successfully',
            'product': product.to_dict()
        }), 201
    
    except APIError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    """
    Update product (admin only)
    
    Request body:
    {
        "name": "Updated Name",
        "price": 399.99,
        "stock_quantity": 50
    }
    """
    data = request.get_json()
    
    try:
        product = ProductService.update_product(product_id, **data)
        
        return jsonify({
            'message': 'Product updated successfully',
            'product': product.to_dict()
        }), 200
    
    except APIError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@products_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    """Delete product (soft delete - set is_active to False)"""
    try:
        product = ProductService.delete_product(product_id)
        
        return jsonify({
            'message': 'Product deleted successfully',
            'product': product.to_dict()
        }), 200
    
    except APIError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

- [ ] **Step 3: Commit products implementation**

```bash
git add backend/app/routes/products.py backend/app/services/product_service.py
git commit -m "feat: implement products CRUD endpoints with filtering and pagination"
```

---

### Task 6: Cart Routes

**Files:**
- Modify: `backend/app/routes/cart.py`
- Create: `backend/app/services/cart_service.py`

**Interfaces:**
- Consumes: Cart, CartItem, Product models; auth routes from Task 4
- Produces: Cart management endpoints (GET, ADD item, REMOVE item, UPDATE quantity, CLEAR cart)

- [ ] **Step 1: Create services/cart_service.py**

```python
# backend/app/services/cart_service.py

from app import db
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.utils.errors import ValidationError, NotFoundError

class CartService:
    """Business logic for cart operations"""
    
    @staticmethod
    def get_or_create_cart(user_id):
        """Get user's cart or create if doesn't exist"""
        cart = Cart.query.filter_by(user_id=user_id).first()
        
        if not cart:
            cart = Cart(user_id=user_id)
            db.session.add(cart)
            db.session.commit()
        
        return cart
    
    @staticmethod
    def get_cart(user_id):
        """Get user's cart"""
        cart = Cart.query.filter_by(user_id=user_id).first()
        
        if not cart:
            raise NotFoundError("Cart not found")
        
        return cart
    
    @staticmethod
    def add_to_cart(user_id, product_id, quantity=1):
        """Add product to cart or update quantity if exists"""
        if quantity < 1:
            raise ValidationError("Quantity must be at least 1")
        
        # Get or create cart
        cart = CartService.get_or_create_cart(user_id)
        
        # Check if product exists
        product = Product.query.get(product_id)
        if not product:
            raise NotFoundError("Product not found")
        
        if not product.is_active:
            raise ValidationError("Product is not available")
        
        # Check if item already in cart
        cart_item = CartItem.query.filter_by(
            cart_id=cart.id,
            product_id=product_id
        ).first()
        
        if cart_item:
            cart_item.quantity += quantity
        else:
            cart_item = CartItem(
                cart_id=cart.id,
                product_id=product_id,
                quantity=quantity
            )
            db.session.add(cart_item)
        
        db.session.commit()
        
        return cart
    
    @staticmethod
    def remove_from_cart(user_id, product_id):
        """Remove product from cart"""
        cart = CartService.get_cart(user_id)
        
        cart_item = CartItem.query.filter_by(
            cart_id=cart.id,
            product_id=product_id
        ).first()
        
        if not cart_item:
            raise NotFoundError("Item not found in cart")
        
        db.session.delete(cart_item)
        db.session.commit()
        
        return cart
    
    @staticmethod
    def update_cart_item_quantity(user_id, product_id, quantity):
        """Update quantity of item in cart"""
        if quantity < 0:
            raise ValidationError("Quantity cannot be negative")
        
        cart = CartService.get_cart(user_id)
        
        cart_item = CartItem.query.filter_by(
            cart_id=cart.id,
            product_id=product_id
        ).first()
        
        if not cart_item:
            raise NotFoundError("Item not found in cart")
        
        if quantity == 0:
            db.session.delete(cart_item)
        else:
            cart_item.quantity = quantity
        
        db.session.commit()
        
        return cart
    
    @staticmethod
    def clear_cart(user_id):
        """Clear all items from cart"""
        cart = CartService.get_cart(user_id)
        
        CartItem.query.filter_by(cart_id=cart.id).delete()
        db.session.commit()
        
        return cart
```

- [ ] **Step 2: Update backend/app/routes/cart.py**

```python
# backend/app/routes/cart.py

from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.routes import cart_bp
from app.services.cart_service import CartService
from app.utils.errors import APIError

@cart_bp.route('/', methods=['GET'])
@jwt_required()
def get_cart():
    """Get user's cart"""
    user_id = get_jwt_identity()
    
    try:
        cart = CartService.get_or_create_cart(user_id)
        return jsonify(cart.to_dict()), 200
    except APIError as e:
        return jsonify({'error': e.message}), e.status_code

@cart_bp.route('/add', methods=['POST'])
@jwt_required()
def add_to_cart():
    """
    Add product to cart
    
    Request body:
    {
        "product_id": 1,
        "quantity": 2
    }
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        cart = CartService.add_to_cart(
            user_id=user_id,
            product_id=data.get('product_id'),
            quantity=data.get('quantity', 1)
        )
        
        return jsonify({
            'message': 'Item added to cart',
            'cart': cart.to_dict()
        }), 200
    
    except APIError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@cart_bp.route('/remove/<int:product_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(product_id):
    """Remove product from cart"""
    user_id = get_jwt_identity()
    
    try:
        cart = CartService.remove_from_cart(user_id, product_id)
        
        return jsonify({
            'message': 'Item removed from cart',
            'cart': cart.to_dict()
        }), 200
    
    except APIError as e:
        return jsonify({'error': e.message}), e.status_code

@cart_bp.route('/update/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_cart_item(product_id):
    """
    Update quantity of item in cart
    
    Request body:
    {
        "quantity": 3
    }
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        cart = CartService.update_cart_item_quantity(
            user_id=user_id,
            product_id=product_id,
            quantity=data.get('quantity', 0)
        )
        
        return jsonify({
            'message': 'Cart item updated',
            'cart': cart.to_dict()
        }), 200
    
    except APIError as e:
        return jsonify({'error': e.message}), e.status_code

@cart_bp.route('/clear', methods=['DELETE'])
@jwt_required()
def clear_cart():
    """Clear all items from cart"""
    user_id = get_jwt_identity()
    
    try:
        cart = CartService.clear_cart(user_id)
        
        return jsonify({
            'message': 'Cart cleared',
            'cart': cart.to_dict()
        }), 200
    
    except APIError as e:
        return jsonify({'error': e.message}), e.status_code
```

- [ ] **Step 3: Commit cart implementation**

```bash
git add backend/app/routes/cart.py backend/app/services/cart_service.py
git commit -m "feat: implement shopping cart management endpoints"
```

---

### Task 7: Orders Routes

**Files:**
- Modify: `backend/app/routes/orders.py`
- Create: `backend/app/services/order_service.py`
- Create: `backend/app/utils/helpers.py`

**Interfaces:**
- Consumes: Order, OrderItem, Cart, CartItem, Product models; cart service
- Produces: Order creation, retrieval, and status update endpoints

- [ ] **Step 1: Create utils/helpers.py**

```python
# backend/app/utils/helpers.py

import uuid
from datetime import datetime

def generate_order_number():
    """Generate unique order number"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_suffix = str(uuid.uuid4())[:8].upper()
    return f"ORD-{timestamp}-{random_suffix}"
```

- [ ] **Step 2: Create services/order_service.py**

```python
# backend/app/services/order_service.py

from app import db
from app.models.order import Order, OrderItem
from app.models.cart import CartItem
from app.models.product import Product
from app.utils.errors import ValidationError, NotFoundError
from app.utils.helpers import generate_order_number

class OrderService:
    """Business logic for order operations"""
    
    @staticmethod
    def create_order_from_cart(user_id, shipping_address, billing_address):
        """Create order from user's cart"""
        from app.models.cart import Cart
        
        cart = Cart.query.filter_by(user_id=user_id).first()
        
        if not cart or len(list(cart.items)) == 0:
            raise ValidationError("Cart is empty")
        
        if not shipping_address:
            raise ValidationError("Shipping address is required")
        
        # Calculate total
        total_amount = 0
        order_items_data = []
        
        for cart_item in cart.items:
            product = cart_item.product
            item_total = float(product.price) * cart_item.quantity
            total_amount += item_total
            
            order_items_data.append({
                'product': product,
                'quantity': cart_item.quantity,
                'price': float(product.price)
            })
        
        # Create order
        order = Order(
            user_id=user_id,
            order_number=generate_order_number(),
            total_amount=total_amount,
            shipping_address=shipping_address,
            billing_address=billing_address or shipping_address,
            status='pending'
        )
        
        db.session.add(order)
        db.session.flush()  # To get order ID without committing
        
        # Create order items
        for item_data in order_items_data:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item_data['product'].id,
                quantity=item_data['quantity'],
                price_at_purchase=item_data['price']
            )
            db.session.add(order_item)
        
        db.session.commit()
        
        # Clear cart
        CartItem.query.filter_by(cart_id=cart.id).delete()
        db.session.commit()
        
        return order
    
    @staticmethod
    def get_order(order_id, user_id=None):
        """Get order by ID, optionally checking user ownership"""
        order = Order.query.get(order_id)
        
        if not order:
            raise NotFoundError("Order not found")
        
        if user_id and order.user_id != user_id:
            raise ValidationError("Order does not belong to user")
        
        return order
    
    @staticmethod
    def get_user_orders(user_id, page=1, per_page=10):
        """Get all orders for a user"""
        pagination = Order.query.filter_by(user_id=user_id).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return {
            'items': [o.to_dict() for o in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }
    
    @staticmethod
    def update_order_status(order_id, status):
        """Update order status"""
        valid_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
        
        if status not in valid_statuses:
            raise ValidationError(f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
        
        order = OrderService.get_order(order_id)
        order.status = status
        db.session.commit()
        
        return order
```

- [ ] **Step 3: Update backend/app/routes/orders.py**

```python
# backend/app/routes/orders.py

from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.routes import orders_bp
from app.services.order_service import OrderService
from app.utils.errors import APIError

@orders_bp.route('/', methods=['POST'])
@jwt_required()
def create_order():
    """
    Create order from cart
    
    Request body:
    {
        "shipping_address": "123 Main St, City, State 12345",
        "billing_address": "123 Main St, City, State 12345"
    }
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        order = OrderService.create_order_from_cart(
            user_id=user_id,
            shipping_address=data.get('shipping_address'),
            billing_address=data.get('billing_address')
        )
        
        return jsonify({
            'message': 'Order created successfully',
            'order': order.to_dict()
        }), 201
    
    except APIError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@orders_bp.route('/', methods=['GET'])
@jwt_required()
def get_orders():
    """Get user's orders"""
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    try:
        result = OrderService.get_user_orders(user_id, page, per_page)
        return jsonify(result), 200
    except APIError as e:
        return jsonify({'error': e.message}), e.status_code

@orders_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    """Get order details"""
    user_id = get_jwt_identity()
    
    try:
        order = OrderService.get_order(order_id, user_id)
        return jsonify(order.to_dict()), 200
    except APIError as e:
        return jsonify({'error': e.message}), e.status_code

@orders_bp.route('/<int:order_id>/status', methods=['PUT'])
@jwt_required()
def update_order_status(order_id):
    """
    Update order status (admin only)
    
    Request body:
    {
        "status": "shipped"
    }
    """
    data = request.get_json()
    
    try:
        order = OrderService.update_order_status(
            order_id=order_id,
            status=data.get('status')
        )
        
        return jsonify({
            'message': 'Order status updated',
            'order': order.to_dict()
        }), 200
    
    except APIError as e:
        return jsonify({'error': e.message}), e.status_code
```

- [ ] **Step 4: Commit orders implementation**

```bash
git add backend/app/routes/orders.py backend/app/services/order_service.py backend/app/utils/helpers.py
git commit -m "feat: implement order creation and management endpoints"
```

---

### Task 8: Payments Routes (Razorpay Integration)

**Files:**
- Modify: `backend/app/routes/payments.py`
- Create: `backend/app/services/payment_service.py`

**Interfaces:**
- Consumes: Payment, Order models; order service
- Produces: Payment creation, verification, and status endpoints with Razorpay integration

- [ ] **Step 1: Create services/payment_service.py**

```python
# backend/app/services/payment_service.py

import razorpay
import os
from app import db
from app.models.payment import Payment
from app.models.order import Order
from app.utils.errors import ValidationError, NotFoundError

class PaymentService:
    """Business logic for payment operations with Razorpay"""
    
    def __init__(self):
        self.razorpay_key_id = os.getenv('RAZORPAY_KEY_ID')
        self.razorpay_key_secret = os.getenv('RAZORPAY_KEY_SECRET')
        
        if not self.razorpay_key_id or not self.razorpay_key_secret:
            raise ValueError("Razorpay credentials not configured")
        
        self.client = razorpay.Client(
            auth=(self.razorpay_key_id, self.razorpay_key_secret)
        )
    
    def create_razorpay_order(self, order_id, user_id):
        """Create Razorpay order for payment"""
        order = Order.query.get(order_id)
        
        if not order:
            raise NotFoundError("Order not found")
        
        if order.user_id != user_id:
            raise ValidationError("Order does not belong to user")
        
        # Check if payment already exists
        existing_payment = Payment.query.filter_by(order_id=order_id).first()
        if existing_payment:
            raise ValidationError("Payment already exists for this order")
        
        try:
            # Create Razorpay order
            razorpay_order = self.client.order.create({
                'amount': int(float(order.total_amount) * 100),  # Convert to paise
                'currency': 'INR',
                'receipt': order.order_number,
                'payment_capture': 1  # Auto capture
            })
            
            # Save payment record
            payment = Payment(
                order_id=order_id,
                user_id=user_id,
                razorpay_order_id=razorpay_order['id'],
                amount=order.total_amount,
                currency='INR',
                status='pending'
            )
            
            db.session.add(payment)
            db.session.commit()
            
            return {
                'payment_id': payment.id,
                'razorpay_order_id': razorpay_order['id'],
                'razorpay_key_id': self.razorpay_key_id,
                'amount': razorpay_order['amount'],
                'currency': razorpay_order['currency']
            }
        
        except Exception as e:
            raise ValidationError(f"Failed to create payment: {str(e)}")
    
    def verify_payment(self, razorpay_order_id, razorpay_payment_id, razorpay_signature):
        """Verify Razorpay payment signature"""
        try:
            # Verify signature
            self.client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })
            
            return True
        except razorpay.errors.SignatureVerificationError:
            return False
    
    def complete_payment(self, razorpay_order_id, razorpay_payment_id, razorpay_signature):
        """Complete payment and update order status"""
        # Verify signature
        if not self.verify_payment(razorpay_order_id, razorpay_payment_id, razorpay_signature):
            raise ValidationError("Payment signature verification failed")
        
        # Find payment record
        payment = Payment.query.filter_by(razorpay_order_id=razorpay_order_id).first()
        
        if not payment:
            raise NotFoundError("Payment record not found")
        
        # Update payment status
        payment.razorpay_payment_id = razorpay_payment_id
        payment.razorpay_signature = razorpay_signature
        payment.status = 'success'
        
        # Update order status
        order = payment.order
        order.status = 'processing'
        order.payment_method = 'razorpay'
        
        db.session.commit()
        
        return payment
    
    def get_payment(self, payment_id, user_id=None):
        """Get payment by ID"""
        payment = Payment.query.get(payment_id)
        
        if not payment:
            raise NotFoundError("Payment not found")
        
        if user_id and payment.user_id != user_id:
            raise ValidationError("Payment does not belong to user")
        
        return payment
    
    def get_order_payment(self, order_id, user_id=None):
        """Get payment for an order"""
        order = Order.query.get(order_id)
        
        if not order:
            raise NotFoundError("Order not found")
        
        if user_id and order.user_id != user_id:
            raise ValidationError("Order does not belong to user")
        
        payment = Payment.query.filter_by(order_id=order_id).first()
        
        if not payment:
            raise NotFoundError("Payment not found for this order")
        
        return payment
```

- [ ] **Step 2: Update backend/app/routes/payments.py**

```python
# backend/app/routes/payments.py

from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.routes import payments_bp
from app.services.payment_service import PaymentService
from app.utils.errors import APIError

@payments_bp.route('/create-order/<int:order_id>', methods=['POST'])
@jwt_required()
def create_payment(order_id):
    """
    Create Razorpay order for payment
    Returns order details needed for payment form
    """
    user_id = get_jwt_identity()
    
    try:
        service = PaymentService()
        payment_data = service.create_razorpay_order(order_id, user_id)
        
        return jsonify({
            'message': 'Payment order created',
            'data': payment_data
        }), 201
    
    except APIError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/verify', methods=['POST'])
@jwt_required()
def verify_payment():
    """
    Verify payment signature and complete payment
    
    Request body:
    {
        "razorpay_order_id": "order_id_from_razorpay",
        "razorpay_payment_id": "payment_id_from_razorpay",
        "razorpay_signature": "signature_from_razorpay"
    }
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        service = PaymentService()
        payment = service.complete_payment(
            razorpay_order_id=data.get('razorpay_order_id'),
            razorpay_payment_id=data.get('razorpay_payment_id'),
            razorpay_signature=data.get('razorpay_signature')
        )
        
        return jsonify({
            'message': 'Payment verified successfully',
            'payment': payment.to_dict()
        }), 200
    
    except APIError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/<int:payment_id>', methods=['GET'])
@jwt_required()
def get_payment(payment_id):
    """Get payment details"""
    user_id = get_jwt_identity()
    
    try:
        service = PaymentService()
        payment = service.get_payment(payment_id, user_id)
        
        return jsonify(payment.to_dict()), 200
    except APIError as e:
        return jsonify({'error': e.message}), e.status_code

@payments_bp.route('/order/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order_payment(order_id):
    """Get payment for an order"""
    user_id = get_jwt_identity()
    
    try:
        service = PaymentService()
        payment = service.get_order_payment(order_id, user_id)
        
        return jsonify(payment.to_dict()), 200
    except APIError as e:
        return jsonify({'error': e.message}), e.status_code
```

- [ ] **Step 3: Commit payments implementation**

```bash
git add backend/app/routes/payments.py backend/app/services/payment_service.py
git commit -m "feat: implement Razorpay payment integration with order verification"
```

---

### Task 9: Users Routes (Profile Management)

**Files:**
- Modify: `backend/app/routes/users.py`
- Create: `backend/app/services/user_service.py`

**Interfaces:**
- Consumes: User model from Task 2
- Produces: User profile retrieval and update endpoints

- [ ] **Step 1: Create services/user_service.py**

```python
# backend/app/services/user_service.py

from app import db
from app.models.user import User
from app.utils.errors import ValidationError, NotFoundError
import validators

class UserService:
    """Business logic for user operations"""
    
    @staticmethod
    def get_user(user_id):
        """Get user by ID"""
        user = User.query.get(user_id)
        
        if not user:
            raise NotFoundError("User not found")
        
        return user
    
    @staticmethod
    def update_user_profile(user_id, **kwargs):
        """Update user profile"""
        user = UserService.get_user(user_id)
        
        # Validate email if provided
        if 'email' in kwargs:
            email = kwargs['email']
            if email and not validators.email(email):
                raise ValidationError("Invalid email address")
            
            # Check if email already taken by another user
            existing_user = User.query.filter(
                User.email == email,
                User.id != user_id
            ).first()
            if existing_user:
                raise ValidationError("Email already in use")
        
        # Validate username if provided
        if 'username' in kwargs:
            username = kwargs['username']
            if username and len(username) < 3:
                raise ValidationError("Username must be at least 3 characters")
            
            # Check if username already taken
            existing_user = User.query.filter(
                User.username == username,
                User.id != user_id
            ).first()
            if existing_user:
                raise ValidationError("Username already taken")
        
        # Update allowed fields
        allowed_fields = ['email', 'username', 'first_name', 'last_name', 'phone_number']
        for field in allowed_fields:
            if field in kwargs:
                setattr(user, field, kwargs[field])
        
        db.session.commit()
        
        return user
    
    @staticmethod
    def change_password(user_id, old_password, new_password):
        """Change user password"""
        user = UserService.get_user(user_id)
        
        if not user.check_password(old_password):
            raise ValidationError("Current password is incorrect")
        
        if len(new_password) < 6:
            raise ValidationError("New password must be at least 6 characters")
        
        if old_password == new_password:
            raise ValidationError("New password must be different from current password")
        
        user.set_password(new_password)
        db.session.commit()
        
        return user
```

- [ ] **Step 2: Update backend/app/routes/users.py**

```python
# backend/app/routes/users.py

from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.routes import users_bp
from app.services.user_service import UserService
from app.utils.errors import APIError

@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user's profile"""
    user_id = get_jwt_identity()
    
    try:
        user = UserService.get_user(user_id)
        return jsonify(user.to_dict()), 200
    except APIError as e:
        return jsonify({'error': e.message}), e.status_code

@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """
    Update user profile
    
    Request body (all fields optional):
    {
        "first_name": "John",
        "last_name": "Doe",
        "email": "newemail@example.com",
        "phone_number": "+1234567890",
        "username": "newusername"
    }
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        user = UserService.update_user_profile(user_id, **data)
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
    
    except APIError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """
    Change user password
    
    Request body:
    {
        "old_password": "currentpassword",
        "new_password": "newpassword"
    }
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        user = UserService.change_password(
            user_id=user_id,
            old_password=data.get('old_password'),
            new_password=data.get('new_password')
        )
        
        return jsonify({
            'message': 'Password changed successfully',
            'user': user.to_dict()
        }), 200
    
    except APIError as e:
        return jsonify({'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

- [ ] **Step 3: Commit users implementation**

```bash
git add backend/app/routes/users.py backend/app/services/user_service.py
git commit -m "feat: implement user profile and password management endpoints"
```

---

### Task 10: Frontend API Integration Layer

**Files:**
- Create: `frontend/assets/js/api-client.js`
- Create: `frontend/assets/js/config.js`
- Modify: `frontend/assets/js/main.js`

**Interfaces:**
- Consumes: Backend API endpoints from Tasks 4-9
- Produces: JavaScript API client for frontend communication with backend

- [ ] **Step 1: Create frontend/assets/js/config.js**

```javascript
// frontend/assets/js/config.js

// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://localhost:5000/api',
    TIMEOUT: 30000, // 30 seconds
    
    ENDPOINTS: {
        // Auth
        AUTH_REGISTER: '/auth/register',
        AUTH_LOGIN: '/auth/login',
        AUTH_LOGOUT: '/auth/logout',
        AUTH_VERIFY: '/auth/verify',
        
        // Products
        PRODUCTS_LIST: '/products',
        PRODUCTS_DETAIL: '/products/{id}',
        PRODUCTS_CREATE: '/products',
        PRODUCTS_UPDATE: '/products/{id}',
        PRODUCTS_DELETE: '/products/{id}',
        
        // Cart
        CART_GET: '/cart',
        CART_ADD: '/cart/add',
        CART_REMOVE: '/cart/remove/{id}',
        CART_UPDATE: '/cart/update/{id}',
        CART_CLEAR: '/cart/clear',
        
        // Orders
        ORDERS_CREATE: '/orders',
        ORDERS_LIST: '/orders',
        ORDERS_DETAIL: '/orders/{id}',
        ORDERS_UPDATE_STATUS: '/orders/{id}/status',
        
        // Payments
        PAYMENTS_CREATE: '/payments/create-order/{id}',
        PAYMENTS_VERIFY: '/payments/verify',
        PAYMENTS_GET: '/payments/{id}',
        PAYMENTS_ORDER: '/payments/order/{id}',
        
        // Users
        USERS_PROFILE: '/users/profile',
        USERS_UPDATE: '/users/profile',
        USERS_CHANGE_PASSWORD: '/users/change-password'
    }
};

// Storage keys
const STORAGE_KEYS = {
    TOKEN: 'auth_token',
    USER: 'current_user'
};
```

- [ ] **Step 2: Create frontend/assets/js/api-client.js**

```javascript
// frontend/assets/js/api-client.js

class APIClient {
    constructor(baseURL, timeout = 30000) {
        this.baseURL = baseURL;
        this.timeout = timeout;
        this.token = this.getStoredToken();
    }
    
    /**
     * Make HTTP request
     */
    async request(method, endpoint, data = null, headers = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };
        
        // Add auth token if available
        if (this.token) {
            options.headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        // Add body for non-GET requests
        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(url, options);
            const responseData = await response.json();
            
            if (!response.ok) {
                throw new Error(responseData.error || `HTTP Error: ${response.status}`);
            }
            
            return responseData;
        } catch (error) {
            console.error(`API Error [${method} ${endpoint}]:`, error);
            throw error;
        }
    }
    
    /**
     * GET request
     */
    get(endpoint, headers = {}) {
        return this.request('GET', endpoint, null, headers);
    }
    
    /**
     * POST request
     */
    post(endpoint, data, headers = {}) {
        return this.request('POST', endpoint, data, headers);
    }
    
    /**
     * PUT request
     */
    put(endpoint, data, headers = {}) {
        return this.request('PUT', endpoint, data, headers);
    }
    
    /**
     * DELETE request
     */
    delete(endpoint, headers = {}) {
        return this.request('DELETE', endpoint, null, headers);
    }
    
    /**
     * Authentication methods
     */
    
    async register(username, email, password, firstName, lastName) {
        const response = await this.post(API_CONFIG.ENDPOINTS.AUTH_REGISTER, {
            username,
            email,
            password,
            first_name: firstName,
            last_name: lastName
        });
        
        if (response.access_token) {
            this.setToken(response.access_token);
            this.storeUser(response.user);
        }
        
        return response;
    }
    
    async login(email, password) {
        const response = await this.post(API_CONFIG.ENDPOINTS.AUTH_LOGIN, {
            email,
            password
        });
        
        if (response.access_token) {
            this.setToken(response.access_token);
            this.storeUser(response.user);
        }
        
        return response;
    }
    
    async logout() {
        await this.post(API_CONFIG.ENDPOINTS.AUTH_LOGOUT, {});
        this.clearToken();
        this.clearUser();
    }
    
    async verifyToken() {
        return this.get(API_CONFIG.ENDPOINTS.AUTH_VERIFY);
    }
    
    /**
     * Product methods
     */
    
    async getProducts(page = 1, perPage = 20, category = null) {
        let endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS_LIST}?page=${page}&per_page=${perPage}`;
        if (category) {
            endpoint += `&category=${category}`;
        }
        return this.get(endpoint);
    }
    
    async getProductDetail(productId) {
        return this.get(API_CONFIG.ENDPOINTS.PRODUCTS_DETAIL.replace('{id}', productId));
    }
    
    /**
     * Cart methods
     */
    
    async getCart() {
        return this.get(API_CONFIG.ENDPOINTS.CART_GET);
    }
    
    async addToCart(productId, quantity = 1) {
        return this.post(API_CONFIG.ENDPOINTS.CART_ADD, {
            product_id: productId,
            quantity
        });
    }
    
    async removeFromCart(productId) {
        return this.delete(API_CONFIG.ENDPOINTS.CART_REMOVE.replace('{id}', productId));
    }
    
    async updateCartItem(productId, quantity) {
        return this.put(API_CONFIG.ENDPOINTS.CART_UPDATE.replace('{id}', productId), {
            quantity
        });
    }
    
    async clearCart() {
        return this.delete(API_CONFIG.ENDPOINTS.CART_CLEAR);
    }
    
    /**
     * Order methods
     */
    
    async createOrder(shippingAddress, billingAddress = null) {
        return this.post(API_CONFIG.ENDPOINTS.ORDERS_CREATE, {
            shipping_address: shippingAddress,
            billing_address: billingAddress
        });
    }
    
    async getOrders(page = 1, perPage = 10) {
        return this.get(`${API_CONFIG.ENDPOINTS.ORDERS_LIST}?page=${page}&per_page=${perPage}`);
    }
    
    async getOrderDetail(orderId) {
        return this.get(API_CONFIG.ENDPOINTS.ORDERS_DETAIL.replace('{id}', orderId));
    }
    
    /**
     * Payment methods
     */
    
    async createPayment(orderId) {
        return this.post(API_CONFIG.ENDPOINTS.PAYMENTS_CREATE.replace('{id}', orderId), {});
    }
    
    async verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
        return this.post(API_CONFIG.ENDPOINTS.PAYMENTS_VERIFY, {
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature
        });
    }
    
    /**
     * User methods
     */
    
    async getUserProfile() {
        return this.get(API_CONFIG.ENDPOINTS.USERS_PROFILE);
    }
    
    async updateUserProfile(profileData) {
        return this.put(API_CONFIG.ENDPOINTS.USERS_UPDATE, profileData);
    }
    
    async changePassword(oldPassword, newPassword) {
        return this.post(API_CONFIG.ENDPOINTS.USERS_CHANGE_PASSWORD, {
            old_password: oldPassword,
            new_password: newPassword
        });
    }
    
    /**
     * Token management
     */
    
    setToken(token) {
        this.token = token;
        this.storeToken(token);
    }
    
    getToken() {
        return this.token;
    }
    
    clearToken() {
        this.token = null;
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
    
    getStoredToken() {
        return localStorage.getItem(STORAGE_KEYS.TOKEN);
    }
    
    storeToken(token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    }
    
    /**
     * User storage
     */
    
    storeUser(user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
    
    getStoredUser() {
        const userJSON = localStorage.getItem(STORAGE_KEYS.USER);
        return userJSON ? JSON.parse(userJSON) : null;
    }
    
    clearUser() {
        localStorage.removeItem(STORAGE_KEYS.USER);
    }
    
    /**
     * Check authentication status
     */
    
    isAuthenticated() {
        return !!this.token;
    }
}

// Initialize API client
const apiClient = new APIClient(API_CONFIG.BASE_URL, API_CONFIG.TIMEOUT);
```

- [ ] **Step 3: Update frontend/assets/js/main.js**

```javascript
// frontend/assets/js/main.js

/**
 * Main application entry point
 * Initializes API client and sets up event listeners
 */

document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is already logged in
    const token = apiClient.getToken();
    const user = apiClient.getStoredUser();
    
    if (token && user) {
        console.log('User already logged in:', user);
        updateUIForLoggedInUser(user);
    } else {
        console.log('User not logged in');
        updateUIForLoggedOutUser();
    }
    
    // Setup navigation
    setupNavigation();
});

/**
 * Update UI for logged in user
 */
function updateUIForLoggedInUser(user) {
    const loginBtn = document.getElementById('login-btn');
    const profileBtn = document.getElementById('profile-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (profileBtn) profileBtn.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
    
    // Show user name if available
    const userNameEl = document.getElementById('user-name');
    if (userNameEl && user) {
        userNameEl.textContent = `Welcome, ${user.first_name || user.username}`;
    }
}

/**
 * Update UI for logged out user
 */
function updateUIForLoggedOutUser() {
    const loginBtn = document.getElementById('login-btn');
    const profileBtn = document.getElementById('profile-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (profileBtn) profileBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
}

/**
 * Setup navigation event listeners
 */
function setupNavigation() {
    // Login button
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.location.href = '/login.html';
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await apiClient.logout();
                alert('Logged out successfully');
                updateUIForLoggedOutUser();
                window.location.href = '/';
            } catch (error) {
                alert('Logout failed: ' + error.message);
            }
        });
    }
    
    // Profile button
    const profileBtn = document.getElementById('profile-btn');
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            window.location.href = '/profile.html';
        });
    }
    
    // Cart button
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            window.location.href = '/cart.html';
        });
    }
}

/**
 * Helper: Show loading indicator
 */
function showLoading() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'block';
}

/**
 * Helper: Hide loading indicator
 */
function hideLoading() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
}

/**
 * Helper: Show error message
 */
function showError(message) {
    const errorEl = document.getElementById('error-message');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }
}

/**
 * Helper: Show success message
 */
function showSuccess(message) {
    const successEl = document.getElementById('success-message');
    if (successEl) {
        successEl.textContent = message;
        successEl.style.display = 'block';
    }
}

/**
 * Helper: Check if user is authenticated
 */
function checkAuthentication() {
    if (!apiClient.isAuthenticated()) {
        alert('Please log in to continue');
        window.location.href = '/login.html';
        return false;
    }
    return true;
}
```

- [ ] **Step 4: Commit frontend API integration**

```bash
git add frontend/assets/js/api-client.js frontend/assets/js/config.js frontend/assets/js/main.js
git commit -m "feat: create frontend API client with service layer for backend communication"
```

---

### Task 11: Update HTML Files for API Integration

**Files:**
- Modify: `frontend/index.html`, `frontend/login.html`, `frontend/register.html`, `frontend/cart.html`, `frontend/checkout.html`

**Interfaces:**
- Consumes: API client from Task 10
- Produces: Updated HTML pages with API integration

**Note:** This task involves updating existing MONQ2 HTML files to work with the new backend API. The exact changes depend on your current HTML structure. Here are template implementations:

- [ ] **Step 1: Create login.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - MONQ2</title>
    <link rel="stylesheet" href="/assets/css/styles.css">
</head>
<body>
    <div class="container">
        <div class="login-form">
            <h1>Login to MONQ2</h1>
            
            <div id="error-message" class="error-message" style="display: none;"></div>
            <div id="success-message" class="success-message" style="display: none;"></div>
            
            <form id="login-form">
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required>
                </div>
                
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required>
                </div>
                
                <button type="submit" class="btn btn-primary">Login</button>
            </form>
            
            <p>Don't have an account? <a href="/register.html">Register here</a></p>
        </div>
    </div>
    
    <script src="/assets/js/config.js"></script>
    <script src="/assets/js/api-client.js"></script>
    <script>
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                showLoading();
                const response = await apiClient.login(email, password);
                showSuccess('Login successful! Redirecting...');
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } catch (error) {
                showError('Login failed: ' + error.message);
            } finally {
                hideLoading();
            }
        });
        
        function showLoading() {
            document.querySelectorAll('button').forEach(btn => btn.disabled = true);
        }
        
        function hideLoading() {
            document.querySelectorAll('button').forEach(btn => btn.disabled = false);
        }
        
        function showError(msg) {
            document.getElementById('error-message').textContent = msg;
            document.getElementById('error-message').style.display = 'block';
        }
        
        function showSuccess(msg) {
            document.getElementById('success-message').textContent = msg;
            document.getElementById('success-message').style.display = 'block';
        }
    </script>
</body>
</html>
```

- [ ] **Step 2: Create register.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - MONQ2</title>
    <link rel="stylesheet" href="/assets/css/styles.css">
</head>
<body>
    <div class="container">
        <div class="register-form">
            <h1>Create MONQ2 Account</h1>
            
            <div id="error-message" class="error-message" style="display: none;"></div>
            <div id="success-message" class="success-message" style="display: none;"></div>
            
            <form id="register-form">
                <div class="form-group">
                    <label for="username">Username:</label>
                    <input type="text" id="username" name="username" required minlength="3">
                </div>
                
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required>
                </div>
                
                <div class="form-group">
                    <label for="first_name">First Name:</label>
                    <input type="text" id="first_name" name="first_name">
                </div>
                
                <div class="form-group">
                    <label for="last_name">Last Name:</label>
                    <input type="text" id="last_name" name="last_name">
                </div>
                
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required minlength="6">
                </div>
                
                <button type="submit" class="btn btn-primary">Register</button>
            </form>
            
            <p>Already have an account? <a href="/login.html">Login here</a></p>
        </div>
    </div>
    
    <script src="/assets/js/config.js"></script>
    <script src="/assets/js/api-client.js"></script>
    <script>
        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const firstName = document.getElementById('first_name').value;
            const lastName = document.getElementById('last_name').value;
            
            try {
                showLoading();
                const response = await apiClient.register(username, email, password, firstName, lastName);
                showSuccess('Registration successful! Redirecting to home...');
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } catch (error) {
                showError('Registration failed: ' + error.message);
            } finally {
                hideLoading();
            }
        });
        
        function showLoading() {
            document.querySelectorAll('button').forEach(btn => btn.disabled = true);
        }
        
        function hideLoading() {
            document.querySelectorAll('button').forEach(btn => btn.disabled = false);
        }
        
        function showError(msg) {
            document.getElementById('error-message').textContent = msg;
            document.getElementById('error-message').style.display = 'block';
        }
        
        function showSuccess(msg) {
            document.getElementById('success-message').textContent = msg;
            document.getElementById('success-message').style.display = 'block';
        }
    </script>
</body>
</html>
```

- [ ] **Step 3: Commit HTML updates**

```bash
git add frontend/login.html frontend/register.html
git commit -m "feat: create login and register pages with API integration"
```

---

## Next Steps

1. **Choose Python Framework:** Decide between Flask (lightweight) or Django (batteries-included)
2. **Database Setup:** Set up PostgreSQL and create the database
3. **Environment Configuration:** Create `.env` file with all required credentials
4. **Run Backend Server:** Start the Flask/Django development server
5. **Connect Frontend:** Update existing HTML files to integrate with the API
6. **Testing:** Test all endpoints with Postman or similar tool
7. **Razorpay Sandbox:** Set up Razorpay sandbox credentials for testing
8. **Deployment:** Deploy backend to production server and update frontend URLs

---

## Summary

This plan transforms MONQ2 from a static HTML site into a full-stack e-commerce application with:

✅ **Backend:** Python REST API with authentication, products, cart, orders, and Razorpay payments  
✅ **Database:** PostgreSQL with proper schema and relationships  
✅ **Frontend:** API client layer for seamless communication  
✅ **Authentication:** JWT token-based auth system  
✅ **Payment:** Razorpay integration for payment processing  
✅ **User Management:** Profile management and password changing  

Each task is independently testable and includes all necessary code.
