# Final Questions for DowOS PRD - Awaiting Answers

## Questions Organized by Priority

### CRITICAL (Block PRD completion)

**Q1: Voice Recognition Cost Approach**
- Web Speech API (free) for MVP?
- Or Google Cloud Speech-to-Text ($50-80/month)?
- Recommendation: Hybrid (Web Speech fallback to Google)

**Q2: Text-to-Speech Quality**
- Google Cloud TTS ($5-10/month)?
- Or ElevenLabs ($20/month) for premium quality?
- Recommendation: Google Cloud TTS for MVP

**Q3: Tutor Mode Implementation**
- System prompt change (same interface, different behavior)?
- Or separate chat interface?
- Both have full memory + voice access?

**Q4: Router LLM for Simple vs Complex Questions**
- Rule-based (keywords + word count)?
- Or LLM-based (Gemini decides)?
- Should router remember user learning style preference?
- Response time constraint: <200ms?

**Q5: Viva Sheet Creation**
- Who creates first 2-3 sheets per module? (You manually?)
- Format stored: As text + JSON with answers?
- Can students add their own sheets? (Phase 2?)
- Shareable between students?

### IMPORTANT (Needed for feature details)

**Q6: Book Upload & Auto-Embedding**
- Sync embedding (slow, 2-5 min per book)?
- Or async (queue, instant upload)?
- Include document parsing (extract text from PDF)?
- Supabase Storage → PDF text extraction → pgvector embedding?

**Q7: Attendance Runway Formula**
- Is this formula correct?
```
safe_skip_count = (required_attendance / total_classes) - attended_classes
```
Example: At 75% of 20 classes (15 attended), safe skip = 0?

**Q8: Driver Tracking Privacy**
- Show actual GPS + driver name?
- Or anonymize ("5 riders on Route 1")?
- Delete location data daily or keep for analytics?

**Q9: MCQ Solver Free Forever**
- Truly unlimited? (No daily cap)?
- Understand business model: Free MCQs beat MedifyHelp?

**Q10: Soft Limit UX for Free AI Tutor**
- After 20 messages: Slow response (character-by-character delay)?
- Or full message after delay (5 seconds)?
- Or shorter response generated?

### INFORMATIONAL (For completeness)

**Q11: Admin Dashboard Scope**
- Approve/reject ID verifications?
- Manage timetables?
- Upload books/slides?
- View analytics?
- All of above?

**Q12: Batch & Lab Group Logic**
- All batches same timetable? Or batch-specific?
- Lab groups have separate practical schedules?
- Viva sheets batch-wide or group-specific?

**Q13: Onboarding Data Collection**
- Collect learning style at signup?
- Collect preferred notification times?
- Any other fields?

**Q14: Progress Matrix Mastery**
- Based on: MCQ accuracy + Viva scores + Both weighted?
- Adaptive weighting based on student preference?

**Q15: Beta Testing**
- Duration: 1 week? 2 weeks?
- Feedback method: In-app form? Calls?
- Free Pro tier for beta testers?
- Go/no-go criteria?

**Q16: Landing Page & Marketing**
- Simple landing page for MVP?
- Or full marketing site?

**Q17: Attendance Check-In Animation**
- Haptic feedback (vibrate)?
- Sound effect?
- Duration: 1-2 seconds?

**Q18: Notification Preferences**
- Quiet hours per user?
- Per-notification-type toggle?
- Batch all settings together?

**Q19: Error Handling**
- Show all errors to user?
- Or generic "Something went wrong"?
- Log errors for debugging?

**Q20: Revenue Projections**
- Include in PRD?
- Conservative estimate (200 Pro users)?
- Or aggressive (600 Pro users)?

---

## Quick Answer Template

Copy and fill:

```
Q1: [Your answer]
Q2: [Your answer]
Q3: [Your answer]
...
Q20: [Your answer]
```

---

## Already Answered / Locked

✅ Frontend: Next.js 15
✅ Backend: Supabase
✅ AI: Gemini (latest) + DeepSeek R1
✅ Voice: MVP (not Phase 2)
✅ MCQ Solver: Unlimited free forever
✅ Attendance Runway: Dynamic calculation
✅ Viva Scoring: Complex adaptive (0-50)
✅ Driver Tracking: Drivers only (not riders in vehicles)
✅ Pre-populate viva sheets: Yes
✅ Books: 25 major + auto-embed as vectors
✅ Mobile: Plan from Day 1 (responsive)
✅ No design spec now (will create after)
✅ No SQL migration scripts (just schema doc)

