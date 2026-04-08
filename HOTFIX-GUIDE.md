# 🔥 Hotfix Deployment Guide — Supercontact Web

## Ringkasan

Hotfix adalah mekanisme untuk **deploy perbaikan mendesak langsung** ke staging atau production **tanpa melalui alur tag** yang normal (RC tag / release tag).

Ketika ada push/merge ke branch `staging` atau `main`, GitLab CI/CD akan **otomatis** mendeteksi dan menjalankan deployment.

---

## Kapan Menggunakan Hotfix?

| Situasi | Gunakan Hotfix? |
|---------|----------------|
| Bug kritis di production yang harus segera diperbaiki | ✅ Ya |
| Security patch urgent | ✅ Ya |
| Fix minor (typo, UI kecil) yang sudah di-test di dev | ✅ Ya |
| Fitur baru | ❌ Tidak, gunakan alur normal |
| Perubahan besar/banyak file | ❌ Tidak, gunakan alur normal |

---

## Cara Deploy Hotfix

### Metode 1: Via Deploy Manager (Rekomendasi)

```bash
# Hotfix ke staging
npm run deploy:hotfix-staging

# Hotfix ke production
npm run deploy:hotfix-prod

# Atau via menu interaktif
npm run deploy
# → Pilih opsi 4 (HOTFIX STAGING) atau 5 (HOTFIX PRODUCTION)
```

Deploy Manager menyediakan 3 sub-metode:
1. **Cherry-pick** — Ambil commit tertentu dari branch mana saja
2. **Merge** — Merge branch saat ini ke target
3. **Push langsung** — Jika sudah di branch target

### Metode 2: Manual via Git

#### Hotfix ke Staging

```bash
# Dari branch dev (atau branch manapun yang sudah ada fix-nya)
git checkout staging
git pull origin staging

# Opsi A: Cherry-pick commit tertentu
git cherry-pick <commit-hash>

# Opsi B: Merge dari dev
git merge --no-ff dev

# Push → GitLab CI otomatis deploy
git push origin staging

# Kembali ke branch kerja
git checkout dev
```

#### Hotfix ke Production

```bash
git checkout main
git pull origin main

# Cherry-pick atau merge
git cherry-pick <commit-hash>

# Push → GitLab CI otomatis deploy
git push origin main

# ⚠️ PENTING: Backmerge ke dev!
git checkout dev
git merge main
git push origin dev
```

---

## Bagaimana CI/CD Menangani Hotfix

File `.gitlab-ci.yml` memiliki rules berikut:

```yaml
# Workflow: Pipeline dibuat saat...
workflow:
  rules:
    # 1. Tag versi → deployment normal
    - if: '$CI_COMMIT_TAG =~ /^v\d+\.\d+\.\d+(-rc\.\d+)?$/'
      when: always
    # 2. Push ke staging/main → HOTFIX deployment
    - if: '$CI_COMMIT_BRANCH =~ /^(staging|main|master)$/'
      when: always
    - when: never

# Job deploy_staging dijalankan saat:
deploy_staging:
  rules:
    - if: '$CI_COMMIT_TAG =~ /^v\d+\.\d+\.\d+-rc\.\d+$/'  # Tag RC
    - if: '$CI_COMMIT_BRANCH == "staging"'                    # Hotfix push

# Job deploy_prod dijalankan saat:
deploy_prod:
  rules:
    - if: '$CI_COMMIT_TAG =~ /^v\d+\.\d+\.\d+$/'            # Tag rilis
    - if: '$CI_COMMIT_BRANCH == "main"'                       # Hotfix push
    - if: '$CI_COMMIT_BRANCH == "master"'                     # Backward compat
```

---

## Alur Deployment Lengkap

```
┌─────────────────────────────────────────────────────────┐
│                     NORMAL DEPLOY                       │
│                                                         │
│  dev ──merge──▶ staging ──tag RC──▶ GitLab CI ──▶ 🧪    │
│  staging ──merge──▶ main ──tag release──▶ GitLab CI ──▶ 🟢 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    HOTFIX DEPLOY                        │
│                                                         │
│  fix ──cherry-pick──▶ staging ──push──▶ GitLab CI ──▶ 🧪  │
│  fix ──cherry-pick──▶ main ──push──▶ GitLab CI ──▶ 🟢     │
└─────────────────────────────────────────────────────────┘
```

---

## Checklist Setelah Hotfix

- [ ] Fix sudah ter-deploy (cek GitLab → CI/CD → Pipelines)
- [ ] Verifikasi fix di environment target (staging/production)
- [ ] Backmerge ke `dev` agar tidak terjadi divergence
- [ ] Informasikan team tentang hotfix yang dilakukan
- [ ] Buat catatan di changelog jika perlu

---

## NPM Scripts Tersedia

| Script | Keterangan |
|--------|-----------|
| `npm run deploy` | Menu interaktif |
| `npm run deploy:status` | Cek status semua branch & tag |
| `npm run deploy:staging` | Deploy normal dev → staging (+ tag RC) |
| `npm run deploy:prod` | Deploy normal staging → main (+ tag release) |
| `npm run deploy:hotfix-staging` | **🔥 Hotfix ke staging** |
| `npm run deploy:hotfix-prod` | **🔥 Hotfix ke production** |
| `npm run deploy:staging-tags` | Lihat tag RC |
| `npm run deploy:prod-tags` | Lihat tag production |
| `npm run deploy:all-tags` | Lihat semua tag |
