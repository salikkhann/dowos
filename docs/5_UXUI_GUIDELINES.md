# DowOS UI/UX Guidelines

**Version:** 1.0 Final
**Status:** Production-Ready
**Last Updated:** February 10, 2026

---

## TABLE OF CONTENTS

1. UX Principles
2. Information Architecture
3. Navigation Patterns
4. Page-Specific UX
5. User Workflows
6. Error Handling
7. Loading States
8. Feedback & Confirmation
9. Mobile Optimization
10. Accessibility Practices

---

## 1. UX PRINCIPLES

### Core Principles for DowOS

**1. Student-Centric**
- Design for 18-25 year old medical students
- Consider their study patterns and busy schedules
- Mobile-first (they use phones primarily)
- Fast interactions (no waiting for slow loads)

**2. Clarity Over Aesthetics**
- Information should be immediately obvious
- Reduce cognitive load
- Clear labels and descriptions
- Avoid jargon or explain it

**3. Efficiency**
- Minimize taps/clicks to accomplish tasks
- Pre-fill known information
- Remember user preferences
- Fast feedback on actions

**4. Trust & Credibility**
- Medical app = needs high trust
- No dark patterns or tricks
- Transparent about data usage
- Clear error messages

**5. Accessibility First**
- Not an afterthought
- WCAG AA as minimum
- Keyboard navigation support
- Color contrast compliance

### Design Decisions

**Mobile-First Approach**
```
Design for smallest screen first (320px)
Then enhance for larger screens
Navigation: Bottom tabs (mobile), Top/Side (tablet+)
Touch targets: Min 44x44px
Spacing: Generous vertical margins for thumb reach
```

**Progressive Disclosure**
```
Show essential information first
Hide advanced options
Let users explore deeper if needed
Example: Timetable → Tap for details
```

**Consistency**
```
Same UI patterns for same actions
Buttons always look/behave the same
Colors mean same things everywhere
Spacing follows same scale
```

---

## 2. INFORMATION ARCHITECTURE

### Site Structure (IA)

```
DowOS App
├── Auth (Entry point)
│   ├── Signup/Login
│   ├── ID Verification
│   └── Profile Setup
│
├── Dashboard (Home)
│   ├── Quick Actions
│   ├── Announcements
│   └── Profile Summary
│
├── Timetable (Schedule)
│   ├── Week View
│   ├── Module View
│   └── Viva Schedule
│
├── Attendance
│   ├── Check-in Button
│   ├── Per-Module Stats
│   └── Runway Calculator
│
├── Learning Hub
│   ├── AI Tutor Chat
│   ├── MCQ Solver
│   ├── Viva Bot
│   └── Progress Matrix
│
├── Community
│   ├── Lost & Found
│   ├── Point Routes
│   └── Announcements
│
├── Phase 2 (Weeks 5+)
│   ├── DowEats
│   ├── Merch Store
│   └── Marketplace
│
└── Account
    ├── Profile
    ├── Settings
    ├── Notifications
    └── Help & Support
```

### Navigation Hierarchy

**Level 1: Main Sections**
```
Bottom navigation tabs (mobile)
- Timetable
- Attendance
- Learning
- Community
- More/Account
```

**Level 2: Subsections**
```
Within each section:
- List/overview
- Detail view
- Actions
```

**Level 3: Details**
```
Full information
Edit/manage options
Related actions
```

### Mental Model

**User thinks in terms of:**
```
"What's my schedule today?" → Timetable
"How's my attendance?" → Attendance
"I need help studying" → Learning Hub
"I lost something" → Lost & Found
"I want to buy food" → DowEats (Week 5)
```

**We provide:**
```
Quick access to each
Logical grouping
Clear labeling
Consistent patterns
```

---

## 3. NAVIGATION PATTERNS

### Mobile Navigation (Primary)

**Bottom Tab Navigation**
```
5 visible tabs:
├── Timetable (calendar icon)
├── Attendance (checkmark icon)
├── Learning (book icon)
├── Community (people icon)
└── Account (user icon)

Behavior:
- Always visible
- Shows current tab highlighted (Teal)
- Tap to navigate
- No sub-navigation in tabs
```

**Secondary Navigation (within screens)**
```
Use:
- Horizontal scrollable tabs for filtering
- List items with chevrons for deeper pages
- Header back button for going back
- Breadcrumbs for complex journeys
```

### Tablet & Desktop Navigation

**Top Bar + Side Navigation**
```
Left Sidebar (persistent):
├── Logo
├── Main sections
├── User profile
└── Settings

Top Bar:
├── Current page title
├── Search (if applicable)
└── Notifications
```

**Behavior:**
```
- Sidebar collapses on smaller tablets
- Desktop: Always show
- Mobile: Hidden (bottom tabs instead)
```

### Navigation Best Practices

**Back Navigation**
```
Mobile: Hardware back + visual back button
Tablet/Desktop: Browser back + visual back button
Always preserve scroll position when going back
Clear indication of current location
```

**Breadcrumbs**
```
Use for: Complex workflows (e.g., MCQ filtering)
Don't use for: Simple 2-level navigation
Format: Home > Module > Subject > Subtopic
```

**Search Navigation**
```
Global search: Top bar (visible on all pages)
Filters below search results
Clear search input state
Show recent searches
```

---

## 4. PAGE-SPECIFIC UX

### Authentication Pages

**Signup Flow**
```
1. Email Input
   - Validate email format
   - Check if already registered
   - Send OTP

2. OTP Verification
   - 6-digit code input
   - Auto-verify on complete
   - Resend button (after 30s)
   - Clear error messages

3. Profile Setup
   - Name
   - Roll number
   - Lab group (A-F)
   - Batch year
   - ID photo upload

4. Verification Status
   - Show "Pending approval"
   - Explain waiting period
   - Show timestamp of submission
```

**Login Flow**
```
1. Email Input
   - Single field
   - Validate format

2. OTP Input
   - Focused on security
   - Clear instructions
   - Countdown timer

3. Dashboard
   - Seamless entry to app
```

### Timetable Page

**Week View**
```
Display:
- Current week (Mon-Fri)
- Color-coded by module
- Time displayed on Y-axis (8 AM - 4 PM)
- Class name, location, faculty

Interactions:
- Tap class → See details
- Swipe to next/prev week
- Toggle viva schedule (with toggle button)
- Filter by module (chips below header)

Details Modal:
- Class name
- Time
- Location
- Faculty
- Module name
- Lab group (if applicable)
- "Add to calendar" button (optional)
```

**Viva Schedule View**
```
Display:
- Calendar grid
- Viva dates highlighted
- Applicable roll numbers shown

Interactions:
- Tap date → See detailed viva info
- Filter by subject
- See your roll number in applicable groups
```

### Attendance Page

**Attendance Checkin**
```
Primary CTA:
- Large "Check In" button (Teal, 48px height)
- Below current time display
- Success state: "Checked in at X:XX"
- Error state: Clear error message

Fallback:
- If class ended: "Class has ended"
- If not in a class: "No active class right now"
- Button disabled with explanation
```

**Attendance Summary**
```
Per-Module View:
- Module name
- X/Y attended
- Percentage (color-coded)
- Safe skip count (calculated)
- Small chart (optional: visual representation)

Interactions:
- Tap for detailed attendance history
- Filters: Module, date range
- Export option (optional)
```

**Runway Calculator**
```
Prominence:
- Highlighted in gold card
- Below attendance summary
- Shows: "You can safely skip X classes"
- Calculation: Based on 75% threshold
- Updates real-time after checkin
```

### Learning Hub

**AI Tutor Chat**
```
Layout:
- Full-screen chat interface
- Previous messages displayed
- Input field at bottom
- Send button (icon or text)

Interactions:
- Tap to send text
- Microphone icon → Voice input
- Speaker icon → Voice output
- Settings icon → Mode selection
- New chat button → Start conversation

Rate Limiting Display:
- Show remaining questions/day
- Visual indicator (progress bar)
- Pro tier offer (when approaching limit)
```

**MCQ Solver**
```
Question Layout:
- Question text (top)
- 4 options (radio buttons, full-width)
- Submit button (Teal, locked until selected)

After Answer:
- Show "Correct!" or "Incorrect"
- Display explanation
- Show correct answer (if wrong)
- "Next Question" button

Progress:
- Top progress bar (X/100)
- Question counter: "Question 15 of 100"
- Time spent on question (optional)

Filters:
- Module dropdown
- Subject dropdown
- Subtopic dropdown
- Difficulty selector
- High-yield toggle
```

**Viva Bot**
```
Before Starting:
- Mode selection (Strict, Friendly, Standard)
- Instructions: "You'll be asked questions. Speak your answer."
- Microphone permission request

During Session:
- Question displayed
- Large microphone button (Teal, animated during recording)
- Recording indicator ("Listening...")
- Time indicator (seconds elapsed)
- Cancel button (stop, don't submit answer)

After Answer:
- Transcription displayed
- Feedback paragraph
- Score breakdown (Correctness, Confidence, Articulation, Bonus)
- "Next Question" button
- or "End Session" button

After Session:
- Final score (large, prominent)
- Breakdown (score/50 for each dimension)
- Strengths (bulleted list)
- Areas to improve (bulleted list)
- Share/export option
```

**Progress Matrix**
```
Hierarchy View:
- Module level (expandable)
  - Subject level (expandable)
    - Subtopic level
      - Mastery % (color-coded)
      - Last practiced date

Color Coding:
- Red: <25% (just started)
- Orange: 25-50%
- Yellow: 50-75%
- Light Green: 75-90%
- Dark Green: 90-100% (mastered)

Interactions:
- Tap subtopic → See related MCQs/viivas
- Filter by module
- Sort by: Name, Last practiced, Mastery
- Annual exam mode (during prof break)
```

### Community Features

**Lost & Found**
```
List View:
- Item photo (left)
- Item name (bold)
- Location
- Date posted
- Status badge (Active, Claimed)

Filters:
- Item type (Lost/Found)
- Category (backpack, keys, etc.)
- Date range
- Status

Add Item Flow:
- Photo upload
- Item name
- Description
- Category
- Location found
- Date found
- Phone number (pre-filled)

Detail View:
- Large photo
- All details
- "Contact via WhatsApp" button (or SMS fallback)
- Report button (if lost/suspicious)
```

**Announcements**
```
List View:
- Latest announcements first
- Announcement title
- Excerpt (first 100 chars)
- Time posted (relative: "2 hours ago")
- Notification badge if unread

Detail View:
- Full announcement
- Posted by
- Date/time
- Category badge
- Share button
- Back button or dismiss
```

### Phase 2: DowEats

**Order Flow**
```
1. Browse Menu
   - Restaurant filter chips
   - Category filter
   - Item cards (photo, name, price)

2. Add Items to Cart
   - Tap item → quantity selector
   - Modals: Select quantity
   - Add to cart

3. Review Cart
   - Items listed
   - Price breakdown
   - Total with DowOS commission (if applicable)
   - Proceed button

4. Checkout
   - Delivery time estimate
   - "Express" vs "Standard"
   - Payment method: Dow Credits
   - Order code display (6 digits, large, tappable to copy)
   - "Share code with rider" button

5. Order Tracking
   - Status: "Preparing" → "Ready" → "Out for delivery"
   - Rider location (if available)
   - Estimated arrival time
   - Notifications on status change
```

---

## 5. USER WORKFLOWS

### Typical Student Workflows

**Morning Routine**
```
Student wakes up → Checks DowOS app
1. Sees today's timetable (widget or home screen)
2. Checks attendance status
3. Opens AI tutor if has questions
4. Ready for classes
```

**During Classes**
```
After each class:
1. Tap "Check In" → Confirms attendance
2. Sees updated attendance & runway
3. Continues with day
```

**Evening Study**
```
After classes:
1. Opens "Learning Hub"
2. Chooses: MCQs or Viva Practice
3. Spends 30-60 minutes
4. Sees progress updated in matrix
5. Prepares for next class
```

**Lunch Time** (Phase 2)
```
Student hungry → Opens DowEats
1. Browses menu
2. Adds 2-3 items
3. Checkout
4. Gets 6-digit code
5. Waits for rider
6. Gets food at gate
```

### Optimizing Workflows

**Reduce Friction:**
```
- Auto-fill known info
- Remember preferences
- One-tap actions where possible
- Progress persistence
```

**Progressive Goals:**
```
New students:
- Understand timetable
- Check attendance
- Try one MCQ

Intermediate:
- Regular attendance
- 20+ MCQs per week
- Try viva bot

Advanced:
- Use AI tutor actively
- 50+ MCQs per week
- Daily viva practice
- Merch purchases
- Marketplace activity
```

---

## 6. ERROR HANDLING

### Error Types & Responses

**Network Errors**
```
Title: "Connection Error"
Message: "Check your internet connection and try again"
Action: Retry button
Recovery: Save draft locally, try again

Example: MCQ unsaved → Show toast with save status
```

**Input Validation**
```
Real-time feedback:
- Email format invalid → "Invalid email format"
- Roll number too short → "Roll number must be 6 digits"
- Password too weak → "Password must be 8+ characters"

Color: Red border + error message
Icon: Alert circle

After user corrects:
- Automatically validate
- Clear error state
- Enable submit button
```

**Server Errors**
```
Title: "Something went wrong"
Message: "Our servers are busy. Please try again in a moment"
Action: Retry button
Recovery: Show cached version if available

Don't show:
- Technical error codes to users
- Stack traces
- 500 Internal Server Error
```

**Rate Limiting (AI Tutor)**
```
Title: "Daily limit reached"
Message: "You've used your X questions for today. Upgrade to Pro for unlimited."
Action: Upgrade button + OK
Recovery: Offer Pro tier

For Pro users:
Title: "No more questions today"
Message: "Your 180-minute monthly limit has been reached. Use again next month."
Action: OK
Recovery: Show next reset date
```

### Error Display

**Toast Notifications** (bottom of screen)
```
Success: Green + check icon + "Saved successfully"
Error: Red + alert icon + "Failed to save. Try again?"
Info: Navy + info icon + "Syncing..."

Auto-dismiss: 
- Success: 2 seconds
- Error: 5 seconds (allow tap to dismiss)
- Info: 3 seconds
```

**Inline Errors** (within forms)
```
Display below field:
- Red text
- Alert icon
- Clear message
- Suggestion (if applicable)
```

**Modal Errors** (critical issues)
```
Title: Clear error statement
Message: Explanation + what user can do
Primary action: Retry or Go Back
```

---

## 7. LOADING STATES

### Skeleton Screens

**Timetable Loading**
```
Show placeholder rows:
- 8 skeleton cards
- Approximate shape of timetable
- Shimmer animation
- Auto-replace when loaded
```

**MCQ Loading**
```
Show:
- Question placeholder (2 lines)
- 4 option placeholders
- Submit button (disabled)
```

**List Loading**
```
Show:
- 5 card-shaped placeholders
- Shimmer effect
- Consistent with card styling
```

### Progress Indicators

**Linear Progress (for steps)**
```
Showing completion:
- Progress bar (top of screen)
- "Step 1 of 3"
- Only for multi-step flows
```

**Spinner (for time-unknown waits)**
```
Circular spinner:
- Teal color
- Centered on screen
- Optional message: "Loading..."
- For waits >2 seconds
```

**Pulse Animation** (for skeleton screens)
```
Gentle fade: 0.5 → 1 opacity
Duration: 1.5 seconds
Repeat: Until real content loads
```

---

## 8. FEEDBACK & CONFIRMATION

### Success Feedback

**Positive Confirmations**
```
Check-in: "Checked in at 9:15 AM" (toast, 2s)
MCQ answer: "Correct!" (inline, prominent)
Viva complete: "Session saved" (modal, with results)
Saved: Toast notification (green)
```

**Celebratory Moments**
```
First check-in of day: Subtle animation
Milestone: "You've completed 50 MCQs!"
Achievement: "Subtopic mastered!" (badge animation)
```

### Confirmation Dialogs

**Destructive Actions**
```
Title: "Are you sure?"
Message: Explain what's about to happen
Primary: Cancel (Navy outline button)
Secondary: Delete/Leave (Teal button)
```

**Significant Changes**
```
Title: "Confirm details"
Message: Show what's changing
Primary: Confirm (Teal)
Secondary: Edit (Navy outline)
```

---

## 9. MOBILE OPTIMIZATION

### Touch-Friendly Design

**Button Sizing**
```
Minimum: 44x44px
Recommended: 48x48px
Spacing between buttons: 8px minimum
```

**Input Fields**
```
Height: 44px (comfortable for thumb)
Padding: 12px (visual breathing room)
Font: 14px (readable without zoom)
```

**List Items**
```
Height: 48px minimum
Padding: 12px vertical, 16px horizontal
Touch target: Full width
Chevron icon: 20px, right-aligned
```

### Viewport Optimization

**Safe Areas**
```
iPhone notch:
- Top padding: 16px (or use safe-area-inset)
- Bottom: Account for home indicator

Landscape:
- Reduce vertical padding
- Consider side-by-side layouts
- Hide non-essential elements
```

**Keyboard Behavior**
```
When keyboard opens:
- Scroll input into view
- Don't cover submit button
- Use keyboard type appropriately:
  - Email input: keyboard="email"
  - Phone input: keyboard="tel"
  - Numbers only: keyboard="number"
```

### Screen Sizes

**Minimum Supported**: iPhone SE 375px
```
Single column layout
Full-width cards (16px padding)
Bottom navigation persistent
```

**Typical Mobile**: 414px+
```
Single column
Cards with more breathing room
Slightly larger fonts
```

**Tablet**: 768px+
```
Two columns where appropriate
Cards narrower (max 400px width)
Side navigation introduced
Increased spacing
```

---

## 10. ACCESSIBILITY PRACTICES

### Keyboard Navigation

**Tab Order**
```
Follow visual order:
Left → Right
Top → Bottom
Logical grouping
```

**Focus Management**
```
Visible focus ring: Navy 400 (2px)
On all interactive elements
After modal opens: Focus on first input
After action: Focus on result/confirmation
```

**Keyboard Shortcuts**
```
Not required but helpful:
- Enter: Submit form
- Escape: Close modal
- Tab: Next element
- Shift+Tab: Previous element
```

### Screen Reader Optimization

**Semantic HTML**
```
Use proper tags:
- <button> for buttons (not <div onClick>)
- <input> for inputs
- <label> for labels
- <nav> for navigation
```

**ARIA Labels**
```
Icons need labels:
- <button aria-label="Close menu">×</button>

Status updates:
- <div role="status" aria-live="polite">
    Saved successfully
  </div>

Groups:
- <fieldset>
    <legend>Module</legend>
  </fieldset>
```

**Form Labels**
```
Always connect:
<label for="email">Email</label>
<input id="email" type="email" />

Not just placeholder:
Placeholder disappears when typing
Label always visible
```

### Color Independence

**Never use color alone:**
```
❌ "Red for error" only
✅ Red icon + text "Error: ..." + clear message

❌ "Green for success" only
✅ Green checkmark + text "Saved successfully"

❌ Module colors only for distinction
✅ Colors + module names + icons
```

### Readability

**Font Sizes**
```
Minimum body text: 14px
Minimum captions: 12px
Large text: 16px+ for comfort
Headers: Proportional increase
```

**Line Spacing**
```
Body text: 1.5 line-height (21px for 14px text)
Headings: 1.2 line-height
Lists: 1.4 line-height
```

**Line Length**
```
Max 75 characters per line (optimal)
For 14px font: ~400px width
Multiple columns if wider
```

---

## UX BEST PRACTICES CHECKLIST

### Before Launch

**Interaction Design**
- [ ] All buttons have clear labels
- [ ] Touch targets minimum 44x44px
- [ ] Feedback provided for every action
- [ ] Error messages are helpful
- [ ] Success states are celebratory
- [ ] Loading states show progress
- [ ] Modals have clear close mechanism
- [ ] Forms have clear submit button

**Accessibility**
- [ ] WCAG AA contrast verified
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Form labels associated
- [ ] Images have alt text
- [ ] Color not only indicator
- [ ] Screen reader tested
- [ ] Mobile zoom works (no disable-zoom)

**Mobile Experience**
- [ ] Works on 375px width
- [ ] Touchscreen tested
- [ ] No horizontal scroll
- [ ] Orientation change handled
- [ ] Safe areas respected
- [ ] Keyboard doesn't cover inputs
- [ ] Links sized for touch

**Performance**
- [ ] Pages load <3 seconds
- [ ] Interactions feel responsive (<100ms)
- [ ] No layout shift
- [ ] Images optimized
- [ ] Animations smooth (60fps)

**Consistency**
- [ ] Colors used correctly
- [ ] Typography consistent
- [ ] Spacing follows scale
- [ ] Buttons look the same
- [ ] Icons style consistent
- [ ] Error handling uniform

---

## CONCLUSION

**DowOS UI/UX is designed for:**
- ✅ Speed (fast, efficient interactions)
- ✅ Clarity (obvious what to do next)
- ✅ Mobile-first (works great on phones)
- ✅ Trust (medical app reliability)
- ✅ Accessibility (works for everyone)
- ✅ Delight (small moments of joy)

**Ready for development & user testing.** 🚀

