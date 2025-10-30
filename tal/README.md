# TalentFlow - Mini Hiring Platform

A modern, feature-rich hiring platform built with React, TypeScript, and a complete local-first architecture. TalentFlow enables HR teams to efficiently manage jobs, track candidates through hiring stages, and build dynamic assessments — all with persistent offline storage.

![TalentFlow](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Vite](https://img.shields.io/badge/Vite-Latest-purple)

## 🚀 Live Demo

🔗 **Deployed App**: [Coming Soon]  
🔗 **GitHub Repository**: [Your Repo URL]

## ✨ Features

### 📋 Jobs Management
- ✅ Create, edit, and archive job postings
- ✅ Paginated job list with search and filters
- ✅ Drag-and-drop reordering with optimistic UI
- ✅ Automatic slug generation from job titles
- ✅ Tagging system for job categorization

### 👥 Candidates Management
- ✅ Track 1000+ candidates with efficient rendering
- ✅ Dual view: List view with search/filter + Kanban board
- ✅ Drag-and-drop candidates between hiring stages
- ✅ Detailed candidate profiles with timeline tracking
- ✅ Stage transition history with timestamps
- ✅ Notes and tagging system

### 📝 Assessment Builder
- ✅ Dynamic form builder with live preview
- ✅ Multiple question types:
  - Single choice (radio buttons)
  - Multiple choice (checkboxes)
  - Short text input
  - Long text (textarea)
  - Numeric input with min/max validation
  - File upload (stub)
- ✅ Conditional logic (show/hide questions based on previous answers)
- ✅ Required field validation
- ✅ Character limits and range validation
- ✅ Split-screen builder and preview

### 💾 Data Persistence
- ✅ **MirageJS** for simulated REST API with realistic latency (200-1200ms)
- ✅ **Dexie.js** for IndexedDB storage (offline-first)
- ✅ 5-10% simulated error rate for robust error handling
- ✅ Automatic data seeding with **Faker.js** (25 jobs, 1000 candidates, 3 assessments)
- ✅ Optimistic updates with rollback on failure

### 🎨 UI/UX Features
- ✅ Professional HR dashboard layout (Sidebar + Topbar + Content)
- ✅ **Framer Motion** animations and transitions
- ✅ **shadcn/ui** component library
- ✅ Responsive design (mobile-friendly)
- ✅ Toast notifications for user feedback
- ✅ Loading skeletons and error states

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 18.3 + TypeScript |
| **Build Tool** | Vite |
| **Styling** | TailwindCSS + shadcn/ui |
| **State Management** | Zustand |
| **Data Fetching** | React Query (TanStack Query) |
| **Routing** | React Router v6 |
| **Mock API** | MirageJS |
| **Local Storage** | Dexie.js (IndexedDB) |
| **Animations** | Framer Motion |
| **Drag & Drop** | @dnd-kit |
| **Seed Data** | Faker.js |

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx       # Main app layout wrapper
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   └── Topbar.tsx          # Top header bar
│   ├── jobs/
│   │   ├── JobCard.tsx         # Individual job card
│   │   ├── JobDialog.tsx       # Create/Edit job modal
│   │   └── JobList.tsx         # Sortable job list
│   ├── candidates/
│   │   ├── CandidateList.tsx   # List view with search
│   │   ├── CandidateKanban.tsx # Kanban board view
│   │   ├── KanbanColumn.tsx    # Individual Kanban column
│   │   └── KanbanCard.tsx      # Draggable candidate card
│   ├── assessments/
*** End Patch
│   │   ├── SectionEditor.tsx      # Section with questions
 