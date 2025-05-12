# Django Unfold Admin Theme-Inspired Styling System

This directory contains UI components that implement a typography and styling system inspired by the Django Unfold admin theme. The system uses Tailwind CSS for styling and provides a consistent, professional interface.

## Typography System

### Font Family
- **Inter** font with weights 400 (regular), 500 (medium), and 600 (semibold)

### Font Sizes
- Body text (default): 16px/1.5 (`text-base`)
- Small text (primary UI text): 14px/1.25rem (`text-sm`)
- Extra small text (captions): 12px/1rem (`text-xs`)
- Very small text (badges): 11px/14px (`text-xxs`)
- Heading level 3: 18px/1.75rem (`text-lg`)
- Heading level 2: 20px/1.75rem (`text-xl`)
- Heading level 1: 24px/2rem (`text-2xl`)

### Font Weights
- Regular (400): For normal body text
- Medium (500): For labels, navigation items, buttons
- Semibold (600): For headings and strong emphasis

## Color System

### Background Colors
- Main background: `bg-white` (dark: `dark:bg-gray-900`)
- Sidebar background: `bg-gray-50` (dark: `dark:bg-gray-900`)
- Card background: `bg-white` (dark: `dark:bg-gray-900`)
- Secondary background: `bg-gray-50` (dark: `dark:bg-gray-800`)
- Section header background: `bg-gray-100` (dark: `dark:bg-white/[.02]`)
- Input background: `bg-white` (dark: `dark:bg-gray-800`)

### Text Colors
- Primary text: `text-gray-900` (dark: `dark:text-white`)
- Secondary text: `text-gray-700` (dark: `dark:text-gray-200`)
- Tertiary text: `text-gray-500` (dark: `dark:text-gray-400`)
- Muted text: `text-gray-400` (dark: `dark:text-gray-600`)

### Border Colors
- Primary border: `border-gray-200` (dark: `dark:border-gray-800`)
- Input border: `border-gray-300` (dark: `dark:border-gray-700`)
- Focus border: `focus:border-primary-500`

## Components

### Icon Component
A reusable component for Material Symbols icons:

```jsx
<Icon name="dashboard" className="text-gray-500 dark:text-gray-400" />
```

### UnfoldButton Component
Styled buttons with primary and secondary variants:

```jsx
<UnfoldButton variant="primary">Primary Action</UnfoldButton>
<UnfoldButton variant="secondary">Secondary Action</UnfoldButton>
```

### UnfoldCard Component
Card container with styled header and body:

```jsx
<UnfoldCard title="Card Title">
  {/* Card content */}
</UnfoldCard>
```

### UnfoldInput Component
Styled form inputs with labels and error states:

```jsx
<UnfoldInput 
  label="Field Label"
  placeholder="Enter value"
  helperText="Helper text"
/>
```

### UnfoldTableStyled Component
Styled tables with headers and data:

```jsx
<UnfoldTableStyled 
  headers={["Name", "Email", "Status"]}
  keys={["name", "email", "status"]}
  data={users}
/>
```

## Demo

A comprehensive demo of all styling elements is available in the `UnfoldDemo` component. You can view this demo on the Settings page.

## Usage Guidelines

1. Use the appropriate text sizes and weights for different UI elements
2. Maintain consistent spacing between elements
3. Use the color system consistently for backgrounds, text, and borders
4. Leverage the provided components for common UI patterns
5. Ensure dark mode compatibility by using the provided dark mode variants

## Implementation Priority

1. Typography system and color scheme in Tailwind config ✅
2. Form input components with the new styling ✅
3. Button styling ✅
4. Card and container components ✅
5. Table styling ✅
6. Dark mode variants ✅