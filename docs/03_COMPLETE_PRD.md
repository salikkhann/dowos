# DowOS - Complete Product Requirements Document (PRD)

**Version:** 1.0 Final
**Date:** February 2026
**Status:** Ready for Development
**Target Launch:** Week 4 of MVP build

---

## EXECUTIVE SUMMARY

**DowOS** is an all-in-one super-app for Dow Medical College students that consolidates fragmented university systems into a single integrated platform. The app solves critical pain points: unclear timetables, no attendance transparency, overpriced alternatives (MedAngle PKR 5,000/year), expensive food and textbooks, and lack of campus-exclusive community features.

### Vision
Replace outdated university infrastructure and compete with commercial platforms by building a campus-exclusive ecosystem that students can't live without.

### Core Problem
Dow Medical College operates with 1995-era systems:
- Paper timetables + manual updates
- Zero attendance visibility (students unsure if they'll pass)
- Overpriced commercial alternatives (MedAngle)
- Expensive cafeteria food (no alternatives)
- Fragmented student community (WhatsApp groups for everything)

### Solution
One app. Everything students need. From academic tools to food delivery to peer-to-peer marketplace.

---

## PRODUCT OVERVIEW

### MVP Scope (4 Weeks, Weeks 1-4)
10 core modules designed for immediate launch:

1. **Authentication & Onboarding** - Dow-ID verified signup
2. **Timetable & Announcements** - Real-time class scheduling + admin comms
3. **Attendance Tracking** - Manual check-in + runway calculator
4. **AI Tutor Chat** - Gemini-powered with voice input/output, memory, 2 modes
5. **MCQ Solver** - 800+ medical questions, unlimited free
6. **Viva Bot** - AI practice with 3 difficulty modes, 50-point adaptive scoring
7. **Point Routes Map** - Campus bus route navigation
8. **Progress Matrix** - Module/subject/subtopic mastery tracking
9. **Lost & Found** - Student-to-student item recovery
10. **Announcements** - Real-time push notifications + calendar

### Phase 2 Scope (Weeks 5-10)
3 revenue-generating features:

1. **DowEats (Week 5)** - Food delivery from campus cafes + external vendors
2. **Dow Merch (Week 6)** - Official university merchandise store
3. **Enhanced Marketplace (Week 7)** - Textbook exchange + equipment rental

---

## TARGET USERS & METRICS

### Primary Users
- **Dow Medical College students:** 2,000 across 5 batches
- **1st-2nd year:** Core users (timetable, attendance, AI tutor, MCQs)
- **3rd-5th year:** Clinical focus (ward rotations, viva prep)

### Success Metrics (MVP Launch)

| Metric | Week 1 | Week 2 | Week 3 | Week 4 | Target |
|--------|--------|--------|--------|--------|--------|
| Signups | 100 | 225 | 350 | 500 | 500 DAU |
| AI Tutor Messages/day | 50 | 150 | 300 | 500 | High engagement |
| Attendance Check-ins/day | 30 | 100 | 250 | 400 | Daily habit |
| MCQ Attempts/day | 100 | 300 | 600 | 1000 | Competitive with MedAngle |
| Viva Bot Sessions/day | 0 | 5 | 15 | 30 | Pro tier adoption |
| App Rating | 4.2/5 | 4.4/5 | 4.5/5 | 4.6/5 | Market standard |

### Year 1 Financial Projections (Conservative)

| Month | Users | Pro Tier | MCQ | DowEats | Merch | Marketplace | Total |
|-------|-------|----------|-----|---------|-------|-------------|-------|
| M1 | 500 | PKR 0 | 0 | 0 | 0 | 0 | **0** |
| M2 | 1000 | PKR 50K | 0 | PKR 37K | PKR 10K | PKR 5K | **PKR 102K** |
| M3 | 1500 | PKR 75K | 0 | PKR 112K | PKR 30K | PKR 15K | **PKR 232K** |
| M6 | 2000 | PKR 100K | 0 | PKR 225K | PKR 120K | PKR 40K | **PKR 485K** |
| Y1 Total | 2000 | PKR 150K | 0 | PKR 1.35M | PKR 600K | PKR 150K | **PKR 2.25M** |

---

## FEATURES - DETAILED SPECIFICATIONS

### 1. AUTHENTICATION & ONBOARDING

**Signup Flow:**
1. Enter email → Receive OTP (valid 10 min)
2. Verify OTP
3. Select batch year (1-5)
4. Select lab group (A-F)
5. Enter name
6. Enter roll number (YY/YYYY/NNN, immutable)
7. Upload Dow ID card photo
8. Create password
9. Submit for approval (manual by admin)

**Status:** PENDING APPROVAL
- Email: "Your DowOS account is pending approval"
- Can't access app until approved
- Admin reviews ID card

**First Login Onboarding (One-time):**
- Learning style (Visual/Auditory/Kinesthetic)
- Explanation depth (Beginner/Intermediate/Advanced)
- Notification preferences (on/off, quiet hours)

---

### 2. TIMETABLE & ANNOUNCEMENTS

**Timetable Display:**
- Week view (Mon-Sat)
- Color-coded by Subject
- Shows: Class name, time, location, faculty
- **Viva Toggle:** Shows vivas in timetable
  - Viva schedule updated 1 week before
  - Shows roll numbers (lab group or clinical group specific)
  - Uses normal university class timings (8 AM - 4 PM)

**Real-time Timetable Updates:**
- Manual admin updates
- Auto-broadcast to students
- ISR caching (5 min revalidation)

**Announcements:**
- Admin-posted (immediate)
- Batch-specific or university-wide
- Real-time push via Firebase Cloud Messaging
- Pin important announcements
- Search + filter

**Lab Groups vs Clinical Groups:**
- Lab groups: Cohorts A-F (1st-2nd year, 6 per batch)
- Clinical groups: 14-15 students per group (3rd+ year, rotate wards)
- Labs: Lab group-wise, roll number-wise
- Wards: Clinical group-wise
- Timetable displays both where its divided amongst lab and clinical groups

---

### 3. ATTENDANCE TRACKING

**Check-In Method:**
- Manual button: "Mark Attendance"
- Animation: "Checking in..." → "✓ Checked in" (2 sec)
- Haptic feedback (phone vibrates)
- Sound effect (notification ding)
- Status: Pending → Confirmed → Failed

**Attendance Dashboard:**
- Per-module attendance % breakdown
- **Attendance Runway Calculator:**
  - Shows "You can safely skip X classes and stay at 75%"
  - Dynamic calculation based on remaining classes
  - Example: 70/100 classes attended → can skip 15 remaining

**Data Tracked:**
- Manual check-in time
- Module attendance %
- Safe skip count per module
- History (view past check-ins)

---

### 4. AI TUTOR CHAT (Main Chatbot)

**Interface:**
- Chat history with session management
- Voice recording button (always visible)
- Settings: Voice on/off, speed (0.8x-1.5x), tutor mode toggle
- Clear chat button
- Save chat history and rename chat name

**Two Modes:**
1. **Chat Mode:** Free-form conversation, full explanations
2. **Tutor Mode:** Structured learning (explain → ask → verify → relate)
   - System prompt change (more educational, less conversational)
   - Same interface, different tone

**Voice Pipeline:**
- Input: OpenAI Whisper (Pakistani accent optimized, $18/month)
- Processing: Keyword matching router (simple vs complex)
- Output: Gemini (latest model) + Google Cloud TTS ($5-10/month)
- Pronunciation: User selectable (male/female, speed)

**Memory Architecture:**
- Short-term: Current session (last 10 messages, TanStack Query cache)
- Long-term: pgvector embeddings (full history, semantic search)
- User prefs: Learning style + explanation depth (editable)
- Knowledge base: 25 medical textbooks + Dow slides (auto-embedded)

**Router Logic (Rule-Based):**
- Keywords: "calculate", "derive", "compare", "why", "how" → Complex
- Word count >50 → Complex
- User feedback history → Complex (if user struggled before)
- Otherwise → Simple

**Rate Limiting (Free Users):**
- Soft limit: 2 messages/day (responses +5s delay)
- Hard limit: 4 messages/day (blocked until next day)
- Pro users: Unlimited
- Soft limits adjusted after 2 weeks based on engagement

---

### 5. MCQ SOLVER

**Organization:**
- Module → Subject → Subtopic hierarchy
- 12000+ questions total (1st + 2nd year)
- Tagged: year, subject, subtopic, difficulty, high-yield

**Practice Mode:**
- Select topic → Quiz (10 questions default)
- Per-question: Show answer immediately
- AI explanation: Why correct + why others wrong
- Citations: Dow slides, textbooks

**Review Mode:**
- View past attempts
- Filter by date/topic/performance
- Retake with different question order

**Free Forever:**
- Unlimited MCQ practice (no rate limit)
- Full explanations included
- Differentiation vs MedAngle: Better explanations + free forever

---

### 6. VIVA BOT (Pro-Only, Voice)

**Three Difficulty Modes:**

**Strict Mode:**
- Correctness: 25 pts (nearly perfect required)
- Confidence: 10 pts (expects solid confidence)
- Articulation: 10 pts (clear speech required)
- Adaptive bonus: 5 pts (challenging follow-ups)
- **Total: 50 points**

**Friendly Mode:**
- Correctness: 25 pts (partial credit given)
- Confidence: 15 pts (encouraging unsure answers)
- Articulation: 7 pts (lenient)
- Adaptive bonus: 3 pts (gentle difficulty)
- **Total: 50 points**

**Standard Mode:**
- Correctness: 25 pts
- Confidence: 12 pts
- Articulation: 8 pts
- Adaptive bonus: 5 pts
- **Total: 50 points**

**Session Flow:**
1. Select viva sheet (pre-populated by Azfar)
2. Select difficulty mode
3. Bot speaks question → Student answers (voice)
4. Transcript shown (student can edit)
5. Bot evaluates on 3 dimensions
6. Instant feedback + move to next Q
7. After 10 Qs: Score report

**Session Report:**
- Final score (X/50)
- Per-question breakdown
- Strengths summary
- Weaknesses summary
- Study recommendations

**Rate Limiting (Pro Users):**
- 180 minutes/month hard cap
- ~9-12 sessions/month per user

**Viva Sheets:**
- Pre-populated by Azfar (2-3 per module)
- Module + Subject focused (e.g., "Cardiology - Anatomy")
- Questions + answers + tips

---

### 7. POINT ROUTES MAP

**MVP (Static Routes):**
- Google Maps SDK with custom polylines
- All Point routes displayed (different colors)
- Numbered stops (1, 2, 3, etc.)
- Filter by route

**Route Selection:**
- "Where are you going?" dropdown
- Select destination stop
- Shows recommended route
- Shows estimated arrival

**Phase 2 (Real-Time GPS):**
- Driver GPS every 10 seconds (6-8:30 AM, 3:15-6 PM only)
- Student map shows Driver location
- "Driver is 5 min away"

---

### 8. PROGRESS MATRIX

**Detailed Breakdown:**
- Module level: % mastery
- Subject level: % mastery per subject
- Subtopic level: % mastery per subtopic

**Mastery Calculation:**
- MCQ accuracy (50% weight)
- Viva Bot performance (30% weight)
- Spaced repetition (20% weight)
- Formula: (MCQ×0.5) + (Viva×0.3) + (SpacedRep×0.2)

**Color Coding:**
- Green (>80%): Mastered
- Yellow (60-80%): Good progress
- Orange (40-60%): Needs work
- Red (<40%): Critical gaps

**Annual Exam Mode (During Prof Break):**
- Professional Exam Planner view
- Coverage % per module
- Recommended study order
- Exam schedule countdown
- Mock exam suggestions

---

### 9. LOST & FOUND

**Search-Based Matching:**
- Student posts: "Lost black backpack, Feb 10, Library"
- Community searches and finds matches
- In-app chat via phone number
- DowOS uninvolved after match

**Post Lost Item:**
- Item name, description, photo
- Location + date
- Phone number (auto-populated, can hide last digits)

**Post Found Item:**
- Item name, description, photo
- Location + date found
- Phone number

**Auto-Archive:** 30 days (can mark as resolved earlier)
**No Rewards System** (builds community goodwill, no payment friction)

---

### 10. ANNOUNCEMENTS

**Real-Time Push Notifications:**
- Admin posts → Immediate broadcast
- Firebase Cloud Messaging (FCM)
- Real-time WebSocket for in-app updates

**Smart Notification Logic:**
- **Time-sensitive** (bypass quiet hours): Class in 5 min, admin announcements
- **Non-time-sensitive** (respects quiet hours): Attendance reminders, new menu items
- Default quiet hours: 10 PM - 8 AM (customizable)

**Announcement Types:**
- University-wide
- Batch-specific
- Club announcements (reviewed by admin)

---

## DESIGN SYSTEM

### Color Palette
- **Primary:** Dark Navy (#1A2B4C)
- **Secondary:** Offwhite/Paper (#F5F5F7)
- **Accent 1:** Teal (#00A896) - medical trust, CTAs
- **Accent 2:** Gold (#D4A574) - premium, special features
- **Accent 3:** Red (#E74C3C) - alerts, warnings, errors

### Typography
- **Headers:** Outfit Bold (geometric, bold, distinctive)
- **Body:** Inter Regular (clean, highly readable)
- **Accent/Code:** JetBrains Mono (technical, metrics)
- **Logo:** "DowOS" in Outfit Bold, top-left navbar

### Components
- **Buttons:** Slightly rounded (4-6px) - professional
- **Cards:** Glassmorphism + subtle shadow - modern depth
- **Input fields:** Rounded borders + subtle shadow - friendly professional

### Dark Mode (Locked)
- **Background:** Very dark navy (#0F1823)
- **Text:** Offwhite (#F5F5F7)
- **Accents:** Lighter (Teal → Cyan, Gold → Light Gold)
- **Red:** Stays visible for alerts

---

## TECHNICAL ARCHITECTURE

### Frontend Stack
- **Framework:** Next.js 15 + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand (UI) + TanStack Query (server)
- **Mobile:** Capacitor.js (web + Android instant, iOS later)
- **Rendering:** ISR (timetable 5min) + SSR (attendance) + Real-time (announcements)

### Backend Stack
- **Database:** Supabase PostgreSQL + pgvector
- **Auth:** Supabase Auth (email + OTP)
- **Storage:** Supabase Storage (ID cards, books, slides)
- **Real-Time:** Supabase WebSocket (announcements, viivas, orders)
- **API:** Next.js API routes

### AI/LLM Integration
- **Simple Chat:** Gemini Flash (latest model)
- **Reasoning required in Chat:** DeepSeek R1 (complex reasoning)
- **Voice STT:** OpenAI Whisper ($18/month)
- **Voice TTS:** Google Cloud TTS ($5-10/month)
- **Embeddings:** Gemini API (stored in pgvector)

### Real-Time Strategy
- **WebSocket (Supabase Realtime):** Announcements, viva schedules, order status
- **Polling:** Timetable (5min), attendance (30s)
- **GPS Tracking (Phase 2):** Rider location (10s during delivery only)

### Deployment
- **Frontend:** Vercel (CI/CD via GitHub Actions)
- **Backend:** Supabase (managed)
- **Staging:** Docker container with test database
- **Monitoring:** Sentry (errors), PostHog (analytics)

### Cost Estimate (MVP + Phase 2)
- Supabase Pro: $25/month
- Gemini API: $40-50/month
- OpenAI Whisper: $18/month
- Google Cloud TTS: $5-10/month
- Google Maps: $15-20/month
- Vercel: $0-20/month
- Firebase FCM: $0/month
- **Total:** ~$135-195/month

---

## PAYMENT SYSTEM

### MVP (Weeks 1-4)
- **Free Tier:** AI tutor 2 soft / 4 hard cap
- **Pro Tier:** PKR 3000/year
  - Unlimited AI tutor
  - Viva Bot access (180 min/month)
  - Analytics dashboard
- **Manual Easypaisa/JazzCash transfers** (Week 1-2)
- **Payment gateway integration** (Phase 2)

### Dow Credits System (All Transactions)
- **Load once via:** Easypaisa/JazzCash (one-time setup)
- **Use throughout app:** DowEats, Merch, Marketplace
- **Pro tier:** PKR 3000 charged once/year

**DowEats Payments:**
- Students pay via Dow Credits
- Cafe receives payment via rider at gate
- 6-digit code verification (student shows rider code XXXXXX)

**Merch Payments:**
- Students pay via Dow Credits upfront
- 7-day delivery timeline

**Marketplace Payments:**
- Students pay via Dow Credits
- 10% commission to DowOS
- Seller gets credits (can withdraw)
- **Seller Withdrawal:**
  - Click "Withdraw" → Opens claim
  - Manual processing (you verify + approve)
  - Bank transfer (2-5 business days)
  - Minimum: PKR 500
  - Fees: 0% (free to students)

---

## PHASE 2 FEATURES (Weeks 5-10)

### DowEats (Week 5)
**Model:**
- No cafe dashboard (manual by you)
- Restaurants: Burns Road + nearby vendors (NOT Dow cafes)
- Menu: You update daily/as-needed
- Delivery: Your hired rider
- Pickup: Gate of Dow Medical College
- Code: 6-digit code shown to student → rider confirms with Ammaar

**Peak Hours:**
- Lunch: 12 PM - 1:30 PM (Ammaar at gate)
- Dinner: N/A (college closes 3:15 PM)
- Off-peak: Can order, pickup "available 12 PM onwards"

**Menu Structure:**
- Items displayed with restaurant tag
- NOT organized by restaurant first
- Example: "Biryani (Burns Road), Biryani (Another Cafe), Karahi (Burns Road)"
- Categories: Biryani, Karahi, Burgers, Drinks, Desserts
- Out of stock: Remove immediately

**Success Target:** 20 orders/day by end of Week 5

### Dow Merch (Week 6)
**All Items Simultaneously:**
- Hoodies, lab coats, notebooks, pens, caps, totebags, laptop sleeves, phone covers, stickers

**Customization:**
- Batch year embroidery
- Optional student name (lab coats)

**Model:** Hybrid inventory (popular stocked, special items pre-order)
**Delivery:** 7 days
**Success Target:** 30 items/week by end of Week 6

### Enhanced Marketplace (Week 7)
**Textbook Exchange:**
- Unlimited listings (students compete on price)
- No verification (trust students)
- Payment: 10% commission via Dow Credits
- Seller withdrawal: Manual processing, PKR 500 minimum

**Equipment (Future):** Not MVP
**Tutoring (Future):** Not MVP
**Lost & Found:** Expanded with search-based matching

**Success Target:** No specific target (secondary feature)

---

## TEAM STRUCTURE

### MVP Build (Weeks 1-4)
- **Salik:** Full-stack development + technical leadership
- **Ammaar:** Rider hiring + gate operations + cafe partnerships
- **Azfar:** Content creation (400 subtopics, viva sheets, MCQs)

### Phase 2 (Weeks 5-10)
- **All:** Work collectively on DowEats, Merch, Marketplace
- **Full team restructure (Round 2):** After Phase 2 stabilizes

---

## LAUNCH STRATEGY

### Beta Testing (Week 4, 1 week)
- 50 testers recruited via form
- Daily feedback cycle
- Go/no-go criteria: <20 critical bugs, >4.2/5 rating, 60%+ DAU retention

### Public Launch (Week 5)
- Announcement via Salik's journalism page (2,500 followers)
- Marketing: Remotion-style Instagram videos
- Distribution: CR network, word-of-mouth
- **DowOS Instagram account** for brand building

### Rollout Timeline
- **Day 1:** 100 signups (early adopters)
- **Day 2-3:** 225 cumulative (word spreads)
- **Week 2:** 500 cumulative (press + social)
- **Week 3:** 1000 cumulative (mainstream adoption)
- **Week 4:** 500 DAU (launch goal)

---

## RISK REGISTER

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Content delays (400 subtopics) | HIGH | HIGH | Recruit 2-3 friends, create reusable AI templates, prioritize 1st year |
| ID verification bottleneck | MEDIUM | MEDIUM | Batch approvals, email approval links |
| Timetable update delays | MEDIUM | MEDIUM | Show stale with "not updated" warning, 2-3 day buffer |
| Point drivers uncooperative | MEDIUM | LOW | Pre-identified drivers (you know them) |
| AI costs spike | LOW | MEDIUM | Optimize queries, cache responses, soft/hard limits |
| Critical bug at launch | MEDIUM | HIGH | Docker staging, full E2E test coverage, 1-2 hour acceptable downtime |
| Cafe partnerships fail | MEDIUM | MEDIUM | Start with sympathetic cafe owners, offer better margins |
| Insufficient beta testing | MEDIUM | MEDIUM | Recruit early + often, daily feedback loop |

---

## NEXT STEPS (Post-PRD)

1. **Database Schema Creation**
   - All 20+ tables defined with relationships
   - Indexes optimized
   - Migration strategy documented

2. **API Specification**
   - 50+ endpoints detailed
   - Request/response examples
   - Authentication & rate limiting

3. **Design System**
   - Component library
   - Color codes (hex)
   - Typography scale
   - Icon guidelines

4. **Content Roadmap**
   - Week-by-week creation schedule
   - Book upload process
   - Viva sheet format

5. **Launch Checklist**
   - Daily tasks (Weeks 1-4)
   - Go-live procedures
   - Post-launch monitoring

---

## CONCLUSION

DowOS will transform Dow Medical College from a fragmented ecosystem into a unified, student-centric platform. By launching with 10 essential modules and scaling to 3 revenue-generating Phase 2 features, we'll capture 100% of the student market and establish a sustainable business.

**4-week MVP launch. 500 DAU. PKR 2.25M Year 1 revenue. Ready to build.**

