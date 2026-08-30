---
name: VitalStream Design System
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#5b403f'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#8f6f6e'
  outline-variant: '#e4bebc'
  surface-tint: '#bb152c'
  primary: '#b7102a'
  on-primary: '#ffffff'
  primary-container: '#db313f'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb3b1'
  secondary: '#745662'
  on-secondary: '#ffffff'
  secondary-container: '#fdd5e4'
  on-secondary-container: '#795a67'
  tertiary: '#465d81'
  on-tertiary: '#ffffff'
  tertiary-container: '#5f759b'
  on-tertiary-container: '#fefcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad8'
  primary-fixed-dim: '#ffb3b1'
  on-primary-fixed: '#410007'
  on-primary-fixed-variant: '#92001c'
  secondary-fixed: '#ffd8e7'
  secondary-fixed-dim: '#e3bccb'
  on-secondary-fixed: '#2b141f'
  on-secondary-fixed-variant: '#5b3f4b'
  tertiary-fixed: '#d5e3ff'
  tertiary-fixed-dim: '#b0c7f1'
  on-tertiary-fixed: '#001b3c'
  on-tertiary-fixed-variant: '#30476a'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  caption:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  margin-mobile: 16px
  gutter-mobile: 12px
---

## Brand & Style

The brand identity focuses on the intersection of clinical precision and human empathy. The design system prioritizes a **Corporate / Modern** aesthetic tailored specifically for healthcare, emphasizing clarity, trust, and professional reliability. 

The visual narrative is built on the "Safe" identity: a standard, highly legible healthcare aesthetic that uses generous white space to reduce cognitive load during critical medical interactions. By balancing a high-energy primary red with soft secondary tones and a pure white background, the system evokes a sense of urgent importance tempered by comforting care. The interface should feel organized, stable, and encouraging, guiding donors and patients through complex medical information with ease.

## Colors

The palette is anchored by **Blood Red (#E63946)**, used strategically for primary actions, critical alerts, and brand signifiers to ensure high visibility. To balance this intensity, **Soft Pink (#FAD2E1)** serves as a supportive secondary color for background accents, progress indicators, and decorative elements that require a "human" touch.

**Pure White (#FFFFFF)** is the mandatory background color to maintain a clinical, "sterile but welcoming" environment. **Deep Navy (#1D3557)** is introduced as a tertiary color for high-contrast typography and navigation elements to anchor the design in professional stability. Success and error states follow standard medical color conventions to ensure immediate recognition.

## Typography

This design system utilizes **Inter** across all levels to maximize legibility and maintain a systematic, utilitarian appearance. The typographic scale is designed for high-density medical information, prioritizing clear hierarchy.

Headlines use semi-bold weights and slight negative letter-spacing to appear modern and authoritative. Body text maintains a comfortable 16px base for accessibility. Labels and captions are utilized for data points, such as blood type or donation dates, ensuring they remain distinct from narrative text. On mobile, avoid using any font size smaller than 12px for critical health information.

## Layout & Spacing

This design system follows a **mobile-first fluid grid** philosophy. The layout uses a 4-column grid for mobile devices with 16px side margins and 12px gutters.

The spacing rhythm is based on a 4px baseline shift. Most components use 16px (md) padding to ensure touch targets are accessible (minimum 44x44px). Vertical rhythm should be generous, especially between unrelated sections (24px or 32px), to prevent the interface from feeling cluttered or stressful—essential for medical applications.

## Elevation & Depth

To maintain a clean, professional look, depth is conveyed through **Tonal Layers** and **Low-Contrast Outlines**. 

- **Level 0 (Background):** Pure White (#FFFFFF).
- **Level 1 (Cards/Containers):** Subtly defined by a 1px border using a light grey (#E9ECEF) or a very soft, diffused shadow (4px blur, 2% opacity) to suggest elevation without appearing heavy.
- **Level 2 (Modals/Pop-overs):** Medium-diffusion shadows with a subtle blue-grey tint (#1D3557 at 10% opacity) are used to separate active tasks from the background.

Avoid heavy shadows or neomorphic effects. Clarity is the priority; layers should feel like stacked sheets of high-quality paper.

## Shapes

The shape language uses **Rounded** (Level 2) settings to soften the clinical nature of the app and make it feel more approachable and "human."

- **Standard Buttons & Inputs:** 0.5rem (8px) corner radius.
- **Cards & Banners:** 1rem (16px) corner radius.
- **Large Action Containers:** 1.5rem (24px) corner radius.

Consistent rounding across all interactive elements communicates a cohesive, friendly experience, reducing the perceived "sharpness" or anxiety associated with medical procedures.

## Components

### Buttons
Primary buttons use a solid **Blood Red** background with white text and 8px rounding. Secondary buttons use the **Soft Pink** background with Blood Red text for lower-priority actions.

### Cards
News and campaign cards must have a 16px radius. Use a 1px stroke (#E9ECEF) instead of a heavy shadow. Images within cards should be top-aligned with the same 16px top-corner radius.

### Input Fields
Inputs should have a 1px border in a neutral grey, moving to Blood Red on focus. Use **Label-lg** for persistent field labels above the input to ensure medical data entry is unambiguous.

### Medical Status Icons
Iconography must be clear and stroke-based (2px weight). For blood types and status indicators, use filled circles or "drops" with the primary color to ensure they stand out as the most important data points on the screen.

### Chips & Tags
Use for blood types or eligibility status. These should be highly rounded (pill-shaped) with a Soft Pink background and Blood Red text for high legibility and a friendly tone.