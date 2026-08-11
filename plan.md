Saya ingin membuat sebuah **website To-Do List sederhana dan fleksibel** menggunakan:

* React JS
* TypeScript
* Tailwind CSS
* LocalStorage
* i18n untuk multi-language
* GSAP
* Lenis Smooth Scroll
* Lucide React

Website ini merupakan project pembelajaran untuk memahami bagaimana membangun aplikasi CRUD menggunakan React, TypeScript, LocalStorage, internationalization (i18n), dark mode, dan animation.

Fokus utama bukan membuat aplikasi enterprise yang kompleks, tetapi membuat aplikasi yang sederhana, fleksibel, clean, responsive, dan memiliki struktur yang mudah dipahami serta dikembangkan.

---

# 1. Project Overview

Nama project:

**To-Do List**

Jenis aplikasi:

**Personal Task Management**

Tujuan:

Membuat aplikasi To-Do List yang memungkinkan pengguna membuat, membaca, mengubah, menyelesaikan, dan menghapus task.

Aplikasi harus menerapkan konsep **CRUD secara jelas**.

CRUD:

* Create → membuat task
* Read → membaca/menampilkan task
* Update → mengubah task
* Delete → menghapus task

Semua data task disimpan menggunakan **LocalStorage**.

Tidak menggunakan backend atau database.

---

# 2. Tujuan Pembelajaran

Project ini juga digunakan untuk mempelajari:

### React

* Component
* Props
* State
* Context
* Hooks
* Custom Hooks
* Conditional Rendering
* List Rendering

### TypeScript

* Interface
* Type
* Union Type
* Generic sederhana
* Type-safe function
* Type-safe component

### CRUD

* Create data
* Read data
* Update data
* Delete data

### LocalStorage

* Save data
* Read data
* Update data
* Delete data
* Data persistence

### i18n

* Multi-language
* Language switching
* Translation files
* Translation keys
* Persist language preference

### Tailwind CSS

* Responsive layout
* Dark mode
* Utility classes
* Component styling

### GSAP

* Page animation
* Component animation
* Modal animation
* Task animation
* Entrance animation

### Lenis

* Smooth scrolling
* Integration dengan animation system

---

# 3. Technology Stack

Gunakan:

### Core

* React JS
* TypeScript

### Build Tool

Gunakan setup React yang sudah tersedia pada project.

Jangan mengganti build system tanpa alasan yang diperlukan.

### Styling

* Tailwind CSS

### Data Storage

* LocalStorage

### Internationalization

Gunakan library i18n yang sesuai untuk React.

Rekomendasi:

* i18next
* react-i18next

Gunakan pendekatan translation key, bukan hardcoded translated text di component.

### Animation

* GSAP

### Smooth Scroll

* Lenis Smooth Scroll

### Icons

* Lucide React

### Routing

* React Router DOM jika diperlukan.

---

# 4. Filosofi Project

Website harus:

* Simple
* Clean
* Modern
* Flexible
* Responsive
* Easy to understand
* Easy to maintain
* Easy to extend

Jangan membuat fitur terlalu kompleks.

Jangan membuat arsitektur enterprise.

Jangan menambahkan library yang tidak diperlukan.

---

# 5. CRUD System

CRUD harus menjadi bagian utama aplikasi.

## Create

Pengguna dapat:

* Membuat task baru
* Mengisi informasi task
* Menyimpan task ke LocalStorage

## Read

Pengguna dapat:

* Melihat semua task
* Melihat pending task
* Melihat completed task
* Melihat task berdasarkan category
* Melihat task berdasarkan filter
* Melihat task pada dashboard

## Update

Pengguna dapat:

* Mengedit task
* Mengubah status task
* Menandai task sebagai completed
* Mengembalikan completed task menjadi pending
* Mengubah priority
* Mengubah category
* Mengubah due date

## Delete

Pengguna dapat:

* Menghapus task
* Menghapus completed tasks
* Menghapus seluruh data aplikasi melalui Settings

Setiap operasi CRUD harus memperbarui:

1. React state
2. LocalStorage
3. UI

---

# 6. Task Model

Setiap task memiliki:

```text
id
title
description
status
priority
category
dueDate
createdAt
updatedAt
```

Status:

```text
pending
completed
```

Priority:

```text
low
medium
high
```

Category:

```text
work
study
personal
shopping
other
```

Gunakan TypeScript type/interface.

Hindari penggunaan `any`.

---

# 7. Dashboard

Dashboard menjadi halaman utama.

Tampilkan:

* Greeting
* Total Tasks
* Completed Tasks
* Pending Tasks
* Progress
* Recent Tasks
* Add Task button

Contoh:

```text
Total Tasks
12

Completed
7

Pending
5

Progress
58%
```

Statistik harus dihitung berdasarkan data task yang tersimpan.

---

# 8. Task Page

Halaman utama untuk CRUD task.

Fitur:

* Create
* Read
* Update
* Delete
* Search
* Filter
* Sorting

Task dapat ditampilkan dalam bentuk:

* Card
* List

Gunakan layout yang fleksibel.

---

# 9. Add Task

Pengguna dapat membuat task baru.

Field:

* Title
* Description
* Priority
* Category
* Due Date

Validation:

* Title wajib
* Priority wajib
* Category wajib
* Due Date harus valid

Setelah Create:

```text
Form
 ↓
Validation
 ↓
Create Task
 ↓
Update React State
 ↓
Save LocalStorage
 ↓
Update UI
 ↓
Feedback
```

---

# 10. Read Task

Task dapat ditampilkan pada:

* Dashboard
* All Tasks
* Pending
* Completed
* Categories

Read operation harus mengambil data dari state yang bersumber dari LocalStorage.

---

# 11. Edit Task

Pengguna dapat mengedit:

* Title
* Description
* Priority
* Category
* Due Date

Flow:

```text
Task
 ↓
Edit
 ↓
Form
 ↓
Update
 ↓
Update State
 ↓
Update LocalStorage
 ↓
UI updated
```

---

# 12. Complete Task

Task dapat diubah statusnya:

```text
pending → completed
```

atau:

```text
completed → pending
```

Perubahan termasuk bagian dari **Update CRUD**.

---

# 13. Delete Task

Pengguna dapat menghapus task.

Sebelum Delete:

* Confirmation

Setelah Delete:

* Remove dari state
* Update LocalStorage
* Update UI

---

# 14. Search

Search berdasarkan:

* Title
* Description

Search harus realtime.

Jika tidak ada hasil:

Tampilkan empty state.

---

# 15. Filter

Filter berdasarkan:

### Status

* All
* Pending
* Completed

### Priority

* All
* Low
* Medium
* High

### Category

* All
* Work
* Study
* Personal
* Shopping
* Other

---

# 16. Sorting

Sorting sederhana:

* Newest
* Oldest
* Due Date
* Priority

Search, filter, dan sorting harus dapat bekerja secara bersamaan.

---

# 17. LocalStorage

Gunakan LocalStorage sebagai persistence layer.

Contoh key:

```text
todo_tasks
```

Simpan seluruh task.

Buat utility atau custom hook untuk LocalStorage.

Contoh:

```text
useLocalStorage
useTasks
```

Flow:

```text
React App
 ↓
useTasks
 ↓
LocalStorage
```

Ketika aplikasi dibuka:

```text
LocalStorage
 ↓
Load Tasks
 ↓
React State
 ↓
UI
```

Ketika CRUD dilakukan:

```text
CRUD Action
 ↓
React State
 ↓
LocalStorage
 ↓
UI
```

Tangani:

* Empty LocalStorage
* Invalid JSON
* Corrupt data
* Missing fields
* Invalid task structure

---

# 18. Internationalization / i18n

Website harus mendukung dua bahasa:

* Indonesia
* English

Gunakan:

* i18next
* react-i18next

Language code:

```text
id
en
```

Default language:

```text
id
```

Pengguna dapat mengganti bahasa melalui language switcher.

---

# 19. Translation Architecture

Jangan menulis text langsung di component jika text tersebut perlu diterjemahkan.

Jangan:

```text
Add Task
```

langsung di component.

Gunakan translation key.

Contoh konsep:

```text
task.add
task.edit
task.delete
task.title
task.description
task.priority
task.category
task.status
```

Translation file:

```text
locales/
├── id/
│   └── translation.json
└── en/
    └── translation.json
```

Contoh konsep:

```json
{
  "task": {
    "add": "Tambah Task",
    "edit": "Edit Task",
    "delete": "Hapus Task"
  }
}
```

English:

```json
{
  "task": {
    "add": "Add Task",
    "edit": "Edit Task",
    "delete": "Delete Task"
  }
}
```

Semua text UI yang relevan harus menggunakan i18n.

---

# 20. Language Switcher

Buat language switcher yang sederhana.

Contoh:

```text
ID | EN
```

atau dropdown:

```text
🇮🇩 Indonesia
🇬🇧 English
```

Ketika bahasa berubah:

* UI langsung berubah
* Tidak perlu reload halaman jika memungkinkan
* Preference bahasa disimpan ke LocalStorage

Contoh key:

```text
app_language
```

Ketika website dibuka kembali:

```text
LocalStorage
 ↓
Language Preference
 ↓
Initialize i18n
 ↓
UI
```

---

# 21. Dark Mode

Website harus memiliki:

* Light Mode
* Dark Mode

Gunakan dark mode Tailwind CSS.

Theme switcher dapat berupa:

```text
☀ Light
🌙 Dark
```

atau icon button.

Preference theme disimpan di LocalStorage.

Contoh:

```text
app_theme
```

Flow:

```text
User toggle theme
 ↓
Update theme state
 ↓
Update HTML class
 ↓
Tailwind dark mode
 ↓
Save LocalStorage
```

Ketika website dibuka kembali:

```text
LocalStorage
 ↓
Theme Preference
 ↓
Initialize Theme
 ↓
UI
```

---

# 22. Theme + i18n

Settings harus dapat mengatur:

* Language
* Theme

Contoh:

```text
Settings

Language
[ Indonesia ]

Theme
[ Dark ]
```

Kedua preference harus tersimpan secara terpisah.

```text
app_language
app_theme
```

Jangan mencampurkan data preference dengan data task.

---

# 23. Layout

Layout harus fleksibel.

Desktop dapat menggunakan:

```text
Sidebar | Main Content
```

Mobile dapat menggunakan:

```text
Header
Main Content
Mobile Navigation
```

Tidak harus selalu menggunakan sidebar.

Gunakan Tailwind responsive utilities.

---

# 24. Navigation

Navigation dapat berisi:

* Dashboard
* Tasks
* Categories
* Settings

Gunakan Lucide React.

Navigation harus responsive.

Active page harus memiliki visual state yang jelas.

---

# 25. Component Architecture

Gunakan reusable component.

Contoh:

```text
src/
├── components/
│   ├── layout/
│   ├── navigation/
│   ├── task/
│   │   ├── TaskCard.tsx
│   │   ├── TaskList.tsx
│   │   ├── TaskForm.tsx
│   │   ├── AddTaskModal.tsx
│   │   ├── EditTaskModal.tsx
│   │   └── DeleteTaskModal.tsx
│   ├── dashboard/
│   ├── settings/
│   └── ui/
│
├── pages/
│   ├── Dashboard/
│   ├── Tasks/
│   ├── Categories/
│   └── Settings/
│
├── hooks/
├── context/
├── types/
├── utils/
├── constants/
├── locales/
│   ├── id/
│   └── en/
│
├── animations/
│   ├── gsap/
│   └── lenis/
│
└── App.tsx
```

Struktur dapat disesuaikan berdasarkan hasil planning.

---

# 26. GSAP Animation

Gunakan GSAP untuk animasi UI.

Animasi harus:

* Smooth
* Subtle
* Modern
* Tidak berlebihan

Gunakan GSAP untuk:

### Page Entrance

* Fade in
* Slide up

### Dashboard Cards

* Stagger animation

### Task Card

* Fade
* Slide
* Stagger

### Modal

Opening:

```text
opacity 0 → 1
scale 0.95 → 1
```

Closing:

```text
opacity 1 → 0
scale 1 → 0.95
```

### Feedback

Gunakan animasi ringan ketika task berhasil dibuat, diperbarui, atau dihapus.

Jangan menggunakan GSAP untuk semua element.

---

# 27. Lenis Smooth Scroll

Gunakan Lenis untuk smooth scrolling.

Lenis harus:

* Diinisialisasi satu kali
* Memiliki lifecycle yang jelas
* Tidak menyebabkan memory leak
* Tidak menyebabkan conflict dengan React
* Tidak menyebabkan scroll menjadi berat

Jika menggunakan GSAP ScrollTrigger, integrasikan dengan benar.

ScrollTrigger tidak wajib digunakan jika animasi sederhana sudah mencukupi.

---

# 28. Reduced Motion

Perhatikan accessibility.

Jika user menggunakan:

```text
prefers-reduced-motion
```

kurangi atau matikan animasi yang tidak diperlukan.

Website tetap harus berfungsi tanpa animasi.

---

# 29. Responsive Design

Website harus responsive pada:

* Mobile
* Tablet
* Laptop
* Desktop
* Large screen

Pastikan:

* Tidak horizontal overflow
* Modal responsive
* Form responsive
* Task card responsive
* Navigation responsive
* Dashboard card responsive

---

# 30. Empty State

Buat empty state untuk:

* Tidak ada task
* Tidak ada pending task
* Tidak ada completed task
* Tidak ada search result
* Tidak ada filter result

Contoh:

```text
No tasks yet

Create your first task.

[ Add Task ]
```

Text harus menggunakan i18n.

---

# 31. Accessibility

Perhatikan:

* Semantic HTML
* Form label
* Keyboard navigation
* Focus state
* Accessible button
* aria-label untuk icon button
* Modal keyboard interaction
* Color contrast
* Reduced motion

Semua text accessibility yang terlihat oleh user juga harus menggunakan i18n jika memungkinkan.

---

# 32. Error Handling

Tangani:

* Empty title
* Invalid form
* Invalid LocalStorage
* Corrupt task data
* Task tidak ditemukan
* Delete error
* Save error

Error message juga harus mendukung:

* Indonesia
* English

Gunakan i18n.

---

# 33. Performance

Jaga aplikasi tetap ringan.

Hindari:

* Animation berlebihan
* Library tidak diperlukan
* Component terlalu besar
* Re-render yang tidak diperlukan
* Logic duplikat

Gunakan GSAP dan Lenis secara terukur.

---

# 34. MVP Features

MVP terdiri dari:

### Core CRUD

1. Create Task
2. Read Task
3. Update Task
4. Delete Task

### Task Management

5. Complete Task
6. Priority
7. Category
8. Due Date
9. Search
10. Filter
11. Sorting

### Application

12. Dashboard
13. Categories
14. Settings
15. LocalStorage

### UI

16. Responsive Layout
17. Dark Mode
18. Light Mode
19. Empty State
20. Responsive Navigation

### Internationalization

21. Indonesia
22. English
23. Language Switcher
24. Language persistence

### Animation

25. GSAP
26. Lenis Smooth Scroll
27. Page animation
28. Task animation
29. Modal animation

---

# 35. Non-MVP

Jangan membuat:

* Authentication
* Backend
* Database
* REST API
* Cloud synchronization
* User account
* Team collaboration
* Real-time collaboration
* AI
* Push notification
* Payment
* Subscription
* Complex calendar
* Email notification

---

# 36. Future Development

Arsitektur harus memungkinkan pengembangan:

### Phase 2

* Backend
* Database
* API
* Authentication

### Phase 3

* User account
* Cloud synchronization
* Reminder
* Recurring task

### Phase 4

* Calendar
* Notification
* Drag and drop
* Advanced task management

i18n juga harus dibuat dengan struktur yang memungkinkan penambahan bahasa lain di masa depan.

Contoh:

```text
id
en
jp
```

tanpa mengubah logic utama aplikasi.

---

# 37. Development Phases

## Phase 1 — Project Setup

* React
* TypeScript
* Tailwind CSS
* GSAP
* Lenis
* Lucide React
* i18next
* react-i18next
* Project structure

## Phase 2 — Layout

* Main layout
* Navigation
* Responsive navigation
* Dashboard layout
* Theme system

## Phase 3 — CRUD

* Task type
* Create
* Read
* Update
* Delete
* Complete task

## Phase 4 — LocalStorage

* Save
* Read
* Update
* Delete
* Validation
* Persistence

## Phase 5 — Task Features

* Search
* Filter
* Sorting
* Category
* Priority
* Due Date

## Phase 6 — i18n

* Translation files
* Translation keys
* Language switcher
* Language persistence
* Indonesia
* English

## Phase 7 — Dark Mode

* Theme state
* Tailwind dark mode
* Theme switcher
* Theme persistence

## Phase 8 — Animation

* GSAP
* Page entrance
* Task animation
* Modal animation
* Stagger animation
* Lenis
* GSAP + Lenis integration

## Phase 9 — Testing

Test:

* CRUD
* LocalStorage
* Search
* Filter
* Sorting
* i18n
* Theme
* Responsive layout
* Animation
* Accessibility

## Phase 10 — Optimization

* Clean code
* Remove unused code
* Optimize animation
* Optimize rendering
* Fix responsive issues
* Fix accessibility issues

---

# 38. Acceptance Criteria

Setiap fitur harus memiliki acceptance criteria.

Contoh:

### Create Task

Task dianggap berhasil jika:

* User dapat membuka Add Task
* User dapat mengisi form
* Validation berjalan
* Task berhasil dibuat
* Task muncul di UI
* Task tersimpan di LocalStorage

### Read Task

* Task tersimpan dapat ditampilkan
* Data tetap tersedia setelah refresh
* Data dapat ditampilkan berdasarkan filter

### Update Task

* User dapat membuka edit
* Data sebelumnya muncul
* User dapat mengubah data
* Data berubah di UI
* LocalStorage ikut berubah

### Delete Task

* User dapat menghapus task
* Confirmation muncul
* Task hilang
* LocalStorage diperbarui

### i18n

* Bahasa Indonesia tersedia
* English tersedia
* Language switcher berfungsi
* UI berubah tanpa reload jika memungkinkan
* Preference tersimpan setelah refresh

### Dark Mode

* Light mode tersedia
* Dark mode tersedia
* Toggle berfungsi
* UI berubah
* Preference tersimpan setelah refresh

### Animation

* GSAP berjalan
* Animation tidak mengganggu interaksi
* Lenis berjalan
* Tidak terjadi memory leak
* Website tetap usable ketika animation dimatikan

---

# 39. Output Planning

Jangan langsung membuat source code.

Buat planning yang terdiri dari:

1. Project Overview
2. Project Goals
3. Learning Goals
4. Target Users
5. Feature List
6. CRUD Requirements
7. Functional Requirements
8. Non-functional Requirements
9. Sitemap
10. User Flow
11. Page Structure
12. Layout Strategy
13. Component Architecture
14. TypeScript Data Model
15. LocalStorage Strategy
16. State Management Strategy
17. Routing Strategy
18. i18n Architecture
19. Translation Strategy
20. Dark Mode Strategy
21. GSAP Animation Strategy
22. Lenis Smooth Scroll Strategy
23. Responsive Design
24. Accessibility
25. Error Handling
26. Performance
27. Folder Structure
28. Development Phases
29. Development Tasks
30. Acceptance Criteria
31. MVP Scope
32. Future Development

Untuk setiap fitur utama jelaskan:

* Tujuan
* User flow
* Functional requirements
* UI requirements
* Data requirements
* Technical considerations
* Acceptance criteria

Hasil planning harus menjadi dokumen acuan yang dapat digunakan untuk development menggunakan **Cursor AI**.

Jangan menghasilkan source code pada tahap planning.

Prioritaskan:

* Simple
* Flexible
* Clean
* Responsive
* Maintainable
* Reusable
* Type-safe
* Good UX
* Smooth animation
* Clear CRUD architecture
* Clear LocalStorage architecture
* Clear i18n architecture

Jangan menambahkan fitur di luar scope tanpa alasan yang jelas.

# 40. Design System — Color System

Website harus menggunakan **color system yang telah ditentukan** dan tidak boleh memilih warna secara acak pada saat development.

Color palette harus konsisten di seluruh:

* Dashboard
* Task List
* Task Card
* Form
* Modal
* Navigation
* Sidebar
* Button
* Badge
* Input
* Dropdown
* Settings
* Empty State
* Error State
* Success State

Gunakan Tailwind CSS untuk implementasi warna.

---

## 40.1 Primary Color

Gunakan **Indigo** sebagai warna utama aplikasi.

### Light Mode

```text id="k7t3m1"
Primary
#4F46E5

Primary Hover
#4338CA
```

### Dark Mode

```text id="h1w8l4"
Primary
#6366F1

Primary Hover
#818CF8
```

Primary digunakan untuk:

* Primary button
* Active navigation
* Links
* Focus indicator
* Progress indicator
* Selected state
* Important interactive elements

Jangan menggunakan primary color pada seluruh element.

Gunakan secara terkontrol sebagai visual accent.

---

# 40.2 Background

### Light Mode

```text id="j9p2x7"
Background
#F8FAFC
```

### Dark Mode

```text id="c5v0n8"
Background
#0F172A
```

Background digunakan sebagai warna utama halaman.

---

# 40.3 Surface / Card

### Light Mode

```text id="v3q6r1"
Surface
#FFFFFF
```

### Dark Mode

```text id="t8m4k2"
Surface
#1E293B
```

Digunakan untuk:

* Card
* Modal
* Dropdown
* Sidebar
* Form container
* Task card

---

# 40.4 Text Color

## Primary Text

### Light

```text id="x2n7p5"
#0F172A
```

### Dark

```text id="m6r1w9"
#F8FAFC
```

Digunakan untuk:

* Heading
* Task title
* Important information

---

## Secondary Text

### Light

```text id="q8k3s2"
#64748B
```

### Dark

```text id="d4v7h1"
#94A3B8
```

Digunakan untuk:

* Description
* Metadata
* Secondary information
* Helper text

---

# 40.5 Border

### Light

```text id="n5t2c8"
#E2E8F0
```

### Dark

```text id="z7m1q4"
#334155
```

Digunakan untuk:

* Card border
* Input border
* Divider
* Modal border
* Navigation separator

Border harus subtle dan tidak terlalu kontras.

---

# 40.6 Semantic Colors

Gunakan semantic color untuk menunjukkan status atau feedback.

## Success

### Light

```text id="f2k8v5"
#22C55E
```

### Dark

```text id="p6r3x9"
#4ADE80
```

Digunakan untuk:

* Completed task
* Success notification
* Success state
* Positive feedback

---

## Warning

### Light

```text id="u4m9s1"
#F59E0B
```

### Dark

```text id="b7q2n6"
#FBBF24
```

Digunakan untuk:

* Warning
* Medium priority
* Important reminder

---

## Danger

### Light

```text id="e8v1k3"
#EF4444
```

### Dark

```text id="r5n7w2"
#F87171
```

Digunakan untuk:

* Delete
* Error
* Validation error
* High priority

---

## Info

### Light

```text id="s3k6p9"
#0EA5E9
```

### Dark

```text id="w8m2c5"
#38BDF8
```

Digunakan untuk:

* Information
* Informational feedback
* Informational badge

---

# 40.7 Priority Colors

Priority harus memiliki visual distinction.

### Low

Gunakan Success / Green.

```text id="g5r8v2"
#22C55E
```

### Medium

Gunakan Warning / Amber.

```text id="j1q6n4"
#F59E0B
```

### High

Gunakan Danger / Red.

```text id="c9m3x7"
#EF4444
```

Priority tidak hanya dibedakan berdasarkan warna.

Gunakan juga:

* Text
* Badge
* Icon
* Label

Hal ini penting untuk accessibility.

Contoh:

```text id="t4p8k1"
Low
Medium
High
```

---

# 40.8 Category Colors

Category dapat memiliki warna accent yang berbeda.

Gunakan warna secara konsisten.

Contoh:

```text id="y6n2r8"
Work
Indigo

Study
Blue

Personal
Purple

Shopping
Orange

Other
Slate
```

Category color tidak boleh mengalahkan primary UI.

Category color hanya digunakan sebagai visual identifier.

---

# 40.9 Interactive States

Setiap interactive component harus memiliki state.

Minimal:

```text id="a3v7m9"
Default
Hover
Active
Focus
Disabled
```

Contoh Button:

```text id="q5k1x8"
Default
#4F46E5

Hover
#4338CA

Focus
Visible focus ring

Disabled
Reduced opacity
```

Gunakan Tailwind state utilities:

```text id="m8p2r6"
hover:
focus:
active:
disabled:
```

---

# 40.10 Focus State

Semua interactive element harus memiliki focus state yang jelas.

Focus indicator harus:

* Terlihat
* Tidak terlalu besar
* Memiliki contrast yang cukup

Contoh:

```text id="v4n7c2"
focus:ring
focus:ring-indigo
```

Jangan menghilangkan outline/focus indicator tanpa menggantinya dengan indikator yang jelas.

---

# 40.11 Disabled State

Disabled component harus terlihat berbeda tetapi tetap terbaca.

Contoh:

```text id="k9s3w5"
opacity
cursor
background
```

Jangan menggunakan opacity terlalu rendah sehingga text tidak terbaca.

---

# 40.12 Color Usage Rules

Gunakan aturan berikut:

### Primary

Untuk action utama.

Contoh:

```text id="r2m8q6"
Add Task
Save
Create Task
```

### Success

Untuk keberhasilan.

Contoh:

```text id="p5v1n7"
Task Completed
Task Created
```

### Warning

Untuk peringatan.

Contoh:

```text id="x8k4c3"
Medium Priority
```

### Danger

Untuk destructive action.

Contoh:

```text id="j6q2m9"
Delete
Remove
Error
```

### Info

Untuk informasi tambahan.

---

# 40.13 Light Mode

Default theme:

**Light Mode**

Color mapping:

```text id="f7w3n2"
Background
#F8FAFC

Surface
#FFFFFF

Primary
#4F46E5

Primary Hover
#4338CA

Text Primary
#0F172A

Text Secondary
#64748B

Border
#E2E8F0

Success
#22C55E

Warning
#F59E0B

Danger
#EF4444

Info
#0EA5E9
```

---

# 40.14 Dark Mode

Dark mode harus menggunakan warna yang sudah ditentukan.

Color mapping:

```text id="n2v8k5"
Background
#0F172A

Surface
#1E293B

Primary
#6366F1

Primary Hover
#818CF8

Text Primary
#F8FAFC

Text Secondary
#94A3B8

Border
#334155

Success
#4ADE80

Warning
#FBBF24

Danger
#F87171

Info
#38BDF8
```

Dark mode tidak boleh hanya menggunakan `black` dan `white`.

Gunakan dark navy/slate palette agar interface lebih nyaman dilihat.

---

# 40.15 Tailwind Color Tokens

Warna sebaiknya didefinisikan sebagai design tokens sehingga component tidak bergantung pada hardcoded color value.

Contoh konsep:

```text id="s8m4q1"
primary
primary-hover
background
surface
text-primary
text-secondary
border
success
warning
danger
info
```

Component menggunakan token tersebut.

Contoh konsep:

```text id="w5n9k3"
bg-primary
text-primary
bg-surface
border-default
text-secondary
```

Implementasi token dapat disesuaikan dengan versi Tailwind CSS yang digunakan oleh project.

Jangan mencampur banyak pendekatan warna tanpa alasan.

---

# 40.16 Design Consistency

Semua halaman harus menggunakan color system yang sama.

Jangan membuat:

```text id="c3r7m8"
Dashboard → Indigo

Tasks → Blue

Settings → Purple
```

untuk primary action.

Primary color harus tetap **Indigo** di seluruh website.

Page dapat memiliki accent tertentu hanya jika diperlukan, tetapi tidak boleh mengubah identitas utama aplikasi.

---

# 40.17 Color + i18n

Warna dan i18n harus dipisahkan.

Translation hanya mengatur:

* Text
* Label
* Message
* Placeholder
* Accessibility text

Color system mengatur:

* Visual
* Background
* Text color
* Border
* Status
* Interactive state

Jangan membuat translation key untuk warna.

---

# 40.18 Color + Dark Mode + i18n

Ketiga sistem harus berdiri secara independen:

```text id="u6q1p4"
Application
│
├── Task State
│
├── Theme System
│   ├── Light
│   └── Dark
│
└── i18n System
    ├── Indonesia
    └── English
```

Contoh:

User dapat menggunakan:

```text id="e2m8v5"
Language: Indonesia
Theme: Dark
```

atau:

```text id="r7k3n1"
Language: English
Theme: Light
```

Perubahan language tidak boleh mengubah theme.

Perubahan theme tidak boleh mengubah language.

---

# 40.19 Final Design Identity

Identitas visual website:

```text id="p8c4w2"
Style:
Modern
Minimal
Clean
Productivity-focused

Primary:
Indigo

Background:
Slate / Navy

Surface:
White / Slate

Typography:
Clean and readable

Semantic:
Green / Amber / Red / Blue

Theme:
Light + Dark

Animation:
Subtle GSAP

Scrolling:
Lenis Smooth Scroll
```

Website harus terlihat seperti **modern productivity application**, bukan seperti website corporate yang penuh elemen.

---

# 41. Updated Planning Structure

Setelah menambahkan Design System, struktur planning final menjadi:

1. Project Overview
2. Project Goals
3. Learning Goals
4. Target Users
5. Technology Stack
6. Project Philosophy
7. CRUD Requirements
8. Task Model
9. Dashboard
10. Task Page
11. Create Task
12. Read Task
13. Update Task
14. Delete Task
15. Complete Task
16. Search
17. Filter
18. Sorting
19. LocalStorage
20. Internationalization / i18n
21. Translation Architecture
22. Language Switcher
23. Dark Mode
24. Theme + i18n
25. Layout
26. Navigation
27. Component Architecture
28. GSAP Animation
29. Lenis Smooth Scroll
30. Reduced Motion
31. Responsive Design
32. Empty State
33. Accessibility
34. Error Handling
35. Performance
36. MVP Features
37. Non-MVP
38. Future Development
39. **Design System — Color System**
40. **Updated Planning Structure**
41. Development Phases
42. Acceptance Criteria
43. Output Planning

Color system menjadi bagian resmi dari planning dan harus digunakan sebagai acuan selama proses UI development.
