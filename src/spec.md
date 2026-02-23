# Specification

## Summary
**Goal:** Build an Automatic Question Paper Generation System for teachers to manage subjects and questions, generate randomized exam papers with multiple variants, and download them as PDFs.

**Planned changes:**
- Implement Internet Identity authentication for teacher login/logout
- Create Teacher Login page with college logo, system title, and Internet Identity integration
- Build Dashboard with welcome message, navigation sidebar, statistics cards (Total Subjects, Total Questions, Papers Generated), and workflow visualization
- Implement backend data models for Subjects, Questions, and GeneratedPapers with stable storage persistence
- Create Add Questions page with form to save questions to database (supports 2 Marks, 4 Marks, MCQ, 6 Marks, 8 Marks categories)
- Build Question Bank page to view, edit, and delete subjects and questions organized by subject and category
- Create Generate Question Paper page with form to specify exam parameters and automatic question selection from database
- Generate 5 paper variants (Sets A-E) simultaneously with shuffled question order maintaining section structure
- Build Generated Question Paper Preview page with formal academic layout organized into sections (A: MCQ, B: 2/4 Marks, C: 6/8 Marks)
- Implement PDF generation for each paper variant with academic formatting
- Create Generated Papers page to list and access all previously generated papers
- Apply consistent navy blue, light blue, white, and light grey academic theme across all pages with Poppins/Inter font

**User-visible outcome:** Teachers can log in with Internet Identity, add and manage subjects and questions in a database, generate randomized question papers with 5 different variants (Sets A-E) based on customizable parameters, preview papers with formal academic formatting, and download each variant as a PDF.
