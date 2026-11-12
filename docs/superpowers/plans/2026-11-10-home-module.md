# Modul Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan layar utama `home` bergaya referensi MonoCode/noodle, memakai palet OpenCore yang sudah ada, dengan data sesi mock.

**Architecture:** Satu modul fitur `src/features/home/` (React 19 + CSS biasa, tanpa dependensi baru) berisi shell grid dua kolom, sidebar sesi, topbar, hero CSS, composer, dan baris status. Logika murni (filter/grup/judul/tanggal) dipisah ke `sessions.ts` agar teruji dengan `node --test`; komponen hanya merender. Tema dipindah ke hook bersama `src/shared/use-theme.ts` supaya onboarding dan home memakai satu sumber.

**Tech Stack:** React 19, TypeScript 6 (strict, `noUnusedLocals`), Vite 8, Tauri 2, CSS biasa tanpa framework, `node --test` untuk fungsi murni.

**Spec:** `docs/superpowers/specs/2026-11-10-home-module-design.md`

## Global Constraints

- Tanpa dependensi baru. `package.json` dependencies/devDependencies tidak berubah.
- Tanpa router. Perpindahan layar memakai state di `src/App.tsx`.
- Tanpa warna hard-coded di `home.css`: semua warna lewat token `:root` (`--page`, `--surface`, `--surface-raised`, `--border`, `--border-visible`, `--text-primary`, `--text-secondary`, `--text-display`, `--accent`, `--interactive`, `--glass-fill`, `--glass-border`, `--glass-shadow`) dari `src/App.css:12-46`.
- Hanya dua token baru: `--home-sidebar: 240px`, `--home-composer: 720px`. Didefinisikan di `src/features/home/home.css`, bukan `App.css`.
- Copy UI berbahasa Inggris, mengikuti onboarding. Komentar kode dan nama variabel berbahasa Inggris.
- Jangan mengubah `src/features/onboarding/ocean/**`, `HeroStage.tsx`, `SharkOcean.tsx`, `SpeechBubble.tsx`, `src/App.css` (kecuali tidak ada), atau mesin ocean.
- Test `.mjs` adalah JavaScript biasa: tanpa anotasi tipe, tanpa `as`, tanpa `import type`. Import file `.ts` memakai ekstensi eksplisit (`./sessions.ts`) — Node 26 menangani type stripping.
- Skrip test menjadi: `node --test src/features/onboarding/*.test.mjs src/features/home/*.test.mjs src/shared/*.test.mjs`.
- Setiap task berakhir dengan commit. Kalau commit di `main` tidak diinginkan, katakan sebelum eksekusi.

## Review Focus

1. Prompt sangat panjang atau satu kata tanpa spasi (URL) → judul sesi di sidebar tetap satu baris, terpotong `…`, tidak merusak lebar. (T1 test `sessionTitleFromPrompt`, T4 langkah CSS `text-overflow`.)
2. Jendela 800×600 → sidebar jadi drawer, topbar tidak bertumpuk dengan tombol toggle, composer tetap bisa dipakai. (T5 langkah verifikasi manual 800×600.)
3. Light theme dengan composer glass di atas hero → teks tetap terbaca; tidak ada `color:` literal. (T5 langkah audit `home.css`.)
4. Reload saat `localStorage["opencore-theme"]` kosong → tema mengikuti `prefers-color-scheme`, bukan selalu gelap. (T2 test `resolveInitialTheme`.)
5. `prefers-reduced-motion` dan fokus keyboard → transisi mati, cincin `:focus-visible` tetap terlihat di nav, sesi, dan composer. (T4/T5 langkah verifikasi.)

---

### Task 1: Data dan helper sesi (TDD)

**Files:**
- Create: `src/features/home/sessions.ts`
- Test: `src/features/home/sessions.test.mjs`
- Modify: `package.json:9` (skrip `test`)

**Interfaces:**
- Produces:
  - `type SessionGroupId = "sessions" | "older"`
  - `type Session = { id: string; title: string; branch: string; model: string; updatedAt: string; group: SessionGroupId }`
  - `const SESSION_GROUPS: readonly { id: SessionGroupId; label: string }[]`
  - `const DEFAULT_MODEL: string` = `"GPT-5 Sol"`
  - `const MOCK_SESSIONS: readonly Session[]` (8 entri, 4 `sessions` + 4 `older`)
  - `filterSessions(sessions: readonly Session[], query: string): Session[]`
  - `groupSessions(sessions: readonly Session[]): { id: SessionGroupId; label: string; items: Session[] }[]`
  - `sessionTitleFromPrompt(prompt: string, maxLength?: number): string` — default `48`
  - `formatUpdatedAt(iso: string, now?: Date): string`
  - `newSession(id: string, now?: Date): Session`

- [ ] **Step 1: Tulis test yang gagal**

`src/features/home/sessions.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_MODEL,
  MOCK_SESSIONS,
  filterSessions,
  formatUpdatedAt,
  groupSessions,
  newSession,
  sessionTitleFromPrompt,
} from "./sessions.ts";

test("filter matches title, branch, and model case-insensitively", () => {
  const sessions = MOCK_SESSIONS;
  assert.ok(filterSessions(sessions, "provider").length >= 1);
  assert.ok(filterSessions(sessions, "FEAT/SETTINGS").length >= 1);
  assert.ok(filterSessions(sessions, "claude").length >= 1);
  assert.equal(filterSessions(sessions, "").length, sessions.length);
  assert.equal(filterSessions(sessions, "   ").length, sessions.length);
  assert.equal(filterSessions(sessions, "zzz-no-match").length, 0);
});

test("groups keep Sessions before Older and label them", () => {
  const groups = groupSessions(MOCK_SESSIONS);
  assert.deepEqual(groups.map((group) => group.id), ["sessions", "older"]);
  assert.deepEqual(groups.map((group) => group.label), ["Sessions", "Older"]);
  assert.ok(groups.every((group) => group.items.length > 0));
  assert.equal(groups.flatMap((group) => group.items).length, MOCK_SESSIONS.length);
});

test("groups drop empty sections", () => {
  const groups = groupSessions(MOCK_SESSIONS.filter((session) => session.group === "older"));
  assert.deepEqual(groups.map((group) => group.id), ["older"]);
});

test("session titles collapse whitespace and truncate at 48 characters", () => {
  assert.equal(sessionTitleFromPrompt("  Fix   the  composer  "), "Fix the composer");
  const long = "a".repeat(80);
  const title = sessionTitleFromPrompt(long);
  assert.equal(title.length, 48);
  assert.ok(title.endsWith("…"));
  assert.equal(sessionTitleFromPrompt("   "), "New session");
  assert.equal(sessionTitleFromPrompt("Short prompt"), "Short prompt");
});

test("updated dates show the month and day, with the year when it differs", () => {
  const now = new Date("2026-11-10T09:00:00Z");
  assert.equal(formatUpdatedAt("2026-11-09T12:00:00Z", now), "Nov 9");
  assert.equal(formatUpdatedAt("2025-12-31T12:00:00Z", now), "Dec 31, 2025");
});

test("newSession starts in the Sessions group with the default model", () => {
  const session = newSession("session-1", new Date("2026-11-10T09:00:00Z"));
  assert.deepEqual(session, {
    id: "session-1",
    title: "New session",
    branch: "main",
    model: DEFAULT_MODEL,
    updatedAt: "2026-11-10T09:00:00.000Z",
    group: "sessions",
  });
});
```

- [ ] **Step 2: Perbarui skrip test supaya file baru ikut jalan**

`package.json`: `"test": "node --test src/features/onboarding/*.test.mjs src/features/home/*.test.mjs src/shared/*.test.mjs"`.

Run: `pnpm test`
Expected: FAIL — `Cannot find module .../sessions.ts` (belum ada).

- [ ] **Step 3: Implementasikan `src/features/home/sessions.ts`**

Delapan fixture dengan `id` stabil (`session-1` … `session-8`):

| id | title | branch | model | updatedAt | group |
| --- | --- | --- | --- | --- | --- |
| session-1 | Plan the desktop chat shell | main | GPT-5 Sol | 2026-11-09T09:00:00Z | sessions |
| session-2 | Wire the model provider bridge | main | GPT-5.1 Luna | 2026-11-08T15:30:00Z | sessions |
| session-3 | Review the onboarding hero copy | feat/onboarding | Claude Sonnet 4.5 | 2026-11-06T11:00:00Z | sessions |
| session-4 | Store conversation history locally | main | GPT-5 Sol | 2026-11-03T08:15:00Z | sessions |
| session-5 | Sketch the settings surface | feat/settings | GPT-5.1 Luna | 2026-10-28T17:45:00Z | older |
| session-6 | Measure cold-start time | main | GPT-5 Sol | 2026-10-21T10:20:00Z | older |
| session-7 | Draft the shortcut map | docs/shortcuts | Claude Sonnet 4.5 | 2026-10-11T14:05:00Z | older |
| session-8 | Summarise the rename decision | main | GPT-5.1 Luna | 2026-09-30T19:40:00Z | older |

`filterSessions` memakai `query.trim().toLowerCase()` dan mencocokkan `title`, `branch`, `model`. `groupSessions` memetakan `SESSION_GROUPS` berurutan, membuang grup kosong, dan tidak mengurutkan ulang item (urutan fixture dipertahankan). `sessionTitleFromPrompt` merapikan spasi (`replace(/\s+/g, " ").trim()`), mengembalikan `"New session"` bila kosong, dan memotong ke `${slice(0, maxLength - 1).trimEnd()}…`. `formatUpdatedAt` memakai `Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", ...(beda tahun ? { year: "numeric" } : {}) })` dengan `timeZone: "UTC"`.

- [ ] **Step 4: Jalankan test sampai hijau**

Run: `pnpm test`
Expected: PASS — 14 test onboarding + 6 test home.

- [ ] **Step 5: Commit**

```bash
git add package.json src/features/home/sessions.ts src/features/home/sessions.test.mjs
git commit -m "feat(home): add session fixtures and pure list helpers"
```

---

### Task 2: Hook tema bersama

**Files:**
- Create: `src/shared/theme.ts` (bagian murni, bisa diimpor Node)
- Create: `src/shared/use-theme.ts` (hook React + Tauri)
- Test: `src/shared/theme.test.mjs`
- Modify: `src/features/onboarding/Onboarding.tsx:1-60,100-110`

**Interfaces:**
- Produces:
  - `type AppTheme = "light" | "dark"` (dari `theme.ts`)
  - `const THEME_STORAGE_KEY = "opencore-theme"` (dari `theme.ts`)
  - `resolveInitialTheme(stored: string | null, prefersDark: boolean): AppTheme` (dari `theme.ts`)
  - `useTheme(): { theme: AppTheme; toggleTheme: () => void }` (dari `use-theme.ts`)

- [ ] **Step 1: Tulis test yang gagal**

`src/shared/theme.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";

import { resolveInitialTheme } from "./theme.ts";

test("a stored theme wins over the system preference", () => {
  assert.equal(resolveInitialTheme("light", true), "light");
  assert.equal(resolveInitialTheme("dark", false), "dark");
});

test("with nothing stored the system preference decides", () => {
  assert.equal(resolveInitialTheme(null, true), "dark");
  assert.equal(resolveInitialTheme(null, false), "light");
});

test("an unknown stored value falls back to the system preference", () => {
  assert.equal(resolveInitialTheme("sepia", true), "dark");
  assert.equal(resolveInitialTheme("", false), "light");
});
```

- [ ] **Step 2: Jalankan untuk melihat gagal**

Run: `pnpm test`
Expected: FAIL — modul `./use-theme.ts` tidak ditemukan.

- [ ] **Step 3: Implementasikan hook**

`src/shared/theme.ts` hanya berisi `AppTheme`, `THEME_STORAGE_KEY`, `SURFACE_COLORS`, dan `resolveInitialTheme` — tanpa import React atau Tauri, supaya bisa dijalankan `node --test`.

`src/shared/use-theme.ts` memindahkan logika dari `src/features/onboarding/Onboarding.tsx:9-45`: `syncNativeTheme` (guard `"__TAURI_INTERNALS__" in window`), `setBrowserThemeColor`, `useState<AppTheme>` yang diinisialisasi `resolveInitialTheme(window.localStorage.getItem(THEME_STORAGE_KEY), window.matchMedia("(prefers-color-scheme: dark)").matches)`, dan `useEffect` yang menulis `documentElement.dataset.theme`, `style.colorScheme`, `localStorage`, meta `theme-color`, serta memanggil `syncNativeTheme`. `toggleTheme` membalik nilai.

Jangan sentuh `window` di top-level modul; hanya di dalam hook/fungsi.

- [ ] **Step 4: Pakai hook di onboarding**

Di `Onboarding.tsx`: hapus state tema lokal, `getInitialTheme`, `syncNativeTheme`, `setBrowserThemeColor`, `SURFACE_COLORS`, `THEME_STORAGE_KEY`; ganti dengan `const { theme, toggleTheme } = useTheme();`. Pertahankan `export type OnboardingTheme = AppTheme;` agar `HeroStage`/`SharkOcean` tidak berubah. Hapus import yang jadi tidak terpakai (ingat `noUnusedLocals`).

- [ ] **Step 5: Verifikasi**

Run: `pnpm build && pnpm test`
Expected: build bersih, 14 + 6 + 3 test PASS.

Manual: `pnpm dev`, buka `http://localhost:1420`, klik toggle `LIGHT`/`DARK`; reload — pilihan bertahan; hapus `localStorage["opencore-theme"]`, set OS gelap, reload — layar gelap.

- [ ] **Step 6: Commit**

```bash
git add src/shared/theme.ts src/shared/use-theme.ts src/shared/theme.test.mjs src/features/onboarding/Onboarding.tsx
git commit -m "refactor(theme): share theme state between screens"
```

---

### Task 3: Shell, topbar, hero, dan status

**Files:**
- Create: `src/features/home/home.css`
- Create: `src/features/home/Home.tsx`
- Create: `src/features/home/index.ts`
- Create: `src/features/home/components/HomeTopbar.tsx`
- Create: `src/features/home/components/HomeSidebar.tsx`
- Create: `src/features/home/components/HeroBackdrop.tsx`
- Create: `src/features/home/components/HomeStatus.tsx`
- Create: `src/features/home/components/icons.tsx`

**Interfaces:**
- Consumes: `useTheme` (T2), `MOCK_SESSIONS`, `Session` (T1).
- Produces:
  - `Home({ onReplayIntro }: { onReplayIntro?: () => void })` — ekspor default. Prop `onSubmitPrompt` ditambahkan di T5.
  - `HomeTopbar({ title, diff, onNewSession, onToggleSidebar }: { title: string; diff: { added: number; removed: number }; onNewSession: () => void; onToggleSidebar: () => void })`
  - `HomeSidebar({ onReplayIntro }: { onReplayIntro?: () => void })` — isi sesi menyusul di T4.
  - `HeroBackdrop()`, `HomeStatus({ branch }: { branch: string })`
  - `icons.tsx` mengekspor komponen `SearchIcon`, `InboxIcon`, `NoteIcon`, `AutomationsIcon`, `PlusIcon`, `FilterIcon`, `ChevronDownIcon`, `BranchIcon`, `ArrowUpIcon`, `ArrowLeftIcon`, `ArrowRightIcon`, `PanelIcon`, `CheckoutIcon` — semuanya `(props: { className?: string }) => JSX.Element`, SVG 16×16, `fill="none"`, `stroke="currentColor"`, `strokeWidth={1.5}`.

- [ ] **Step 1: Tulis `home.css`**

Token dan aturan inti (nilai spasi boleh disesuaikan pelaksana):

```css
.home-shell { --home-sidebar: 240px; --home-composer: 720px;
  display: grid; grid-template-columns: var(--home-sidebar) minmax(0, 1fr);
  width: 100%; height: 100dvh; overflow: hidden;
  background: var(--page); color: var(--text-primary);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
.home-sidebar { display: flex; flex-direction: column; min-height: 0;
  background: var(--surface); border-right: 1px solid var(--border); }
.home-main { position: relative; display: flex; flex-direction: column; min-width: 0; }
.home-topbar { display: flex; align-items: center; gap: 10px; height: 48px;
  padding: 0 14px; border-bottom: 1px solid var(--border); background: var(--surface); }
.home-stage { position: relative; display: flex; flex: 1; min-height: 0;
  flex-direction: column; align-items: center; justify-content: center;
  padding: 24px; text-align: center; isolation: isolate; }
.home-hero { position: absolute; z-index: -1; inset: 0;
  background-color: var(--page);
  background-image: radial-gradient(var(--border-visible) 0.65px, transparent 0.65px);
  background-size: 18px 18px; }
.home-hero-glow { position: absolute; inset: 0;
  background:
    radial-gradient(60% 55% at 50% 38%, color-mix(in srgb, var(--accent) 7%, transparent), transparent 70%),
    radial-gradient(90% 80% at 50% 100%, color-mix(in srgb, var(--accent) 3%, transparent), transparent 75%);
  }
.home-hero-vignette { position: absolute; inset: 0;
  background: linear-gradient(to bottom, color-mix(in srgb, var(--page) 55%, transparent), transparent 30%, transparent 60%, var(--page)); }
```

Plus kelas untuk: `.home-brand` (mono 12px, jarak 0.13em, `--text-display`, tanda `/` berwarna `--accent`), `.home-nav-item` (tinggi 34px, radius 6px, ikon 16px, label 13px, hover `--surface-raised`, `:focus-visible` outline `--accent`), `.home-section-label` (mono 10px, `--text-secondary`, tracking 0.1em), `.home-session-row` (padding 8px 10px, radius 8px, baris 1 judul 13px `--text-primary` truncate, baris 2 meta 11px `--text-secondary`), `.home-session-row[data-active="true"]` (`background: var(--surface-raised)` + `box-shadow: inset 2px 0 0 var(--accent)`), `.home-title` (`clamp(22px, 2.2vw, 28px)`, weight 500, `--text-display`, letter-spacing `-0.02em`), `.home-status` (mono 10px `--text-secondary`, tiap chip tinggi 26px, radius 6px, border `--border`).

Hero memakai `--home-hero-image` bila ada:

```css
.home-hero[data-image="true"] {
  background-image: var(--home-hero-image);
  background-size: cover; background-position: center;
}
.home-hero-scrim { position: absolute; inset: 0;
  background: color-mix(in srgb, var(--page) 72%, transparent); }
```

Tambahkan blok `@media (prefers-reduced-motion: reduce)` yang mematikan `transition-duration`/`animation-duration` untuk `.home-shell *`.

- [ ] **Step 2: Tulis ikon**

`icons.tsx`: satu komponen per ikon, semua menerima `{ className?: string }`, `aria-hidden="true"`, `focusable="false"`, `width={16} height={16}`. Bentuk: search = lingkaran + garis; inbox = kotak dengan garis masuk; note = persegi dengan lipatan sudut; automations = kilat; plus = dua garis; filter = corong; chevron = sudut; branch = dua titik + garis bercabang; arrow-up = panah; arrow-left/right; panel = persegi dengan garis kiri; checkout = laptop kecil.

- [ ] **Step 3: Tulis komponen**

- `HeroBackdrop`: `<div className="home-hero" aria-hidden="true">` berisi `.home-hero-glow`, `.home-hero-vignette`; set `data-image` bila `getComputedStyle` menemukan `--home-hero-image` — cukup render scrim selalu, tanpa JS.
- `HomeStatus`: `<div className="home-status"><span><CheckoutIcon /> Current checkout</span><span><BranchIcon /> {branch}</span></div>`.
- `HomeTopbar`: tombol `‹`/`›` (disabled, `aria-label`), breadcrumb dengan titik `--accent` + `title`, tombol `+` (`aria-label="New session"`), spacer, diff `+12` (`--interactive`) dan `−3` (`--accent`), tombol toggle sidebar (`PanelIcon`, `aria-label="Toggle sidebar"`).
- `HomeSidebar`: brand `/ OPENCORE` + `ChevronDownIcon`; nav Search (dengan `⌘K`), Inbox, Notes, Automations; section header `SESSIONS`; area daftar kosong (diisi T4); footer `REPLAY INTRO` + `MEMORY: MOCK`.
- `Home`: `const { theme, toggleTheme } = useTheme();` (theme dipakai T5 untuk tombol tema; untuk sementara render `null` sebagai `data-theme` tidak diperlukan), state `sessions = MOCK_SESSIONS`, `activeId = sessions[0].id`. Render `.home-shell` → `HomeSidebar` → `.home-main` → `HomeTopbar` (title = sesi aktif) → `.home-stage` (`HeroBackdrop`, `h1` "What should we work on?", slot composer kosong, `HomeStatus branch={active.branch}`).

- [ ] **Step 4: Verifikasi**

Run: `pnpm build`
Expected: bersih. `pnpm dev` menampilkan dua kolom, hero dot-grid dengan glow merah tipis, topbar, judul, dan status baris di light dan dark.

- [ ] **Step 5: Commit**

```bash
git add src/features/home
git commit -m "feat(home): add shell, topbar, hero, and status row"
```

---

### Task 4: Sidebar sesi dan pencarian

**Files:**
- Create: `src/features/home/components/SessionList.tsx`
- Modify: `src/features/home/Home.tsx`
- Modify: `src/features/home/components/HomeSidebar.tsx`
- Modify: `src/features/home/home.css`

**Interfaces:**
- Consumes: `filterSessions`, `groupSessions`, `newSession`, `Session` (T1).
- Produces:
  - `SessionList({ groups, activeId, onSelect, query }: { groups: ReturnType<typeof groupSessions>; activeId: string | null; onSelect: (id: string) => void; query: string })`
  - `HomeSidebar` diperluas: `{ sessions, activeId, query, onQueryChange, onSelectSession, onNewSession, onReplayIntro, searchRef }` dengan `searchRef: React.RefObject<HTMLInputElement | null>`.

- [ ] **Step 1: Tulis `SessionList`**

Grup dirender berurutan; header grup `SESSIONS`/`OLDER` memakai `.home-section-label` dengan tombol filter di grup `older`. Tiap baris: `<button data-active={...} aria-current={active ? "page" : undefined}>` berisi judul + tanggal (kanan), lalu meta `branch` + `model` + titik status `--interactive`. Judul dan meta memakai `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`. Bila `groups.length === 0`: `<p className="home-empty">No sessions match “{query}”.</p>`.

- [ ] **Step 2: Sambungkan pencarian dan pembuatan sesi di `Home`**

State: `sessions: Session[]`, `activeId: string`, `query: string`. Turunan: `groups = groupSessions(filterSessions(sessions, query))`, `active = sessions.find((session) => session.id === activeId) ?? sessions[0]`.

- `onQueryChange` menyimpan query.
- `onNewSession` membuat `newSession(\`session-${Date.now()}\`)`, menaruhnya di depan daftar, dan mengaktifkannya.
- `onSelectSession` hanya mengubah `activeId`.

- [ ] **Step 3: Input pencarian dan pintasan ⌘K**

`HomeSidebar` merender `<input ref={searchRef} type="search" placeholder="Search" aria-label="Search sessions">` di item nav pertama; `⌘K`/`Ctrl+K` di `useEffect` pada `window` memanggil `preventDefault()` lalu `searchRef.current?.focus()` dan `select()`; `Escape` mengembalikan fokus ke `document.body`. Bersihkan listener saat unmount.

- [ ] **Step 4: Verifikasi**

Run: `pnpm build && pnpm test`
Expected: bersih; 23 test PASS.

Manual di `pnpm dev`: ketik `provider` → hanya sesi yang cocok; kosongkan → semua muncul; klik `+` → sesi "New session" di puncak dan aktif; `⌘K` fokus ke input; judul panjang tetap satu baris. Cek di dark dan light.

- [ ] **Step 5: Commit**

```bash
git add src/features/home
git commit -m "feat(home): add session list and search"
```

---

### Task 5: Composer, submit, drawer, dan aksesibilitas

**Files:**
- Create: `src/features/home/components/Composer.tsx`
- Modify: `src/features/home/Home.tsx`
- Modify: `src/features/home/components/HomeTopbar.tsx`
- Modify: `src/features/home/home.css`

**Interfaces:**
- Consumes: `sessionTitleFromPrompt`, `DEFAULT_MODEL`, `Session` (T1).
- Produces:
  - `Composer({ value, onChange, onSubmit, model, mode, disabled }: { value: string; onChange: (value: string) => void; onSubmit: () => void; model: string; mode: string; disabled?: boolean })`
  - `HomeTopbar` diperluas dengan `{ theme, onToggleTheme, sidebarOpen }`.

- [ ] **Step 1: Tulis `Composer`**

Struktur: `.home-composer` (glass: `background: var(--glass-fill)`, `border: 1px solid var(--glass-border)`, `border-radius: 16px`, `box-shadow: var(--glass-shadow)`, `backdrop-filter: blur(14px) saturate(1.15)`, `width: min(100%, var(--home-composer))`, `text-align: left`). Di dalamnya `<textarea rows={1}>` yang tumbuh sampai 160px (`onInput` mengatur `style.height`), placeholder `Ask, build, or describe a change…`, `aria-label="Prompt"`. Baris aksi: tombol `+` (`aria-label="Add context"`, nonaktif), pill model (`● {model}` + `ChevronDownIcon`), pill mode (`{mode}` = `"Supervised"`), spacer, tombol submit bulat 32px (`aria-label="Send prompt"`, `disabled={disabled}`, latar `var(--text-display)`, warna `var(--page)`, hover `var(--accent)` + putih, `ArrowUpIcon`).

Keyboard: `Enter` tanpa `Shift` → `preventDefault()` + `onSubmit()` bila tidak kosong; `Shift+Enter` default.

- [ ] **Step 2: Sambungkan submit di `Home`**

`drafts: Record<string, string>`, `draft = drafts[activeId] ?? ""`. `onSubmit`:

```ts
const prompt = draft.trim();
if (!prompt) return;
const title = sessionTitleFromPrompt(prompt);
setSessions((current) => current.map((session) =>
  session.id === activeId ? { ...session, title, updatedAt: new Date().toISOString() } : session));
setDrafts((current) => ({ ...current, [activeId]: "" }));
onSubmitPrompt?.(prompt, { ...active, title });
```

Tombol submit `disabled={draft.trim().length === 0}`.

- [ ] **Step 3: Drawer di bawah 900px dan tombol tema di topbar**

`Home` menyimpan `sidebarOpen` (default `false`, hanya relevan ≤900px) dan meneruskannya. `HomeTopbar`: tombol `PanelIcon` memanggil `onToggleSidebar`; tambahkan tombol tema mono 10px (`LIGHT`/`DARK`) di ujung kanan memakai `theme`/`onToggleTheme` dari `useTheme`.

CSS:

```css
@media (max-width: 900px) {
  .home-shell { grid-template-columns: minmax(0, 1fr); }
  .home-sidebar { position: fixed; z-index: 20; inset: 0 auto 0 0; width: 280px;
    transform: translateX(-100%); transition: transform 200ms var(--ease-out); }
  .home-sidebar[data-open="true"] { transform: translateX(0); box-shadow: var(--glass-shadow); }
  .home-scrim { position: fixed; z-index: 19; inset: 0;
    background: color-mix(in srgb, var(--page) 55%, transparent);
    backdrop-filter: blur(2px); }
}
@media (min-width: 901px) { .home-scrim, .home-sidebar-toggle { display: none; } }
@media (max-width: 640px) {
  .home-stage { padding: 16px 14px; }
  .home-composer-mode { display: none; }
}
```

Klik scrim atau `Escape` menutup drawer. Pada `>900px`, `sidebarOpen` diabaikan (`data-open` selalu `"true"` lewat `matchMedia` atau cukup CSS default).

- [ ] **Step 4: Audit aksesibilitas**

- Semua tombol ikon punya `aria-label`; nav memakai `<nav aria-label="Primary">`; daftar sesi `<nav aria-label="Sessions">`.
- `:focus-visible` memakai `outline: 2px solid var(--accent); outline-offset: 2px` untuk semua kontrol di `.home-shell`.
- `aria-live="polite"` pada judul sesi aktif di topbar? Tidak perlu; cukup `title` atribut.
- `prefers-reduced-motion` mematikan transisi drawer.

- [ ] **Step 5: Audit warna dan ukuran**

Run: `grep -nE "#[0-9a-fA-F]{3,8}|rgba?\\(" src/features/home/home.css`
Expected: tidak ada hasil (semua warna dari token; `color-mix` boleh).

Manual: 1180×760, 900×640, 800×600 — sidebar jadi drawer yang bisa dibuka/tutup, topbar tidak bertumpuk, composer muat, teks glass terbaca di light dan dark.

- [ ] **Step 6: Commit**

```bash
git add src/features/home
git commit -m "feat(home): add composer, submit flow, and responsive drawer"
```

---

### Task 6: Integrasi aplikasi

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/features/onboarding/Onboarding.tsx:117-136`
- Modify: `src-tauri/tauri.conf.json:18-21`
- Modify: `README.md` (bagian "Yang ada sekarang")

**Interfaces:**
- Consumes: `Home` (T3–T5).
- Produces: `Onboarding({ onEnterWorkspace }: { onEnterWorkspace?: () => void })`; `App` merender `home` bila `localStorage["opencore-onboarded"] === "1"`.

- [ ] **Step 1: Tambah prop onboarding**

`Onboarding.tsx`: tambahkan `onEnterWorkspace?: () => void` ke props; tombol `ENTER WORKSPACE` memanggilnya dan `title` lama dihapus.

- [ ] **Step 2: Ganti isi `App.tsx`**

```tsx
import { useState } from "react";

import Onboarding from "./features/onboarding/Onboarding";
import Home from "./features/home";
import "./App.css";

const ONBOARDED_KEY = "opencore-onboarded";

type Screen = "onboarding" | "home";

function initialScreen(): Screen {
  return window.localStorage.getItem(ONBOARDED_KEY) === "1" ? "home" : "onboarding";
}

function App() {
  const [screen, setScreen] = useState<Screen>(initialScreen);

  function enterWorkspace() {
    window.localStorage.setItem(ONBOARDED_KEY, "1");
    setScreen("home");
  }

  function replayIntro() {
    window.localStorage.removeItem(ONBOARDED_KEY);
    setScreen("onboarding");
  }

  return screen === "home" ? (
    <Home onReplayIntro={replayIntro} />
  ) : (
    <Onboarding onEnterWorkspace={enterWorkspace} />
  );
}

export default App;
```

- [ ] **Step 3: Ukuran jendela**

`src-tauri/tauri.conf.json`: `width: 1180`, `height: 760`, tambah `"minWidth": 900, "minHeight": 600`.

- [ ] **Step 4: Dokumentasi**

`README.md`, bagian "Yang ada sekarang": tambah satu baris — layar `home` dengan sidebar sesi mock, composer, dan hero; onboarding tampil sekali, bisa diputar ulang dari sidebar. Jangan hapus kalimat tentang hero laut.

- [ ] **Step 5: Verifikasi**

Run: `pnpm build && pnpm test`
Expected: bersih; 23 test PASS.

Manual: `pnpm tauri dev` (atau `pnpm dev` di browser) — mulai di onboarding, tekan `ENTER WORKSPACE` → home; reload → langsung home; `REPLAY INTRO` → onboarding lagi; reload → onboarding. Tema ikut pilihan terakhir. Jendela 900×600 minimum tidak memotong composer.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/features/onboarding/Onboarding.tsx src-tauri/tauri.conf.json README.md
git commit -m "feat(app): open home after onboarding"
```
