# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup placeholder

---

## [0.1.1] - 2025-01-09

### Detail Versi 0.1.1

#### ✨ Fitur Baru

- **Deskripsi:**
  - **Forgot Password Flow:** Implementasi *end-to-end* fitur lupa kata sandi mulai dari request email, input OTP, hingga set password baru.
  - **UI/UX Implementation:**
    - Halaman input email dengan validasi client-side.
    - Halaman verifikasi OTP dengan *countdown timer* dan fitur resend.
    - Halaman reset password baru dengan validasi match password.
  - **Security:** Handling expired token dan generic success message untuk mencegah *email enumeration*.
  - **Technical Notes:**
    - Integrasi endpoint `POST /api/v1/auth/otp/resend` (Request OTP)
    - Integrasi endpoint `POST /api/v1/auth/otp/verify` (Verify OTP)
    - Integrasi endpoint `POST /api/v1/auth/otp/reset-password` (New Password)
    - Redirect otomatis ke `/login` setelah sukses reset.
  - **Impact:** User dapat memulihkan akses akun secara mandiri tanpa bantuan admin, melengkapi *core auth flow*.