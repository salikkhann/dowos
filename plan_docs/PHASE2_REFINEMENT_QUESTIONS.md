# Phase 2 Deep Refinement - 38 Critical Questions

## Overview
Your Phase 2 specs are generic. Let's make them **YOUR** Phase 2 by understanding:
- How DowEats REALLY works at Dow
- How Merch actually gets into students' hands
- Which marketplace features students will use
- Whether Pakistani payment reality matches our tech

---

## PART 1: DOWEATS (Questions 1-6)

### The Problem We're Solving
- Cafeteria food is expensive + overpriced
- Limited options (same food every day)
- No alternative vendors

### Q1: Cafe Partnership Model
**Current spec:** Cafes have dashboard, manage orders
**Reality check:** Will cafes really use a dashboard?

Do you want:
- [ ] Cafes get their own login/dashboard (they see orders, confirm)
- [ ] You manually input all orders for cafes (you handle cafe comms)
- [ ] Hybrid (you input orders, they just see WhatsApp notifications)

### Q2: Menu Management
**Current spec:** Cafes update menu weekly
**Reality check:** Menus change constantly at Dow cafes

Who updates the menu?
- [ ] Each cafe updates their own menu in app (requires cafe buy-in)
- [ ] You physically check cafe chalkboard daily/weekly and update
- [ ] Hybrid (students report menu changes, you approve)

How often?
- [ ] Daily (too much work)
- [ ] Weekly (Sunday night?)
- [ ] As-needed (only when cafe tells you)

### Q3: Pricing & Discounts
**Current spec:** 15% commission from cafes
**Reality check:** Will cafes accept this? Will you negotiate?

Pricing model:
- [ ] You negotiate fixed prices with each cafe, cafes can't change
- [ ] Cafes set their own prices freely
- [ ] You suggest price ranges, cafes stay within

Student discounts:
- [ ] Yes, automatic 10% off for all students (you subsidize?)
- [ ] Yes, but cafes offer it, not you
- [ ] No discounts - no margin for it

### Q4: Delivery vs Pickup
**Current spec:** Delivery with hired riders
**Reality check:** Can you trust riders with food?

Model:
- [ ] **Delivery** (riders pick up, deliver to dorm/location)
- [ ] **Pickup only** (students collect from cafe)
- [ ] **Hybrid** (both options)

If delivery, who delivers?
- [ ] Hired student riders (2-3 people you employ)
- [ ] Cafe's own staff (they handle delivery)
- [ ] Mix (rider picks up from cafe, hands to cafe staff)

### Q5: Payment Method
**Current spec:** Dow Credits + Easypaisa/JazzCash
**Reality check:** Students prefer what they already use

Will students pay via:
- [ ] **Dow Credits only** (they load app with Easypaisa once, then use credits)
- [ ] **Direct Easypaisa/JazzCash** (each order = new payment)
- [ ] **Both** (student chooses per order)

### Q6: Revenue Split
**Current spec:** 15% to DowOS, 85% to cafes
**Reality check:** Is this sustainable? Do cafes accept?

Model:
- [ ] **15% commission** (standard, cafes pay from order)
- [ ] **Different percentage** (what % feels fair?)
- [ ] **Flat fee** (PKR 10 per order regardless of amount)
- [ ] **Markup** (you mark up cafe prices 10%, pocket difference)

---

## PART 2: DOW MERCH (Questions 7-11)

### The Problem We're Solving
- No official Dow merchandise exists
- Students want hoodies/lab coats with Dow branding
- Missing sense of university identity

### Q7: Inventory Model
**Current spec:** You hold physical stock
**Reality check:** Inventory is cash flow killer

Model:
- [ ] **Physical stock** (you buy 100 hoodies, hold inventory, sell)
- [ ] **Dropshipping** (vendor holds stock, you take orders, they ship)
- [ ] **Pre-order** (students pre-order, you buy only what's ordered)
- [ ] **Hybrid** (keep popular items in stock, special items pre-order)

### Q8: Customization
**Current spec:** Batch year + names + logo
**Reality check:** Customization = complexity + cost

What customization?
- [ ] **Logo only** (just Dow crest on plain hoodie)
- [ ] **Batch year** (2024, 2025 on sleeve)
- [ ] **Student name** (embroider on lab coat)
- [ ] **All above** (maximum customization)
- [ ] **None** (plain + logo, simplicity)

Turnaround time for customization?
- [ ] 3-5 days (rush, costs more)
- [ ] 1-2 weeks (standard)
- [ ] 2-4 weeks (acceptable for merch)

### Q9: Size & Color Range
**Current spec:** Standard S-XL
**Reality check:** More variants = inventory nightmare

Sizes:
- [ ] **XS-XXL** (cover everyone)
- [ ] **S-L** (most common only)
- [ ] **S-XL** (standard)

Colors per item:
- [ ] **1 color** (simplicity)
- [ ] **2-3 colors** (choice without chaos)
- [ ] **5+ colors** (full customization)

### Q10: Vendor Strategy
**Current spec:** Single vendor for all items
**Reality check:** Different products need different vendors

Vendors:
- [ ] **One vendor** (simpler, but quality depends on them)
- [ ] **Separate vendors** (hoodies vendor, lab coats vendor, caps vendor)
- [ ] **Best price per item** (shop around, order from whoever's cheapest)

Bulk minimums:
- [ ] **Can order 10 hoodies** (flexibility)
- [ ] **Minimum 100 per order** (traditional wholesale)
- [ ] **Negotiate per vendor** (depends)

### Q11: Cash Flow Model
**Current spec:** Inventory purchase upfront
**Reality check:** How do you fund initial inventory?

Model:
- [ ] **Pre-order** (students pay first, you buy after reaching order threshold)
- [ ] **Inventory purchase** (you buy stock with your own money, sell)
- [ ] **Drop shipment** (vendor fulfills directly to students)
- [ ] **Hybrid** (popular items: inventory, rare items: pre-order)

Timeline before shipping?
- [ ] **1 week** (students get items fast)
- [ ] **2-3 weeks** (reasonable)
- [ ] **4+ weeks** (acceptable for special merch)

---

## PART 3: MARKETPLACE (Questions 12-16)

### The Problem We're Solving
- Textbooks expensive (PKR 3000+)
- No peer-to-peer exchange at Dow
- Equipment expensive to buy new

### Q12: Textbook Listings
**Current spec:** Any book allowed
**Reality check:** How do you prevent junk listings?

Policy:
- [ ] **Any textbook** (free listing, no curation)
- [ ] **Dow-approved books only** (you maintain list of legit textbooks)
- [ ] **Auto-approved after verification** (student uploads ISBN, you check)

Duplicate prevention:
- [ ] **Allow duplicates** (same book listed 10 times, compete on price)
- [ ] **Prevent duplicates** (one listing per book edition)
- [ ] **Encourage bundling** (multiple of same book = auto-bundle?)

### Q13: Textbook Pricing
**Current spec:** Free pricing
**Reality check:** Students will underprice; sellers lose money

Pricing model:
- [ ] **Free pricing** (student lists "selling Harrison's for PKR 1000")
- [ ] **Suggested range** (you show "market price PKR 2000-2500, list within this")
- [ ] **Fixed price** (you determine price for each textbook)
- [ ] **Platform rules** ("can't sell for <50% of new price")

### Q14: Transaction Handling
**Current spec:** P2P meetup, DowOS takes 5% commission
**Reality check:** How do students actually exchange money?

Model:
- [ ] **P2P exchange** (students meet, trade money themselves, DowOS uninvolved)
- [ ] **DowOS handles payment** (student pays DowOS, DowOS pays seller)
- [ ] **Escrow** (buyer pays DowOS, DowOS holds until seller confirms delivery)
- [ ] **Trust system** (buyer rates seller, history-based trust)

Dispute handling:
- [ ] **Manual arbitration** (you mediate buyer/seller disputes)
- [ ] **Automated refund** (buyer claims issue, gets refund instantly)
- [ ] **No support** (buyers/sellers figure it out)

### Q15: Equipment Rental
**Current spec:** Stethoscopes, equipment can be rented
**Reality check:** Will this actually get used?

Rental feature:
- [ ] **Yes, implement rental** (daily/weekly/monthly rates)
- [ ] **No, not worth complexity** (remove from spec)
- [ ] **Later (Phase 3)** (focus on textbooks first)

If yes:
- Rental rates? (Daily? Weekly? Semester?)
- Security deposit required? (Yes/No)
- Damage liability? (Who pays if renter breaks it?)

### Q16: Tutoring & Academic Services
**Current spec:** Students offer tutoring, solution sheets
**Reality check:** Will Dow students actually buy tutoring?

Tutoring:
- [ ] **Yes, include tutoring** (demand exists)
- [ ] **No, remove it** (students won't pay peers)
- [ ] **Maybe - launch without, add if requested**

If yes:
- Price per hour? (PKR 200? 500? 1000?)
- Online or in-person? (Both?)
- Verification needed? (Check tutor credentials?)

---

## PART 4: LOST & FOUND (Questions 17-18)

### Q17: Matching Process
**Current spec:** Auto-match algorithm
**Reality check:** Can algorithm match a "black backpack"?

Matching:
- [ ] **Auto-match** (AI suggests matches based on description)
- [ ] **Manual matching** (you review lost/found, suggest matches)
- [ ] **Crowdsourced** (community upvotes matches, highest wins)
- [ ] **Search-based** (lost item posted, others search and reply)

### Q18: Reward Payments
**Current spec:** Student offers PKR 500 reward
**Reality check:** How does payment happen?

Payment:
- [ ] **Escrow** (you hold PKR 500 until item returned, then release)
- [ ] **Honor system** (student trusts finder, pays directly)
- [ ] **Dow Credits** (reward in app credits, not cash)
- [ ] **No rewards** (remove money from system, just community help)

---

## PART 5: PHASE 2 STRATEGY (Questions 19-21)

### Q19: Launch Sequence
**Current spec:** All simultaneous
**Reality check:** Can you handle all three?

Launch order:
- [ ] **DowEats first** (food = daily need, easiest traction)
- [ ] **Merch first** (branding = community, simplest ops)
- [ ] **Marketplace first** (textbooks = natural extension of MVP)
- [ ] **All together** (we're ready for phase 2)

### Q20: Team Capacity
**Current spec:** Ammaar handles all operations
**Reality check:** Can 1-2 people run Phase 2?

Staffing:
- [ ] **Ammaar alone** (he can handle it)
- [ ] **Ammaar + new hire** (bring operations person)
- [ ] **Ammaar + Azfar split duties** (both take different areas)
- [ ] **Full team restructure** (new roles for Phase 2)

### Q21: Success Targets
**Current spec:** Generic numbers
**Reality check:** What does success look like?

Define success by:
- **DowEats:** ___ orders/day by end of Month 1?
- **Merch:** ___ items/week by end of Month 1?
- **Marketplace:** ___ listings by end of Month 1?

---

## PART 6: PAKISTAN-SPECIFIC REALITIES (Questions 22-27)

### Q22: MedifyHelp Differentiation
What's your competitive advantage vs MedifyHelp?
- Is it DowEats (unique)?
- Or Merch (unique)?
- Or just better execution?

### Q23: Why Not Integrate?
Why not use Foodpanda, OLX, Uber Eats instead?
- Campus exclusivity is important?
- You want full control?
- You want revenue from everything?

### Q24: Payment Reality
Students will actually use:
- [ ] **Dow Credits** (if they load it once)
- [ ] **Easypaisa** (what everyone knows)
- [ ] **Both** (but mostly Easypaisa?)
- [ ] **Other** (tell me)

### Q25: Shipping Strategy
For Merch, shipping reality:
- [ ] **Campus pickup only** (no shipping complexity)
- [ ] **Local Karachi delivery** (via courier)
- [ ] **Nationwide** (ambitious, but possible)
- [ ] **Pre-order, ship later** (batch shipments, cheaper)

### Q26: Cafe Buy-In
How will you convince cafes to partner?
- [ ] **Show revenue potential** (they make more money)
- [ ] **Start with 1-2 sympathetic cafe owners** (build case study)
- [ ] **Offer flat fee, not commission** (guaranteed income)
- [ ] **Partner with admin** (get admin endorsement)

### Q27: Rider Reliability
How will you ensure delivery quality?
- [ ] **Hire reliable students** (background check, bonus structure)
- [ ] **GPS tracking** (monitor rider movement)
- [ ] **Customer ratings** (bad raters get fired)
- [ ] **Insurance/bonding** (cover losses if something breaks)

---

## PART 7: HONEST PRIORITIZATION (Questions 28-30)

### Q28: The Brutal Truth
If you had to pick ONE Phase 2 feature to launch Week 5:
- [ ] **DowEats** (food delivery)
- [ ] **Merch** (university gear)
- [ ] **Marketplace** (textbook exchange)

Which would have BIGGEST impact on students?

### Q29: Real Pain Points
Which problem is ACTUALLY severe at Dow?
- Expensive cafeteria: TRUE / EXAGGERATED / MYTH?
- No official merch: TRUE / NICE-TO-HAVE?
- Overpriced textbooks: TRUE / MANAGEABLE?

### Q30: Your Personal Usage
Which Phase 2 feature would YOU use as a student?
- [ ] DowEats (order food daily)
- [ ] Merch (buy hoodie once, wear always)
- [ ] Marketplace (buy used textbooks)

Which would you use MOST OFTEN?

---

## PART 8: NAMING (Questions 31-33)

### Q31: What's Wrong with "DowOS"?
Why doesn't it feel right?
- [ ] Too technical (sounds like operating system)
- [ ] Too corporate (not student-friendly)
- [ ] Not clear what it does
- [ ] Doesn't sound fun
- [ ] Something else: _______________

### Q32: What Should the Name Convey?
The app is about:
- [ ] "The unofficial student hub" (scrappy, underground)
- [ ] "Your medical school companion" (professional)
- [ ] "We fixed Dow" (confident, bold)
- [ ] Something playful/fun
- [ ] Mix of above: _______________

### Q33: Name Alternatives
Do any of these resonate?
- **DocFlow** (medical + flow of info) - ___/10
- **MedCircle** (medical + community) - ___/10
- **DowHub** (central meeting point) - ___/10
- **Healers** (for med students) - ___/10
- **CliniqOS** (clinical + OS) - ___/10
- **StudyBridge** (connecting students) - ___/10
- **MediHub** (medical + hub) - ___/10
- **DowLife** (your life at Dow) - ___/10
- **Other suggestion:** _______________

---

## PART 9: DESIGN SPEC (Questions 34-38)

### Q34: Color Palette
Which resonates most?
- [ ] **Healthcare Green** (trust, medical field) + white accents
- [ ] **Professional Blue** (calm, credible) + white accents
- [ ] **Premium Purple** (innovative, premium) + white accents
- [ ] **Warm Orange/Coral** (friendly, approachable) + white accents
- [ ] **Dark Minimalist** (modern, clean) + accent color
- [ ] **Pakistani Pride** (Green + white from flag) + accent
- [ ] **Custom mix:** _______________

### Q35: Typography
Which style appeals to you?
- [ ] **Modern Sans-Serif** (Helvetica, Inter, Poppins)
- [ ] **Friendly Geometric** (Sora, Space Mono)
- [ ] **Bold/Playful** (Outfit, DM Sans)
- [ ] **Classic/Professional** (Georgia, Playfair Display)
- [ ] **Mix** (Serif headers + Sans body)

### Q36: Design Personality
Which brand identity?
- [ ] **Corporate & Professional** (like Slack, Notion)
- [ ] **Playful & Approachable** (like Discord, Figma)
- [ ] **Minimal & Clean** (like Apple)
- [ ] **Energetic & Bold** (like Airbnb)
- [ ] **Educational & Friendly** (like Khan Academy)

### Q37: Logo Concept
What style?
- [ ] **Medical symbol** (stethoscope, caduceus, heartbeat)
- [ ] **Letter-based** (stylized "D" or "DOS")
- [ ] **Icon-based** (abstract shape)
- [ ] **Text only** (just the app name, well-designed)
- [ ] **Custom concept:** _______________

Icon style throughout app?
- [ ] **Filled** (solid icons)
- [ ] **Outlined** (wireframe icons)
- [ ] **Hand-drawn** (friendly, organic)
- [ ] **Duotone** (two-color icons)

### Q38: Dark Mode
Essential or later?
- [ ] **MVP Light Only** (add dark later)
- [ ] **Both from Day 1** (support both themes)
- [ ] **Dark First** (dark is primary)
- [ ] **Optional Toggle** (users choose)

---

## FINAL SUMMARY

Once you answer these 38 questions, I'll:
1. **Edit Phase 2 specs** to match your actual workflow
2. **Create Name & Design Spec** with final brand identity
3. **Build complete PRD** with corrected Phase 2 details

**Estimated time to answer:** 30-45 minutes
**Impact:** 100% accurate specs that match reality instead of assumptions

Ready to dive in? 🚀

