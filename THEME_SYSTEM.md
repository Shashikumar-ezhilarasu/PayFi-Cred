# Theme System - PayForMe

## Color Tokens (Dark Theme)

### Base Colors

```css
--bg: #000000           /* Pure black background */
--card: #14161C         /* Card/panel background */
--elev: #1A1D22         /* Elevated surfaces */
```

### Text Colors

```css
--color-text: #D1D5DB         /* Primary text (soft, legible) */
--color-text-alt: #A3AEBF     /* Secondary text */
--color-muted: #6B7280        /* Muted/disabled text */
```

### Accent Colors

```css
--color-accent: #00F5D4       /* Primary neon accent (cyan) */
--color-accent2: #00E5FF      /* Secondary neon accent (blue) */
```

### Structural Colors

```css
--color-divider: #2a2f37; /* Borders and dividers */
```

## Typography Scale

### System Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
  "Helvetica Neue", Arial, sans-serif;
```

### Heading Sizes (Responsive)

- **H1**: 2rem - 3rem (clamp)
- **H2**: 1.5rem - 2.25rem (clamp)
- **H3**: 1.25rem - 1.75rem (clamp)
- **H4**: 1.125rem - 1.5rem (clamp)
- **H5**: 1rem - 1.25rem (clamp)
- **H6**: 0.875rem - 1rem (clamp)

### Typography Properties

- **Line Height**: 1.5 for body text, 1.2 for headings
- **Letter Spacing**: -0.02em for headings (tighter)
- **Font Weight**: 700 for headings
- **Base Size**: 16px

## Grid System

### 8px Grid

All spacing follows 8px increments:

- `gap-grid`: 8px
- `gap-grid-2x`: 16px
- `gap-grid-3x`: 24px
- `gap-grid-4x`: 32px

### Card Padding

Default card padding: 1.5rem (24px)

## Usage Examples

### Card Component

```tsx
<div className="card">
  <h3>Heading</h3>
  <p className="text-secondary">Description text</p>
</div>
```

### Neon Accent Elements

```tsx
<button className="neon-glow neon-border">
  <span className="neon-text">Click Me</span>
</button>
```

### Text Hierarchy

```tsx
<h2 className="text-primary">Main Heading</h2>
<p className="text-secondary">Supporting text</p>
<small className="text-muted">Meta information</small>
```

### Grid Layout

```tsx
<div className="grid gap-grid-2x">
  <div className="card">Card 1</div>
  <div className="card">Card 2</div>
</div>
```

## Tailwind Integration

### Custom Classes

Use CSS variables in Tailwind:

```tsx
className = "bg-[var(--card)] text-[var(--color-text)]";
```

### Common Patterns

```tsx
// Card
bg-[var(--card)] border border-[var(--color-divider)] rounded-xl p-6

// Elevated Surface
bg-[var(--elev)] border border-[var(--color-divider)]

// Neon Button
bg-[var(--color-accent)] text-[var(--bg)] hover:opacity-90

// Secondary Button
bg-[var(--card)] text-[var(--color-text)] border border-[var(--color-accent)]

// Input Field
bg-[var(--card)] border border-[var(--color-divider)] focus:border-[var(--color-accent)]
```

## Accessibility

### Focus States

All interactive elements have visible focus indicators:

```css
outline: 2px solid var(--color-accent);
outline-offset: 2px;
```

### Color Contrast

- Primary text (#D1D5DB) on black background: AAA compliant
- Secondary text (#A3AEBF) on black: AA compliant
- Muted text (#6B7280) on black: AA compliant for large text

### Selection

```css
::selection {
  background: var(--color-accent);
  color: var(--bg);
}
```

## Animation & Transitions

### Default Transition

```css
transition-duration: 200ms;
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
```

### Neon Glow Effects

```css
.neon-glow {
  box-shadow: 0 0 20px rgba(0, 245, 212, 0.3);
}

.neon-text {
  text-shadow: 0 0 10px rgba(0, 245, 212, 0.5);
}
```

## Dark Theme Enforcement

### HTML Root

```html
<html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
```

### Body Styles

System font, proper line-height, and overflow control applied globally.

## Component Guidelines

### Alignment

- **Text**: Left-aligned within panels
- **Horizontal**: Consistent alignment using 8px grid
- **Vertical**: Maintain visual rhythm with consistent spacing

### Card Design

1. Background: `var(--card)`
2. Border: 1px solid `var(--color-divider)`
3. Border Radius: 12px
4. Padding: 1.5rem (24px)
5. Spacing between cards: 16px (gap-grid-2x)

### Button Hierarchy

1. **Primary**: Neon gradient background
2. **Secondary**: Card background with neon border
3. **Tertiary**: Text only with neon hover state

### Input Fields

1. Background: `var(--card)`
2. Border: `var(--color-divider)`
3. Focus: `var(--color-accent)`
4. Text: `var(--color-text)`
5. Placeholder: `var(--color-muted)`

## Scrollbar Styling

Custom scrollbar with theme colors:

- Width: 8px
- Track: `var(--bg)`
- Thumb: `var(--color-divider)`
- Thumb Hover: `var(--color-muted)`

## Implementation Checklist

- [x] CSS variables defined in globals.css
- [x] Typography scale with responsive sizing
- [x] 8px grid system utilities
- [x] Neon glow effect utilities
- [x] Focus state styling
- [x] Selection styling
- [x] Custom scrollbar
- [x] Dark theme enforcement
- [ ] Update all components to use new color tokens
- [ ] Replace hardcoded colors with CSS variables
- [ ] Ensure consistent spacing with 8px grid
- [ ] Test accessibility and contrast ratios

## Migration Guide

### From Old Colors

```tsx
// Old
className = "bg-black text-white";

// New
className = "bg-[var(--bg)] text-[var(--color-text)]";
```

### From Hardcoded Green

```tsx
// Old
className = "text-green-500";

// New
className = "text-[var(--color-accent)]";
```

### From Inline Styles

```tsx
// Old
style={{ background: '#000' }}

// New
className="bg-[var(--bg)]"
```

## Best Practices

1. **Always use CSS variables** for colors
2. **Follow 8px grid** for all spacing
3. **Use semantic class names** (.text-primary, .card)
4. **Maintain text hierarchy** with proper heading levels
5. **Ensure sufficient contrast** for all text
6. **Test focus states** on all interactive elements
7. **Use neon accents sparingly** for emphasis only
8. **Keep card designs consistent** across the app

---

**Version**: 1.0.0  
**Last Updated**: January 11, 2026
