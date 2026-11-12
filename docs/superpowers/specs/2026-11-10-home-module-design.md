# Design — modul `home`

Tanggal: 2026-11-10
Status: menunggu persetujuan

## Maksud dan alasan

OpenCore sekarang hanya punya layar onboarding: `src/App.tsx:1-8` langsung merender `<Onboarding />`, dan tombol `ENTER WORKSPACE` (`src/features/onboarding/Onboarding.tsx:127-134`) belum menuju ke apa pun. Aplikasi butuh layar utama tempat pengguna memilih sesi dan menulis prompt.

Referensi visual: tangkapan layar MonoCode/noodle — sidebar bergrup, topbar breadcrumb, hero penuh, composer glass di tengah, baris status checkout. Yang diambil adalah susunannya, bukan gayanya: warna, tipografi, dan sudut mengikuti palet yang sudah ada di `src/App.css:12-46` (aksen `#d71921`, permukaan netral, label mono uppercase, dot-grid, glass panel).

## Tujuan

- `home` menjadi layar utama; onboarding tampil sekali, ditandai di `localStorage` (`opencore-onboarded`), dan bisa diputar ulang dari sidebar.
- Susunan mengikuti referensi: sidebar 240px, topbar, hero, judul, composer, status baris.
- Semua warna dari token yang ada; tidak ada warna baru di luar token.
- Light dan dark berjalan, termasuk sinkron tema jendela Tauri.
- Tetap layak di jendela 800×600 (sidebar jadi drawer) sampai 1440px.
- Keyboard dan pembaca layar dasar: landmark, `aria-current`, `focus-visible`, `⌘K`.

## Non-tujuan

- Backend chat, pemanggilan model, streaming, penyimpanan riwayat.
- Layar Inbox, Notes, Automations, Settings — hanya item nav tanpa tujuan.
- Router atau library baru. Tidak ada dependensi baru sama sekali.
- Mengubah mesin ocean, hero onboarding, atau `src/App.css` selain menambah token.
- Persistensi sesi: data hilang saat reload (sesuai keputusan "dummy/mock untuk saat ini").

## Pendekatan

| | Cara | Trade-off | Putusan |
| --- | --- | --- | --- |
| A | Modul presentasional mandiri, CSS biasa, fixture mock | Cepat, mudah ditinjau, tidak mengunci backend | **Dipilih** |
| B | A + `useSessions` dengan localStorage | Terasa seperti aplikasi, kerja ~2×, sebagian terbuang saat backend asli masuk | Ditunda |
| C | Cangkok `src/app/shell/*` dari monocode | Bergantung Tailwind, ikon, popover, dnd, dan store Rust yang tidak ada di repo ini | Ditolak |

## Rancangan

### Berkas

```text
src/features/home/
  index.ts                 ekspor default + tipe
  Home.tsx                 shell, state UI lokal
  home.css                 semua gaya, prefiks .home-
  sessions.ts              tipe, fixture, helper murni
  sessions.test.mjs        uji helper murni (pola repo: node --test)
  components/
    HomeTopbar.tsx         back/forward, breadcrumb, +, diff, search, toggle sidebar
    HomeSidebar.tsx        brand, nav, grup sesi, footer replay intro
    SessionList.tsx        header grup, baris sesi
    HeroBackdrop.tsx       dot-grid, glow aksen, vignette, slot gambar
    Composer.tsx           textarea, pill model, pill mode, submit
    HomeStatus.tsx         "Current checkout" + chip branch
    icons.tsx              SVG inline, stroke 1.5, 16px
src/shared/use-theme.ts    hook tema bersama (lihat di bawah)
```

### Integrasi

- `src/features/onboarding/Onboarding.tsx` menerima prop opsional `onEnterWorkspace?: () => void`; tombol `ENTER WORKSPACE` memanggilnya bila ada. Tidak ada perubahan lain pada onboarding.
- `src/App.tsx` menyimpan layar: `"onboarding" | "home"`. Awal = `home` bila `localStorage["opencore-onboarded"] === "1"`, selain itu `onboarding`.
- `Home` menerima `onReplayIntro?: () => void`; tombol footer sidebar menghapus flag dan kembali ke onboarding.
- Tema dipindah ke `src/shared/theme.ts` (bagian murni) + `src/shared/use-theme.ts` (`{ theme, toggleTheme }`) yang menangani `localStorage`, `data-theme`, `meta[theme-color]`, dan `getCurrentWindow().setTheme/setBackgroundColor`. `Onboarding.tsx` memakainya sebagai ganti blok tema lokal (≈25 baris) tanpa mengubah tampilan.

### Susunan

```text
.home-shell        grid: 240px 1fr, height 100dvh, background var(--page)
├ .home-sidebar    var(--surface), border-right var(--border)
│  ├ brand         "/ OPENCORE" mono 12px + chevron
│  ├ nav           Search ⌘K · Inbox · Notes · Automations (ikon 16px, label 13px)
│  ├ grup          "SESSIONS" + tombol "+ New" · "Older" + filter
│  └ footer        REPLAY INTRO (mono 9px), MEMORI: DUMMY
└ .home-main
   ├ .home-topbar  48px: ‹ › · ● New session · + · ···  +12 −3 · ⌕ · ▤
   ├ .home-stage   position relative, hero di belakang
   │  ├ h1         "What should we work on?"
   │  ├ composer   glass, radius 16, max-width 720px
   │  └ status     ◇ Current checkout · ⑂ main
   └ (hero: HeroBackdrop absolute inset)
```

Topbar memakai `data-tauri-drag-region` pada area kosong.

### Data dan perilaku (mock)

`Session { id, title, branch, model, updatedAt, group: "sessions" | "older" }`, delapan fixture dengan judul, model (`GPT-5 Sol`, `GPT-5.1 Luna`, `Claude Sonnet 4.5`), dan tanggal.

- Search memfilter judul/branch/model (case-insensitive) lewat `filterSessions()`, murni dan teruji.
- `groupSessions()` mengembalikan dua grup terurut; helper murni, teruji.
- Klik sesi: menandai aktif (`aria-current="page"`), judul masuk breadcrumb, draft per sesi disimpan di memori.
- `+ New` / topbar `+`: membuat sesi "New session" di depan daftar dan mengaktifkannya.
- Submit (Enter tanpa Shift, atau tombol ↑): bila draft tidak kosong, sesi aktif diganti judulnya jadi potongan prompt (maks 48 karakter), draft dibersihkan, dan `onSubmitPrompt?.(prompt, sessionId)` dipanggil bila ada. Shift+Enter menambah baris. Tombol nonaktif saat draft kosong.
- `⌘K` / `Ctrl+K` memfokuskan input search; `Esc` mengembalikan fokus.
- Di bawah 900px sidebar jadi drawer overlay dengan scrim + tombol toggle di topbar; di bawah 640px composer kehilangan pill mode (disembunyikan) dan padding menyusut.

### Pemetaan palet

| Elemen | Token |
| --- | --- |
| Latar aplikasi | `--page` |
| Sidebar, topbar | `--surface` + border `--border` |
| Baris sesi aktif | `--surface-raised` + batang kiri 2px `--accent` |
| Judul, heading | `--text-display` |
| Meta, label | `--text-secondary` |
| Composer | `--glass-fill` / `--glass-border` / `--glass-shadow` |
| Tombol submit aktif | latar `--text-display`, hover `--accent` (sama seperti `.primary-action`) |
| Glow hero | `--accent` pada 7% dan 3% opasitas |
| Fokus | `outline: 2px solid var(--accent)` |

Token baru hanya dua: `--home-sidebar: 240px` dan `--home-composer: 720px`, ditambahkan ke `:root` di `home.css` (bukan `App.css`).

Hero dibuat CSS murni: dot-grid seperti `.onboarding-shell`, dua radial glow, vignette. Bila `--home-hero-image` diisi, gambar menutupi dengan scrim sesuai tema. Tidak ada aset foto yang dikirim.

### Jendela

`src-tauri/tauri.conf.json`: `width 1180`, `height 760`, tambah `minWidth 900`, `minHeight 600`. 800×600 tetap jalan lewat drawer, tapi referensi butuh ruang.

### Verifikasi

- `pnpm build` (tsc + vite) bersih.
- `node --test src/features/home/*.test.mjs` hijau; skrip `test` di `package.json` diperluas ke `src/features/*/*.test.mjs` supaya uji onboarding dan home jalan bersama.
- Uji manual: light + dark pada 1180×760, 900×640, 800×600; ⌘K, Enter, Shift+Enter, drawer, replay intro.

## Yang diserahkan ke pelaksana

Nama kelas, isi ikon, dan angka spasi boleh disesuaikan selama token palet dan susunan di atas dipertahankan.
