# Final Design & Technical Clarifications

## DESIGN SPEC - Color Palette Finalization

You want dark navy + offwhite + 2-3 accents
You asked: "what would look good? dark purple? gold? yellow? red? green?"

Let me propose combinations and you pick:

### Option A: Medical + Professional
- Primary: Dark Navy (#1A2B4C)
- Secondary: Offwhite/Paper (#F5F5F7)
- Accent 1: **Teal** (#00A896) - medical trust
- Accent 2: **Gold** (#D4A574) - premium, prestige
- Accent 3: **Red** (#E74C3C) - alerts, important
**Feel:** Professional, trustworthy, premium

### Option B: Bold & Modern
- Primary: Dark Navy (#1A2B4C)
- Secondary: Offwhite/Paper (#F5F5F7)
- Accent 1: **Purple** (#8E44AD) - innovative, premium
- Accent 2: **Teal** (#00A896) - modern, clean
- Accent 3: **Yellow** (#F1C40F) - energy, highlights
**Feel:** Bold, energetic, innovative

### Option C: Minimal & Clean
- Primary: Dark Navy (#1A2B4C)
- Secondary: Offwhite/Paper (#F5F5F7)
- Accent 1: **Teal** (#00A896)
- Accent 2: **Coral** (#FF6B6B) - friendly, approachable
- No third accent (keep minimal)
**Feel:** Clean, modern, approachable

### Option D: Pakistani Pride
- Primary: Dark Navy (#1A2B4C)
- Secondary: Offwhite/Paper (#F5F5F7)
- Accent 1: **Green** (#27AE60) - Pakistan flag
- Accent 2: **Gold** (#D4A574) - prestige
- Accent 3: **White** (already in secondary, skip)
**Feel:** Patriotic, premium, local identity

**Questions:**

Q35a: **Which color palette appeals most?**
- [ ] Option A (Medical + Professional)
- [ ] Option B (Bold & Modern)
- [ ] Option C (Minimal & Clean)
- [ ] Option D (Pakistani Pride)
- [ ] Custom: [describe what you want]

Q35b: **For alerts/warnings/errors, which color?**
- [ ] Red
- [ ] Orange
- [ ] Yellow
- [ ] Which accent from your chosen palette?

---

## DESIGN SPEC - Typography

You said: "i will look at fonts and let you know, you tell me help me on this"

Let me educate you on **bold fonts with distinct identity**:

### **Recommended Pairs for DowOS:**

**Pair 1: Premium Medical**
- Headers: **Playfair Display Bold** (serif, elegant, medical feel)
- Body: **Inter Regular** (clean, readable)
- Accent: **Space Mono Bold** (code/system, distinct)
- **Feel:** Professional, established, trustworthy

**Pair 2: Modern Bold**
- Headers: **Outfit Bold** (geometric, bold, distinct)
- Body: **Inter Regular** (clean baseline)
- Accent: **JetBrains Mono** (technical, modern)
- **Feel:** Contemporary, confident, tech-forward

**Pair 3: Friendly Bold**
- Headers: **DM Sans Bold** (rounded, approachable, bold)
- Body: **Inter Regular** (clean, readable)
- Accent: **Courier Prime** (distinctive, typewriter feel)
- **Feel:** Friendly, modern, accessible

**Pair 4: Minimal Bold**
- Headers: **Sora SemiBold** (geometric, minimal)
- Body: **Sora Regular** (single font family)
- Accent: **IBM Plex Mono** (bold monospace)
- **Feel:** Clean, minimal, focused

**Questions:**

Q36a: **Which typography pair appeals to you?**
- [ ] Pair 1 (Playfair + Inter + Space Mono)
- [ ] Pair 2 (Outfit + Inter + JetBrains)
- [ ] Pair 3 (DM Sans + Inter + Courier)
- [ ] Pair 4 (Sora + IBM Plex)
- [ ] Custom: [other fonts you like]

Q36b: **Logo font specifically:**
- [ ] Use the header font from your pair above
- [ ] Or separate distinctive font for logo only?
- [ ] Examples: Bebas Neue, Anton, Righteous (all-caps, bold)?

---

## DESIGN SPEC - Dark Mode Implementation

You said: "dark navy and offwhite background in lightmode, no idea for dark mode"

Standard implementation:

**Light Mode (Default):**
- Background: Offwhite (#F5F5F7)
- Text: Dark Navy (#1A2B4C)
- Accents: Teal, Gold, Red (your chosen palette)

**Dark Mode (Question: How should we do it?):**

Option A: **Invert but keep navy**
- Background: Very dark navy (#0F1823)
- Text: Offwhite (#F5F5F7)
- Accents: Lighter versions (Teal → Cyan, Gold → Light Gold)

Option B: **Full dark with accent boost**
- Background: Pure black (#000000)
- Text: Offwhite (#F5F5F7)
- Accents: Brighter (neon-like teal, bright yellow)

Option C: **Navy-focused dark mode**
- Background: Dark navy (#1A2B4C)
- Text: Offwhite (#F5F5F7)
- Accents: Bright versions (electric teal, bright gold)

**Question:**

Q37: **Dark mode preference:**
- [ ] Option A (Invert with softer accents)
- [ ] Option B (Black with neon accents)
- [ ] Option C (Navy with bright accents)
- [ ] No preference, you decide

---

## DESIGN SPEC - Component Details

**Questions:**

Q38: **Button style:**
- [ ] Rounded edges (radius 8-12px) - friendly
- [ ] Slightly rounded (radius 4-6px) - professional
- [ ] Sharp corners (radius 0px) - bold, minimal
- [ ] Gradient buttons with accents?

Q39: **Cards/containers:**
- [ ] Subtle shadow (soft drop shadow)
- [ ] Border only (outline, no shadow)
- [ ] Glassmorphism (frosted glass effect)
- [ ] Solid background, no decoration

Q40: **Input fields (text boxes, search, etc):**
- [ ] Rounded borders with subtle shadow
- [ ] Flat design with bottom border only
- [ ] Outlined (visible border on all sides)
- [ ] Floating label style

---

## TECHNICAL - Real-Time & Performance

**Questions:**

Q41: **Viva calendar with dates:**
- Should viva dates be fetched real-time from database?
- Or pre-calculated for semester and cached?
- Impact: Real-time = fresher data, cached = faster

Q42: **Dow Credits wallet:**
- When student loads credits via Easypaisa, should update be instant?
- Or take 2-5 seconds (for payment confirmation)?
- Impact: Real-time = better UX, delayed = safer (prevents double-charges)

Q43: **Marketplace listings:**
- Should students see new listings instantly?
- Or refresh every 30 seconds?
- Impact: Real-time = live feel, polling = lighter server load

Q44: **DowEats order tracking:**
- Rider GPS updates every 30 seconds (locked)
- Order status (preparing → packed → dispatched) - real-time or polling?
- Impact: Real-time = expensive, polling = cheaper

---

## TECHNICAL - Viva Bot Scoring

You want: "Complex adaptive scoring (out of 50 points)"

**Need clarity on:**

Q45: **Viva Bot scoring breakdown:**
- Correctness: ___ points (0-?)
- Confidence: ___ points (0-?)
- Articulation: ___ points (0-?)
- Adaptiveness bonus: ___ points (0-?)
- **Total: 50 points**

How should we weight these?

Example:
- Correctness: 25 points (most important)
- Confidence: 15 points
- Articulation: 10 points
- **Total: 50**

Your preference?

---

## TECHNICAL - Module Viva Scheduling

You said: "4 days of viivas subject-wise and group-wise"

**Need clarification:**

Q46: **Viva schedule within module:**
- Are the 4 days pre-set in the timetable?
- Or announced during the module?
- Should app show "Anatomy Viva: Feb 12 (pending schedule)"?

Q47: **Group-wise viivas:**
- Each clinical group has separate viva day?
- Or all groups viva same day, different times?
- How should timetable display this?

---

## TECHNICAL - Annual Exam Checklist

You want: "checklist for exam season"

**Need details:**

Q48: **Annual exam checklist format:**
```
Module 1 (Hematology):
- [ ] Notes complete
- [ ] MCQs practice: 50/100
- [ ] Viva practice: 3 sessions
- Readiness: 65%
```

Is this the format you want?

Q49: **Readiness calculation:**
- How do we calculate "65% readiness"?
- Based on: MCQ accuracy + Viva scores + Notes completion?
- Weighted equally or different weights?

---

## TECHNICAL - Payment Withdrawal

You said: "sellers get credited dow credits that they can withdraw"

**Need clarification:**

Q50: **Withdrawal process:**
- Student has 2500 credits (from selling books)
- Click "Withdraw" → goes to their bank account?
- Or stay as in-app credits, use for future purchases?
- Minimum withdrawal amount? (PKR 500? 1000?)

Q51: **Withdrawal fees:**
- Are there fees? (2-3% bank transfer fee?)
- Or zero fees?
- Impact: Affects seller motivation

---

## TECHNICAL - Lost & Found Contact

You said: "chat through number given in listing, dowOS uninvolved"

**Questions:**

Q52: **Phone number display:**
- Student posts "Lost backpack"
- Finder sees: Full number, hidden number, WhatsApp link?
- How do we protect privacy while enabling contact?

Q53: **Verification:**
- Should we verify phone numbers are real?
- Or trust students?

---

## OPERATIONAL - Ammaar's Gate Role Details

You said: "peak hours only"

**Questions:**

Q54: **Peak hours definition:**
- Lunch: 12:00 PM - 1:30 PM?
- Dinner: 6:00 PM - 7:30 PM?
- Or different times?

Q55: **Off-peak orders:**
- If student orders at 11 AM (outside peak hours)
- Can they still pick up order?
- Or does app show "Pickup available 12 PM onwards"?

Q56: **Non-peak coverage:**
- Who distributes orders if Ammaar unavailable?
- Should app show "Temporarily unavailable, back at 12 PM"?

---

## OPERATIONAL - DowEats Menu Structure

**Questions:**

Q57: **Menu categories:**
- Should be: Biryani, Karahi, Burgers, Drinks, Desserts?
- Or different organization?
- How many items per cafe initially?

Q58: **Out of stock:**
- If item runs out, mark as "unavailable"?
- Or remove from menu?

---

## OPERATIONAL - Merch Launch Strategy

You said: "notebooks, pens, caps, totebags, laptop sleeve, phone cover stickers"

**Questions:**

Q59: **Launch items priority:**
- Which items launch Week 5 (Merch Week)?
- Or all simultaneously?
- Suggest: Hoodies + caps first (easiest, most popular)?

Q60: **Initial quantities:**
- Notebooks: 100 units (S-XL sizes)?
- Caps: 50 units?
- Pre-order or inventory?

---

## FINAL: Name Confirmation

You said: "DowOS is fine"

Just to confirm: **DowOS** is the final name?
- Not changing it?
- Logo will be text-only "DowOS" in bold font?

---

## SUMMARY

Once you answer these 26 questions (Q35-Q60):

✅ **Complete Design System** ready
✅ **Technical architecture** locked
✅ **Operational workflows** clear
✅ **Ready to build PRD**

**Estimated time: 15-20 minutes**

Then I'll create:
1. **Complete PRD** (30 pages)
2. **Design System Spec** (color codes, fonts, components)
3. **Technical Spec** (all endpoints + real-time strategy)
4. **Database Schema** (all tables designed)
5. **Launch Checklist** (week-by-week)

**Final deliverable: 150+ pages**

Ready? 🚀

