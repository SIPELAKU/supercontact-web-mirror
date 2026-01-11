## [0.1.1] - 2025-01-15

### Detail Versi 0.1.1

#### 🔐 Forgot Password Feature

- **Deskripsi:**
  - **Forgot Password Page (FE):**
    - Implementasi halaman *Forgot Password* dengan form input email
    - Validasi email client-side dan feedback error/success (/auth/otp/resend)
    - UI mengikuti Supercontact design system (MUI + Tailwind)
  - **Reset Password Page (FE):**
    - Halaman reset password dengan send OTP via Email
    - Verifikasi OTP via halaman verifikasi (`endpoint: "/auth/otp/verify"`)
    - Validasi password dan confirm password (`endpoint: "auth/otp/new-password"`)
    - Handling expired / invalid token
    - Redirect ke halaman "/login" jika berhasil (pada folder path app/(account)/new-password)
  - **API Integration:**
  - Integrasi dengan endpoint `POST /api/v1/auth/otp/resend`
    - Integrasi dengan endpoint `POST /api/v1/auth/otp/verify`
    - Integrasi dengan endpoint `POST /api/v1/auth/otp/reset-password`
    - Handling loading, success, dan error state dari API
  - **Security & UX Considerations:**
    - Generic success message untuk mencegah email enumeration
  - **Impact:**
    - User dapat melakukan recovery akun secara mandiri
    - UX auth flow menjadi lebih lengkap