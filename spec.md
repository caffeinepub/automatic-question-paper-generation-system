# Specification

## Summary
**Goal:** Allow Teacher (non-admin) users to add subjects, removing the admin-only restriction on subject creation.

**Planned changes:**
- Remove the admin-only guard in the backend subject creation endpoint so any authenticated user can add subjects
- Remove any UI-level restriction in the SubjectManager frontend component that hides or disables the "Add Subject" button/form for non-admin users

**User-visible outcome:** A logged-in Teacher can open the Add Subject dialog, fill in the subject name and code, and successfully save the subject without receiving an "Unauthorized: Only admins can add subjects" error.
