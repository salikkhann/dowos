# Enhanced Marketplace - Complete Phase 2 Specification

## Overview
**Launch:** Week 5+ (Parallel with MVP)
**Scope:** Peer-to-peer marketplace for textbooks, equipment, services
**Includes:** Lost & Found expansion
**Revenue Model:** Small transaction fees (5-10%)

---

## 1. FEATURE SPECIFICATIONS

### 1.1 Marketplace Listings (P2P)

#### Seller Interface
1. **Create Listing:**
   - Item category (Textbooks, Lab Equipment, Notes, Services)
   - Item name, description
   - Condition (New, Excellent, Good, Fair, Poor)
   - Price
   - Photos (up to 5)
   - Contact method (chat, phone, WhatsApp)

2. **Listing Management:**
   - View active listings
   - Mark as sold
   - Edit price
   - Bump listing (move to top)
   - View interested buyers

#### Buyer Interface
1. **Browse:**
   - Search by keyword
   - Filter by category, price range, condition
   - Sort by: Recent, Price (low-high), Price (high-low), Rating

2. **Listing Detail:**
   - Photos, description, seller info
   - Seller rating/reviews
   - Message seller button
   - Add to watchlist

3. **Messaging:**
   - In-app chat with seller
   - Negotiate price
   - Agree on meetup location
   - Mark transaction complete

### 1.2 Textbook Exchange

**Special Features for Textbooks:**
- Book title auto-fill (search database)
- ISBN barcode scanner (use phone camera)
- Edition selector
- Author auto-populate
- Market price comparison ("Average selling: PKR 2000")
- Buy/sell history for that book

**Example Listing:**
```
Title: Harrison's Textbook of Internal Medicine
Edition: 22nd
Author: Dennis L. Kasper
Condition: Excellent (used 1 semester)
Price: PKR 2500
Seller: Medical student, Batch 1
Rating: 4.8/5 (12 reviews)
```

### 1.3 Lab Equipment Market

**Stethoscopes, reflex hammers, anatomy models, etc.**
- Category-specific details
- Condition ratings important
- Rental option (for expensive items like ultrasound machines)
- Lease terms (weekly, monthly, semester)

### 1.4 Academic Services

**Students offering:**
- Tutoring (Physics, Chemistry, Anatomy)
- Note-sharing (high-yield summaries for PKR 50-100)
- Solution sheets (for past papers)
- Group study sessions

**Price range:** PKR 50-500 per service

### 1.5 Lost & Found (Expanded from MVP)

**Improvements over MVP:**
- Item categories (Keys, Books, Clothing, Documents, Electronics)
- Detailed descriptions with location/time
- Photo uploads
- Reward offered (for lost items)
- Automatic expiration (30 days, then archived)
- Search by date found
- Mark item as claimed/resolved

**Example Lost Item:**
```
Lost: Black backpack with medical textbooks
Date: Feb 10, 2026
Location: Library, 2nd floor reading hall
Reward: PKR 500
Contact: Student name, room number
```

---

## 2. DATA MODELS & SCHEMA

```sql
-- Marketplace Categories
marketplace_categories (
  id UUID PRIMARY KEY,
  name TEXT, -- Textbooks, Equipment, Services, Lost & Found
  icon TEXT,
  description TEXT,
  created_at TIMESTAMP
);

-- Marketplace Listings (P2P)
marketplace_listings (
  id UUID PRIMARY KEY,
  seller_id UUID REFERENCES users,
  category_id UUID REFERENCES marketplace_categories,
  title TEXT,
  description TEXT,
  price DECIMAL(10,2),
  condition TEXT, -- New, Excellent, Good, Fair, Poor
  photos_url JSON, -- Array of URLs
  location TEXT,
  contact_method TEXT, -- chat, phone, whatsapp
  seller_phone TEXT (nullable, encrypted),
  is_negotiable BOOLEAN DEFAULT true,
  status TEXT, -- active, sold, removed
  views INT DEFAULT 0,
  interested_buyers INT DEFAULT 0,
  isbn TEXT (nullable, for books),
  book_title TEXT (nullable),
  book_author TEXT (nullable),
  book_edition TEXT (nullable),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  expires_at TIMESTAMP (90 days from creation)
);

-- Textbook Database (for auto-fill)
textbook_database (
  id UUID PRIMARY KEY,
  title TEXT,
  author TEXT,
  isbn TEXT (unique),
  edition TEXT,
  subject TEXT,
  average_price DECIMAL(10,2),
  market_info TEXT,
  created_at TIMESTAMP
);

-- Listing Inquiries/Messages
listing_inquiries (
  id UUID PRIMARY KEY,
  listing_id UUID REFERENCES marketplace_listings,
  buyer_id UUID REFERENCES users,
  seller_id UUID REFERENCES users,
  message_thread_id TEXT, -- Links to messaging system
  price_negotiation_offer DECIMAL(10,2) (nullable),
  status TEXT, -- active, sold, abandoned
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Watchlist
watchlist (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  listing_id UUID REFERENCES marketplace_listings,
  created_at TIMESTAMP,
  UNIQUE(user_id, listing_id)
);

-- Transaction History
marketplace_transactions (
  id UUID PRIMARY KEY,
  listing_id UUID REFERENCES marketplace_listings,
  buyer_id UUID REFERENCES users,
  seller_id UUID REFERENCES users,
  final_price DECIMAL(10,2),
  transaction_fee DECIMAL(10,2), -- 5-10%
  date_completed TIMESTAMP,
  marked_complete_by TEXT, -- buyer or seller
  created_at TIMESTAMP
);

-- Reviews (Buyer → Seller)
marketplace_reviews (
  id UUID PRIMARY KEY,
  transaction_id UUID REFERENCES marketplace_transactions,
  reviewer_id UUID REFERENCES users,
  reviewed_user_id UUID REFERENCES users,
  rating INT (1-5),
  comment TEXT,
  is_seller_review BOOLEAN,
  created_at TIMESTAMP
);

-- Lost & Found Listings
lost_found_listings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  type TEXT, -- lost or found
  category TEXT, -- Keys, Books, Clothing, Documents, Electronics
  title TEXT,
  description TEXT,
  photos_url JSON,
  location TEXT,
  date_of_incident DATE,
  time_approximate TEXT, -- Morning, Afternoon, Evening
  reward_offered DECIMAL(10,2) (nullable),
  status TEXT, -- active, claimed, expired
  claimant_user_id UUID REFERENCES users (nullable),
  claim_date TIMESTAMP (nullable),
  created_at TIMESTAMP,
  expires_at TIMESTAMP (30 days from creation),
  updated_at TIMESTAMP
);

-- Lost & Found Matches
lost_found_matches (
  id UUID PRIMARY KEY,
  lost_listing_id UUID REFERENCES lost_found_listings,
  found_listing_id UUID REFERENCES lost_found_listings,
  matched_by TEXT, -- user or admin
  confidence_score DECIMAL(3,2), -- 0-1, how confident match is
  is_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMP
);

-- Academic Services Listings
academic_services (
  id UUID PRIMARY KEY,
  provider_id UUID REFERENCES users,
  service_type TEXT, -- Tutoring, Note-sharing, Solution-sharing, Study-group
  subject TEXT,
  description TEXT,
  rate DECIMAL(10,2),
  availability JSON, -- Days and times available
  experience_years INT,
  previous_students_helped INT DEFAULT 0,
  rating DECIMAL(3,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Service Bookings
service_bookings (
  id UUID PRIMARY KEY,
  service_id UUID REFERENCES academic_services,
  student_id UUID REFERENCES users,
  provider_id UUID REFERENCES users,
  booking_date DATE,
  booking_time TIME,
  duration_hours DECIMAL(3,1),
  total_cost DECIMAL(10,2),
  status TEXT, -- pending, confirmed, completed, cancelled
  session_notes TEXT (nullable),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 3. API ENDPOINTS

### Marketplace Listings
```
GET    /api/marketplace/listings
GET    /api/marketplace/listings/:id
POST   /api/marketplace/listings (create)
PUT    /api/marketplace/listings/:id (edit)
DELETE /api/marketplace/listings/:id (remove)
GET    /api/marketplace/listings?category=textbooks&price_max=3000
POST   /api/marketplace/listings/:id/inquire (message seller)
GET    /api/marketplace/listings/:id/inquiries (for seller)
POST   /api/marketplace/watchlist/add
GET    /api/marketplace/watchlist
```

### Textbook Database
```
GET    /api/marketplace/textbooks/search?title=Harrison
GET    /api/marketplace/textbooks/isbn/:isbn
GET    /api/marketplace/textbooks/:id/average-price
```

### Transactions & Reviews
```
POST   /api/marketplace/transactions/:id/complete
POST   /api/marketplace/transactions/:id/review
GET    /api/marketplace/user/:id/reviews
GET    /api/marketplace/user/:id/reputation
```

### Lost & Found
```
GET    /api/marketplace/lost-found
POST   /api/marketplace/lost-found/post
GET    /api/marketplace/lost-found/:id
PATCH  /api/marketplace/lost-found/:id/claim
POST   /api/marketplace/lost-found/:id/match (admin)
```

### Academic Services
```
GET    /api/marketplace/services?subject=Anatomy
POST   /api/marketplace/services (create service)
POST   /api/marketplace/services/:id/book (book session)
GET    /api/marketplace/services/:id/availability
```

---

## 4. REPUTATION & TRUST SYSTEM

### Seller Score
```
score = (reviews_count * avg_rating + transaction_count * 0.1) / (reviews_count + 1)

Example:
- 10 reviews, avg 4.8 rating
- 50 transactions
- Score = (10 × 4.8 + 50 × 0.1) / 11 = (48 + 5) / 11 = 4.8
```

### Trust Badges
- ✅ Verified Email
- 🏆 5+ Sales, 4.5+ Rating
- 💯 100% Positive Feedback
- 📱 Verified Phone Number

### Dispute Resolution
- Buyer claims item not received
- Seller claims payment not received
- Admin review (DowOS team arbitrates)
- Refund/Relist decision

---

## 5. FINANCIAL MODEL

### Transaction Fees
- Textbooks: 5% (seller pays)
- Equipment: 7% (seller pays)
- Services: 10% (provider pays)
- Lost & Found: Free (admin service)

### Projection

**Listing volume (Month 1):**
- 200 textbook listings → 50 sold @ avg PKR 2500 = PKR 125K
- 100 equipment listings → 20 sold @ avg PKR 1000 = PKR 20K
- 50 service listings → 30 bookings @ avg PKR 500 = PKR 15K
- 300 lost & found items → 50 resolved

**DowOS revenue (5% avg across all):**
- Commission: ~PKR 8K (Month 1)
- Scaling to Month 6: ~PKR 40K/month

---

## 6. MODERATION & SAFETY

### Automated Moderation
- Keyword filtering (prevent scams)
- Price validation (alert on suspiciously low prices)
- Image screening (detect inappropriate content)
- User verification (Dow ID required)

### Manual Review
- Admin team spot-checks listings
- Respond to user reports
- Handle disputes

### Banned Items List
- Illegal items
- Counterfeit goods
- Hazardous materials

---

## 7. PHASE 2 TIMELINE

### Week 5-6 (MVP for Marketplace)
- [ ] Build P2P listing system
- [ ] Build messaging system
- [ ] Create textbook database (500 common books)
- [ ] Soft launch with 100 students

### Week 7-8 (Expansion)
- [ ] Add academic services
- [ ] Expand textbook database to 1000+ titles
- [ ] Launch Lost & Found promotion
- [ ] Reach 500+ active listings

### Week 9+ (Scaling)
- [ ] Add rental system
- [ ] Implement advanced search (filters, recommendations)
- [ ] Reputation badges + trust score display
- [ ] Scale to 2000+ active listings

---

## 8. SUCCESS METRICS

| Metric | Target (Month 1) | Target (Month 3) |
|--------|------------------|------------------|
| Active listings | 300 | 1500 |
| Monthly transactions | 100 | 500 |
| Seller registration | 50% of users | 75% of users |
| Avg transaction value | PKR 1200 | PKR 1500 |
| Customer satisfaction | 4.4/5 | 4.6/5 |
| DowOS monthly revenue | PKR 8K | PKR 40K |

