# DowOS - PRD Overview (Executive Summary)

**Project:** DowOS Medical Super-App
**Organization:** Dow Medical College
**Target Users:** 2,000 medical students (Batches 1-5)
**Timeline:** 4 weeks MVP + 6 weeks Phase 2
**Year 1 Projection:** PKR 2.25M revenue (conservative)

---

## ONE-PAGE SUMMARY

**DowOS** transforms Dow Medical College from a fragmented ecosystem (WhatsApp groups, paper timetables, expensive alternatives like MedAngle @ PKR 15,000/year) into a unified, student-centric super-app.

**MVP (4 weeks):** 10 essential features
- Timetable + real-time updates
- Attendance tracking + runway calculator
- AI Tutor (voice + text + memory)
- 800 MCQs (free forever)
- Viva Bot (voice practice, 50-point scoring)
- Progress Matrix (detailed subtopic breakdown)
- Point Routes (campus navigation)
- Lost & Found (community recovery)
- Announcements (real-time push)

**Phase 2 (Weeks 5-10):** 3 revenue features
- DowEats (Week 5): Food delivery from Burns Road restaurants
- Merch (Week 6): Official merchandise + varsity jackets
- Marketplace (Week 7): Textbook exchange + peer-to-peer sales

**Differentiation:**
- ✅ Campus-exclusive (Dow students only)
- ✅ Hyperlocal (physical gate delivery, campus-specific)
- ✅ 100% student adoption goal (vs MedAngle 20-30%)
- ✅ PKR 3000/year (vs MedAngle PKR 5,000)
- ✅ Free Forever MCQs (vs competitors)
- ✅ Revenue from Phase 2 (vs competitors education-only)

---

## PROBLEM STATEMENT

### Current Pain Points at Dow Medical College

1. **Unclear Timetables**
   - Manual updates, paper-based
   - Students uncertain about classes
   - No real-time notifications

2. **Attendance Opacity**
   - No visibility into attendance %
   - Students unsure if they'll pass
   - Runway to 75% unclear

3. **Expensive Alternatives**
   - MedAngle: PKR 5,000/year
   - Limited to MCQs
   - Poor user experience
   - Only 20-30% adoption

4. **Expensive Food**
   - Cafeteria overpriced
   - Limited options
   - No delivery

5. **Fragmented Community**
   - WhatsApp groups for everything
   - Lost items never recovered
   - No student-to-student marketplace

---

## SOLUTION: DOWOS

### 10 MVP Features (Weeks 1-4)

**Feature 1: Authentication**
- Email/OTP signup
- Dow ID card verification (manual)
- Lab group selection (A-F)
- Roll number input
- First-login onboarding

**Feature 2: Timetable & Announcements**
- Week view (Mon-Fri)
- Color-coded by module
- Real-time updates (ISR 5min)
- Viva schedule with roll numbers
- Real-time push notifications

**Feature 3: Attendance Tracking**
- One-tap check-in
- Per-module attendance %
- **Runway Calculator** (unique): "You can safely skip X classes"
- Historical view

**Feature 4: AI Tutor Chat**
- Two modes: Chat & Tutor
- Voice input (OpenAI Whisper)
- Voice output (Google Cloud TTS)
- Memory: Session + long-term (pgvector)
- Rate limiting: 2 soft / 4 hard (free)
- Unlimited (Pro)

**Feature 5: MCQ Solver**
- 800 questions (1st + 2nd year)
- Module → Subject → Subtopic hierarchy
- AI explanations (why correct, why wrong)
- Practice mode + review mode
- **Free forever** (unlimited)

**Feature 6: Viva Bot** (Pro-only)
- Three difficulty modes (strict, friendly, standard)
- Voice Q&A
- 50-point adaptive scoring
- Session report (strengths + weaknesses)
- 180 min/month hard cap (Pro)

**Feature 7: Point Routes Map**
- Campus bus route navigation
- MVP: Static routes (Google Maps)
- Phase 2: Real-time GPS (10s updates)

**Feature 8: Progress Matrix**
- Module/Subject/Subtopic breakdown
- Mastery % per subtopic
- Color-coded (green/yellow/orange/red)
- Annual Exam Planner (during prof break)

**Feature 9: Lost & Found**
- Search-based matching (no AI auto-match)
- Phone contact (full number, community-locked)
- 30-day auto-archive
- No rewards system

**Feature 10: Announcements**
- Admin-posted (immediate)
- Real-time Firebase Cloud Messaging
- Batch-specific or university-wide
- Smart quiet hours (bypass for urgent)

---

### Phase 2 Features (Weeks 5-10)

**Feature 11: DowEats (Week 5)**
- Menu from Burns Road restaurants
- Student → 6-digit code → Rider → Ammaar → Gate delivery
- Peak hours: 12-1:30 PM (lunch only)
- All payments via Dow Credits
- Success target: 20 orders/day

**Feature 12: Dow Merch (Week 6)**
- All items simultaneously: Hoodies, lab coats, caps, etc.
- Customization: Batch year + optional names
- 7-day delivery
- Varsity jacket drop: PKR 800-900 profit × 400 = PKR 320-360K
- Success target: 30 items/week

**Feature 13: Enhanced Marketplace (Week 7)**
- Textbook listings (no verification)
- Bundling encouraged
- 10% commission on sales
- Manual dispute arbitration
- Seller withdrawal (PKR 500 min, 0% fees)

---

## BUSINESS MODEL

### Revenue Streams

**Stream 1: Pro Tier Subscription**
- Price: PKR 3000/year
- Features: Unlimited AI tutor, viva bot, analytics
- Conservative: 25% conversion = 500 students
- Revenue: PKR 150K/month

**Stream 2: DowEats Commission**
- Model: 15% commission on orders
- Average order: PKR 300-400
- Target: 20 orders/day = PKR 90,000-120,000/month
- M3 projection: PKR 112K/month

**Stream 3: Merch Profit**
- Model: Direct profit per item
- Varsity jacket: PKR 800-900 × 400 = PKR 320-360K
- Monthly items: Hoodies, caps, etc. = PKR 30-50K/month
- M3 projection: PKR 30K/month

**Stream 4: Marketplace Commission**
- Model: 10% commission on textbook sales
- Target: PKR 15-40K/month
- M3 projection: PKR 15K/month

### Year 1 Revenue Projection

| Period | Pro Tier | DowEats | Merch | Marketplace | Total |
|--------|----------|---------|-------|-------------|-------|
| M1-M2 | 0 | 0 | 0 | 0 | PKR 0 |
| M3 | PKR 75K | PKR 112K | PKR 30K | PKR 15K | PKR 232K |
| M6 | PKR 100K | PKR 225K | PKR 120K | PKR 40K | PKR 485K |
| **Y1** | **PKR 150K** | **PKR 1.35M** | **PKR 600K** | **PKR 150K** | **PKR 2.25M** |

---

## TECHNICAL ARCHITECTURE

### Frontend
- **Framework:** Next.js 15 + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Mobile:** Capacitor.js (web + Android instant)
- **Rendering:** ISR (timetable) + SSR (auth) + Real-time (announcements)

### Backend
- **Database:** Supabase PostgreSQL (35+ tables)
- **Auth:** Supabase Auth (email/OTP)
- **Real-Time:** Supabase WebSocket
- **Storage:** Supabase Storage (photos, audio)
- **API:** Next.js API routes

### AI/LLM
- **Simple Chat Tutor:** Gemini Flash (latest)
- **Reasoning:** DeepSeek R1 (complex reasoning)
- **Voice STT:** OpenAI Whisper ($18/month)
- **Voice TTS:** Google Cloud TTS ($5-10/month)
- **Embeddings:** pgvector (semantic search)

### Real-Time
- **WebSocket:** Supabase (announcements, viivas, orders)
- **Polling:** Timetable (5min), attendance (30s)
- **GPS:** Rider location (10s during delivery)

### Cost
- Supabase: $25/month
- Gemini API: $40-50/month
- Voice services: $23-28/month
- Maps: $15-20/month (if we use Google Maps API)
- Vercel: $0-20/month

---

## TEAM & ROLES

### MVP Build (Weeks 1-4)

**Salik - Full-Stack Developer**
- Next.js 15 setup + Supabase
- All 10 MVP features
- Voice integration (Whisper + TTS)
- AI Tutor routing
- Mobile optimization (Capacitor)

**Ammaar - Operations**
- Rider hiring + management
- Cafe partnership (Week 5)
- Gate coordination + delivery
- Menu updates
- Merch vendor relationships

**Azfar - Content Creator**
- 400 subtopics (Anatomy, Physiology, Pathology per module)
- 12000 MCQs (questions + answers + explanations)
- Detailed viva sheets per module (questions + expected answers)
- 25 medical textbooks + Dow slides (upload + embed)
- Content review + quality assurance

### Phase 2 (Weeks 5-10)
- All work collectively
- Full team restructure in Round 2

---

## SUCCESS METRICS

### Week 4 Launch
- ✅ 500 signups (all beta testers upgraded)
- ✅ 500 DAU (daily active users)
- ✅ 4.2/5 app rating
- ✅ <20 critical bugs
- ✅ <10% DAU churn

### Month 2-3
- ✅ 1000+ active users (50% of Dow Medical)
- ✅ PKR 100K+ revenue
- ✅ 50%+ DAU retention
- ✅ Positive word-of-mouth (social metrics)

### Year 1
- ✅ 2000 users (100% Dow Medical)
- ✅ PKR 2.25M revenue
- ✅ 60%+ daily engagement
- ✅ Ready for Phase 3 expansion (other colleges)

---

## COMPETITIVE ADVANTAGE

### vs MedAngle
| Metric | MedAngle | DowOS |
|--------|-----------|-------|
| **Price** | PKR 5,000/year | PKR 3,000/year |
| **MCQs** | Limited + paid | 800+ free forever |
| **AI Tutor** | No | Yes (unlimited Pro) |
| **Food Delivery** | No | Yes (Week 5) |
| **Merchandise** | No | Yes (Week 6) |
| **Campus Exclusive** | No | Yes (Dow only) |
| **Adoption Rate** | 20-30% | Target 100% |

### vs Other Med Apps
- ✅ Hyperlocal (campus-specific)
- ✅ Free MCQs forever
- ✅ Revenue diversification (not just education)
- ✅ Student-centric (community features)
- ✅ Built BY students FOR students

---

## DESIGN SYSTEM - LOCKED

**Colors:**
- Primary: Dark Navy `#1A2B4C`
- Secondary: Offwhite `#F5F5F7`
- Accents: Teal `#00A896`, Gold `#D4A574`, Red `#E74C3C`

**Typography:**
- Headers: **Outfit Bold** (700/800)
- Body: **Inter Regular** (400)
- Data: **JetBrains Mono** (600)

**Components:**
- Buttons: Slightly rounded (4-6px)
- Cards: Glassmorphism + subtle shadow
- Inputs: Rounded borders + subtle shadow
- Dark Mode: Full support

---

## TIMELINE

### Week 1-2: Core Infrastructure
- Auth + Timetable + Attendance
- Chat setup + Whisper/TTS integration
- Database migrations
- Mobile optimization

### Week 2-3: Learning Features
- MCQ system (800 questions)
- Viva Bot (voice practice)
- Progress Matrix (subtopic tracking)

### Week 3-4: Community + Launch
- Lost & Found (search-based)
- Announcements (real-time push)
- Testing + bug fixes
- Public beta (50 testers)

### Week 4: PUBLIC LAUNCH
- Week 4 Friday: Release to 2,000 Dow Medical students
- Marketing: Instagram videos + CR network
- Target: 500 DAU within week 1

### Weeks 5-10: Phase 2
- Week 5: DowEats
- Week 6: Merch
- Week 7: Marketplace

---

## RISK REGISTER (Top 5)

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Content delays | HIGH | HIGH | Recruit 2-3 friends, AI templates, prioritize 1st year |
| Cafe partnerships fail | MEDIUM | MEDIUM | Pre-identified sympathetic owners, show revenue potential |
| Critical bug at launch | MEDIUM | HIGH | Docker staging, full E2E tests, 1-hour acceptable downtime |
| Insufficient beta testing | MEDIUM | MEDIUM | Recruit early + often, daily feedback |
| AI costs spike | LOW | MEDIUM | Optimize queries, cache responses, soft/hard limits |

---

## NEXT STEPS (Post-PRD)

1. **Database Schema** (08_DATABASE_SCHEMA.md) - 35+ tables locked
2. **API Specification** - 50+ endpoints (to be created)
3. **Design System** - Component library + Figma (to be created)
4. **Content Roadmap** - Week-by-week creation plan (to be created)
5. **Launch Checklist** - Daily tasks Week 1-4 (to be created)

---

## CONCLUSION

DowOS will capture 100% of Dow Medical College's student market by offering:
1. **Free forever MCQs** (vs paid competitors)
2. **Campus-exclusive** (hyperlocal advantage)
3. **Revenue diversification** (food, merch, marketplace)
4. **Student-by-students** (trust + understanding)
5. **Cheaper** than MedAngle

**4-week MVP launch. 500 DAU. PKR 2.25M Year 1. Ready to build.**

---

**Status:** ✅ Ready for Development
**Last Updated:** February 10, 2026
**Next:** Week 1 MVP Build Begins

