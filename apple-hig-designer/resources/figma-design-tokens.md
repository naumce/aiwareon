# Apple iOS Design Tokens (Figma Export)

Extracted from Apple's official iOS/iPadOS Figma Design Kit using the Lukasoppermann Design Tokens plugin. These are the **exact values** from Apple's design system.

---

## System Colors — Light Mode

| Color   | Hex       | CSS Variable           |
|---------|-----------|------------------------|
| Red     | `#FF383C` | `--system-red`         |
| Orange  | `#FF8D28` | `--system-orange`      |
| Yellow  | `#FFCC00` | `--system-yellow`      |
| Green   | `#34C759` | `--system-green`       |
| Mint    | `#00C8B3` | `--system-mint`        |
| Teal    | `#00C3D0` | `--system-teal`        |
| Cyan    | `#00C0E8` | `--system-cyan`        |
| Blue    | `#0088FF` | `--system-blue`        |
| Indigo  | `#6155F5` | `--system-indigo`      |
| Purple  | `#CB30E0` | `--system-purple`      |
| Pink    | `#FF2D55` | `--system-pink`        |
| Brown   | `#AC7F5E` | `--system-brown`       |

## System Colors — Dark Mode

| Color   | Hex       |
|---------|-----------|
| Red     | `#FF6165` |
| Orange  | `#FFA056` |
| Yellow  | `#FEDF43` |
| Green   | `#4AE968` |
| Mint    | `#54DFCB` |
| Teal    | `#3BDDEC` |
| Cyan    | `#6DD9FF` |
| Blue    | `#5CB8FF` |
| Indigo  | `#A7AAFF` |
| Purple  | `#EA8DFF` |
| Pink    | `#FF8AC4` |
| Brown   | `#DBA679` |

---

## Gray Scale — Light Mode

| Name   | Hex       |
|--------|-----------|
| Gray   | `#8E8E93` |
| Gray 2 | `#AEAEB2` |
| Gray 3 | `#C7C7CC` |
| Gray 4 | `#D1D1D6` |
| Gray 5 | `#E5E5EA` |
| Gray 6 | `#F2F2F7` |
| Black  | `#000000` |
| White  | `#FFFFFF` |

## Gray Scale — Dark Mode

| Name   | Hex       |
|--------|-----------|
| Gray   | `#AEAEB2` |
| Gray 2 | `#545456` |
| Gray 3 | `#444446` |
| Gray 4 | `#363638` |
| Gray 5 | `#242426` |
| Gray 6 | `#000000` |
| Black  | `#000000` |
| White  | `#FFFFFF` |

---

## Backgrounds — Light Mode

### Standard (non-grouped content)
| Level    | Hex       |
|----------|-----------|
| Primary  | `#FFFFFF` |
| Secondary| `#F2F2F7` |
| Tertiary | `#FFFFFF` |

### Grouped (table views, grouped lists)
| Level    | Hex       |
|----------|-----------|
| Primary  | `#F2F2F7` |
| Secondary| `#FFFFFF` |
| Tertiary | `#F2F2F7` |

## Backgrounds — Dark Mode

### Standard
| Level              | Hex       |
|--------------------|-----------|
| Primary            | `#000000` |
| Secondary          | `#242426` |
| Tertiary           | `#363638` |
| Primary Elevated   | `#242426` |
| Secondary Elevated | `#363638` |
| Tertiary Elevated  | `#3A3A3C` |

### Grouped
| Level              | Hex       |
|--------------------|-----------|
| Primary            | `#000000` |
| Secondary          | `#242426` |
| Tertiary           | `#363638` |
| Primary Elevated   | `#242426` |
| Secondary Elevated | `#363638` |
| Tertiary Elevated  | `#3A3A3C` |

---

## Labels (Text Colors)

### Light Mode
| Level      | Value                        | Opacity |
|------------|------------------------------|---------|
| Primary    | `#000000`                    | 100%    |
| Secondary  | `#3C3C43` / `rgba(60,60,67,0.6)`  | 60%     |
| Tertiary   | `#3C3C43` / `rgba(60,60,67,0.3)`  | 30%     |
| Quaternary | `#3C3C43` / `rgba(60,60,67,0.18)` | 18%     |

### Dark Mode
| Level      | Value                              | Opacity |
|------------|------------------------------------|---------|
| Primary    | `#FFFFFF`                          | 100%    |
| Secondary  | `#EBEBF5` / `rgba(235,235,245,0.7)`  | 70%     |
| Tertiary   | `#EBEBF5` / `rgba(235,235,245,0.55)` | 55%     |
| Quaternary | `#EBEBF5` / `rgba(235,235,245,0.4)`  | 40%     |

---

## Fills (System Fill Colors)

### Light Mode
| Level      | Hex        | Opacity |
|------------|------------|---------|
| Primary    | `#787878`  | 20% (`#78787833`) |
| Secondary  | `#788080`  | 16% (`#78788029`) |
| Tertiary   | `#767680`  | 12% (`#7676801F`) |
| Quaternary | `#747480`  | 8% (`#74748014`)  |

### Dark Mode
| Level      | Hex        | Opacity |
|------------|------------|---------|
| Primary    | `#787880`  | 44% (`#78788070`) |
| Secondary  | `#787880`  | 40% (`#78788066`) |
| Tertiary   | `#767680`  | 32% (`#76768052`) |
| Quaternary | `#767680`  | 26% (`#76768042`) |

---

## Separators

### Light Mode
| Type       | Value                          |
|------------|--------------------------------|
| Opaque     | `#C6C6C8`                      |
| Non-opaque | `rgba(0,0,0,0.12)` / `#0000001F` |

### Dark Mode
| Type       | Value                             |
|------------|-----------------------------------|
| Opaque     | `#38383A`                         |
| Non-opaque | `rgba(255,255,255,0.17)` / `#FFFFFF2B` |
| Vibrant    | `#1A1A1A`                         |

---

## Typography — SF Pro

All values are in **points (px on web)**. Font family: `SF Pro` (use `-apple-system, BlinkMacSystemFont` on web).

### Type Scale

| Style        | Size | Line Height | Weight        | Letter Spacing | Emphasized Weight |
|-------------|------|-------------|---------------|----------------|-------------------|
| Large Title | 34   | 41          | 400 (Regular) | +0.40          | 700 (Bold)        |
| Title 1     | 28   | 34          | 400 (Regular) | +0.38          | 700 (Bold)        |
| Title 2     | 22   | 28          | 400 (Regular) | -0.26          | 700 (Bold)        |
| Title 3     | 20   | 25          | 400 (Regular) | -0.45          | 600 (Semibold)    |
| Headline    | 17   | 22          | 600 (Semibold)| -0.43          | —                 |
| Body        | 17   | 22          | 400 (Regular) | -0.43          | 600 (Semibold)    |
| Callout     | 16   | 21          | 400 (Regular) | -0.31          | 600 (Semibold)    |
| Subheadline | 15   | 20          | 400 (Regular) | -0.23          | 600 (Semibold)    |
| Footnote    | 13   | 18          | 400 (Regular) | -0.08          | 600 (Semibold)    |
| Caption 1   | 12   | 16          | 400 (Regular) | 0              | 500 (Medium)      |
| Caption 2   | 11   | 13          | 400 (Regular) | +0.06          | 600 (Semibold)    |

### CSS Implementation

```css
:root {
  --font-system: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;

  /* Large Title */
  --text-large-title: 34px;
  --lh-large-title: 41px;
  --ls-large-title: 0.4px;

  /* Title 1 */
  --text-title1: 28px;
  --lh-title1: 34px;
  --ls-title1: 0.38px;

  /* Title 2 */
  --text-title2: 22px;
  --lh-title2: 28px;
  --ls-title2: -0.26px;

  /* Title 3 */
  --text-title3: 20px;
  --lh-title3: 25px;
  --ls-title3: -0.45px;

  /* Headline */
  --text-headline: 17px;
  --lh-headline: 22px;
  --ls-headline: -0.43px;

  /* Body */
  --text-body: 17px;
  --lh-body: 22px;
  --ls-body: -0.43px;

  /* Callout */
  --text-callout: 16px;
  --lh-callout: 21px;
  --ls-callout: -0.31px;

  /* Subheadline */
  --text-subhead: 15px;
  --lh-subhead: 20px;
  --ls-subhead: -0.23px;

  /* Footnote */
  --text-footnote: 13px;
  --lh-footnote: 18px;
  --ls-footnote: -0.08px;

  /* Caption 1 */
  --text-caption1: 12px;
  --lh-caption1: 16px;
  --ls-caption1: 0px;

  /* Caption 2 */
  --text-caption2: 11px;
  --lh-caption2: 13px;
  --ls-caption2: 0.06px;
}
```

---

## Vibrant Materials

Used for background blur / vibrancy effects (e.g., behind translucent panels).

### Vibrant Fills — Dark (blend mode: `linear_dodge` / screen)
| Level    | Color     |
|----------|-----------|
| Primary  | `#333333` |
| Secondary| `#1F1F1F` |
| Tertiary | `#121212` |

### Vibrant Fills — Light (blend mode: `linear_burn` / multiply)
| Level    | Color     |
|----------|-----------|
| Primary  | `#CCCCCC` |
| Secondary| `#E0E0E0` |
| Tertiary | `#EDEDED` |

### Vibrant Labels — Dark (blend mode: `linear_dodge`)
| Level      | Color     |
|------------|-----------|
| Primary    | `#FFFFFF` |
| Secondary  | `#999999` |
| Tertiary   | `#404040` |
| Quaternary | `#262626` |

### Vibrant Labels — Light
| Level      | Color     | Blend Mode |
|------------|-----------|------------|
| Primary    | `#000000` | normal     |
| Secondary  | Multi-layer: `#7F7F7F80` luminosity + `#3D3D3D` overlay | |
| Tertiary   | Multi-layer: `#7F7F7F66` luminosity + `#3D3D3D80` overlay | |
| Quaternary | Multi-layer: `#7F7F7F33` luminosity + `#3D3D3D80` overlay | |

---

## Overlays

| Type                     | Value                        |
|--------------------------|------------------------------|
| Default                  | `rgba(0,0,0,0.48)` / `#0000007A` |
| Activity View Controller | `rgba(0,0,0,0.29)` / `#0000004A` |
| Alert Overlay            | `rgba(18,18,18,0.56)` / `#1212128F` |

---

## Miscellaneous UI Colors (Dark Mode)

### Text Fields
| Property | Value                              |
|----------|------------------------------------|
| BG       | `#000000`                          |
| Outline  | `rgba(235,235,245,0.3)` / `#EBEBF54D` |

### Tab Bar
| Property         | Value     |
|------------------|-----------|
| Unselected icon  | `#7E7E7E` |
| Selected icon    | `#FFFFFF` |

### Segmented Control
| Property        | Value                          |
|-----------------|--------------------------------|
| Selected fill   | `rgba(255,255,255,0.27)` / `#FFFFFF45` |

### Buttons (Destructive)
| Property                      | Value       |
|-------------------------------|-------------|
| Label (disabled)              | `#FF616580` |
| BG (prominent)                | `#FF616533` |
| BG (default)                  | `#FF616524` |

### Window Controls (macOS)
| Control  | Color     |
|----------|-----------|
| Close    | `#FF5F57` |
| Minimize | `#FEBC2F` |
| Maximize | `#27C840` |

### Toggle Switch
| Property          | Value     |
|-------------------|-----------|
| AX Label (off)    | `#FFFFFF` |

### Sidebar
| Property        | Value                          |
|-----------------|--------------------------------|
| Fill (selected) | `rgba(144,144,153,0.3)` / `#9090994D` |
| Text (selected) | `{colors.grays.white}` → `#FFFFFF` |

### Keyboard Colors
| Property          | Value     |
|-------------------|-----------|
| Emoji + Mic       | `#FFFFFFBA` |
| Glyphs Primary    | `#A6A6A6` |
| Keys              | `#454545` |
| Glyphs Secondary  | `#4D4D4D` |

---

## Liquid Glass Parameters (iOS 26)

Apple's new Liquid Glass material system. These are Figma representation values:

| Parameter              | Regular | Medium | Large |
|------------------------|---------|--------|-------|
| Light Angle            | -45°    | -45°   | -45°  |
| Refraction             | 60      | 60     | 60    |
| Frost                  | 6       | 20     | 35    |
| Depth                  | 30      | 60     | 60    |
| Dispersion             | 0       | 0      | 0     |
| Splay                  | 25      | 12     | 12    |

### CSS Approximation (Web)
```css
.liquid-glass-regular {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(6px) saturate(180%);
  -webkit-backdrop-filter: blur(6px) saturate(180%);
  border: 0.5px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-xl);
  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.08);
}

.liquid-glass-medium {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px) saturate(180%);
  border: 0.5px solid rgba(255, 255, 255, 0.25);
}

.liquid-glass-large {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(35px) saturate(200%);
  border: 0.5px solid rgba(255, 255, 255, 0.2);
}

@media (prefers-color-scheme: dark) {
  .liquid-glass-regular {
    background: rgba(40, 40, 40, 0.5);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow:
      inset 0 0.5px 0 rgba(255, 255, 255, 0.15),
      0 2px 8px rgba(0, 0, 0, 0.3);
  }
}
```

---

## Component Dimensions

### Sheet (modal) Border Radius
| Device  | Position | Radius |
|---------|----------|--------|
| iPhone  | Top      | 34px   |
| iPhone  | Bottom   | 58px   |
| iPad    | All      | 38px   |

### Keyboard Border Radius
| Device  | Position | Radius |
|---------|----------|--------|
| iPhone  | Top      | 27px   |
| iPhone  | Bottom   | 62px   |

### Scroll Edge Effect
| Property    | Value |
|-------------|-------|
| Blur radius | 10px  |

---

## Complete CSS Variables (Copy-Paste Ready)

```css
:root {
  /* ===== SYSTEM COLORS (Light Mode) ===== */
  --system-red: #FF383C;
  --system-orange: #FF8D28;
  --system-yellow: #FFCC00;
  --system-green: #34C759;
  --system-mint: #00C8B3;
  --system-teal: #00C3D0;
  --system-cyan: #00C0E8;
  --system-blue: #0088FF;
  --system-indigo: #6155F5;
  --system-purple: #CB30E0;
  --system-pink: #FF2D55;
  --system-brown: #AC7F5E;

  /* ===== GRAYS ===== */
  --system-gray: #8E8E93;
  --system-gray2: #AEAEB2;
  --system-gray3: #C7C7CC;
  --system-gray4: #D1D1D6;
  --system-gray5: #E5E5EA;
  --system-gray6: #F2F2F7;

  /* ===== LABELS ===== */
  --label-primary: #000000;
  --label-secondary: rgba(60, 60, 67, 0.6);
  --label-tertiary: rgba(60, 60, 67, 0.3);
  --label-quaternary: rgba(60, 60, 67, 0.18);

  /* ===== BACKGROUNDS ===== */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F2F2F7;
  --bg-tertiary: #FFFFFF;
  --bg-grouped-primary: #F2F2F7;
  --bg-grouped-secondary: #FFFFFF;
  --bg-grouped-tertiary: #F2F2F7;

  /* ===== FILLS ===== */
  --fill-primary: rgba(120, 120, 128, 0.2);
  --fill-secondary: rgba(120, 128, 128, 0.16);
  --fill-tertiary: rgba(118, 118, 128, 0.12);
  --fill-quaternary: rgba(116, 116, 128, 0.08);

  /* ===== SEPARATORS ===== */
  --separator: rgba(0, 0, 0, 0.12);
  --separator-opaque: #C6C6C8;

  /* ===== OVERLAYS ===== */
  --overlay-default: rgba(0, 0, 0, 0.48);
  --overlay-light: rgba(0, 0, 0, 0.29);
  --overlay-alert: rgba(18, 18, 18, 0.56);

  /* ===== TYPOGRAPHY ===== */
  --font-system: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'SF Mono', SFMono-Regular, Menlo, Monaco, monospace;

  --text-large-title: 34px;
  --text-title1: 28px;
  --text-title2: 22px;
  --text-title3: 20px;
  --text-headline: 17px;
  --text-body: 17px;
  --text-callout: 16px;
  --text-subhead: 15px;
  --text-footnote: 13px;
  --text-caption1: 12px;
  --text-caption2: 11px;
}

/* ===== DARK MODE ===== */
@media (prefers-color-scheme: dark) {
  :root {
    --system-red: #FF6165;
    --system-orange: #FFA056;
    --system-yellow: #FEDF43;
    --system-green: #4AE968;
    --system-mint: #54DFCB;
    --system-teal: #3BDDEC;
    --system-cyan: #6DD9FF;
    --system-blue: #5CB8FF;
    --system-indigo: #A7AAFF;
    --system-purple: #EA8DFF;
    --system-pink: #FF8AC4;
    --system-brown: #DBA679;

    --system-gray: #AEAEB2;
    --system-gray2: #545456;
    --system-gray3: #444446;
    --system-gray4: #363638;
    --system-gray5: #242426;
    --system-gray6: #000000;

    --label-primary: #FFFFFF;
    --label-secondary: rgba(235, 235, 245, 0.7);
    --label-tertiary: rgba(235, 235, 245, 0.55);
    --label-quaternary: rgba(235, 235, 245, 0.4);

    --bg-primary: #000000;
    --bg-secondary: #242426;
    --bg-tertiary: #363638;
    --bg-primary-elevated: #242426;
    --bg-secondary-elevated: #363638;
    --bg-tertiary-elevated: #3A3A3C;
    --bg-grouped-primary: #000000;
    --bg-grouped-secondary: #242426;
    --bg-grouped-tertiary: #363638;

    --fill-primary: rgba(120, 120, 128, 0.44);
    --fill-secondary: rgba(120, 120, 128, 0.40);
    --fill-tertiary: rgba(118, 118, 128, 0.32);
    --fill-quaternary: rgba(118, 118, 128, 0.26);

    --separator: rgba(255, 255, 255, 0.17);
    --separator-opaque: #38383A;

    --overlay-default: rgba(0, 0, 0, 0.48);
    --overlay-alert: rgba(18, 18, 18, 0.56);
  }
}
```

---

*Source: Apple iOS/iPadOS Figma Design Kit — exported via Lukasoppermann Design Tokens plugin. Values represent the iOS 18/26 design system.*
