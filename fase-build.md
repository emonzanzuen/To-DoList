Kerjakan project secara bertahap:

**Phase 1 — Project Setup**

* Periksa struktur project yang tersedia.
* Periksa `package.json`.
* Pastikan dependency yang dibutuhkan tersedia.
* Jangan menginstal dependency yang sebenarnya sudah tersedia.
* Jika ada dependency yang kurang, jelaskan terlebih dahulu sebelum menggunakannya.
* Pastikan konfigurasi React + TypeScript + Tailwind berjalan.

**Phase 2 — Architecture**
Buat struktur folder berdasarkan planning.

Pisahkan dengan jelas:

* components
* pages
* hooks
* context
* types
* utils
* constants
* locales
* animations

**Phase 3 — Design System**
Implementasikan:

* Color tokens
* Typography
* Spacing
* Border radius
* Shadows
* Light mode
* Dark mode
* Interactive states

Gunakan color palette persis seperti yang sudah ditentukan di `plan.md`.

**Phase 4 — Layout**
Implementasikan:

* Dashboard
* Navigation
* Responsive navigation
* Main content
* Task layout
* Settings layout

**Phase 5 — CRUD**
Implementasikan task management secara penuh:

* Create
* Read
* Update
* Delete
* Complete / uncomplete

Pastikan setiap operasi memperbarui React state dan LocalStorage.

**Phase 6 — Task Features**
Implementasikan:

* Search
* Filter
* Sorting
* Priority
* Category
* Due date
* Overdue calculation
* Progress calculation
* Clear completed

**Phase 7 — i18n**
Implementasikan:

* Indonesia
* English
* Language switcher
* Translation files
* Translation keys
* Persistent language preference

Pastikan seluruh UI text yang relevan menggunakan i18n.

**Phase 8 — Theme**
Implementasikan:

* Light Mode
* Dark Mode
* Theme switcher
* Persistent theme preference

Theme dan language harus bekerja secara independen.

**Phase 9 — Animation**
Implementasikan:

* GSAP page entrance
* Dashboard card animation
* Task card animation
* Modal animation
* Toast/feedback animation jika diperlukan
* Lenis Smooth Scroll

Pastikan GSAP dan Lenis tidak menyebabkan memory leak atau conflict dengan React lifecycle.

**Phase 10 — Validation**
Setelah implementation selesai, periksa:

* TypeScript errors
* Runtime errors
* CRUD
* LocalStorage persistence
* Search
* Filter
* Sorting
* i18n
* Dark mode
* Responsive layout
* GSAP
* Lenis
* Accessibility