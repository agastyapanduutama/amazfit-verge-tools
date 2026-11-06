# Design Direction: Amazfit Verge Lite Workout Trigger

Dial: ENERGY 2 / RHYTHM 2 / MOTION 1

## Identity & Mood

- **Product**: Hardware remote trigger for Amazfit Verge Lite watches suffering from ghost-touch screen failure.
- **Audience**: Runners, cyclists, and outdoor athletes who need one-handed workout activation from their Android phone alongside the Zepp app.
- **Visual Language**: Tactile field chronograph and hardware instrument panel. High-contrast surfaces, crisp 1.5px structural borders, tabular numerals, and oversized thumb-ready trigger keys (minimum 56px height, well above the 44px minimum).
- **Identity Motif**: Alphanumeric hardware channel codes (`CH-01` through `CH-08`) paired with hexadecimal GATT payload previews on every trigger key, giving the app the unmistakable character of a physical watch remote rather than a generic fitness dashboard.

## Palette (2 Core Neutrals + 1 Deliberate Accent per Theme)

### Dark Mode (Outdoor Night / AMOLED Sport)
- **Background Primary**: `#0D1117` (Deep Slate Black)
- **Surface / Key Panel**: `#161B22` (Elevated Instrument Surface)
- **Interactive / Secondary Surface**: `#21262D` (Tactile Control Surface)
- **Structural Border**: `#7D8590` (Contrast 4.64:1 against `#161B22`, passes WCAG AA 3:1 non-text and 4.5:1 normal text)
- **Text Primary**: `#F0F6FC` (Contrast 17.39:1 on `#0D1117`, 15.89:1 on `#161B22`)
- **Text Secondary**: `#B1BAC4` (Contrast 8.81:1 on `#161B22`)
- **Deliberate Accent**: `#FF6B35` (Chronograph Signal Orange, contrast 6.67:1 with `#0D1117` dark label text, used only on the active workout session banner and primary trigger action)

### Light Mode (Direct Sunlight / Daylight Field)
- **Background Primary**: `#F6F8FA` (Daylight Matte Paper)
- **Surface / Key Panel**: `#FFFFFF` (Crisp Key Surface)
- **Interactive / Secondary Surface**: `#EAECEF` (Pressed / Secondary Surface)
- **Structural Border**: `#57606A` (Contrast 6.39:1 against `#FFFFFF`, passes WCAG AA)
- **Text Primary**: `#0D1117` (Contrast 18.92:1 on `#FFFFFF`)
- **Text Secondary**: `#3D444D` (Contrast 9.85:1 on `#FFFFFF`, 9.25:1 on `#F6F8FA`)
- **Deliberate Accent**: `#C23B00` (Deep Signal Vermilion, contrast 5.36:1 with `#FFFFFF` text and 5.36:1 against `#FFFFFF` surface)

## One-Line Decision Log (Rule R-31)

- **Why this color**: High-contrast slate and daylight paper with a single signal-orange accent (`#FF6B35` dark / `#C23B00` light) ensures WCAG AA legibility under harsh sunlight or night runs while reserving color exclusively for the active trigger state.
- **Why this layout**: A fixed top connection deck followed by an asymmetric primary workout launcher and a 2-column responsive trigger matrix lets a runner start or stop a watch workout with one thumb in under two seconds.
- **Why this typography**: System sans-serif with heavy weight for workout titles provides instant glanceability while moving, paired with tabular monospace strictly for real BLE MAC addresses, GATT UUIDs, and elapsed workout timers.
- **Why this spacing**: Tight 8px internal group gaps and 20px section breaks separate the hardware connection bar, the active workout telemeter, and the trigger pad without wasting vertical screen space on mobile.
- **Why use cards**: Tactile bordered keypads with distinct elevation for the primary selected sport vs. secondary grid items give physical button affordance to replace the broken watch touchscreen.
- **Why no decorative icons or illustrations**: Alphanumeric hardware channel codes (`CH-01` to `CH-08`) and real GATT command bytes convey technical utility directly without decorative emoji or generic stock icon sets.

