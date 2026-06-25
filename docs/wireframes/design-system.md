# Design System — wireframe selection

**Mood preset:** `trust-corporate` (family: professional)

- Rationale: ระบบประกันภัย enterprise/b2b ต้องการโทน **น่าเชื่อถือ มั่นคง จริงจัง** (preset best_for: enterprise, finance, fintech, b2b)
- Fonts: **Spectral** (display) + **Public Sans** (body) · radius `md` · shadow `soft` · motion `subtle` · default mode `light`
- Token contract (source of truth, generated at B0): `playbooks/generated/design-tokens.md`
- Golden reference page (generate via `node ai-sdlc/scripts/generate-presets.mjs`): `docs/design/golden-reference/trust-corporate.html`

> Colors / typography / radius / shadow / motion ถูกกำหนดโดย preset ทั้งหมด — ห้าม hardcode สี
> `/ai-scaffold` จะเขียน `@theme` ของ preset ลง `globals.css` (managed block — ห้ามแก้มือ)
> guidance ด้านล่างเป็น preset-independent

## Accessibility
- Touch target ≥ 48px; body font ≥ 16px
- Contrast: WCAG-AA (preset ผ่าน contrast validation ทั้ง light/dark แล้ว)
- ทุก form field มี label + error ที่ screen-reader อ่านได้; modal มี focus-trap
- ภาษาไทยเป็นหลัก (locale th)

## Responsive breakpoints
- Mobile 360px (E-Motor field use — สำคัญ, surveyor ใช้ภาคสนาม) · Tablet 768px · Desktop 1280px
- ฝั่ง ABC (back-office) optimize desktop; ฝั่ง E-Motor optimize mobile-first
