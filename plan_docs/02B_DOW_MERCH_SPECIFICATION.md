# Dow Merch - Complete Phase 2 Specification

## Overview
**Launch:** Week 9-10 (Phase 2)
**Scope:** Official Dow University merchandise store
**Products:** Hoodies, lab coats, t-shirts, caps, stickers
**Revenue Model:** Profit margin per item (PKR 300-500)

---

## 1. FEATURE SPECIFICATIONS

### 1.1 Student Interface

#### Merch Store Home
- **Featured Products** (carousel of new items)
- **Categories:**
  - Apparel (Hoodies, T-shirts, Lab coats)
  - Accessories (Caps, Bags, Stickers)
  - Drinkware (Mugs, Water bottles)
  - Stationery (Notebooks, Pens)

#### Product Detail Page
- High-res product photos (multiple angles)
- Product name, description, price
- Available sizes/colors
- Material info (cotton %, comfort rating)
- Customer reviews & ratings
- Stock availability
- Shipping time estimate
- Add to cart button

#### Customization Options (Future)
- Embroider name on lab coat
- Custom batch year on hoodie
- Print date on shirt

#### Checkout Flow
1. Review cart
2. Shipping address (campus default or custom)
3. Shipping method:
   - Pick up from campus (free)
   - Home delivery (PKR 100-200)
4. Payment:
   - Dow Credits
   - Easypaisa / JazzCash
5. Order confirmation with tracking number

#### Order Tracking
- Order status: "Processing → Printing/Packing → Shipped → Delivered"
- Tracking number (if shipping)
- Estimated delivery date
- Mark as received

### 1.2 Admin Interface (Inventory Management)

#### Product Management
- Add new product:
  - Name, description, category
  - Upload photos
  - Set price, cost, profit margin
  - Add sizes/colors available
  - Stock quantity per size/color
- Edit existing products
- Mark out-of-stock
- View sales analytics

#### Order Management
- Incoming orders dashboard
- Print packing slips
- Batch shipping
- Track inventory levels
- Alert when stock low (<10 units)

#### Vendor Management (for manufacturing)
- Store vendor contact info
- Reorder quantity settings
- Lead times
- Cost tracking

### 1.3 Shipping Integration

#### Fulfillment Options
1. **Campus Pickup**
   - Students pick up from designated location
   - Free shipping
   - Notification when ready

2. **Home Delivery** (Pakistan Post / TCS)
   - Track via courier
   - Estimated 3-7 days delivery
   - PKR 100-200 fee

---

## 2. DATA MODELS & SCHEMA

```sql
-- Merch Products
merch_products (
  id UUID PRIMARY KEY,
  name TEXT,
  description TEXT,
  category TEXT, -- Apparel, Accessories, Drinkware, Stationery
  price DECIMAL(8,2),
  cost_price DECIMAL(8,2),
  profit_margin DECIMAL(8,2),
  image_urls JSON, -- Array of image URLs
  material TEXT, -- 100% Cotton, Polyester, etc.
  available_colors JSON, -- ["Black", "White", "Blue"]
  available_sizes JSON, -- ["S", "M", "L", "XL"]
  total_stock INT DEFAULT 100,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Product Stock (per size/color combination)
merch_stock (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES merch_products,
  color TEXT,
  size TEXT,
  quantity INT DEFAULT 0,
  reorder_level INT DEFAULT 5,
  reorder_quantity INT DEFAULT 20,
  last_restocked_at TIMESTAMP (nullable)
);

-- Merch Orders
merch_orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  order_number TEXT, -- MRC-001, MRC-002, etc.
  total_amount DECIMAL(10,2),
  payment_method TEXT, -- dow_credits, easypaisa, jazzcash
  shipping_method TEXT, -- pickup, home_delivery
  shipping_address TEXT,
  order_status TEXT, -- pending, processing, packing, shipped, delivered, returned
  tracking_number TEXT (nullable),
  estimated_delivery_date DATE (nullable),
  placed_at TIMESTAMP,
  shipped_at TIMESTAMP (nullable),
  delivered_at TIMESTAMP (nullable),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Merch Order Items
merch_order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES merch_orders,
  product_id UUID REFERENCES merch_products,
  color TEXT,
  size TEXT,
  quantity INT,
  unit_price DECIMAL(8,2),
  subtotal DECIMAL(10,2),
  created_at TIMESTAMP
);

-- Customer Reviews for Merch
merch_reviews (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES merch_products,
  user_id UUID REFERENCES users,
  rating INT (1-5),
  title TEXT,
  comment TEXT,
  photos_url JSON (nullable),
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP
);

-- Vendor/Manufacturer
merch_vendors (
  id UUID PRIMARY KEY,
  name TEXT,
  contact_person TEXT,
  phone_number TEXT,
  email TEXT,
  city TEXT,
  specialty TEXT, -- Hoodies, T-shirts, etc.
  lead_time_days INT,
  min_order_quantity INT,
  unit_cost DECIMAL(8,2),
  quality_rating DECIMAL(3,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
);

-- Merch Inventory History
merch_inventory_log (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES merch_products,
  transaction_type TEXT, -- purchase, restock, adjustment
  quantity_change INT,
  reason TEXT,
  user_id UUID REFERENCES users (nullable),
  created_at TIMESTAMP
);

-- Sales Analytics
merch_sales_analytics (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES merch_products,
  month DATE,
  units_sold INT,
  revenue DECIMAL(10,2),
  profit DECIMAL(10,2),
  created_at TIMESTAMP
);
```

---

## 3. API ENDPOINTS

```
GET    /api/merch/products
GET    /api/merch/products/:id
GET    /api/merch/products/:id/stock
POST   /api/merch/cart/add
DELETE /api/merch/cart/remove
GET    /api/merch/cart
POST   /api/merch/orders (create order)
GET    /api/merch/orders/:id
GET    /api/merch/orders (user order history)
POST   /api/merch/products/:id/review
GET    /api/merch/products/:id/reviews

-- Admin endpoints
POST   /api/admin/merch/products (create product)
PUT    /api/admin/merch/products/:id (update product)
GET    /api/admin/merch/inventory
PUT    /api/admin/merch/stock/:id
GET    /api/admin/merch/orders (all orders)
PUT    /api/admin/merch/orders/:id/status (update order status)
GET    /api/admin/merch/analytics
```

---

## 4. FINANCIAL MODEL

### Cost Breakdown
- Hoodie cost: PKR 700, Sell: PKR 1000, Profit: PKR 300
- Lab coat cost: PKR 400, Sell: PKR 800, Profit: PKR 400
- T-shirt cost: PKR 200, Sell: PKR 450, Profit: PKR 250
- Cap cost: PKR 100, Sell: PKR 250, Profit: PKR 150

### Sales Projection

**Week 1:**
- 20 hoodies × PKR 300 = PKR 6,000
- 10 lab coats × PKR 400 = PKR 4,000
- 15 t-shirts × PKR 250 = PKR 3,750
- 20 caps × PKR 150 = PKR 3,000
- **Week 1 total: PKR 16,750**

**By Week 4 (Week 9+10):**
- 100 hoodies × PKR 300 = PKR 30,000
- 50 lab coats × PKR 400 = PKR 20,000
- 80 t-shirts × PKR 250 = PKR 20,000
- 100 caps × PKR 150 = PKR 15,000
- **Week 4 total: PKR 85,000**

**Month 2 Projection (after scaling):**
- 400 items/week × average profit PKR 275 = **PKR 110,000/month**

---

## 5. PHASE 2 TIMELINE

### Week 8 (Design & Production)
- [ ] Design merch graphics (Dow logo, batch year, funny medical quotes)
- [ ] Source vendors (hoodies, lab coats, caps)
- [ ] Order initial inventory (100 hoodies, 50 lab coats, etc.)
- [ ] Design landing page for merch store
- [ ] Create admin dashboard

### Week 9 (Soft Launch)
- [ ] Receive inventory
- [ ] Test ordering system
- [ ] Beta test with 20 students
- [ ] Collect feedback

### Week 10 (Public Launch)
- [ ] Marketing push ("Finally, official Dow merch!")
- [ ] Instagram carousel ads
- [ ] Student ambassador promotions
- [ ] Limited-time discounts (first 50 orders 20% off)

---

## 6. SUCCESS METRICS

| Metric | Target (Week 10) | Target (Month 2) |
|--------|------------------|------------------|
| Total items sold | 200-250 | 1000+ |
| Repeat purchase rate | 20% | 35% |
| Average order value | PKR 1200 | PKR 1500 |
| Customer satisfaction | 4.5/5 | 4.7/5 |
| Monthly profit | PKR 55K | PKR 110K |

---

## 7. RISKS & MITIGATIONS

| Risk | Mitigation |
|------|-----------|
| Slow initial sales | Heavy discounts, influencer partnerships, dorm visits |
| Inventory stockout | Better demand forecasting, pre-orders |
| Quality issues | Vendor vetting, QA inspection on receipt |
| Shipping delays | Partner with reliable courier, set realistic expectations |

