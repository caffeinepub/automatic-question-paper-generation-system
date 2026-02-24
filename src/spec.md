# Specification

## Summary
**Goal:** Fix MCQ marking to 1 mark, add upload/generation success popups, and automatically display generated paper preview.

**Planned changes:**
- Update MCQ category to use 1 mark instead of current value throughout backend and frontend
- Add success popup in AddQuestion.tsx after bulk file upload completes, showing confirmation and question count
- Add success popup in GeneratePaper.tsx after paper generation completes
- Automatically redirect to and display generated paper preview after generation success
- Fix issue where generated paper preview is not showing after generation

**User-visible outcome:** Users will see MCQ questions correctly marked as 1 mark, receive clear success notifications when uploading questions or generating papers, and automatically view the generated paper preview with all 5 variants (A-E) properly displayed.
