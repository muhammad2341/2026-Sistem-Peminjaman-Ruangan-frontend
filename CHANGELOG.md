# Changelog

Semua perubahan penting pada project frontend ini akan didokumentasikan di file ini.

Format yang digunakan mengacu pada [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
dan project ini mengikuti [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- Booking Form (create booking) untuk user
- Booking History and Search
- Penyempurnaan UI/UX dan validasi form

## [0.2.0] - 2026-02-12

### Added

- Integrasi API client frontend ke backend (`rooms` dan `bookings` endpoint)
- Halaman **Room List** dengan:
  - Fetch data ruangan dari API
  - Search ruangan (berdasarkan nama/nomor)
  - Pagination sederhana
  - Status badge ketersediaan ruangan
- Halaman **Booking Management Dashboard** dengan:
  - List booking
  - Filter berdasarkan status, room, dan search
  - Aksi approve, reject (dengan alasan), cancel
  - Modal konfirmasi aksi
  - Pagination sederhana
- Konfigurasi environment frontend:
  - `.env.example` untuk `REACT_APP_API_URL`
  - Update `.gitignore` agar `.env` tidak ikut ter-commit
- Perbaikan struktur navigasi di `App.tsx` untuk perpindahan view fitur

### Technical

- Build frontend berhasil menggunakan `npm run build`
- Penambahan deklarasi tipe CSS (`src/styles.d.ts`) untuk menghindari error TypeScript side-effect import

## [0.1.0] - 2026-02-10

### Added

- Inisialisasi project React + TypeScript (Create React App)
- Struktur dasar aplikasi frontend
- Setup awal konfigurasi TypeScript dan testing bawaan CRA
