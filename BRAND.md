# animorize — brand guide

> Final visual identity and design language for the Animorize app.
> Source of truth for every UI, logo variant, marketing asset, and visual decision.
> v1.1 · Aug 2026

---

## 1 · Brand concept

**Animorize** = anime + memorize / organize.

A tool for tracking anime, series, movies, OVAs, and specials — replacing the messy Excel spreadsheets fans use to remember what they watched, where they watched it, and which episode they're on.

| Field               | Value                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------- |
| Name (wordmark)     | `animorize` — always lowercase                                                           |
| Name (running text) | `Animorize` — capitalized as a proper noun, sentence case                                |
| Audience            | Anime fans, age 18–35, who watch enough to need organization. People who pay for Notion. |
| Tone                | Quiet, organized, slightly playful. Closer to Notion or Linear than to MyAnimeList.      |
| Don't be            | Crunchyroll, Funimation, anything shouty, anime mascot.                                  |

---

## 2 · Logo

### 2.1 Concept

A wordmark where the dot on the "i" is replaced with a **4-point sparkle** — the visual shorthand for the "shine" in anime eyes and shounen impact frames. Subtle enough to read as professional, unmistakable to anyone familiar with the medium.

```
an i morize
   ↑
  sparkle (not a dot)
```

### 2.2 Construction

- **Wordmark:** all lowercase, weight 500, letter-spacing -0.02em
- **Font:** Inter (final — picked over Geist and DM Sans for breadth of weights and webfont support)
- **Sparkle:** 4-point star, vertical:horizontal ratio **1.6 : 1** (taller than wide)
- **Sparkle position:** centered above the stem of the "i", where the dot would be
- **Sparkle size:** width ≈ **1.6×** the stem width of the "i" (≈ `0.42em` height when set inline)

### 2.3 Sparkle SVG path

ViewBox `0 0 100 160`. Four points connected by concave cubic-bezier curves toward the center:

```svg
<svg viewBox="0 0 100 160">
  <path d="M 50 0 C 50 60, 55 75, 100 80
            C 55 85, 50 100, 50 160
            C 50 100, 45 85, 0 80
            C 45 75, 50 60, 50 0 Z"
        fill="#D4537E" />
</svg>
```

### 2.4 Inline wordmark technique

Render the "i" as the dotless U+0131 character (`ı`) and absolutely position the sparkle SVG above it. This keeps placement perfect at any size and survives font fallback.

```html
<span class="wordmark"
  >an<span class="i-slot">ı<svg class="sparkle">…</svg></span>morize</span
>
```

```css
.wordmark {
  font: 500 56px/1 "Inter";
  letter-spacing: -0.02em;
}
.wordmark .i-slot {
  position: relative;
  display: inline-block;
}
.wordmark .sparkle {
  position: absolute;
  left: 50%;
  bottom: 0.72em;
  transform: translateX(-50%);
  height: 0.42em;
  width: auto;
}
```

### 2.5 Variants

1. **Horizontal wordmark** — primary. Headers, marketing, footers.
2. **Stacked** — square spaces, social avatars, app stores. Icon above, wordmark below, 16px gap.
3. **Icon only** — favicon, app icon, tight spaces. Sparkle on a dark rounded square.
4. **Monogram** — single `a` + small sparkle in the upper-right, on a dark rounded square. Alternative app icon.

### 2.6 Color treatments

| Treatment           | Background | Wordmark/stem                         | Sparkle |
| ------------------- | ---------- | ------------------------------------- | ------- |
| **Primary (light)** | paper      | ink                                   | accent  |
| **Primary (dark)**  | ink        | paper                                 | accent  |
| Mono dark           | ink        | paper                                 | paper   |
| Mono light          | paper      | ink                                   | ink     |
| Accent fill         | accent     | paper                                 | paper   |
| Outline             | paper      | ink (1.5px stroked, transparent fill) | ink     |

### 2.7 Clear space

Minimum padding around the logo on all sides = the **height of the sparkle** (X). Never let other elements enter this zone.

### 2.8 Don'ts

- Don't rotate, skew, or tilt.
- Don't stretch horizontally or vertically.
- Don't change the sparkle color to anything other than `#D4537E` or a monochrome treatment.
- Don't remove the sparkle and use a regular dot.
- Don't add gradients, shadows, glows, or outlines beyond the variants above.
- Don't place over busy photographs without a solid backing.
- Don't use mixed case — always lowercase wordmark.

---

## 3 · Color palette

Minimal 2-color brand system. Status colors live in the UI layer (Section 7).

### 3.1 Brand colors

| Token             | Hex       | Usage                                                      |
| ----------------- | --------- | ---------------------------------------------------------- |
| `color-ink`       | `#0F0F0F` | Primary text, logo on dark, icons                          |
| `color-ink-2`     | `#1A1A1A` | Page background (dark mode)                                |
| `color-soft-dark` | `#222222` | Surface (dark mode)                                        |
| `color-paper`     | `#FFFFFF` | Page background (light mode)                               |
| `color-soft`      | `#F5F4EF` | Surface, cards, secondary background (light mode)          |
| `color-accent`    | `#D4537E` | **Sparkle only.** Favorites, brand presence. Nothing else. |

### 3.2 Accent rule

The pink accent `#D4537E` is the _only_ chromatic color in the brand. It signals: favorites, sparkle, brand presence. It does **not** signal: primary buttons, links, errors, hover states, focus rings, success, anything routine. **Save it.**

### 3.3 Semantic colors — light mode

| Token            | Value                 | Where it lives                                                      |
| ---------------- | --------------------- | ------------------------------------------------------------------- |
| `bg-page`        | `#FFFFFF`             | `<html>` and `<body>`                                               |
| `bg-surface`     | `#F5F4EF`             | Popover item hover, Card `surface` variant, sidebar, inset surfaces |
| `bg-surface-2`   | `#EEEDE7`             | Progress track, skeleton base, table stripes                        |
| `bg-overlay`     | `rgba(15,15,15,0.50)` | Modal backdrop                                                      |
| `text-primary`   | `#0F0F0F`             | Body, headings                                                      |
| `text-secondary` | `rgba(15,15,15,0.65)` | Descriptions, captions                                              |
| `text-tertiary`  | `rgba(15,15,15,0.45)` | Meta, labels, placeholders                                          |
| `text-disabled`  | `rgba(15,15,15,0.25)` | Disabled controls                                                   |
| `text-inverse`   | `#FFFFFF`             | Text on primary buttons / ink surfaces                              |
| `border-subtle`  | `rgba(0,0,0,0.06)`    | Dividers between rows                                               |
| `border-default` | `rgba(0,0,0,0.08)`    | Default 0.5px hairline (cards, inputs, all surfaces)                |
| `border-strong`  | `rgba(0,0,0,0.16)`    | Hover state, secondary button outline                               |
| `border-focus`   | `rgba(15,15,15,0.55)` | Focus rings                                                         |

### 3.4 Provider colors

Provider brand colors (Crunchyroll-orange, Netflix-red, etc.) are **allowed only as a small swatch** (max 8×8px) inside a provider badge. Never as a fill, never as a background of anything larger than the badge swatch.

Reference values (used as data, not as design tokens):

```
crunchyroll  #F47521
netflix      #E50914
bilibili     #00A1D6
disney+      #113CCF
prime video  #00A8E1
hidive       #00B4D8
```

---

## 4 · Dark mode

Dark mode is **required**, with **1 : 1 parity** for every component. Toggled via `[data-theme="dark"]` on the `<html>` element.

### 4.1 Dark mode color mappings

| Token               | Light                 | Dark                     |
| ------------------- | --------------------- | ------------------------ |
| `bg-page`           | `#FFFFFF`             | `#1A1A1A`                |
| `bg-surface`        | `#F5F4EF`             | `#222222`                |
| `bg-surface-2`      | `#EEEDE7`             | `#2A2A2A`                |
| `bg-overlay`        | `rgba(15,15,15,0.50)` | `rgba(0,0,0,0.60)`       |
| `bg-skeleton`       | `rgba(15,15,15,0.06)` | `rgba(255,255,255,0.05)` |
| `bg-skeleton-2`     | `rgba(15,15,15,0.10)` | `rgba(255,255,255,0.09)` |
| `text-primary`      | `#0F0F0F`             | `#F5F4EF`                |
| `text-secondary`    | `rgba(15,15,15,0.65)` | `rgba(245,244,239,0.65)` |
| `text-tertiary`     | `rgba(15,15,15,0.45)` | `rgba(245,244,239,0.45)` |
| `text-disabled`     | `rgba(15,15,15,0.25)` | `rgba(245,244,239,0.25)` |
| `text-inverse`      | `#FFFFFF`             | `#0F0F0F`                |
| `border-subtle`     | `rgba(0,0,0,0.06)`    | `rgba(255,255,255,0.06)` |
| `border-default`    | `rgba(0,0,0,0.08)`    | `rgba(255,255,255,0.10)` |
| `border-strong`     | `rgba(0,0,0,0.16)`    | `rgba(255,255,255,0.18)` |
| `border-focus`      | `rgba(15,15,15,0.55)` | `rgba(245,244,239,0.55)` |
| `status-success`    | `#2F8A5C`             | `#4FB07F`                |
| `status-success-bg` | `#E8F2EC`             | `rgba(79,176,127,0.14)`  |
| `status-warning`    | `#B45309`             | `#D7873A`                |
| `status-warning-bg` | `#FBF1E5`             | `rgba(215,135,58,0.14)`  |
| `status-error`      | `#C53030`             | `#E25555`                |
| `status-error-bg`   | `#FBE9E9`             | `rgba(226,85,85,0.14)`   |
| `status-info`       | `#1F6FEB`             | `#5589F0`                |
| `status-info-bg`    | `#E8EFFC`             | `rgba(85,137,240,0.14)`  |

### 4.2 What stays the same across modes

- `color-accent` (`#D4537E`) — identical pink in light and dark
- Sparkle SVG — same shape, same color, both modes
- Provider colors — identical hexes
- All radii, spacing, type sizes, motion timings

### 4.3 What's different

- Primary button: `ink` in light → `paper` in dark (inverted high-contrast)
- Icons inherit `text-primary`, so they flip color automatically
- Status backgrounds shift from solid pastels to semi-transparent overlays so they don't blow out against `#1A1A1A`

---

## 5 · Typography

### 5.1 Family

**Inter** — final choice. One family across the entire surface, both the wordmark and the UI. Weights **400** and **500** only. No 700, no italic, no display face.

```css
font-family:
  "Inter",
  ui-sans-serif,
  system-ui,
  -apple-system,
  sans-serif;
```

### 5.2 Type scale

| Token           | Size     | Line-height | Weight | Letter-spacing | Use                            |
| --------------- | -------- | ----------- | ------ | -------------- | ------------------------------ |
| `font-size-5xl` | **40px** | 1.05        | 500    | -0.025em       | Marketing hero h1, page heroes |
| `font-size-4xl` | **32px** | 1.1         | 500    | -0.02em        | Page titles (h1 in app)        |
| `font-size-3xl` | **24px** | 1.2         | 500    | -0.015em       | Section titles (h2)            |
| `font-size-2xl` | **20px** | 1.25        | 500    | -0.01em        | Subsection (h3)                |
| `font-size-xl`  | **17px** | 1.3         | 500    | -0.005em       | Card titles, modal titles (h4) |
| `font-size-lg`  | **15px** | 1.55        | 400    | 0              | Long-form body, modal body     |
| `font-size-md`  | **14px** | 1.6         | 400    | 0              | Default body, descriptions     |
| `font-size-sm`  | **13px** | 1.4         | 500    | 0              | UI labels, tabs, button text   |
| `font-size-xs`  | **12px** | 1.4         | 400    | 0              | Meta, captions, hints          |

### 5.3 Case

- **Sentence case** for everything: headings, labels, buttons.
- Never **Title Case**. Never **ALL CAPS** (except small monospaced section anchors like `01 / 06`).
- The brand should feel like a quiet notebook, not a billboard.

### 5.4 Special-purpose

- **Monospace** (`ui-monospace, monospace`) — section anchors, URLs in tables, IDs, code samples, the "fake spreadsheet" comparison.
- **Tabular numerals** (`font-feature-settings: "tnum"`) — episode counts, IDs, timestamps. Anywhere numbers need to align vertically.

---

## 6 · Spacing

8px base unit. **Stick to the scale.** No half-steps, no 10px, no 18px.

| Token      | Value    |
| ---------- | -------- |
| `space-1`  | **4px**  |
| `space-2`  | **8px**  |
| `space-3`  | **12px** |
| `space-4`  | **16px** |
| `space-6`  | **24px** |
| `space-8`  | **32px** |
| `space-12` | **48px** |
| `space-16` | **64px** |

Marketing sections use **96px** vertical padding (3× `space-8`). App page padding is `space-6` × `space-8`.

---

## 7 · Status colors

Status colors live in the **UI layer**, not the brand layer. They communicate state, never identity.

| Status  | FG (light) | BG (light) | FG (dark) | BG (dark)               |
| ------- | ---------- | ---------- | --------- | ----------------------- |
| Success | `#2F8A5C`  | `#E8F2EC`  | `#4FB07F` | `rgba(79,176,127,0.14)` |
| Warning | `#B45309`  | `#FBF1E5`  | `#D7873A` | `rgba(215,135,58,0.14)` |
| Error   | `#C53030`  | `#FBE9E9`  | `#E25555` | `rgba(226,85,85,0.14)`  |
| Info    | `#1F6FEB`  | `#E8EFFC`  | `#5589F0` | `rgba(85,137,240,0.14)` |

**Usage:** Badges (`watching` = success, `dropped` = error), Toasts, form-field errors, sync-log rows. Never use these colors for branding, links, or buttons.

---

## 8 · Borders & corners

### 8.1 Border widths

| Token           | Value     | Use                                                        |
| --------------- | --------- | ---------------------------------------------------------- |
| `border-w-hair` | **0.5px** | Default for all surfaces (cards, inputs, tables, dividers) |
| `border-w-1`    | **1px**   | Secondary-button outline emphasis                          |
| `border-w-icon` | **1.5px** | Outline icon stroke                                        |

### 8.2 Radii

| Token             | Value     | Use                                          |
| ----------------- | --------- | -------------------------------------------- |
| `radius-input`    | **8px**   | Inputs, selects, textareas                   |
| `radius-button`   | **8px**   | All buttons                                  |
| `radius-card`     | **12px**  | Cards, popovers, library tiles               |
| `radius-modal`    | **16px**  | Modals                                       |
| `radius-pill`     | **999px** | Badges, theme toggle, avatar, progress track |
| `radius-app-icon` | **18%**   | iOS-style app icon                           |

### 8.3 Shadows: none

There are no shadows in the brand. Anywhere. Use border-color shifts and background tints for hover and focus states.

### 8.4 Gradients: none

No mesh gradients, no linear gradients in UI. The one exception is the dark overlay on poster tiles where a `linear-gradient(180deg, transparent, rgba(0,0,0,0.55))` is used to ensure title text is readable over the solid color tile.

---

## 9 · Iconography

- **Lucide** or Tabler style. Outline only. **1.5px stroke.**
- 24×24 viewBox. Stroke = `currentColor` (inherits from text color).
- **Filled icons exist only as state changes:** favorited star, completed checkmark. Never mix outline and filled glyphs in the same surface.
- The sparkle is **not a generic icon** — it is brand. Use it for favorites, brand presence, and the rare "sparkle moment" only.

---

## 10 · Component specs

Each component below uses the tokens above. Heights, paddings, and radii are exact — they map to the implemented components in `ds/components.jsx`.

### 10.1 Button

| Variant       | Background     | Border                | Text           | Use                                     |
| ------------- | -------------- | --------------------- | -------------- | --------------------------------------- |
| `primary`     | `text-primary` | none                  | `text-inverse` | Main action (Add, Save, Start tracking) |
| `secondary`   | `bg-page`      | `0.5px border-strong` | `text-primary` | Cancel, alt action                      |
| `ghost`       | transparent    | none                  | `text-primary` | Tertiary action, icon buttons           |
| `destructive` | `bg-page`      | `0.5px border-strong` | `status-error` | Remove, delete                          |

**Never** color a button with `color-accent`. Pink is not for actions.

| Size           | Height | Padding-x | Font-size | Gap | Use                                               |
| -------------- | ------ | --------- | --------- | --- | ------------------------------------------------- |
| `xs`           | 22px   | 8px       | 12px      | 4px | Compact inline (search-result Add, dense actions) |
| `sm`           | 28px   | 10px      | 13px      | 6px | Dense (toolbar, table row, footer, nav)           |
| `md` (default) | 34px   | 14px      | 14px      | 8px | Page-header / standalone primary                  |
| `lg`           | 42px   | 18px      | 15px      | 8px | Hero / marketing                                  |
| Marketing hero | 44px   | 20px      | 15px      | 8px | Landing page only                                 |

- **Radius:** 8px (button), 10px (marketing hero only)
- **Hairline:** 0.5px on `secondary` / `destructive`. Primary has no border.
- **Icon-only:** square; width = height.
- **Focus:** 2px outline using `border-focus` with 2px offset.
- **Icons:** use `<Icon>` wrapper, default `size={15}` (xs = 12). Icon is the first child; gap comes from size token.

### 10.2 Input / Select / Textarea / Search

| Property             | Value                                     |
| -------------------- | ----------------------------------------- |
| Height (text/select) | **36px**                                  |
| Padding-x            | **12px**                                  |
| Background           | `bg-page`                                 |
| Border               | `0.5px solid border-default`              |
| Hover border         | `border-strong`                           |
| Focus border         | `text-primary` (single hairline, no ring) |
| Error border         | `status-error`                            |
| Radius               | **8px**                                   |
| Font-size            | **14px**                                  |
| Placeholder color    | `text-tertiary`                           |
| Textarea padding     | `10px 12px`, min-height 64px              |
| Field label          | 13px / 500 / `text-secondary`             |
| Field hint           | 12px / 400 / `text-tertiary`              |

### 10.3 Card

| Property            | Value                                                   |
| ------------------- | ------------------------------------------------------- |
| Background          | `bg-page` (default) or `bg-surface` (`surface` variant) |
| Border              | `0.5px solid border-default`                            |
| Radius              | **12px**                                                |
| Padding             | **16px 20px** (minimum)                                 |
| Hover (interactive) | border → `border-strong`                                |
| Title               | 17px / 500 / `text-primary`                             |
| Body                | 14px / 400 / `text-secondary`, line-height 1.6          |
| Actions row         | 8px gap, top margin 8px                                 |

### 10.4 Media card (library tile)

| Property            | Value                                                                      |
| ------------------- | -------------------------------------------------------------------------- |
| Container border    | `0.5px solid border-default`, radius 12px                                  |
| Poster aspect ratio | **16:10** (compact list view) or **2:3** (detail page poster)              |
| Poster gradient     | bottom 70%, `linear-gradient(180deg, transparent, rgba(0,0,0,0.55))`       |
| Fav button          | absolute, 8/8 top-right, 26×26 circle, `rgba(15,15,15,0.55)` bg            |
| +1 ep button        | absolute, 8/8 bottom-right, 24px height, `rgba(255,255,255,0.95)` bg, pill |
| Meta padding        | `10px 12px 12px`                                                           |
| Title (meta)        | 14px / 500, truncated single line                                          |
| Provider badge      | inline, swatch only                                                        |
| Progress bar        | 3px, `bg-surface-2` track, `text-primary` fill                             |

### 10.5 Badge

| Property  | Value                                                                |
| --------- | -------------------------------------------------------------------- |
| Height    | **20px** (default), **18px** (count)                                 |
| Padding-x | 8px                                                                  |
| Radius    | 999px (pill)                                                         |
| Font-size | 12px                                                                 |
| Weight    | 500                                                                  |
| Border    | `0.5px solid border-default` (default), transparent (status & count) |
| Status BG | `status-{kind}-bg`, text = `status-{kind}`                           |
| Count BG  | `text-primary`, text = `text-inverse`                                |
| Dot       | 6×6 circle, `currentColor`                                           |
| Provider  | swatch 8×8 with 2px radius + plain text; no fill                     |

### 10.6 Avatar

| Size | Diameter | Font-size |
| ---- | -------- | --------- |
| `xs` | 20px     | 10px      |
| `sm` | 28px     | 12px      |
| `md` | 36px     | 13px      |
| `lg` | 48px     | 16px      |

- Background: `bg-surface`. Border: `0.5px solid border-default`. Radius: 999px.
- Initials: up to 2 letters, lowercase, weight 500.
- Stack: each subsequent avatar `margin-left: -8px`.

### 10.7 Tabs

- Underline-on-active style.
- Tab padding: `8px 12px 10px`.
- Active border-bottom: 2px `text-primary`. Inactive: transparent.
- Container border-bottom: `0.5px solid border-default`.
- Tab font: 14px / 500. Inactive color: `text-secondary`. Active: `text-primary`.
- Count suffix: 11px / 400 / `text-tertiary`.

### 10.8 Breadcrumb

- Font: 13px.
- Separator: `chevron-right` icon at 12px, `border-default` color.
- Inactive link: `text-secondary`. Hover: `text-primary`. Current: `text-primary`, weight 500.

### 10.9 Top navigation

- Height: **56px**.
- Background: `bg-page`.
- Border-bottom: `0.5px solid border-default`.
- Padding-x: 24px.
- Logo on left, links center, controls on right.

### 10.10 Modal

| Property   | Value                                                                                                                                                                                                                         |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backdrop   | `bg-overlay` (no blur)                                                                                                                                                                                                        |
| Background | `bg-page`                                                                                                                                                                                                                     |
| Border     | `0.5px solid border-default`                                                                                                                                                                                                  |
| Radius     | **16px**                                                                                                                                                                                                                      |
| Width      | `min(420px, calc(100% - 32px))`                                                                                                                                                                                               |
| Padding    | 24px                                                                                                                                                                                                                          |
| Title      | 17px / 500 / -0.02em                                                                                                                                                                                                          |
| Body       | 14px / 400 / `text-secondary` / 1.6                                                                                                                                                                                           |
| Actions    | right-aligned, 8px gap                                                                                                                                                                                                        |
| Dark       | Background `bg-surface`, border `border-strong` — one step lighter than `bg-page` so the modal stays legible against a near-black backdrop on a near-black page. Not visually testable until dark mode is wired (Phase 5 P6). |

### 10.11 Popover

- Same surface treatment as Card (12px radius, hairline border).
- Padding: 6px container, items 8px 10px.
- Item radius: 6px on hover.
- Hover background: `bg-surface`.
- Divider: 0.5px `border-default`, 4px vertical margin.
- Destructive item color: `status-error`.
- Icon slot: fixed 16px, always rendered even when an item has no icon — keeps labels aligned when a selected row's `check` appears.
- Disabled item: label + reason both `text-secondary`; `align-items: flex-start`; padding-top/bottom intentionally asymmetric (7px/9px, optical correction — do not normalize). No hover.
- Disabled item reason text: 12.5px, `line-snug`, `text-secondary` — hardcoded size straddling `--font-size-xs`/`-sm` by design (same precedent as `.kbd` at 11px).
- Disabled item focus ring: same as an enabled item — disabled items are keyboard-focusable (roving `tabindex`) so their reason is reachable by screen readers; see `DECISIONS.md` §P5 for why this departs from the design bundle.

### 10.12 Toast

| Property          | Value                         |
| ----------------- | ----------------------------- |
| Background        | `bg-page`                     |
| Border            | `0.5px solid border-default`  |
| Radius            | 12px                          |
| Padding           | 12px 14px                     |
| Min width         | 280px                         |
| Max width         | 360px                         |
| Title             | 14px / 500                    |
| Description       | 13px / 400 / `text-secondary` |
| Status icon color | `status-{variant}`            |
| No emoji, ever    |

### 10.13 Progress

- **Smooth bar** (default, when total > 24 or unknown):
  - Track: 4px, `bg-surface-2`, radius 999px.
  - Fill: `text-primary`, transition `width 240ms ease-out`.
- **Ticks** (for OVAs and short series, total ≤ 24):
  - 6px height, 3px gap, each tick `flex: 1`, radius 1px.
- The fill is **never** pink — pink is reserved.

### 10.14 Skeleton

- Animation: pulse 1.6s ease-in-out infinite, between `bg-skeleton` and `bg-skeleton-2`.
- Variants: `text` (12px h), `title` (18px h), `circle` (50% radius), `card` (12px radius).
- Use skeletons for any async block. Never spinners alone.

### 10.15 Empty state

- Illustration: a single outline icon at 22px inside a 56px rounded square (`bg-surface`).
- Title: 15px / 500.
- Body: 14px / 400 / `text-secondary`, max-width 320px.
- Optional CTA below.
- **No mascots. No emoji.**

### 10.16 Theme toggle

- Pill segmented control. 28px height, 2px padding.
- Background: `bg-surface`. Border: `0.5px solid border-default`. Radius: 999px.
- Each button: 24×24, radius 999px.
- Active button: `bg-page` background, `text-primary` color.

---

## 11 · Motion

| Token           | Value                           | Use                                         |
| --------------- | ------------------------------- | ------------------------------------------- |
| `duration-fast` | **120ms**                       | Color and border transitions (hover, focus) |
| `duration-base` | **180ms**                       | Default for most state changes              |
| `duration-slow` | **240ms**                       | Progress bar fill, larger layout movement   |
| `ease-out`      | `cubic-bezier(0.16, 1, 0.3, 1)` | The only easing curve. Used everywhere.     |

### Hover

- No lift. No translate-y. No box-shadow growth.
- Use **border-color** shift (default → strong) or **background-tint** (transparent → `bg-surface`).

### Sparkle moments

A 4-point sparkle, scaling 0.3 → 1.05 → 1, opacity 0 → 1, rotation -30° → 0° over ~1100ms. Fires **once per meaningful action**:

- Marking an episode watched (`+1` on the progress row)
- Favoriting a title (the favorite button)
- Hero on first load (the "i" in "provider" on the landing page)

Never run sparkle animations on a loop. Never use sparkle particles. One sparkle, one moment.

### Reduced motion

Respect `prefers-reduced-motion: reduce`. Cut all animations to a 0–120ms fade with no transform.

---

## 12 · Voice & microcopy

- Direct, short, conversational.
- **Sentence case** everywhere.
- **No exclamation marks** in routine UI. Reserve for genuine celebration moments (rare).
- **No emoji** in product copy. (Marketing copy may include emoji _only_ when quoting a user.)
- Use first person when speaking _as_ the product: "we'll sync your list nightly."

### Pattern examples

| Don't                      | Do                                                                         |
| -------------------------- | -------------------------------------------------------------------------- |
| Add To Your Library!       | Add to library                                                             |
| 12/24 episodes watched 🎉  | Episode 12 of 24                                                           |
| All caught up! Yay!        | You're up to date                                                          |
| Sign Up Free Today!        | Start tracking                                                             |
| Premium Anime Tracking App | A quiet, fast tool for the watch list you've been keeping in a spreadsheet |

---

## 13 · Imagery

- **Anime posters and screenshots** are the primary visual content. Display at natural aspect ratios (typically **2:3 portrait** for posters).
- Keep UI chrome minimal around them — let the content breathe.
- **Placeholder posters** in mocks: solid color tiles, no gradient, no fake artwork. Title rendered as white text at the bottom with a subtle dark-to-transparent gradient for legibility (the one place gradients are allowed — see §8.4).

---

## 14 · The full token block (CSS)

Paste this into `tokens.css` and import once at the top of the app.

```css
:root {
  /* Brand (raw) */
  --color-ink: #0f0f0f;
  --color-ink-2: #1a1a1a;
  --color-soft-dark: #222222;
  --color-paper: #ffffff;
  --color-soft: #f5f4ef;
  --color-accent: #d4537e; /* sparkle / favorites / brand presence ONLY */

  /* Semantic — light mode */
  --bg-page: var(--color-paper);
  --bg-surface: var(--color-soft);
  --bg-surface-2: #eeede7;
  --bg-overlay: rgba(15, 15, 15, 0.5);
  --bg-skeleton: rgba(15, 15, 15, 0.06);
  --bg-skeleton-2: rgba(15, 15, 15, 0.1);

  --text-primary: var(--color-ink);
  --text-secondary: rgba(15, 15, 15, 0.65);
  --text-tertiary: rgba(15, 15, 15, 0.45);
  --text-disabled: rgba(15, 15, 15, 0.25);
  --text-inverse: var(--color-paper);

  --border-subtle: rgba(0, 0, 0, 0.06);
  --border-default: rgba(0, 0, 0, 0.08);
  --border-strong: rgba(0, 0, 0, 0.16);
  --border-focus: rgba(15, 15, 15, 0.55);

  /* Status (UI layer) */
  --status-success: #2f8a5c;
  --status-success-bg: #e8f2ec;
  --status-warning: #b45309;
  --status-warning-bg: #fbf1e5;
  --status-error: #c53030;
  --status-error-bg: #fbe9e9;
  --status-info: #1f6feb;
  --status-info-bg: #e8effc;

  /* Spacing (8px base) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  /* Radii */
  --radius-input: 8px;
  --radius-button: 8px;
  --radius-card: 12px;
  --radius-modal: 16px;
  --radius-pill: 999px;
  --radius-app-icon: 18%;

  /* Borders */
  --border-w-hair: 0.5px;
  --border-w-1: 1px;
  --border-w-icon: 1.5px;

  /* Typography */
  --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;

  --font-size-xs: 12px;
  --font-size-sm: 13px;
  --font-size-md: 14px;
  --font-size-lg: 15px;
  --font-size-xl: 17px;
  --font-size-2xl: 20px;
  --font-size-3xl: 24px;
  --font-size-4xl: 32px;
  --font-size-5xl: 40px;

  --line-tight: 1.2;
  --line-snug: 1.4;
  --line-body: 1.6;

  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semi: 600;

  --letter-tight: -0.02em;
  --letter-normal: 0;

  /* Motion */
  --duration-fast: 120ms;
  --duration-base: 180ms;
  --duration-slow: 240ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);

  /* z-index (no shadows in the system) */
  --z-base: 1;
  --z-sticky: 30;
  --z-popover: 60;
  --z-modal: 80;
  --z-toast: 90;
}

[data-theme="dark"] {
  --bg-page: var(--color-ink-2);
  --bg-surface: var(--color-soft-dark);
  --bg-surface-2: #2a2a2a;
  --bg-overlay: rgba(0, 0, 0, 0.6);
  --bg-skeleton: rgba(255, 255, 255, 0.05);
  --bg-skeleton-2: rgba(255, 255, 255, 0.09);

  --text-primary: #f5f4ef;
  --text-secondary: rgba(245, 244, 239, 0.65);
  --text-tertiary: rgba(245, 244, 239, 0.45);
  --text-disabled: rgba(245, 244, 239, 0.25);
  --text-inverse: var(--color-ink);

  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.1);
  --border-strong: rgba(255, 255, 255, 0.18);
  --border-focus: rgba(245, 244, 239, 0.55);

  --status-success: #4fb07f;
  --status-success-bg: rgba(79, 176, 127, 0.14);
  --status-warning: #d7873a;
  --status-warning-bg: rgba(215, 135, 58, 0.14);
  --status-error: #e25555;
  --status-error-bg: rgba(226, 85, 85, 0.14);
  --status-info: #5589f0;
  --status-info-bg: rgba(85, 137, 240, 0.14);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 15 · Don'ts (running list)

- ❌ Don't title-case the wordmark — always `animorize`, lowercase.
- ❌ Don't use the pink accent for primary buttons, links, focus rings, errors, or anything routine.
- ❌ Don't add shadows, glows, drop shadows, mesh gradients, or chromatic effects.
- ❌ Don't mix outline and filled icons in the same surface.
- ❌ Don't use exclamation marks in routine UI.
- ❌ Don't use emoji in product copy.
- ❌ Don't invent new font sizes, spacing values, or radii outside this guide.
- ❌ Don't recolor provider badges with full-bleed fills — the brand color is a swatch, not the surface.
- ❌ Don't use mascots, anime characters, or sparkle particle systems.
- ❌ Don't use Crunchyroll-orange or any saturated brand colors in the UI chrome.

---

## 16 · Quick reference — for AI design tools

```
Brand:       animorize (lowercase always)
Mood:        Notion-meets-anime. Quiet. Organized. Subtle wink to the medium.
Logo:        lowercase wordmark, dot on "i" is a 4-point pink sparkle (#D4537E),
             vertical:horizontal sparkle ratio 1.6:1
Colors:      ink #0F0F0F · accent #D4537E (sparingly) · paper #FFFFFF · soft #F5F4EF
Status:      success #2F8A5C · warning #B45309 · error #C53030 · info #1F6FEB
Type:        Inter, weights 400/500 only, sentence case everywhere
Sizes:       12 13 14 15 17 20 24 32 40 px (no others)
Spacing:     4 8 12 16 24 32 48 64 px (8px base, no halves)
Surfaces:    flat · 0.5px borders · 12px card radius · 8px button/input radius
             16px modal radius · NO shadows · NO gradients
Icons:       outline only, 1.5px stroke (Lucide / Tabler)
Dark mode:   required, 1:1 parity, swap via [data-theme="dark"] on <html>
Motion:      120/180/240ms · ease-out cubic-bezier(0.16, 1, 0.3, 1)
             one sparkle per meaningful action, never on loop
Don't:       emoji · exclamation marks · pink anywhere routine · Title Case
             mascots · drop shadows · mesh gradients · Crunchyroll-orange
```

---

_Last updated: May 25, 2026 · v1.0_
_Owners: design + frontend. Changes via PR._
