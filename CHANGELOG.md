# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial project setup placeholder

---

## [0.5.1] - 2026-01-14

### Detail Versi 0.5.1

#### ♻️ Refactor Add Contact Modal

- **Deskripsi:**
  - **Modal Architecture:** Refactor Add Contact modal dari SweetAlert2-based container menjadi standalone React modal (overlay).
  - **Separation of Concerns:** Memisahkan lifecycle modal React dari SweetAlert2 untuk menghindari konflik state dan unmount tidak terduga.
  - **Validation Handling:** Validasi form dipindahkan sepenuhnya ke React state agar error tidak memicu penutupan modal.
  - **Technical Notes:** SweetAlert2 kini digunakan hanya untuk feedback (success dan global error), bukan sebagai container UI.
  - **Impact:** Arsitektur UI lebih stabil, predictable, dan mudah di-maintain.

#### 🐛 Bug Fix Contact Form Modal

- **Deskripsi:**
  - **Unexpected Modal Close:** Fix issue di mana Add Contact modal tertutup saat terjadi error validasi atau API error.
  - **Reopen Failure:** Fix bug modal tidak bisa dibuka kembali setelah error tanpa reload halaman.
  - **User Experience:** Modal tetap terbuka saat validasi gagal sehingga user dapat langsung memperbaiki input.
  - **Impact:** Menghilangkan kebutuhan reload halaman dan mencegah kehilangan input user.

### [0.5.0] - 2026-01-14

#### ✨ Fitur Baru

- **Deskripsi:**
  - **Inbox:** Slicing inbox page.

---

## [0.4.1] - 2026-01-14

### Detail Versi 0.4.1

#### 🚀 Peningkatan Performa

- **Sidebar:** Hapus console.log.

## [0.4.0] - 2026-01-14

### Detail Versi 0.4.0

#### ✨ Fitur Baru

- **Deskripsi:**
  - **Data Intelligence:** Tambah item sidebar baru yaitu Data Intelligence dengan child menu yaitu Company, Industry Leader, dan Individual.
  - **Data Intelligence Icon:** Tambah icon untuk Data Intelligence.
  - **Technical Notes:**
    - Belum ada desain halaman Data Intelligence dari Tim UI/UX.

## [0.3.0] - 2026-01-14

### Detail Versi 0.3.0

#### ✨ Fitur Baru

- **Deskripsi:**
  - **Security Page:** Slicing security tab di halaman profile setting.

## [0.2.1] - 2026-01-13

### Detail Versi 0.2.1

#### 🎨 UI/UX Enhancement

- **Account Settings:**
  - **Profile Settings:** Penyesuaian layout dan desain halaman pengaturan akun untuk konsistensi dengan desain baru.

## [0.2.0] - 2026-01-13

### Detail Versi 0.2.0

#### 🎨 UI/UX Enhancement

- **Profile Page Revamp:**
  - **New Dashboard UI:** Implementasi halaman profile baru dengan desain dashboard modern, cover image, dan ringkasan informasi user.
  - **Responsive Design:** Penyesuaian layout untuk tampilan mobile dan desktop yang konsisten.

#### ♻️ Refactor

- **Settings Migration:**
  - **Account Settings Move:** Memindahkan form pengaturan akun dari halaman utama profile ke sub-halaman `/profile/settings`.
  - **Navigation Update:** Menambahkan tombol "Settings" di halaman profile untuk akses cepat ke konfigurasi akun.

---

## [0.1.1] - 2025-01-09

### Detail Versi 0.1.1

#### ✨ Fitur Baru

- **Deskripsi:**
  - **Forgot Password Flow:** Implementasi _end-to-end_ fitur lupa kata sandi mulai dari request email, input OTP, hingga set password baru.
  - **UI/UX Implementation:**
    - Halaman input email dengan validasi client-side.
    - Halaman verifikasi OTP dengan _countdown timer_ dan fitur resend.
    - Halaman reset password baru dengan validasi match password.
  - **Security:** Handling expired token dan generic success message untuk mencegah _email enumeration_.
  - **Technical Notes:**
    - Integrasi endpoint `POST /api/v1/auth/otp/resend` (Request OTP)
    - Integrasi endpoint `POST /api/v1/auth/otp/verify` (Verify OTP)
    - Integrasi endpoint `POST /api/v1/auth/otp/reset-password` (New Password)
    - Redirect otomatis ke `/login` setelah sukses reset.
  - **Impact:** User dapat memulihkan akses akun secara mandiri tanpa bantuan admin, melengkapi _core auth flow_.
