# DowOS - Final Locked Decisions (All 100+ Questions Answered)

## DESIGN DECISIONS

### Color Palette - LOCKED ✅
**Option A: Medical + Professional**
- Primary: Dark Navy (#1A2B4C)
- Secondary: Offwhite/Paper (#F5F5F7)
- Accent 1: Teal (#00A896) - medical trust
- Accent 2: Gold (#D4A574) - premium, prestige
- Accent 3: Red (#E74C3C) - alerts, important
**Feel:** Professional, trustworthy, premium

### Typography - NEEDS RECOMMENDATION
Q36a: User wants recommendation based on app profile
**My Suggestion:** Pair 2 (Outfit + Inter + JetBrains)
- Headers: **Outfit Bold** (geometric, bold, distinct, student-friendly)
- Body: **Inter Regular** (clean, highly readable)
- Accent: **JetBrains Mono** (technical, for code/system info)
**Reasoning:**
- Outfit = bold, modern, confident (medical students)
- Inter = best readability (lots of text content)
- JetBrains = tech-forward (for viva scores, metrics)
- **Perfect for DowOS:** Professional but youthful

### Logo - LOCKED ✅
- Text-only: "DowOS" in Outfit Bold
- Position: Top-left navbar
- Alternative considered: "Dow Central" (rejected, staying with DowOS)

### Components - LOCKED ✅
- Buttons: Slightly rounded (4-6px) - professional
- Cards: Glassmorphism + subtle shadow - modern depth
- Input fields: Rounded borders with subtle shadow - friendly professional

### Dark Mode - LOCKED ✅
**Option A: Dark navy background**
- Background: Very dark navy (#0F1823)
- Text: Offwhite (#F5F5F7)
- Accents: Lighter versions (Teal → Cyan, Gold → Light Gold)
- Red: Stays visible for alerts

---

## TECHNICAL DECISIONS

### Viva Calendar & Scheduling - LOCKED ✅
**Timeline:**
- Schedule announced 1 week before viva dates
- Uses normal university class timings
- Automatically updates timetable when schedule posted
- **Viva Toggle in Timetable:**
  - Shows which viva on which day
  - Shows applicable roll numbers (lab group or clinical group)
  - Sometimes group-wise, sometimes number-wise

**Lab Groups vs Clinical Groups:**
- Lab groups: 1st-2nd year (6 groups: A-F)
- Clinical groups: 3rd+ year (14-15 students per group, rotate wards)

### Dow Credits Update - LOCKED ✅
**Manual Processing with Notification**
- Student loads credits via Easypaisa/JazzCash
- Payment processed immediately (Easypaisa handles it)
- Credits appear in 5-10 minutes (manual verification)
- Automated processing in Phase 2

### Marketplace Listings - LOCKED ✅
- Students see new listings **instantly** (real-time)
- Real-time WebSocket updates via Supabase Realtime

### DowEats Rider Tracking - LOCKED ✅
- GPS updates every 30 seconds (locked)
- Order status updates: Real-time via WebSocket

### Viva Bot Scoring - LOCKED ✅
**Three Modes with Different Scoring:**
1. **Strict Mode** - High standards, harsh scoring
   - Correctness: 25 points (must be nearly perfect)
   - Confidence: 10 points (expects solid confidence)
   - Articulation: 10 points (must articulate clearly)
   - Adaptive bonus: 5 points (challenging follow-ups)
   - **Total: 50 points**

2. **Friendly Mode** - Supportive, encouraging
   - Correctness: 25 points (partial credit given)
   - Confidence: 15 points (encouraging unsure answers)
   - Articulation: 7 points (lenient on articulation)
   - Adaptive bonus: 3 points (gentle difficulty increase)
   - **Total: 50 points**

3. **In-Between Mode** (Standard)
   - Correctness: 25 points
   - Confidence: 12 points
   - Articulation: 8 points
   - Adaptive bonus: 5 points
   - **Total: 50 points**

**Scoring Calculation:**
- LLM evaluates answer on 3 dimensions
- Automatically assigns points per mode
- Adaptive: Follow-up questions get harder if student excels
- Report includes breakdown + strengths/weaknesses

### Viva Schedule Announcement - LOCKED ✅
- Vivas happen in 4-day period (announced before)
- Uses normal class timings (8 AM - 4 PM)
- Lab group specific (most viivas)
- Shows in timetable with applicable roll numbers

### Annual Exam Preparation - LOCKED ✅
**Checklist by Subtopic Completion:**
```
Cardiology Module:
  - Anatomy subtopics: [ ] Coronary circulation [ ] Heart chambers [ ] Conduction
  - Physiology subtopics: [ ] Action potential [ ] Cardiac cycle
  - Pathology subtopics: [ ] CAD [ ] Arrhythmias
  
  - MCQ practice: 75/100 questions solved
  - Viva practice: 5 sessions completed
  - Readiness Score: 78%
```

**Readiness Calculation Formula:**
During module (ongoing):
- MCQ accuracy + Subtopic completion = Readiness %

During prof break (special view):
- **Professional Exam Planner** shows:
  - Coverage % per module (based on modules completed)
  - Recommended study order (by weakness)
  - Exam schedule countdown
  - Mock exam recommendations

### Payment Withdrawal - LOCKED ✅
**Marketplace Seller Withdrawals:**
- Seller has PKR 2500 credits from sales
- Click "Withdraw" → Opens withdrawal claim
- **Manual Processing:**
  - You (Salik/Ammaar) receive claim notification
  - Verify seller legitimacy
  - Process via bank transfer
  - Confirm in app → Credits become withdrawals history
- **Minimum:** PKR 500
- **Fees:** 0% (zero fees to students)
- **Timeline:** 2-5 business days (standard bank transfer)

### Lost & Found Contact - LOCKED ✅
**Privacy & Trust:**
- Community is locked (Dow students only)
- Privacy not a major concern
- Show full phone number + student name
- Optional: WhatsApp button for direct message
- **Trust students** (no verification needed)
- Auto-archive after 30 days

---

## OPERATIONAL DECISIONS

### DowEats Peak Hours - LOCKED ✅
**Timing:**
- **Lunch:** 12:00 PM - 1:30 PM (peak order window)
- **Dinner:** College closes at 3:15 PM anyway (lunch is primary)
- **Off-peak:** Can order anytime, but pickup available 12 PM onwards

**Delivery:**
- Rider: Your hired delivery person (you know them)
- **Pickup location:** Dow Medical College gate
- **During peak hours:** Rider + Ammaar present at gate for handoff
- **Off-peak:** Rider waits/delivers when gate is open
- **Student notification:** "Order ready, show code XXXXXX to rider at gate"

### DowEats Menu Structure - LOCKED ✅
**Organization:**
- Items displayed with tags showing restaurant source
- NOT by restaurant first, by ITEM FIRST with restaurant tag
- Example:
  ```
  Biryani (Burns Road)
  Biryani (Another Cafe)
  Karahi (Burns Road)
  ```
- Categories available as filters: Biryani, Karahi, Burgers, Drinks, Desserts

**Out of Stock:**
- Remove from menu immediately (not just "unavailable")
- Update menu daily/as-needed

### Dow Merch Launch - LOCKED ✅
**All Items Simultaneously (Week 5):**
- Hoodies
- Lab coats
- Notebooks
- Pens
- Caps
- Totebags
- Laptop sleeves
- Phone covers
- Stickers
- **Annual Varsity Jacket Drop** (special event, separate timing)

**Initial Inventory Quantities:**
- To be decided with vendors (after app is built)
- Hybrid model: Popular items stock, special items pre-order
- 7-day delivery timeline

**Customization:**
- Batch year embroidery
- Optional student name on lab coats
- Varsity jacket: batch year + name

---

## FEATURE SPECIFICATIONS - LOCKED ✅

### MVP Features (Weeks 1-4)
1. ✅ Authentication & Onboarding
2. ✅ Timetable (with viva toggle, lab group tracking)
3. ✅ Attendance Tracking (with runway calculator)
4. ✅ AI Tutor Chat (with voice, memory, tutor mode)
5. ✅ MCQ Solver (unlimited free)
6. ✅ Viva Bot (3 modes, adaptive scoring, 50-point scale)
7. ✅ Point Routes Map (static routes MVP)
8. ✅ Progress Matrix (detailed subtopic breakdown)
9. ✅ Lost & Found (search-based, no rewards)
10. ✅ Announcements (real-time push)

### Phase 2 Features (Weeks 5-10)
**Week 5 (DowEats):** Complete food delivery system
**Week 6 (Merch):** All items simultaneously
**Week 7 (Marketplace):** Textbook + equipment exchange

---

## NAMING - LOCKED ✅

**Final Name:** DowOS
- Staying with DowOS
- Rejected alternatives: "Dow Central"
- Logo: Text-only "DowOS" in Outfit Bold
- Future expansion: CampusOS model for other colleges (but Dow-only for now)

---

## TECH STACK - CONFIRMED ✅

**Frontend:**
- Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
- Rendering: ISR (timetable 5min) + SSR (attendance) + real-time (announcements)
- Mobile: Capacitor.js (web + Android instant, iOS later)

**Backend:**
- Supabase (PostgreSQL + Realtime + Auth + Storage)
- pgvector (embeddings for AI memory)
- Next.js API routes

**AI:**
- Gemini (latest model) - main tutor
- DeepSeek R1 - fallback complex reasoning
- OpenAI Whisper - voice recognition ($18/month, Pakistani accent)
- Google Cloud TTS - text-to-speech ($5-10/month)

**Real-Time:**
- Supabase WebSocket for announcements, viivas, order tracking
- Polling for timetable (5min), attendance (30s)

**Payment:**
- All via Dow Credits (load once via Easypaisa/JazzCash, use throughout app)
- Manual withdrawal processing for marketplace sellers

**Maps:**
- Google Maps SDK for Point routes

**Notifications:**
- Firebase Cloud Messaging (push)
- Time-sensitive bypasses quiet hours (class in 5 min, admin announcements)

---

## REVENUE MODEL - CONFIRMED ✅

**MVP (Weeks 1-4):**
- Free tier: AI tutor limited (2 soft, 4 hard)
- Pro tier: PKR 3000/year (unlimited AI, viva bot, analytics)
- Conservative: 25% conversion = ~500 students

**Phase 2:**
- DowEats: 15% commission on orders
- Merch: PKR 300-900 profit per item
- Marketplace: 10% commission on textbook sales
- Target Year 1: PKR 2.25M (conservative)

---

## TIMELINE - CONFIRMED ✅

**MVP Build (4 weeks):**
- Week 1: Setup + core modules (auth, timetable, attendance)
- Week 2: AI tutor + MCQ solver + voice integration
- Week 3: Viva bot + progress matrix + announcements
- Week 4: Testing + beta launch (50 testers, 1 week)

**Phase 2 (Weeks 5-10):**
- Week 5: DowEats launch
- Week 6: Merch launch
- Week 7: Marketplace launch

**Launch Metrics:**
- Week 4: 500 DAU
- Week 5-6: 750-1000 DAU
- Month 2: 1500+ DAU
- Month 3: 2000 DAU

---

## TEAM STRUCTURE - CONFIRMED ✅

**MVP (Weeks 1-4):**
- Salik: Full-stack development + technical leadership
- Ammaar: Rider management + cafe partnerships + gate operations
- Azfar: Content creation (400 subtopics, viva sheets, MCQs)

**Phase 2:**
- All work collectively
- Full team restructure in "round 2" (after Phase 2 stabilizes)

---

## FINAL CHECKLIST ✅

✅ All 100+ questions answered
✅ Design locked (colors, fonts, components, dark mode)
✅ Technical architecture confirmed
✅ Operational workflows defined
✅ Business model validated
✅ Timeline realistic
✅ Team structure clear
✅ Success metrics defined

**READY TO BUILD COMPLETE PRD**

