# DowOS MVP - Comprehensive Feature Specifications

## Document Version
- **Version:** 1.0
- **Date:** February 2026
- **Scope:** MVP (Weeks 1-4)
- **Target Users:** 500 DAU by Week 4

---

## **TABLE OF CONTENTS**
1. Core Modules Overview
2. Feature Specifications (Detailed)
3. User Flows & Interactions
4. Data Models & Relationships
5. API Endpoints Summary
6. Voice Integration Details
7. AI Memory Architecture
8. Real-Time Architecture
9. Performance & Scaling Constraints

---

## **1. CORE MODULES OVERVIEW**

### Module Stack (MVP)
1. **Authentication & Onboarding**
2. **Timetable & Announcements**
3. **Attendance Tracking**
4. **AI Tutor (Main Chatbot with Voice)**
5. **MCQ Solver**
6. **Viva Bot (Pro-Only, Voice)**
7. **Point Routes & Navigation**
8. **Progress Matrix**
9. **Lost & Found (Marketplace)**
10. **Spiritual Hub (Prayer Times)**

---

## **2. FEATURE SPECIFICATIONS (DETAILED)**

### **2.1 AUTHENTICATION & ONBOARDING**

#### 2.1.1 User Signup Flow
**Trigger:** Student clicks "Sign Up"

**Steps:**
1. Student enters email address
2. OTP sent to email (valid 10 minutes)
3. Student enters OTP to verify
4. Student selects batch year (1-5)
5. Student selects lab group (A-F)
6. Student enters name
7. Student enters roll number (format: YY/YYYY/NNN, e.g., 01/2023/242)
   - Immutable after creation
   - Allow prefix typos (fix by admin later)
8. Student uploads ID card photo (Dow student ID or university document)
9. Student creates password (email + password auth)
10. Student consent to privacy policy
11. Submission for manual admin approval

**Status: PENDING APPROVAL**
- Email sent: "Your DowOS account is pending approval"
- Student cannot access app until approved
- Admins review ID card photo

**Admin Approval Flow (You/Ammaar):**
- Go to Admin Dashboard
- View pending users
- Verify ID card authenticity
- Click "Approve" or "Reject"
- If approved: User gets email, can login
- If rejected: User gets email with reason, can reapply

**Estimated approval time:** Same day if submitted before 5 PM, next morning otherwise

#### 2.1.2 First Login Flow
**Trigger:** Approved user clicks "Sign In"

**Steps:**
1. Enter email + password
2. Multi-factor auth (optional, toggle in settings)
3. Redirect to home dashboard
4. **Onboarding Survey** (first login only):
   - "What's your learning style?" (Visual / Auditory / Kinesthetic)
   - "Preferred explanation depth?" (Beginner / Intermediate / Advanced)
   - "Notifications settings" (toggle on/off)
   - "Preferred notification quiet hours?" (e.g., 10 PM - 8 AM)
   - "Subscribe to viva notifications?" (yes/no)
5. Close survey → Redirect to home dashboard

#### 2.1.3 User Profile Management
**Trigger:** User clicks profile icon

**Screen: Edit Profile**
- Name (editable)
- Email (read-only)
- Roll number (read-only, shows "YY/YYYY/NNN")
- Batch year (read-only)
- Lab group (editable)
- ID card photo (view current, can update)
- Learning preferences (edit anytime)
- Notification settings (edit anytime)
- Delete account (with 7-day confirmation)
- Logout

**Data Stored:**
```
users table:
- id (UUID)
- email (unique)
- password_hash
- name
- roll_number (immutable)
- batch_year (1-5)
- lab_group (A-F)
- learning_style (visual/auditory/kinesthetic)
- explanation_depth (beginner/intermediate/advanced)
- id_card_photo_url
- approved_at (timestamp)
- created_at
- updated_at
- deleted_at (soft delete)
```

---

### **2.2 TIMETABLE & ANNOUNCEMENTS**

#### 2.2.1 Timetable Display

**Main View:**
- **Week view** (default, shows Mon-Fri)
- **Horizontal scroll** for multiple weeks
- Shows all classes for user's batch + year (shared timetable)
- Color-coded by module
- Show class name, time, location (e.g., "Math Lecture, 10 AM - 11 AM, Lecture Hall A")

**Click on class:**
- Shows: Class name, module, time, location, faculty name
- Button: "Mark Attendance" (manual check-in)
- Button: "Navigate to location" (Google Maps)
- Show class-specific announcements (if any)

**Data Structure:**
```
timetables table:
- id
- batch_year (1-5)
- lab_group (A-F)
- module_id (foreign key)
- class_name
- day_of_week (0-4 = Mon-Fri)
- start_time (HH:MM)
- end_time (HH:MM)
- location
- faculty_name
- created_at
- updated_at

Example:
- Batch 1, Lab A
- Module: Cardiovascular
- Class: "Anatomy of Heart"
- Monday 10:00 - 11:00
- Location: A-201
- Faculty: Dr. Ahmed
```

#### 2.2.2 Timetable Management (Admin/CR Panel)

**Admin Panel Access:**
- You + Ammaar (full access)
- Class Reps (batch-specific edit access)

**Admin Timetable Editor:**
1. Select batch year + lab group
2. Import CSV or Google Sheet with timetable
3. Preview import
4. Manual edit interface:
   - Add class: Module + Class name + Day + Time + Location
   - Edit class: Change any field
   - Delete class: Soft delete (hide but keep history)
5. Save changes → Auto-broadcast to students (Real-time update)
6. Export CSV for backup

**Weekly Update Process:**
1. Admin receives updated PDF from faculty/admin office
2. Admin manually digitizes PDF into spreadsheet
3. Admin imports via CSV upload
4. Auto-notifies CRs of changes
5. Announcement auto-posted: "Timetable updated for [Batch]"

**Class Rep Access:**
- Can only edit timetables for their batch
- Can add/edit/delete classes
- Cannot import bulk (manual only)

#### 2.2.3 Announcements

**Student View:**
- Announcements feed (sorted by recency + priority)
- Filter by: Batch-specific / University-wide / All
- Pin important announcements (stays at top)
- Search announcements

**Announcement Types:**
1. **Admin Announcements** (You/Ammaar only)
   - Important updates (app maintenance, policy changes)
   - Reach: All batches OR specific batch
   - Scheduled or immediate posting

2. **Class Rep Announcements** (CRs only)
   - Batch-specific updates (missed class makeup, assignment due dates)
   - Reach: Specific batch only
   - Moderated by admins (optional, can be set to auto-approve)

3. **Club Announcements** (Club admins)
   - Event updates, recruitment
   - Reach: All students
   - Moderated by admin team (you review before posting)

**Data Structure:**
```
announcements table:
- id
- title
- content
- author_id (user_id, admin/CR)
- author_type (admin/cr/club)
- batch_restriction (null = all batches, 1-5 = specific batch)
- is_pinned
- priority (1-5, default 3)
- scheduled_at (null = post immediately)
- expires_at (optional, auto-hide after date)
- created_at
- updated_at
```

**Real-Time Updates:**
- When admin posts announcement → Realtime update to all students
- Push notification triggered (see Notifications section)

---

### **2.3 ATTENDANCE TRACKING**

#### 2.3.1 Student Attendance Check-In

**Trigger:** Student opens app or views timetable

**Check-In Methods:**
1. **Manual Check-In**
   - Student clicks "Mark Attendance" button on class
   - Confirmation: "Checked in for [Class Name], [Time]"
   - Animation: "Checking in..." → "✓ Checked in" (2 second animation)
   - Haptic feedback (phone vibrates)
   - Sound effect (optional)

2. **QR Code Check-In** (Phase 2, not MVP)
   - Will be added in week 5

**Check-In Window:**
- Any time (before, during, or after class)
- Preferred: During class time (flagged if marked after class ends)
- No time window restriction (student can mark anytime)

**Status Tracking:**
- **Pending:** Just clicked, waiting for sync
- **Checked In:** Successfully synced
- **Failed:** Network error, show retry button

**Data Structure:**
```
attendance table:
- id
- user_id
- timetable_id
- check_in_time (timestamp when marked)
- method (manual / qr_code)
- marked_at (when student marked, might be late)
- status (pending / confirmed / failed)
- is_flagged (if marked after class end time)
- created_at
```

#### 2.3.2 Student Attendance Dashboard

**Main View: Attendance Tracker**
- Shows per-module attendance breakdown
- Module name | Classes attended / Total classes | % Attendance | Status
- Status: "Safe" (>75%) / "Warning" (70-75%) / "Critical" (<70%)

**Attendance Runway Calculator:**
- Shows: "You can safely skip X more classes this module and stay at 75%"
- Dynamic calculation based on:
  - Total classes in module: N
  - Classes attended so far: A
  - Current attendance: A/N
  - Classes needed to maintain 75%: C = 0.75 × (N + future_classes)
  - Safe skip: C - A

**Example:**
- Module: Cardiology
- Total classes so far: 20
- Attended: 15 (75%)
- Safe skip: 0 (already at threshold)
- If attend next class: 21 total, need 15.75 ≈ 16 → Safe skip = 5

**View History:**
- Click on module → See attendance history (list of classes with check-in status)
- Filter by week/month

**Data Structure:**
```
attendance_stats (cached daily):
- id
- user_id
- module_id
- total_classes
- attended_classes
- percentage
- safe_skip_count
- is_safe (boolean)
- last_calculated_at
```

---

### **2.4 AI TUTOR (Main Chatbot with Voice)**

#### 2.4.1 Chat Interface

**Home Screen:**
- Chat history (recent conversations)
- New chat button
- Voice recording button (always visible)

**Chat Screen:**
- Message history (scrollable)
- Input field (text + voice button)
- Clear chat button
- Settings button (voice on/off, speed, tutor mode toggle)

#### 2.4.2 Tutor Mode Toggle

**Default Chat Mode:**
- Free-form conversation
- Student asks any question
- AI answers with full explanation
- Voice: Optional

**Tutor Mode:**
- More structured interaction
- AI provides guided learning:
  1. Explains concept
  2. Asks follow-up questions
  3. Checks understanding
  4. Provides related subtopics
- Tone: More educational, less conversational
- System prompt change: "Act as a structured medical tutor..."

**Switch Between Modes:**
- Toggle button at top of chat
- Mode choice persistent in user preferences
- Both modes have full memory + voice access

#### 2.4.3 Voice Input/Output Pipeline

**Voice Input Flow:**
1. Student clicks microphone button
2. Browser requests microphone permission (first time only)
3. Record audio (show waveform)
4. Student clicks "Send" or auto-detects silence (5s)
5. Audio → Speech-to-Text (Web Speech API or Google Cloud Speech)
6. Transcript displayed to student (can edit before sending)
7. **Router LLM** decides: Simple Q bot or Complex Q bot?
   - Keyword matching: "Calculate", "derive", "complex" → Complex
   - Word count: >50 words → Complex
   - User feedback: "This was hard" → Next similar Q goes Complex
   - Fallback: User preference (learning_style = advanced → Complex)
8. Route to appropriate Gemini prompt (simple or complex)
9. Gemini responds with text
10. Text-to-Speech (Google Cloud TTS or Web Speech API)
11. Audio played to student
12. Student can read transcript or listen

**Voice Output Quality:**
- Natural-sounding voice (male/female toggle in settings)
- Speed adjustable (0.8x - 1.5x)
- Accent: English (UK/US) selector

**Cost Tracking:**
- Speech-to-Text: $0.004 per 15 seconds
- Text-to-Speech: $16 per 1M characters (~$0.00016 per message)
- For 500 users: ~$50/month STT + $5/month TTS

#### 2.4.4 AI Memory Architecture

**Short-Term Memory (Current Session):**
- Cached in TanStack Query
- Last 10 messages in context
- Cleared on logout or 12-hour idle

**Long-Term Memory (Persistent):**
- All messages stored in PostgreSQL
- Embedded as vectors in pgvector
- User preferences stored in user_preferences table
- Related past struggles retrieved on each message

**Implementation:**
```
conversations table:
- id
- user_id
- message (user input)
- ai_response (AI output)
- router_decision (simple / complex)
- embeddings (pgvector type)
- created_at

user_preferences table:
- id
- user_id
- learning_style (visual/auditory/kinesthetic)
- explanation_depth (beginner/intermediate/advanced)
- weak_topics (array of topic IDs)
- strong_topics (array of topic IDs)
- updated_at
```

**Retrieval Flow:**
1. User sends message
2. Embed message as vector
3. Query pgvector: Find 3-5 most similar past messages
4. Include in system prompt: "User previously struggled with X"
5. Call Gemini with enhanced context

#### 2.4.5 Rate Limiting (Free Users)

**Soft Limit: 20 messages/day**
- After 20 messages, responses get slower (artificial delay 3-5s)
- Show warning: "Free users get 20 fast responses/day. Consider upgrading."
- User can keep chatting but with slowness

**Hard Limit: 50 messages/day**
- After 50 messages, block further chat
- Show modal: "Daily limit reached. Subscribe to Pro for unlimited."
- Button: "Subscribe Now" or "Try again tomorrow"

**Pro Users:**
- Unlimited messages
- Faster response (no artificial delay)

#### 2.4.6 Data Structure

```
ai_tutor_sessions table:
- id
- user_id
- session_id
- mode (chat / tutor)
- started_at
- ended_at
- message_count
- total_tokens_used
- cost_estimate
- created_at
```

---

### **2.5 MCQ SOLVER**

#### 2.5.1 MCQ Library

**Organization:**
- Module → Subject → Subtopic
- Each MCQ tagged with: module, subject, subtopic, year (of past paper), difficulty

**Example Structure:**
- Module: Cardiology
  - Subject: Physiology
    - Subtopic: Coronary circulation
      - MCQ 1-1: "Blood flow in LAD..." (Year 2023)
      - MCQ 1-2: "Coronary steal..." (Year 2022)

**Total MCQs for MVP:**
- All 1st year: ~400 MCQs
- All 2nd year: ~400 MCQs
- Total: ~800 MCQs with full explanations

#### 2.5.2 Student MCQ Interface

**Home Screen:**
- Browse by: Module / Subject / Difficulty
- Search MCQ by keyword
- "Start Practice" button
- "Review History" button

**Practice Mode:**
1. Select topic
2. Start MCQ quiz (10 questions default, customizable)
3. For each Q:
   - Show question + 4-5 options
   - Student selects answer
   - Immediate feedback: ✓ Correct / ✗ Incorrect
   - Show correct answer
   - Show AI explanation (why correct, why others wrong)
   - Citation to slides/books if applicable
   - "Next Question" button

4. After all Qs:
   - Show score (X/10 = 80%)
   - Performance breakdown by subtopic
   - Weak topics highlighted
   - Suggestion to review weak topics

**Review Mode:**
- View past attempts
- Filter by: Date / Topic / Performance
- Retake quiz with different Q order

#### 2.5.3 Free Access (Forever)

**Rate Limiting:**
- No limit (truly unlimited)
- However, if user hits soft AI tutor limit, MCQ explanation generation slows down
- But MCQ questions always accessible instantly

**Data Structure:**
```
mcqs table:
- id
- module_id
- subject_id
- subtopic_id
- question_text
- options (JSON: [{text: "A) ...", is_correct: false}, ...])
- correct_answer_index
- explanation (AI-generated)
- explanation_brief (high-yield version)
- source_citations (array: [{source: "Harrison's", page: 42}, ...])
- year_from_past_paper
- difficulty (easy/medium/hard)
- created_at

mcq_attempts table:
- id
- user_id
- mcq_id
- answer_given
- is_correct
- time_spent (seconds)
- attempted_at
```

---

### **2.6 VIVA BOT (Pro-Only, Voice)**

#### 2.6.1 Viva Session Setup

**Trigger:** Student (Pro tier) clicks "Start Viva"

**Screen 1: Select Viva Sheet**
- Shows pre-populated viva sheets by module/subject
- Example: "Cardiology - Physiology (10 questions)"
- Student selects sheet

**Screen 2: Select Difficulty Mode**
- "Supportive" (encouraging, explains if wrong)
- "Standard" (neutral, gives feedback)
- "Strict" (challenging, like real HOD viva)
- Student selects mode

**Screen 3: Start Session**
- Show: "About to start [Sheet Name] in [Mode]"
- Show: "Duration: ~15 minutes, 10 questions"
- Button: "Start Viva"

#### 2.6.2 Viva Interaction Flow

**For each question:**
1. Viva Bot speaks question (via Text-to-Speech)
2. Transcript shown on screen
3. Student answers (voice input)
4. Audio transcribed (Speech-to-Text)
5. Transcript shown, student can edit
6. Send button
7. Bot evaluates answer:
   - Correctness (0-100%)
   - Confidence expressed (0-100%)
   - Articulation quality (0-100%)
8. Adaptive scoring: Points given (0-5 per question, max 50 total)
9. Bot speaks feedback on answer
10. Move to next question

#### 2.6.3 Adaptive Scoring

**Base Score (per question):**
- Correctness: 0-3 points (0% = 0 pts, 50% = 1.5 pts, 100% = 3 pts)
- Confidence: 0-1.5 points (stuttering/hesitation = low, smooth = high)
- Articulation: 0-0.5 points (clear = 0.5, mumbled = 0)

**Total per question: 0-5 points**
**Total for 10 questions: 0-50 points**

**Adaptive Difficulty:**
- If student scores <2/5 on Q1, make Q2-3 easier (foundational)
- If student scores 5/5, make next Q harder (more complex)
- Adjust throughout session

#### 2.6.4 Viva Session Report

**After all questions:**
1. Show final score (X/50)
2. Performance breakdown:
   - Q1: 5/5 (Excellent)
   - Q2: 3/5 (Good)
   - Q3: 1/5 (Needs improvement)
   - ... (all 10 questions)
3. Strengths summary: "Strong in coronary physiology"
4. Weaknesses summary: "Needs work on ECG interpretation"
5. Recommendations: "Study [Subtopic 1], [Subtopic 2]"
6. Button: "Save Report" / "Retake Viva" / "Start New Viva"

**Report Storage:**
```
viva_sessions table:
- id
- user_id
- viva_sheet_id
- mode (supportive/standard/strict)
- started_at
- ended_at
- total_score (0-50)
- question_scores (JSON array of scores)
- strengths (array of subtopic IDs)
- weaknesses (array of subtopic IDs)
- recommendations (text)
- voice_quality_score (0-100%)
- created_at
```

#### 2.6.5 Rate Limiting (Pro Users)

**Hard Limit: 180 minutes/month**
- Can spread across multiple sessions
- Each viva session: ~15-20 minutes
- Allows ~9-12 viivas/month per user
- When limit reached: Show "Monthly limit reached. Resets on [Date]."

**Tracking:**
```
viva_usage_tracking table:
- id
- user_id
- month
- total_minutes_used
- sessions_count
- reset_date (next month)
```

---

### **2.7 POINT ROUTES & NAVIGATION**

#### 2.7.1 Point Routes Map

**Home Screen:**
- Google Maps showing Dow area
- All Point routes displayed as polylines (different colors per route)
- Point stops marked with numbered pins (1, 2, 3, etc.)
- Filter button: Show/hide specific routes

**Route Selection:**
1. Student selects "Where are you going?"
2. Auto-detect current location (approx, for performance)
3. Show nearby Point stops
4. Student selects destination stop
5. Calculate best Point route (might be multiple transfers)
6. Show:
   - Recommended route (which Point to take)
   - Next stop location on map
   - Estimated arrival time
   - "Directions" button (opens Google Maps)

#### 2.7.2 Point Route Data

**Stored as:**
```
point_routes table:
- id
- route_number (1, 2, 3, etc.)
- name ("Route 1 - City Center")
- color (hex for map visualization)
- stops (array of coordinates)
- stops_list (array of: {name, lat, lng, arrival_time_estimate})
- created_at

point_stops table:
- id
- route_id
- stop_number
- name (e.g., "Dow Medical Gate")
- latitude
- longitude
- estimated_wait_time (avg minutes)
```

#### 2.7.3 Real-Time Driver Tracking (Phase 1 MVP: Static Routes)

**MVP Scope:**
- Static routes (no real-time tracking)
- Just show route polylines and stops
- Estimated times based on average schedule

**Phase 2 (Week 5+):**
- Real-time driver GPS tracking
- Show "Driver is X minutes away"
- Track driver location every 10 seconds (6-8:30 AM, 3:15-6 PM only)
- Show number of riders on each route

#### 2.7.4 Navigation to Class Location

**Quick Action on Timetable:**
- When viewing class, click "Navigate to [Location]"
- Opens Google Maps with class location pinned
- Shows: Walking route, estimated time

---

### **2.8 PROGRESS MATRIX**

#### 2.8.1 Student Progress View

**Home Screen:**
- Show overall mastery: "Cardiology Module - 60% mastery"
- List all modules + progress bars

**Click on module:**
- Show subjects breakdown:
  - Anatomy: 55% mastery
  - Physiology: 70% mastery
  - Pathology: 45% mastery

**Click on subject:**
- Show subtopics breakdown:
  - Coronary circulation: 80%
  - Coronary artery disease: 60%
  - Conduction system: 40%

#### 2.8.2 Mastery Calculation

**Based on:**
- MCQ accuracy on subtopic (50% weight)
- Viva Bot performance on subtopic (30% weight)
- Spaced repetition performance (20% weight)

**Formula:**
```
Mastery% = (MCQ_Score * 0.5) + (Viva_Score * 0.3) + (SpacedRep_Score * 0.2)

Example:
- MCQ score: 80% (user answered 4/5 MCQs correctly on topic X)
- Viva score: 60% (user got 3/5 on topic X in viva)
- Spaced rep: 90% (user reviewed topic X 3 times, got 90% avg)
- Mastery% = (80 * 0.5) + (60 * 0.3) + (90 * 0.2) = 40 + 18 + 18 = 76%
```

#### 2.8.3 Color Coding

- Green: >80% (Mastered)
- Yellow: 60-80% (Good progress)
- Orange: 40-60% (Needs work)
- Red: <40% (Critical gaps)

**Data Structure:**
```
user_progress table:
- id
- user_id
- module_id / subject_id / subtopic_id
- mcq_accuracy (0-100)
- mcq_attempts
- viva_score (0-50, convert to %)
- viva_attempts
- spaced_rep_score (0-100)
- spaced_rep_reviews
- overall_mastery (calculated)
- last_updated_at
```

---

### **2.9 LOST & FOUND (Marketplace)**

#### 2.9.1 Student Interface

**Main Screen:**
- Browse lost items
- Filter by: Recent / Category / Batch
- Search by item name
- "Post Lost Item" button
- "Post Found Item" button

**Post Lost Item:**
1. Item name
2. Category (book, device, keys, lab coat, etc.)
3. Description
4. Photo (optional)
5. Where lost (Dow campus / Classroom / Library, etc.)
6. When (date)
7. Post → Auto-moderates for spam → Listed

**Post Found Item:**
1. Item name
2. Category
3. Description
4. Photo
5. Where found
6. When
7. Post → Sent to admin for approval → Listed after approval

**Browsing:**
- Click item → See details + photos
- Show: "Posted by Salik on Feb 10"
- Button: "Contact Poster" (sends message in-app)

**Communication:**
- In-app messaging system
- Poster + finder message back and forth
- Meet up and exchange
- Mark as "Resolved" when found/returned

#### 2.9.2 Data Structure

```
marketplace_items table:
- id
- user_id (poster)
- type (lost / found)
- item_name
- category
- description
- photos (array of URLs)
- location
- posted_date
- date_of_incident
- status (active / resolved / expired)
- is_moderated (true = posted, false = pending review)
- created_at

marketplace_messages table:
- id
- item_id
- sender_id
- recipient_id
- message
- read_at
- created_at
```

---

### **2.10 SPIRITUAL HUB (Prayer Times)**

#### 2.10.1 Prayer Times Display

**Main Screen:**
- Show today's prayer times:
  - Fajr: 5:30 AM
  - Dhuhr: 12:45 PM
  - Asr: 4:15 PM
  - Maghrib: 6:45 PM
  - Isha: 8:00 PM
- Two masjids shown:
  - Dow Medical Masjid
  - Civil Hospital Masjid

**Toggle between masjids:**
- Different prayer times for each location

#### 2.10.2 Jamaat Notifications

**Settings:**
- Toggle: "Notify me of Jamaat"
- If enabled, send notification 5 minutes before Jamaat time
- Student can choose which Jamaat to receive notifications for

#### 2.10.3 Daily Verse & Reflection

**Each day:**
- Show Quranic verse of the day
- Short reflection/translation
- Option to share

#### 2.10.4 Maintenance

**Updated by:**
- Your 2-3 friends (volunteers)
- Weekly update on prayer times (if timing changes seasonally)

**Data Structure:**
```
prayer_timings table:
- id
- date
- fajr
- dhuhr
- asr
- maghrib
- isha
- jamaat_times (JSON)
- masjid_id
- updated_by (user_id)
- created_at

daily_verses table:
- id
- date
- verse_text
- verse_reference (e.g., "Surah Al-Fatiha:1")
- reflection
- translation
```

---

### **2.11 ANNOUNCEMENTS & NOTIFICATIONS**

#### 2.11.1 Push Notifications

**Types:**
1. **Timetable Alerts**
   - "Math lecture starts in 5 minutes"
   - Triggered 5 minutes before class
   - Automatic (no manual action)

2. **Announcement Push**
   - "New announcement from Admin: Important policy update"
   - Triggered when admin posts
   - Real-time

3. **Attendance Reminder**
   - "Don't forget: Attendance for Cardiology ends today"
   - Sent daily at 8 PM if student hasn't checked in for that day's classes
   - Optional (toggle in settings)

4. **Prayer Jamaat**
   - "Jamaat in 5 minutes at Dow Masjid"
   - Triggered 5 minutes before Jamaat
   - Optional (toggle in settings)

#### 2.11.2 Notification Preferences

**Student Settings:**
- Toggle: All notifications on/off
- Quiet hours: (e.g., 10 PM - 8 AM, no notifications)
- Per-type settings: Toggle each notification type
- Sound: On/off
- Vibration: On/off

**Implementation:**
```
user_notification_preferences table:
- id
- user_id
- all_notifications_enabled
- quiet_hours_start (time)
- quiet_hours_end (time)
- timetable_alerts (boolean)
- announcement_push (boolean)
- attendance_reminders (boolean)
- prayer_jamaat (boolean)
- sound_enabled
- vibration_enabled
```

---

## **3. USER FLOWS & INTERACTIONS**

### **3.1 First-Time User Journey (Week 1)**

```
Day 0 (Sign Up):
1. Student visits DowOS site
2. Click "Sign Up"
3. Enter email → Receive OTP
4. Verify OTP → Enter batch, lab group, name, roll number
5. Upload ID card photo
6. Create password
7. Submit for approval

Day 1 (Approval):
1. Admin reviews ID card
2. Click "Approve"
3. Student gets email: "Your account is approved!"
4. Student signs in

Day 1 (First Login):
1. Email + password login
2. Onboarding survey (learning style, preferences)
3. Home screen shows timetable for this week
4. Show: 3 announcements, upcoming classes
5. Try AI tutor (free demo: 5 messages)

Days 2-4:
1. Check timetable daily
2. Mark attendance for classes
3. View attendance tracker (% per module)
4. Try AI tutor (limited to 20 msg/day)
5. Browse MCQ solver
6. Browse viva sheets (locked as non-Pro)
```

### **3.2 Daily User Journey**

```
Morning (6 AM - 8:30 AM):
1. Open DowOS
2. See today's timetable
3. Get notification: "Math class starts in 5 min"
4. Mark attendance for morning class
5. Check announcements (any new posts?)
6. Ask AI tutor a quick question

During Class:
1. Open Point routes map
2. Check where next class is
3. Navigate using Google Maps

After Class:
1. Mark attendance for completed class
2. View attendance %: "Still at 75%, can skip 2 classes"
3. Solve 5 MCQs on topic covered today
4. Ask AI tutor about unclear concept

Evening (3:15 PM - 6 PM):
1. Check timetable for tomorrow
2. See announcements
3. Solve 10 MCQs (practice mode)
4. If Pro: Start viva session (15-20 min)
5. View progress matrix

Night (8 PM - 10 PM):
1. Reminder notification: "Mark attendance if missed any classes"
2. Chat with AI tutor about complex topic (uses voice)
3. Review MCQ history
```

---

## **4. DATA MODELS & RELATIONSHIPS**

### **4.1 Entity Relationship Diagram (Simplified)**

```
users (1) ──── (N) conversations
users (1) ──── (N) attendance
users (1) ──── (N) mcq_attempts
users (1) ──── (N) viva_sessions
users (1) ──── (1) user_preferences
users (1) ──── (N) marketplace_items

batches (1) ──── (N) timetables
batches (1) ──── (N) announcements (batch-scoped)

modules (1) ──── (N) subjects
modules (1) ──── (N) timetables
modules (1) ──── (N) user_progress

subjects (1) ──── (N) subtopics
subjects (1) ──── (N) user_progress

subtopics (1) ──── (N) mcqs
subtopics (1) ──── (N) user_progress

timetables (1) ──── (N) attendance

viva_sheets (1) ──── (N) viva_sheet_questions
viva_sheets (1) ──── (N) viva_sessions

mcqs (1) ──── (N) mcq_attempts
```

### **4.2 Critical Tables for MVP**

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `users` | User accounts | id, email, roll_number, batch_year, lab_group, approved_at |
| `timetables` | Class schedules | batch_year, lab_group, module_id, class_name, day, time, location |
| `attendance` | Student check-ins | user_id, timetable_id, check_in_time, method |
| `modules` | Medical modules | name, batch_year (1st, 2nd, etc.) |
| `subjects` | Module subdivisions | module_id, name |
| `subtopics` | Detailed topics | subject_id, name, high_yield_flag |
| `mcqs` | Practice questions | subtopic_id, question, options, explanation |
| `conversations` | AI tutor history | user_id, message, ai_response, embeddings |
| `viva_sessions` | Viva attempts | user_id, viva_sheet_id, score, report |
| `announcements` | News/updates | batch_restriction, content, author_id |
| `user_preferences` | Learning settings | learning_style, explanation_depth, quiet_hours |
| `marketplace_items` | Lost & Found | type (lost/found), category, description, location |

---

## **5. API ENDPOINTS SUMMARY**

### **5.1 Authentication**
```
POST   /api/auth/signup
POST   /api/auth/verify-otp
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
```

### **5.2 Timetable**
```
GET    /api/timetable?batch=1&lab_group=A
POST   /api/admin/timetable (admin only)
PUT    /api/admin/timetable/:id (admin/CR)
DELETE /api/admin/timetable/:id (admin/CR)
```

### **5.3 Attendance**
```
POST   /api/attendance/check-in
GET    /api/attendance/history
GET    /api/attendance/runway/:moduleId
```

### **5.4 AI Tutor**
```
POST   /api/ai-tutor/chat (send message, get response)
GET    /api/ai-tutor/history
POST   /api/ai-tutor/voice-input (transcribe audio)
POST   /api/ai-tutor/voice-output (synthesize speech)
DELETE /api/ai-tutor/clear-chat
```

### **5.5 MCQ Solver**
```
GET    /api/mcqs?module=1&subject=2&limit=10
POST   /api/mcqs/attempt
GET    /api/mcqs/history
POST   /api/mcqs/flag-explanation (crowdsourced corrections)
```

### **5.6 Viva Bot**
```
GET    /api/viva/sheets?module=1
POST   /api/viva/start-session
POST   /api/viva/submit-answer
GET    /api/viva/session/:id
GET    /api/viva/usage (track 180-min limit)
```

### **5.7 Point Routes**
```
GET    /api/maps/point-routes
GET    /api/maps/stops
POST   /api/maps/calculate-route (A to B)
```

### **5.8 Progress**
```
GET    /api/progress/modules
GET    /api/progress/subjects/:moduleId
GET    /api/progress/subtopics/:subjectId
```

### **5.9 Announcements**
```
GET    /api/announcements?batch=1
POST   /api/announcements (admin/CR)
PUT    /api/announcements/:id (admin/CR)
DELETE /api/announcements/:id (admin)
```

### **5.10 Marketplace**
```
POST   /api/marketplace/post-item
GET    /api/marketplace/items
POST   /api/marketplace/message
GET    /api/marketplace/messages/:itemId
PATCH  /api/marketplace/items/:id/resolve
```

### **5.11 User Preferences**
```
GET    /api/user/preferences
PUT    /api/user/preferences
GET    /api/user/profile
PUT    /api/user/profile
```

---

## **6. VOICE INTEGRATION DETAILS**

### **6.1 Speech-to-Text (Transcription)**

**Provider Options for MVP:**
1. **Web Speech API (Free)**
   - Pros: No API calls, instant, works offline
   - Cons: Lower accuracy, no medical term training
   - Latency: <100ms
   - Quality: 60-70%

2. **Google Cloud Speech-to-Text** (Recommended)
   - Cost: $0.004 per 15 seconds ($0.016 per minute)
   - Pros: High accuracy, medical domain model available
   - Cons: Network dependent, costs add up
   - Latency: 1-2 seconds
   - Quality: 95%+

**For MVP:**
- Use Web Speech API for quick prototyping
- Fallback to Google Cloud Speech-to-Text for better accuracy
- Total cost estimate: $50-80/month for 500 users

### **6.2 Text-to-Speech (Voice Synthesis)**

**Provider Options:**
1. **Web Speech API (Free)**
   - Pros: No cost, works offline
   - Cons: Limited voices, robotic quality
   - Quality: 40-50%

2. **Google Cloud Text-to-Speech** (Recommended)
   - Cost: $16 per 1M characters (~$5-10/month for 500 users)
   - Pros: Natural voice, multiple languages, adjustable speed
   - Cons: Requires API call, network dependent
   - Quality: 85-90%

3. **ElevenLabs (Premium)**
   - Cost: $20/month for API access
   - Pros: Most human-like voices
   - Cons: Overkill for MVP, higher cost
   - Quality: 95%+

**For MVP:**
- Use Google Cloud Text-to-Speech (best value)
- Male/Female voice toggle
- Speed adjustment (0.8x - 1.5x)

### **6.3 Voice Recording UI/UX**

**Recording State:**
1. **Idle:** Microphone icon (tappable)
2. **Recording:** Red circle + waveform animation
3. **Processing:** Spinner + "Transcribing..."
4. **Transcript:** Show text, allow edit
5. **Sending:** Spinner + "Sending..."
6. **Response:** Show AI response text, play audio

**Error Handling:**
- No microphone permission: "Please allow microphone access"
- Network error: "Couldn't transcribe. Try again?"
- Audio quality low: "Couldn't hear clearly. Try again?"

---

## **7. AI MEMORY ARCHITECTURE**

### **7.1 Vector Embedding & RAG**

**Embedding Process:**
```
User message → Gemini Embeddings API → Vector (1536 dimensions)
↓
Store in pgvector column
↓
Future queries: Semantic search for similar past interactions
```

**Example:**
- User: "I'm struggling with CAD pathophysiology"
- Embed this message
- Query pgvector: "Find similar past struggles"
- Result: "User asked about atherosclerosis 2 weeks ago" + response
- Include in context for Gemini

**Cost:** ~$0.02 per 1,000 embeddings (negligible)

### **7.2 Context Window Management**

**Maximum context window:** 32K tokens (Gemini Flash)

**Allocation:**
- System prompt: 2K tokens
- User preferences + long-term memory: 5K tokens
- Current conversation: 10K tokens
- Knowledge base (books/slides): 10K tokens
- User message: <1K token
- Reserve: 3K tokens for response

**Strategy:**
- Keep only last 10 messages in short-term
- Retrieve top 3 similar past interactions
- Summarize if memory exceeds 5K tokens

### **7.3 Memory Update Frequency**

- After each user message: Update conversation table
- After each session: Generate session summary
- Weekly: Update user_preferences based on weak topic frequency
- No immediate embedding (batch daily at 2 AM for performance)

---

## **8. REAL-TIME ARCHITECTURE**

### **8.1 Supabase Realtime (WebSocket)**

**Used for:**
- Announcements (broadcast to all students)
- Viva sessions (one-way, student receives updates)
- Live chat (if needed)

**Connection management:**
- Establish on app load
- Reconnect on disconnect (exponential backoff)
- Cleanup on logout

### **8.2 Polling Strategy**

**Timetable Updates** (every 5 minutes):
- Check if timetable has changed
- If changed, show notification: "Timetable updated"

**Attendance Sync** (after each check-in):
- Immediate sync attempt
- Fallback: Retry every 30 seconds if failed
- Show "pending" status to user until synced

**Point Routes** (every 10 seconds during peak hours):
- Check driver location (Phase 2)
- Update map in real-time

---

## **9. PERFORMANCE & SCALING CONSTRAINTS**

### **9.1 Target Performance Metrics**

| Metric | Target | Notes |
|--------|--------|-------|
| Page Load | <2s | On 4G |
| Chat Response | <3s | Gemini API latency |
| Voice Transcription | <2s | Google Cloud STT |
| API Response | <500ms | Database query + serialization |
| Database Query | <100ms | With proper indexing |
| Realtime Update | <500ms | WebSocket delivery |

### **9.2 Database Indexing**

**Critical indexes:**
```
users: (batch_year, lab_group)
timetables: (batch_year, lab_group, day_of_week)
attendance: (user_id, timetable_id, created_at)
conversations: (user_id, created_at DESC)
mcq_attempts: (user_id, mcq_id, created_at)
user_progress: (user_id, module_id, created_at DESC)
announcements: (batch_restriction, created_at DESC)
```

### **9.3 Caching Strategy**

**TanStack Query (Client-side):**
- Cache timetable for 5 minutes
- Cache announcements for 1 minute
- Cache user progress for 1 hour
- Cache MCQ library for 24 hours

**Supabase Cache:**
- Enable query result caching
- Set TTL based on data freshness requirements

### **9.4 Load Estimation (500 Users)**

**Peak Hour (8-9 AM):**
- 300 simultaneous users
- ~100 timetable queries/minute
- ~50 attendance check-ins/minute
- ~20 AI tutor messages/minute
- Total: ~170 API requests/minute

**Off-Peak:**
- 50 simultaneous users
- ~10 API requests/minute

**Supabase Free Tier Limits:**
- 50,000 API calls/month: ✅ Safe (500 users × 30 days × 100 calls/day avg = ~1.5M calls)
- Database size: ~5GB: ✅ Safe (estimated <500MB for MVP)
- Realtime connections: 200: ✅ Need to upgrade to Pro ($25/month) for 500+ users

**Cost Scaling (500 users):**
- Supabase Pro: $25/month
- Gemini API: $40-50/month
- Google Cloud Speech: $50-80/month
- Google Cloud Text-to-Speech: $5-10/month
- Google Maps API: $15-20/month
- Vercel: $0-20/month (depends on usage)
- Firebase Cloud Messaging: $0/month
- **Total: ~$135-195/month** ✅ Sustainable

---

## **10. SUCCESS METRICS (MVP)**

### **10.1 Week-by-Week KPIs**

| Week | Metric | Target | Notes |
|------|--------|--------|-------|
| Week 1 | Signups | 100 | Beta launch to your batch |
| Week 1 | Approvals | 80% | ID verification bottleneck? |
| Week 2 | DAU | 150 | Word-of-mouth from first 100 |
| Week 2 | Attendance Checkins | 200+ | Test attendance tracking |
| Week 3 | DAU | 300 | Growing adoption |
| Week 3 | AI Tutor Messages | 500+ | Test voice, memory, router |
| Week 4 | DAU | 500 | Public launch target |
| Week 4 | MCQ Attempts | 1000+ | Solver adoption |
| Week 4 | Viva Sessions (Pro) | 50+ | Measure viva value |

### **10.2 Quality Metrics**

- **AI Tutor Satisfaction:** Survey (target: 4/5 stars)
- **Voice Accuracy:** % correct transcriptions (target: >90%)
- **App Stability:** Crash-free rate (target: 99.5%)
- **Response Time:** P95 latency (target: <3s)

---

## **END OF FEATURE SPECIFICATIONS**

### Next Documents:
1. **Technical Specification** (Architecture, Stack, Deployment)
2. **Database Schema Guide** (SQL structure)
3. **API Specification** (Detailed endpoints)
4. **Content Roadmap** (Week-by-week)
5. **Launch Checklist** (Daily tasks)
6. **Risk Register** (Mitigations)

