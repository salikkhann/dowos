# DowEats - Complete Phase 2 Specification

## Overview
**Launch:** Week 5-8 (Phase 2)
**Scope:** Food delivery platform integrated with DowOS
**Users:** Students order, restaurants fulfill, riders deliver
**Revenue Model:** 15% commission per order

---

## 1. FEATURE SPECIFICATIONS

### 1.1 Student Interface

#### Home Screen
- **"Order Food"** section showing:
  - Partner restaurants/cafes (grid view with photos)
  - Filters: Vegetarian, Fast Food, Healthy, Budget
  - Search bar: Search by restaurant or dish
  - Delivery time estimate
  - Average rating
  - Current promotions/discounts

#### Restaurant Detail Screen
- Menu organized by category (Meals, Snacks, Drinks, Desserts)
- Each item shows: Photo, name, description, price, ratings
- Dietary tags (Vegan, Halal, etc.)
- Click item → Add to cart

#### Checkout Flow
1. Review cart (quantities, prices)
2. Select delivery address (or use campus default)
3. Delivery time estimate: "Arrives in 25-35 minutes"
4. Select payment method:
   - Dow Credits (in-app wallet)
   - Easypaisa (mobile payment)
   - JazzCash (mobile payment)
5. Add special instructions (allergies, no onions, etc.)
6. Place order

#### Order Tracking
- Real-time status: "Preparing → Packed → Rider assigned → In transit → Delivered"
- Rider location on map (if available)
- Rider contact info (name, phone)
- Estimated arrival countdown
- Chat with rider (in-app messaging)

#### Order History
- Past orders with dates
- Reorder button (quickly reorder same items)
- Rate and review restaurant
- Track loyalty points (accumulated per order)

### 1.2 Restaurant/Cafe Interface

#### Setup
- Restaurant admin dashboard login
- Add menu items:
  - Name, description, price, photo, category
  - Dietary tags
  - Preparation time estimate
- Set business hours (when accepting orders)
- Set minimum order value
- Create promotions/discounts

#### Order Management
- Incoming orders notification
- Order queue dashboard:
  - New orders at top
  - Cooking status (Not started → In progress → Ready)
  - Mark as "Ready for pickup" → Rider assigned
- View order details (customer special requests, delivery address)
- Cancel order option (with reason)

#### Analytics
- Daily/weekly revenue
- Popular items
- Customer feedback/ratings
- Rider performance metrics

### 1.3 Rider/Delivery Interface

#### Acceptance Flow
- Rider app shows available orders
- Accept order → Auto-assigned to rider
- Navigate to restaurant
- Pick up order
- Navigate to delivery address
- Mark delivered

#### Route Optimization
- Show best route (Point-based if on campus)
- Multiple orders per trip (if going same direction)
- Real-time GPS tracking
- Share ETA with customer

#### Earnings Tracking
- Delivery pay per order (flat PKR 50-100)
- Incentive bonuses (complete 10 orders = extra PKR 200)
- Daily earnings summary

---

## 2. DATA MODELS & SCHEMA

### 2.1 Tables

```sql
-- Restaurants/Cafes
restaurants (
  id UUID PRIMARY KEY,
  name TEXT,
  description TEXT,
  phone_number TEXT,
  email TEXT,
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(10,8),
  logo_url TEXT,
  average_rating DECIMAL(3,2),
  business_hours_start TIME,
  business_hours_end TIME,
  minimum_order_value DECIMAL(8,2),
  commission_rate DECIMAL(3,2) DEFAULT 0.15, -- 15%
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Menu Items
menu_items (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants,
  name TEXT,
  description TEXT,
  price DECIMAL(8,2),
  category TEXT, -- Meals, Snacks, Drinks, Desserts
  photo_url TEXT,
  dietary_tags JSON, -- ["Vegetarian", "Halal", "Gluten-free"]
  preparation_time_minutes INT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Orders
orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  restaurant_id UUID REFERENCES restaurants,
  rider_id UUID REFERENCES riders (nullable),
  total_amount DECIMAL(10,2),
  subtotal DECIMAL(10,2),
  tax DECIMAL(8,2),
  delivery_fee DECIMAL(8,2),
  discount_applied DECIMAL(8,2) DEFAULT 0,
  payment_method TEXT, -- dow_credits, easypaisa, jazzcash
  status TEXT, -- pending, accepted, cooking, packed, dispatched, delivered, cancelled
  delivery_address TEXT,
  special_instructions TEXT,
  ordered_at TIMESTAMP,
  accepted_at TIMESTAMP (nullable),
  packed_at TIMESTAMP (nullable),
  dispatched_at TIMESTAMP (nullable),
  delivered_at TIMESTAMP (nullable),
  estimated_delivery_time TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Order Items (Line items in order)
order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders,
  menu_item_id UUID REFERENCES menu_items,
  quantity INT,
  price_at_order DECIMAL(8,2),
  special_notes TEXT, -- No onions, extra sauce, etc.
  created_at TIMESTAMP
);

-- Riders
riders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  phone_number TEXT,
  vehicle_type TEXT, -- bike, car, bicycle
  license_plate TEXT,
  is_active BOOLEAN DEFAULT true,
  current_location GEOMETRY(POINT, 4326), -- PostgreSQL geographic point
  current_status TEXT, -- available, on_delivery, offline
  total_deliveries INT DEFAULT 0,
  average_rating DECIMAL(3,2),
  total_earnings DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Rider Location History (for analytics)
rider_location_history (
  id UUID PRIMARY KEY,
  rider_id UUID REFERENCES riders,
  latitude DECIMAL(10,8),
  longitude DECIMAL(10,8),
  timestamp TIMESTAMP,
  order_id UUID REFERENCES orders (nullable)
);

-- Order Reviews
order_reviews (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders,
  user_id UUID REFERENCES users,
  restaurant_rating INT (1-5),
  rider_rating INT (1-5),
  comment TEXT,
  created_at TIMESTAMP
);

-- Promotions
promotions (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants,
  code TEXT, -- SAVE20, WELCOME10
  discount_percentage DECIMAL(5,2),
  max_discount_amount DECIMAL(8,2),
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  minimum_order_value DECIMAL(8,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
);

-- Loyalty Points
loyalty_points (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  restaurant_id UUID REFERENCES restaurants,
  points_balance INT DEFAULT 0,
  points_earned_lifetime INT DEFAULT 0,
  points_redeemed_lifetime INT DEFAULT 0,
  last_earned_at TIMESTAMP (nullable),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Payment Transactions
doweats_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  order_id UUID REFERENCES orders,
  amount DECIMAL(10,2),
  payment_method TEXT, -- dow_credits, easypaisa, jazzcash
  transaction_status TEXT, -- pending, success, failed
  external_transaction_id TEXT (nullable), -- for Easypaisa/JazzCash
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 3. API ENDPOINTS

### 3.1 Restaurant/Menu Endpoints
```
GET    /api/doweats/restaurants
GET    /api/doweats/restaurants/:id
GET    /api/doweats/restaurants/:id/menu
POST   /api/admin/doweats/restaurants (admin only)
PUT    /api/admin/doweats/restaurants/:id (admin only)
```

### 3.2 Order Endpoints
```
POST   /api/doweats/orders (create order)
GET    /api/doweats/orders/:id (get order details)
GET    /api/doweats/orders (user's order history)
PUT    /api/doweats/orders/:id/cancel (cancel order)
PUT    /api/doweats/orders/:id/track (real-time tracking)
POST   /api/doweats/orders/:id/review (submit review)
```

### 3.3 Rider Endpoints
```
POST   /api/doweats/riders/accept-order/:id
PUT    /api/doweats/riders/location (update location)
PUT    /api/doweats/riders/status (set status: available/on_delivery)
GET    /api/doweats/riders/earnings
GET    /api/doweats/riders/deliveries
```

### 3.4 Payment Endpoints
```
POST   /api/doweats/pay-with-credits
POST   /api/doweats/pay-with-easypaisa
POST   /api/doweats/pay-with-jazzcash
POST   /api/doweats/easypaisa-callback (webhook for Easypaisa)
POST   /api/doweats/jazzcash-callback (webhook for JazzCash)
```

---

## 4. REAL-TIME FEATURES

### Real-Time Updates (Supabase Realtime)
- Order status changes (restaurant accepts → packed → dispatched)
- Rider location updates (every 10 seconds during delivery)
- New order notifications (for restaurant admin)
- Chat messages (rider ↔ customer)

### Polling (TanStack Query)
- Restaurant menu refresh (every 5 min)
- Order history (every 30 sec during active delivery)

---

## 5. FINANCIAL MODEL

### Commission Structure
- Per-order commission: 15%
- Payment processing fee: 2% (Easypaisa/JazzCash)

### Cost Breakdown (Week 5-8)
- Week 5: 5 restaurants, 5 orders/day = PKR 375/day (15% × PKR 500 × 5)
- Week 6: 8 restaurants, 15 orders/day = PKR 1,125/day
- Week 7: 10 restaurants, 30 orders/day = PKR 2,250/day
- Week 8: 12 restaurants, 50 orders/day = PKR 3,750/day (stabilized)

### Month 2 Projection
- 50 orders/day × 30 days × PKR 500 avg order × 15% = **PKR 112,500/month**

### Scaling to Year 2
- If 5,000 students, 500 orders/day
- **PKR 1.125M/month** (aggressive growth)

---

## 6. PHASE 2 IMPLEMENTATION TIMELINE

### Week 5 (Setup)
- [ ] Partner with 5-8 cafes
- [ ] Get menu from each cafe
- [ ] Onboard 2-3 delivery riders
- [ ] Build DowEats admin dashboard
- [ ] Test payment integration (Easypaisa test mode)
- [ ] Internal beta: Order from test cafes

### Week 6-7 (Beta Testing)
- [ ] Soft launch to 100 students
- [ ] Collect feedback (delivery time, food quality, payment issues)
- [ ] Fix bugs
- [ ] Refine rider assignment algorithm

### Week 8 (Public Launch)
- [ ] Go live with all restaurants
- [ ] Marketing push via Instagram/WhatsApp
- [ ] Promotions: "First order 50% off"
- [ ] Monitor metrics: Order volume, cancellation rate, customer satisfaction

---

## 7. SUCCESS METRICS

| Metric | Target (Week 8) | Target (Month 2) |
|--------|-----------------|------------------|
| Active restaurants | 12 | 20 |
| Daily orders | 50 | 150 |
| Average order value | PKR 500 | PKR 550 |
| Customer satisfaction | 4.5/5 | 4.6/5 |
| Delivery success rate | 95% | 98% |
| Average delivery time | 35 min | 30 min |
| Monthly revenue | PKR 37.5K | PKR 112.5K |

---

## 8. RISKS & MITIGATIONS

| Risk | Mitigation |
|------|-----------|
| Restaurants cancel partnership | Sign 6-month MoU, guaranteed minimum commission |
| Riders unreliable | Incentive bonuses, rate enforcement, backup riders |
| Payment failures | Multiple payment methods, instant notifications |
| Food quality issues | Customer reviews, restaurant rating system |
| Low adoption | Aggressive discounts first month, influencer marketing |

---

## 9. INTEGRATION WITH MVP

**Shared Components:**
- User authentication (same users table)
- Notifications (push notifications system)
- Admin dashboard (add DowEats section)
- Dow Credits wallet (reuse payment system)

**New Components:**
- Restaurant management
- Order tracking
- Rider assignment

**No conflicts with MVP features.**

