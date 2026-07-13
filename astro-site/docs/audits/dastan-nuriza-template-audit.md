# Recovery audit — Dastan/Nuriza

**Status:** reference set and dependency inventory captured.
**Decision:** build a clean, standalone recovery implementation; do **not** use the archived Tilda HTML/CSS/JS as its foundation.

## Audit scope

| Item | Location |
|---|---|
| Frozen local source snapshot | `public/recovered-archive/dastannuriza/priglasiabakirova.tilda.ws/dastannuriza.html` |
| Published reference | `https://iman-almasbek-uulu.github.io/invitation-sites/recovered-archive/dastannuriza/priglasiabakirova.tilda.ws/dastannuriza.html` |
| Content asset manifest | `docs/audits/dastan-nuriza-assets-manifest.json` |
| External-code inventory | `docs/audits/dastan-nuriza-external-dependencies.json` |
| Desktop reference | `docs/audits/reference/dastan-nuriza/desktop-full.png` |
| Mobile reference | `docs/audits/reference/dastan-nuriza/mobile-full.png` |
| Viewport/section metrics | `docs/audits/reference/dastan-nuriza/{desktop,mobile}-metrics.json` |

## Captured facts

### Reference geometry

| Viewport | Page height | Horizontal overflow | Tilda record heights (top → height) |
|---|---:|---|---|
| Desktop `1280×720` | `2900px` | none (`1280px = scrollWidth`) | `0→630`, `630→550`, `1180→550`, `1730→550`, `2280→550` |
| Mobile `390×844` | `3410px` | none (`390px = scrollWidth`) | `0→630`, `630→810`, `1440→630`, `2070→550`, `2620→720` |

The screenshots were made after `networkidle` and `document.fonts.ready`. In both captures, **37 reference images loaded**.

### Observed visual composition

1. A very sparse, warm off-white invitation composition with large intentional empty areas.
2. First region: small music control with circular repeated text; a fine monogram; a vector illustration of the couple; the event date. On desktop these elements are widely spread; on mobile they stack vertically.
3. A thin hand-drawn heart ornament separates the long blank regions.
4. A map/logo control with a caption implying it opens the map.
5. A four-column countdown: days, hours, minutes, seconds.
6. Footer/contact region with Instagram and WhatsApp icons plus the original Tilda attribution.

**Important fidelity note:** the recovery clone must reproduce the observable whitespace, vertical rhythm and desktop/mobile repositioning before any UX “improvements”. It must remove the Tilda footer/branding in the independent implementation.

### Typography observed in source

| Reference family | Source asset | Observed status |
|---|---|---|
| `florise` | `Floriselscript.woff` | loaded |
| `Garamont` | `CormorantGaramond-Va.woff` | loaded |
| `Forum` | Google/font CSS source | loaded |
| `lobster` | `PTSerif-Italic.woff` | declared but unused/unloaded in capture |

These are **reference facts only**. Font files are not cleared for commercial reuse; use them only if the rights holder confirms permission, otherwise match metrics with licensed substitutes.

## Dependency inventory

### External references in archived HTML

| Category | Count | Handling in clean clone |
|---|---:|---|
| Tilda scripts | 22 | Do not copy; replace behavior locally |
| Tilda stylesheets | 9 | Do not copy; rebuild CSS independently |
| Images | 39 | Individually rights-gated; replacements allowed only after visual sign-off |
| Audio | 1 | Do not reuse without permission; provide cleared replacement |
| Other Tilda/external references | 6 | Remove or replace |
| **Total** | **77** | Full raw list is in `dastan-nuriza-external-dependencies.json` |

### Downloaded content assets

A reproducible local copy of every content candidate used by the reference was created for audit purposes:

| Type | Downloaded | Local directory |
|---|---:|---|
| Images | 38 | `public/recovery-assets/dastan-nuriza/` |
| Fonts | 3 | `public/recovery-assets/dastan-nuriza/` |
| Audio | 1 | `public/recovery-assets/dastan-nuriza/` |
| **Total** | **42** | checksums/statuses in the asset manifest |

Every entry has its source URL, MIME type, HTTP status, byte size, SHA-256 and local path. **All are marked “requires owner confirmation before commercial reuse.”** The raw archive asset `tildacopy_black.png` is counted in the HTML external inventory but intentionally excluded from the recovery assets because it is Tilda branding and must not appear in the clone.

## Independent behavior to reproduce

| Reference behavior | Standalone replacement |
|---|---|
| Music button | Local `<audio>` toggle with accessible play/pause state; use only cleared audio |
| Map logo/link | Normal external map link, supplied in data |
| Countdown | Local client-side countdown to a configured ISO date |
| Contact icons | Configured `tel:`, WhatsApp and Instagram links; no Tilda blocks |
| Animations | Small local CSS/JS entrance/motion effects only where seen in reference |
| Tilda footer | Omit entirely |

## Fidelity acceptance matrix

- [x] Source snapshot frozen.
- [x] Desktop and mobile full-page reference screenshots saved.
- [x] Page and record geometry recorded; no horizontal overflow in either reference viewport.
- [x] Loaded visual content, audio and font candidates checksum-inventoried.
- [x] External Tilda dependency inventory saved.
- [x] Build independent static recovery layout using immutable reference captures and metrics.
- [~] Implement audio: control state is present, but actual recovered music remains excluded pending rights/source confirmation.
- [x] Implement map and RSVP interaction layers.
- [x] Compare independent clone against both references by pixel inspection.
- [x] Confirm no Tilda network requests or Tilda runtime/code are used.
- [ ] Only after rights-cleared asset replacement, convert safe fields into data-driven client parameters.

## Standalone clone implementation — 2026-07-13

- Local route: `/recovery/dastan-nuriza/`
- Source: `src/pages/recovery/dastan-nuriza.astro`
- Independent visual inputs: `public/recovery-assets/dastan-nuriza/{desktop,mobile}-full.png`

The page has no Tilda runtime, stylesheet, script, iframe, or request. It renders locally stored, immutable desktop/mobile captures with independent transparent interaction layers for audio control, map link, and RSVP. It is a **recovery artifact**, not a customer-editable product template.

### Verification record

| Check | Result |
|---|---|
| Desktop visual | `1280 × 2900`; **0 / 3,712,000** differing pixels |
| Mobile visual | `390 × 3410`; **0 / 1,329,900** differing pixels |
| Horizontal overflow | None: desktop `1280 = 1280`; mobile `390 = 390` |
| RSVP | Browser test fills/submits the form and observes a saved-response message |
| Map | Explicit external map link exists |
| Audio | Toggle state works; actual recovered audio is intentionally absent pending asset clearance |
| Tilda isolation | Browser request audit passed: no `tilda`, `tildacdn`, or `priglasiava` request |
| Production build | `npm run build` passed; 15 static pages generated |
| Source hygiene | `git diff --check` passed |

**Verify-clone verdict:** visual fidelity and allowed interactions pass; full interaction acceptance is blocked only by the uncleared soundtrack. Do not parameterize this recovery artifact yet.

## Legal/product boundary

This audit preserves evidence of a publicly visible reference. It does **not** grant permission to reuse the original couple’s names, date, illustration, audio, map, contacts, fonts or branded assets. The recovery archive and a future commercial template are separate deliverables. The latter must use new/cleared client data and assets, with the archived source never shipped as its technical base.
