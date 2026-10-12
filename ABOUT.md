# Tentang OpenCore Tauries

OpenCore Tauries adalah aplikasi desktop untuk percakapan dengan model AI. Pengguna menjalankannya sebagai program di komputer, bukan sebagai situs atau aplikasi ponsel.

## Cakupan

- Desktop saja: macOS, Windows, dan Linux
- iOS dan Android di luar cakupan, dan proyek ini tidak menyertakan target mobile

## Arah produk

Aplikasi ini dimaksudkan sebagai chatbot desktop: jendela percakapan, pesan yang dikirim ke model, dan jawaban yang ditampilkan di tempat yang sama. Penyedia model, penyimpanan riwayat, dan tampilan chat masih akan ditambahkan di atas kerangka Tauri yang ada sekarang.

## Stack

- Antarmuka: React, TypeScript, Vite
- Shell desktop: Tauri 2 dan Rust
- Paket: pnpm

## Status

Versi `0.1.0` adalah titik awal. Perintah contoh `greet` masih ada supaya jalur dari antarmuka ke Rust bisa dicek sebelum fitur chat dibangun.

## Repositori

https://github.com/bengidev/opencore_tauries
