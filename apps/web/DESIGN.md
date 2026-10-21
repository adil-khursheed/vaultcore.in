---
name: VaultCore
description: A zero-knowledge password manager and digital vault with calm, instrument-grade restraint.
colors:
  paper: "oklch(0.9911 0 0)"
  paper-deep: "oklch(0.9461 0 0)"
  graphite: "oklch(0.2046 0 0)"
  graphite-soft: "oklch(0.2435 0 0)"
  slate: "oklch(0.5452 0 0)"
  line: "oklch(0.9037 0 0)"
  field: "oklch(0.9731 0 0)"
  mint: "oklch(0.8348 0.1302 160.908)"
  mint-ink: "oklch(0.2626 0.0147 166.4589)"
  alert: "oklch(0.5523 0.1927 32.7272)"
  alert-ink: "oklch(0.9934 0.0032 17.2118)"
typography:
  display:
    fontFamily: "Outfit, sans-serif"
    fontSize: "clamp(1.875rem, 7vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Outfit, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Outfit, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "Outfit, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0.025em"
  label:
    fontFamily: "Outfit, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.1em"
  ui:
    fontFamily: "Outfit, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "0.025em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  3xl: "24px"
  full: "9999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "6": "24px"
  "8": "32px"
  "12": "48px"
  "16": "64px"
  "24": "96px"
components:
  button-primary:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.mint-ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "oklch(0.8348 0.1302 160.908 / 0.9)"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.graphite}"
    typography: "{typography.ui}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-ghost:
    textColor: "{colors.graphite}"
    typography: "{typography.ui}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  input:
    backgroundColor: "{colors.field}"
    textColor: "{colors.graphite}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "4px 12px"
    height: "36px"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.xl}"
    padding: "24px"
  badge-secondary:
    backgroundColor: "{colors.paper-deep}"
    textColor: "{colors.graphite-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  sidebar-item:
    backgroundColor: "{colors.paper-deep}"
    textColor: "{colors.graphite-soft}"
    typography: "{typography.ui}"
    rounded: "{rounded.md}"
    padding: "8px"
---

# Design System: VaultCore

## Overview

**Creative North Star: "The Quiet Vault"**

VaultCore looks like a well-kept private archive rather than a security console. Paper-white surfaces, graphite text, and hairline rules do the structural work; a single pale mint accent marks the action or fact that matters. Nothing glows, nothing alarms, nothing performs vigilance. The calm is the security claim: a product that handles secrets can afford to speak softly.

The system is dense where users work and generous where they decide. The vault app is a tight split pane with 12px padding, compact rows, and a fixed 16rem sidebar. Marketing pages breathe inside a 1152px column, separated by full-bleed horizontal rules and 96px section padding. Animated demos add life in short, linear loops, but the static composition still reads without motion.

Depth is conditional. Surfaces sit flat at rest and lift only in response to hover, focus, or overlay. Borders carry hierarchy first; shadows confirm it second. The world explicitly rejects cyberpunk and hacker aesthetics: no neon-on-black, matrix rain, glowing shields, or lock iconography used as ornament.

**Key Characteristics:**
- Paper white, graphite ink, one pale mint signal.
- Hairline borders and full-bleed rules define the grid.
- Compact, engineered controls: 36px tall, 6px radius, visible states.
- Flat at rest; shadow is a response, not a decoration.
- Outfit for everything functional; serif reserved for the wordmark and watermark.

## Colors

A near-monochrome paper-and-graphite palette interrupted by pale mint verification signals.

### Primary
- **Pale Mint Signal** (`oklch(0.8348 0.1302 160.908)`): Primary buttons, active pricing ring, feature icon washes, gradient headline emphasis, and small security accents. It reads as "verified," not "alert."
- **Deep Mint Ink** (`oklch(0.2626 0.0147 166.4589)`): Text and icons placed on mint fills. Dark enough to keep the primary button legible without turning black.

### Neutral
- **Paper White** (`oklch(0.9911 0 0)`): Page background, cards, popovers, and the nav surface. The default ground for both marketing and app.
- **Warm Stone** (`oklch(0.9461 0 0)`): Muted and accent fills: hover states, ghost-button surfaces, inset panels, and the alternating why-us band.
- **Graphite Ink** (`oklch(0.2046 0 0)`): Primary text, headings, and the base foreground color.
- **Soft Graphite** (`oklch(0.2435 0 0)`): Secondary text and muted foreground roles, including descriptions and metadata.
- **Slate Gray** (`oklch(0.5452 0 0)`): Sidebar labels and the lowest-emphasis interface text.
- **Hairline** (`oklch(0.9037 0 0)`): Every 1px border, divider, table rule, and full-bleed section line.
- **Field Wash** (`oklch(0.9731 0 0)`): Input and control backgrounds in light mode.

### Semantic
- **Signal Red** (`oklch(0.5523 0.1927 32.7272)`): Destructive actions, invalid fields, and risk callouts. Never used for decoration.
- **Signal Red Ink** (`oklch(0.9934 0.0032 17.2118)`): Text on destructive fills.

### Named Rules
**The One Signal Rule.** Mint is scarce. Use it for the primary action, the current selection, a verified state, or one emphasized phrase per section. Never flood a panel or a page background with it.

**The Paper Ground Rule.** Large surfaces stay paper white or stone. Color enters through icons, borders, text emphasis, and 5–10% tinted washes, not through saturated blocks.

## Typography

**Display Font:** Outfit (with sans-serif fallback)
**Body Font:** Outfit (with sans-serif fallback)
**Label/Mono Font:** Geist Mono for hashes, passwords, and technical readouts; Source Serif 4 only for the wordmark and footer watermark.

**Character:** Outfit gives the product a clean, slightly geometric voice that stays legible at 12px interface sizes. The serif appears as a single archival gesture, not a second text face. Monospace is reserved for data that must look exact.

### Hierarchy
- **Display** (700, `clamp(1.875rem, 7vw, 4.5rem)`, 1.05): Landing hero only. Tight tracking, sentence case, one mint gradient phrase at most.
- **Headline** (700, `clamp(1.875rem, 4vw, 3rem)`, 1.1): Section titles across marketing pages.
- **Title** (600, 1.25rem, 1.4): Card titles, dialog titles, and panel headings.
- **Body** (400, 1rem, 1.6, 0.025em): Descriptions, form labels' supporting text, and marketing prose. Cap measure at 65–75ch.
- **Label** (500, 0.75rem, 1.4, 0.1em): Uppercase micro-labels for field groups, diagram nodes, and metadata. Never use uppercase for sentences.
- **UI** (500, 0.875rem, 1.25): Buttons, nav items, inputs, and compact controls.

### Named Rules
**The Serif Exception Rule.** Source Serif 4 is an identity gesture, not a text face. It may appear in the wordmark and the oversized footer watermark; do not set product copy, headings, or labels in it.

**The Mono Evidence Rule.** Use Geist Mono only where the user must verify exact characters: passwords, keys, hashes, domains, and audit values. Never use it for general body copy.

## Layout

Marketing pages use a single centered column capped at 1152px (`max-w-6xl`), bounded by 1px left and right rules and separated into full-bleed horizontal bands. Sections run at 96px vertical padding (`py-24`), with a 48–64px gap between the intro block and its content. The hero starts at 64px top padding and spans the column edge to edge.

The vault app abandons the marketing column: a 16rem sidebar sits fixed at left, a 48px header runs across the top, and the content splits into a 40% master list (`md:w-2/5`) and a detail sheet. List padding is 12px; row gaps are 12px; the sidebar collapses to a 48px icon rail.

Breakpoints follow Tailwind defaults: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px. Mobile stacks the marketing grid to one column, replaces the navbar with a sheet menu, and turns the sidebar into an 18rem drawer. The hero demo is hidden below `md`; its composition is not compressed into a phone.

Spacing runs on a 4px base. Recurring steps are 8px for icon/text gaps, 12px for compact stacks, 16px for control padding, 24px for card interiors, 48px for content groups, and 96px for section rhythm.

### Named Rules
**The Container Rule.** Marketing surfaces live inside the 1152px ruled column. App surfaces span the viewport. Never wrap the app shell in the marketing container.

**The Breathing Section Rule.** Marketing sections earn 96px of vertical padding and one full-bleed divider. Do not stack more than two competing visual events in a single band.

## Elevation & Depth

The system is flat by default. Structure comes from 1px hairline borders and tonal steps, not from stacked shadows. Cards sit on paper with a border and at most `shadow-sm`; outline buttons and inputs carry `shadow-xs`; hover lifts a card with `shadow-xl` and a 4px translate. Dialogs, sheets, and dropdowns use the higher shadow steps because they genuinely float above the page.

In dark mode the same logic holds: surfaces separate through graphite steps and borders, and shadows remain functional rather than dramatic.

### Shadow Vocabulary
- **Hairline lift** (`0px 1px 3px 0px hsl(0 0% 0% / 0.09)`): Inputs, outline buttons, and small controls at rest.
- **Card rest** (`0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 1px 2px -1px hsl(0 0% 0% / 0.17)`): Cards and panels at rest.
- **Hover lift** (`0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 8px 10px -1px hsl(0 0% 0% / 0.17)`): Feature cards and pricing cards on hover only.
- **Overlay** (`0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 4px 6px -1px hsl(0 0% 0% / 0.17)`): Dialogs, sheets, popovers, and menus.

### Named Rules
**The Flat-By-Default Rule.** A surface at rest gets a border before it gets a shadow. Shadows appear only as a response to state or as proof that an overlay floats.

## Shapes

Controls are gently squared: 6px radius on buttons, inputs, selects, tabs, and menu rows; 8px on compact icon tiles; 12px on standard cards and popovers; 16px on feature cards; 24px on the largest marketing panels. Badges and status pills are fully round. The logo itself is a long, pill-shaped lockup, so pill geometry is reserved for identity and status, not for ordinary buttons.

Borders are 1px and always the hairline color. There are no thick decorative strokes, no corner cuts, and no mixed radii inside a single component. Icon tiles use the same 8px radius as their adjacent controls.

### Named Rules
**The One Radius Rule.** A component uses one corner radius family. Do not pair a 6px button with a 12px input inside the same control group.

## Components

### Buttons
- **Shape:** Gently squared (6px radius), 36px default height, 32px small, 40px large, 48px extra-large on the hero.
- **Primary:** Pale mint fill with deep mint ink, 8px 16px padding, medium weight. The hero uses the 48px `xl` size.
- **Hover / Focus:** Primary darkens to 90% opacity. Outline and ghost fill with stone. Focus is a 3px mint ring at 50% opacity, never a glow.
- **Secondary / Outline / Ghost:** Outline is paper with a hairline border and `shadow-xs`; ghost is transparent until hover; secondary uses the stone fill. Destructive uses signal red with white text.

### Chips
- **Style:** Fully round, 2px 8px padding, 12px medium text, 20px tall. Default chips use stone fill with graphite text; the "Popular" pricing chip uses the mint fill.
- **State:** Chips are labels, not filters. Selection is expressed by the mint left border on a vault row, not by chip color.

### Cards / Containers
- **Corner Style:** 12px for standard cards, 16px for feature cards, 24px for marketing display panels.
- **Background:** Paper white, with stone for inset or alternating bands.
- **Shadow Strategy:** Border at rest; `shadow-sm` for standard cards; `shadow-xl` only on hover.
- **Border:** 1px hairline on every card.
- **Internal Padding:** 24px standard; 20px for compact feature cards; 12px for vault rows.

### Inputs / Fields
- **Style:** 36px tall by default, 44px on authentication forms. Field wash or transparent background, hairline border, 6px radius, 12px horizontal padding, 14px text. Icons sit in muted addons at the leading edge.
- **Focus:** Border shifts to mint with a 3px mint ring at 50% opacity. The ring is the only focus ornament.
- **Error / Disabled:** Invalid fields switch the border and ring to signal red; disabled controls drop to 50% opacity and lose pointer events. Errors use 12px red text below the field.

### Navigation
- **Marketing navbar:** Sticky, translucent paper at 30% opacity with backdrop blur, max 1152px, 40px logo, ghost links, and one primary "Get Started Free" button. Mobile swaps to a sheet with full-width ghost links.
- **App sidebar:** 16rem paper column with a 1px right border. Rows are 36px tall, 6px radius, 14px medium text; hover and active states use the stone fill and soft graphite text. Group labels are 12px slate uppercase. Collapsing leaves a 48px icon rail.

### Vault Row (signature)
The recurring vault item is an outline button stretched to full width, 12px radius at the row level but 6px on the control, with a 40px avatar, title plus 10px type badge, muted username, and a right chevron. The selected row gains a 4px mint left border. This row is the product's core repeated object and should stay recognizable in every list view.

### Empty State
Centered, never a blank panel: a masked 144px column of skeleton cards scrolls upward on a 22-second linear loop, followed by a 16px semibold title and 14px muted instruction. The motion is ambient and must pause or degrade gracefully when reduced motion is requested.

## Do's and Don'ts

### Do:
- **Do** keep mint to one primary action, one active marker, or one emphasized phrase per section.
- **Do** use 1px hairline borders and paper/stone tones to build hierarchy before reaching for shadow.
- **Do** keep controls 36px tall in the app, 44px in authentication, with 6px radius and clear hover states.
- **Do** reserve Geist Mono for passwords, keys, hashes, domains, and audit values.
- **Do** hide or simplify the hero demo below `md` rather than compressing it into an unreadable phone layout.
- **Do** honor reduced-motion preferences in the animated demos and empty-state loop.

### Don't:
- **Don't** use cyberpunk or hacker aesthetics: no neon-on-black, matrix rain, glowing shields, or lock emblems as decoration.
- **Don't** flood panels or page backgrounds with mint; the accent loses meaning when it becomes a fill.
- **Don't** pair multiple corner radii inside one control group or card.
- **Don't** put shadows on resting cards beyond `shadow-sm`, and never use a glow as a focus or hover state.
- **Don't** use Source Serif 4 for interface or body copy.
- **Don't** fabricate testimonials, customer logos, benchmarks, or security proof to fill a layout.
