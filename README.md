# OpenCore Tauries

Aplikasi desktop AI chatbot. Proyek ini memakai [Tauri 2](https://tauri.app/), React, TypeScript, dan Rust, dan hanya menargetkan desktop: macOS, Windows, dan Linux.

Antarmuka chat, penyedia model, dan riwayat percakapan belum dibangun. Yang ada sekarang adalah kerangka aplikasi desktop yang siap dikembangkan ke arah itu.

## Yang ada sekarang

- Jendela desktop Tauri dengan frontend Vite + React + TypeScript
- Perintah Rust `greet` sebagai contoh pemanggilan dari antarmuka
- Konfigurasi bundel untuk macOS, Windows, dan Linux

## Prasyarat

- [Node.js](https://nodejs.org/) dan [pnpm](https://pnpm.io/)
- [Rust](https://www.rust-lang.org/tools/install) stable
- Dependensi sistem Tauri untuk sistem operasi yang dipakai: [prasyarat Tauri](https://tauri.app/start/prerequisites/)

## Menjalankan

```bash
pnpm install
pnpm tauri dev
```

Perintah itu menjalankan frontend di `http://localhost:1420` dan membuka jendela desktop.

Build instalasi desktop:

```bash
pnpm tauri build
```

Hasil build ada di `src-tauri/target/release/bundle/`.

## Skrip

| Perintah | Fungsi |
| --- | --- |
| `pnpm dev` | Frontend Vite saja, tanpa jendela Tauri |
| `pnpm build` | Typecheck dan build frontend ke `dist/` |
| `pnpm preview` | Pratinjau build frontend |
| `pnpm tauri dev` | Aplikasi desktop mode pengembangan |
| `pnpm tauri build` | Paket desktop untuk rilis |

## Struktur

```text
.
├── src/                 Frontend React
├── src-tauri/           Shell desktop Rust / Tauri
│   ├── src/lib.rs       Perintah dan builder aplikasi
│   ├── src/main.rs      Entrypoint desktop
│   ├── capabilities/    Izin jendela
│   └── tauri.conf.json  Nama produk, jendela, dan bundel
├── ABOUT.md             Tentang produk
└── LICENSE              Lisensi MIT
```

`node_modules/`, `dist/`, dan `src-tauri/target/` tidak masuk ke git.

## Rahasia

Kunci API model dan kredensial lain disimpan di `.env` lokal. File itu diabaikan git. Jangan memasukkan kunci ke kode, commit, atau issue.

## Lisensi

MIT. Lihat [LICENSE](LICENSE).
