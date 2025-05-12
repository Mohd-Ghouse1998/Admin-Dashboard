# UnfoldSidebar Component

A React component that implements a sidebar navigation following the Django Unfold admin theme styling using Tailwind CSS.

## Features

- Fixed sidebar with exact Django Unfold styling
- Logo/header section
- Search box with filtering functionality
- Navigation sections with category headers
- Support for active state styling
- Dark mode support
- Material Symbols icons integration

## Installation

### Material Symbols Icons

To use this component, you need to include Material Symbols icons in your project. Add the following line to your `index.html` file:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
```

## Usage

```jsx
import { UnfoldSidebar } from "@/components/ui/unfold-sidebar";

// Define your navigation structure
const navigationSections = [
  {
    title: "Charger Management",
    items: [
      {
        title: "Chargers",
        icon: "bolt",
        link: "/chargers",
      },
      {
        title: "Charging sessions",
        icon: "electric_bolt",
        link: "/sessions",
        active: true, // Manually set active state
      },
    ],
  },
  // More sections...
];

function MyLayout() {
  return (
    <div className="relative">
      <UnfoldSidebar 
        navigationSections={navigationSections} 
        logo="/logo.jpg"
        appName="Joulepoint"
        dashboardLink="/dashboard"
      />
      <div className="ml-[280px] p-6">
        {/* Your main content */}
      </div>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `navigationSections` | `NavSection[]` | Required | Array of navigation sections with their items |
| `logo` | `string` | `/logo.jpg` | Path to the logo image |
| `appName` | `string` | `Joulepoint` | Application name displayed in the header |
| `dashboardLink` | `string` | `/dashboard` | Link for the logo and app name |
| `className` | `string` | `undefined` | Additional CSS classes for the sidebar |

## Types

```typescript
interface NavItem {
  title: string;
  icon: string; // Material Symbols icon name
  link: string;
  active?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}
```

## Styling

The component uses Tailwind CSS with exact styling from the Django Unfold admin theme. It includes:

- Fixed sidebar with specific width (280px)
- Proper spacing and padding
- Exact color schemes for light and dark modes
- Specific styling for active and hover states

## Active State

The active state of menu items is determined by:
1. The `active` property set to `true` in the navigation item
2. Matching the current route path with the item's link

## Search Functionality

The search box filters navigation items in real-time based on the input text.