# ✅ Business Task Manager — Multi-User Project Management

Aplikasi manajemen tugas bisnis multi-user yang modern dan komprehensif, dibangun sebagai **project pembelajaran** untuk memahami arsitektur CRUD dengan RBAC, relasi entitas, i18n, Dark Mode, dan Animation menggunakan React & TypeScript.

> 🎯 **Fokus Utama:** Multi-user RBAC, Client-Project-Task Relations, Type-safe, Responsive, dan Easy to Extend.
> Bukan aplikasi enterprise, melainkan fondasi yang solid untuk belajar best practices dalam sistem manajemen bisnis.

---

## ✨ Fitur Utama

### Core — Task Management
- ✅ **Full CRUD** — Create, Read, Update, Delete task
- ⭐ **Pin/Star Task** — Tandai task penting, selalu muncul di atas
- 🔄 **Recurring Task** — Auto-create task baru setelah complete (Daily/Weekly/Monthly)
- 🔍 **Search Realtime** — Cari berdasarkan judul & deskripsi
- 🏷️ **Filter & Sort** — Status, Priority, Category, Due Date + 4 opsi sorting
- 📊 **Dashboard** — Greeting, statistik, progress bar, pinned tasks, recent tasks, burndown chart, team workload
- ☑️ **Checklist** — Sub-task checklist dengan progress bar per task
- 💬 **Comments** — Komentar real-time per task
- 📎 **Attachment** — Lampiran URL per task
- ⏱️ **Time Tracking** — Pencatatan waktu pengerjaan (jam)
- 👥 **Multi-Assignee** — Satu task bisa ditugaskan ke beberapa anggota tim
- 🔒 **Task Ownership Lock** — Hanya assignee yang bisa edit/delete/update status; Admin/Manager full access
- 🔄 **Status Dropdown** — Ubah status langsung dari task card tanpa buka modal

### Approval Workflow
- 🛡️ **Approval System** — Member mengajukan approval, Admin/Manager menyetujui/menolak
- ⏭️ **Auto-Skip Approval** — Task yang dibuat/di-assign ke Admin/Manager tidak memerlukan approval
- 🔄 **Reset Approval** — Admin/Manager bisa reset status approval

### Project Management
- 📁 **Full CRUD Project** — Buat, edit, hapus project dengan status (Active/Completed/Archived)
- 📅 **Project Deadline** — Set tenggat waktu project, overdue detection otomatis
- 👥 **Project Membership** — Invite/remove anggota tim ke project
- 🔐 **Auto-Member Admin/Manager** — Admin & Manager otomatis jadi member semua project
- 🔒 **Membership-Based Access** — Member hanya melihat project yang dia ikuti
- 🏢 **Client-Project Relation** — Hubungkan project dengan client
- 📊 **Project Stats** — Progress bar, task stats, milestone preview, deadline terdekat
- 📋 **Project Detail Page** — Header, progress, anggota tim, milestones, tasks terbaru dengan CRUD penuh

### Milestone Management
- 🎯 **Full CRUD Milestone** — Buat, edit, hapus milestone dengan status & deadline
- 📈 **Milestone Progress** — Otomatis hitung progress berdasarkan task terkait
- 🔗 **Milestone-Project Relation** — Milestone terhubung ke project
- 🔒 **Membership Filter** — Member hanya melihat milestone dari project yang dia ikuti
- 📄 **Milestone Detail Page** — Info lengkap, stats, daftar task dengan CRUD penuh

### Client Management
- 🏢 **Full CRUD Client** — Tambah, edit, hapus client dengan info lengkap (email, phone, address, notes)
- 🔗 **Client-Project Relation** — Lihat semua project milik suatu client
- 🔒 **RBAC Client Filtering** — Member hanya melihat client yang terhubung dengan project-nya
- 📄 **Client Detail Page** — Info client, overall progress, daftar project terkait
- 📊 **Client Stats** — Jumlah project, task selesai, progress keseluruhan

### Kanban Board
- 📋 **Drag & Drop** — Pindahkan task antar kolom status
- 🔄 **Real-time Status Update** — Status berubah instan saat drop
- 🔒 **RBAC Filtering** — Member hanya lihat task sendiri, Admin/Manager lihat semua

### Calendar View
- 📅 **Monthly Calendar** — Visualisasi task berdasarkan due date
- 🔍 **Click to Detail** — Klik task di kalender untuk buka detail modal
- 🔒 **RBAC Filtering** — Member hanya lihat task sendiri, Admin/Manager lihat semua

### Team Management
- 👥 **User Management** — Tambah, edit, hapus user custom
- ✏️ **Edit Built-in Users** — Override user bawaan (nama, role, team) via localStorage
- 🔐 **Role-Based Access Control** — Admin, Manager, Member dengan permission berbeda
- 🆕 **Custom User Login** — User baru yang ditambahkan Admin bisa langsung login

### Settings & Company Profile
- 🏢 **Company Profile** — Edit nama, tagline, alamat, kontak, website perusahaan (Admin only)
- 🖼️ **Logo Upload** — Upload logo perusahaan, tampil di sidebar, login page, & favicon browser
- 🔍 **Logo Preview** — Double-click logo untuk preview fullscreen (WhatsApp style)
- 🌙 **Dark/Light Mode** — Persistent preference, independent dari bahasa
- 🌐 **i18n (ID/EN)** — Multi-language tanpa reload, persistent preference
- ⚠️ **Danger Zone** — Hapus semua data (Admin only)

### UX & Accessibility
- ♿ **Accessibility** — Semantic HTML, aria-labels, focus states, keyboard navigation
- 🎬 **GSAP Animation** — Page entrance, stagger cards, modal scale animation
- 🖱️ **Lenis Smooth Scroll** — Smooth scrolling tanpa memory leak, sidebar scroll independen
- 📱 **Responsive** — Mobile bottom nav ↔ Desktop sidebar
- 🎨 **Lucide Icons** — Semua icon menggunakan Lucide React (tanpa emoji)
- 📊 **Burndown Chart** — SVG chart dengan tooltip interaktif, status badge, area fill, legend
- 📈 **Team Workload Chart** — Visualisasi beban kerja per anggota tim
- 📉 **Task Distribution Chart** — Distribusi task per status & priority
- 🔐 **Auth Loading State** — Spinner screen mencegah flash konten saat refresh
- 🌐 **SPA Routing** — Netlify redirect rule untuk client-side routing

### Data & Security
- 💾 **LocalStorage Persistence** — Semua data tersimpan lokal, validasi corrupt data
- 🛡️ **Backward Compatible Migration** — Data lama otomatis dimigrasi saat field baru ditambahkan
- ⚠️ **Error Handling** — Invalid JSON, missing fields, empty state dengan CTA
- 🔒 **RBAC Enforcement** — Permission dicek di UI dan logic level
- 🔄 **Dynamic Favicon** — Favicon browser otomatis berubah sesuai logo perusahaan

---

## 🛡️ Role-Based Access Control (RBAC)

| Permission | Admin | Manager | Member |
|---|:---:|:---:|:---:|
| Lihat semua tasks | ✅ | ✅ | ❌ (hanya task sendiri) |
| Edit task orang lain | ✅ | ✅ | ❌ |
| Hapus task | ✅ | ✅ | ❌ |
| Clear completed tasks | ✅ | ✅ | ❌ |
| Approve/reject task | ✅ | ✅ | ❌ |
| Buat/edit/hapus project | ✅ | ✅ | ❌ |
| Set project deadline | ✅ | ✅ | ❌ |
| Invite/remove member project | ✅ | ✅ | ❌ |
| Lihat project (membership) | ✅ Semua | ✅ Semua | ✅ Hanya yang di-invite |
| Auto-member semua project | ✅ | ✅ | ❌ |
| Buat/edit/hapus milestone | ✅ | ✅ | ❌ |
| Lihat milestone (membership) | ✅ Semua | ✅ Semua | ✅ Hanya project sendiri |
| Buat/edit/hapus client | ✅ | ✅ | ❌ |
| Lihat client (membership) | ✅ Semua | ✅ Semua | ✅ Hanya project sendiri |
| Manage team (add/edit user) | ✅ | ❌ | ❌ |
| Hapus user | ✅ | ❌ | ❌ |
| Edit company profile | ✅ | ❌ | ❌ |
| Upload logo perusahaan | ✅ | ❌ | ❌ |
| Delete all data | ✅ | ❌ | ❌ |
| Activity Log | ✅ | ✅ | ❌ |
| Burndown Chart | ✅ | ❌ | ❌ |
| Checklist task orang lain | ✅ | ✅ | ❌ (hanya task sendiri) |
| Update status task orang lain | ✅ | ✅ | ❌ (hanya task sendiri) |

---

## 🗂️ Entity Relations

```
Client (1) ──── (*) Project
                  │
                  ├── (*) Milestone
                  │         │
                  │         └── (*) Task
                  │
                  ├── (*) Task
                  │
                  └── (*) Member (User)
```

- **Client → Project**: One-to-Many (satu client punya banyak project)
- **Project → Milestone**: One-to-Many (satu project punya banyak milestone)
- **Project → Task**: One-to-Many (task bisa belong ke project)
- **Milestone → Task**: One-to-Many (task bisa linked ke milestone)
- **Project → User**: Many-to-Many (via memberIds array + auto-member admin/manager)
- **Task → User**: Many-to-Many (via assigneeIds array)

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Core | React 18+, TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v3 |
| Routing | React Router DOM v6 |
| State Management | React Context + Custom Hooks |
| Data Storage | LocalStorage with backward compat migration |
| i18n | i18next + react-i18next |
| Animation | GSAP |
| Smooth Scroll | Lenis |
| Icons | Lucide React |
| Charts | Custom SVG (Burndown, Distribution, Workload) |
| Auth | Mock multi-user with LocalStorage |
| Deploy | Netlify (auto-deploy from GitHub) |

---

## 📁 Project Structure

```
src/
├── animations/gsap/          # GSAP page entrance hooks
├── components/
│   ├── auth/                 # RoleGuard component
│   ├── dashboard/            # BurndownChart, SimpleChart, TeamWorkloadChart
│   ├── layout/               # AppLayout, Sidebar, BottomNav, MobileHeader
│   ├── task/                 # TaskCard, TaskList, AddTaskModal, EditTaskModal,
│   │                         # DeleteTaskModal, TaskDetailModal, TaskForm
│   └── ui/                   # Button, Badge, Modal, ProgressBar, EmptyState,
│                             # ConfirmDialog
├── constants/                # Categories, Priorities, Statuses, Badge styles
├── context/
│   ├── AuthContext.tsx        # Auth, RBAC permissions, isLoading, user override
│   ├── TaskContext.tsx        # Task CRUD, checklist, comments, approval
│   ├── ProjectContext.tsx     # Project CRUD, membership, dueDate, extraMemberIds
│   ├── MilestoneContext.tsx   # Milestone CRUD
│   ├── ClientContext.tsx      # Client CRUD with full fields
│   ├── ActivityContext.tsx    # Activity logging
│   ├── ThemeContext.tsx       # Dark/Light mode
│   └── ToastContext.tsx       # Toast notifications
├── pages/
│   ├── Dashboard/            # Dashboard dengan charts & stats
│   ├── Tasks/                # Task list dengan filter & RBAC
│   ├── Projects/             # Project list + ProjectDetail (dengan deadline)
│   ├── Milestones/           # Milestone list + MilestoneDetail
│   ├── Clients/              # Client list + ClientDetail
│   ├── Kanban/               # Kanban board view
│   ├── Calendar/             # Calendar view dengan RBAC filtering
│   ├── Categories/           # Category browser
│   ├── Team/                 # Team management (Admin only)
│   ├── ActivityLog/          # Activity log
│   ├── Settings/             # Company profile, logo, language, theme, danger zone
│   └── Login/                # Mock login dengan logo perusahaan & favicon dinamis
├── types/                    # TypeScript interfaces (Task, Project, Milestone, Client, User)
├── utils/                    # Utility functions (date, storage, taskUtils, repeatUtils)
└── i18n/                     # Translation files (en.json, id.json)
```

---

## 🚀 Deployment

Deployed on **Netlify** with auto-deploy from GitHub.

- **SPA Routing**: `netlify.toml` redirect rule untuk client-side routing
- **Auto Deploy**: Setiap push ke `main` branch otomatis trigger build & deploy
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`

---

## 📝 Notes

> ⚠️ Aplikasi ini menggunakan **LocalStorage** sebagai database. Data tersimpan di browser masing-masing user. Untuk production nyata, ganti storage layer dengan backend API (Node.js/Firebase/Supabase).

> 💡 **Best Practices Implemented:**
> - Type-safe TypeScript throughout
> - Component composition & reusability
> - Context-based state management
> - RBAC enforcement at UI & logic level
> - Backward compatible data migration
> - Responsive design (mobile-first)
> - Accessibility (semantic HTML, ARIA)
> - i18n with persistent preference
> - Zero emoji — all Lucide icons
> - Dynamic favicon & title from company profile
> - Auth loading state prevents flash of wrong content
