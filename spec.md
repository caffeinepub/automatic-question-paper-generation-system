# Specification

## Summary
**Goal:** Restore the original colour theme, layout, and PDF format of the Exam Paper Generator application to its initial state, undoing any visual or formatting modifications.

**Planned changes:**
- Restore the original navy-blue academic colour palette in `frontend/src/index.css` and `frontend/tailwind.config.js`, including all CSS custom properties, gradients, and theme tokens
- Restore the original layout and styling of all pages (Dashboard, Login, QuestionBank, GeneratePaper, GeneratedPapers, PaperPreview, AddQuestion) including sidebar, navigation, cards, typography (Poppins/Inter), and spacing
- Restore all shared components (PaperCard, QuestionCard, StatsCard, Layout) to their original visual design
- Restore the original PDF/print generation format in `frontend/src/utils/pdfGenerator.ts`, including exam paper header, section labels, question numbering, MCQ option layout, marks display, and instructions

**User-visible outcome:** The application looks and functions exactly as it did originally, with the navy-blue academic theme, original page layouts, and correct PDF exam paper output restored throughout.
