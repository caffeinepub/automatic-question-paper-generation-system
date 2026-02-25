# Specification

## Summary
**Goal:** Revert the entire ExamCraft application (frontend and backend) to its Version 13 state, undoing all changes introduced in Versions 14 through 20.

**Planned changes:**
- Revert all frontend pages (Dashboard, Login, QuestionBank, AddQuestion, GeneratePaper, GeneratedPapers, PaperPreview) to their Version 13 implementation
- Revert all frontend components (Layout, StatsCard, WorkflowDiagram, PaperCard, PaperSection, QuestionCard, SubjectManager, EditQuestionModal) to their Version 13 implementation
- Revert all frontend utility files, hooks, styles, and configuration files to their Version 13 state
- Revert the backend main.mo actor, data types, CRUD operations, and role-based access control logic to their Version 13 state

**User-visible outcome:** The application behaves exactly as it did at Version 13, with no features or changes from Versions 14 through 20 present.
