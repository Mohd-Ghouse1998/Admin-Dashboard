# OCPI Dual-Role Module

This module implements a full-featured, dual-role OCPI (Open Charge Point Interface) functionality that supports both Charge Point Operator (CPO) and e-Mobility Service Provider (EMSP) roles with seamless switching between them.

## Overview

The OCPI (Open Charge Point Interface) module provides a complete implementation of the OCPI protocol for both Charge Point Operators (CPOs) and E-Mobility Service Providers (EMSPs). This dual-role implementation allows a single platform to function as both a CPO and an EMSP, with the ability to switch between roles seamlessly.

## Architecture

The OCPI module is built with a modular architecture following these design principles:

- **Role-based Design**: All components adapt their behavior based on the current role (CPO or EMSP)
- **Context API Integration**: Utilizes React Context for global state management of OCPI roles
- **API Service Abstraction**: Implements role-based API services to handle backend communication
- **Route Segregation**: Organizes routes specific to each role while sharing common components
- **Dynamic Navigation**: Builds navigation items dynamically based on the current role

## Directory Structure

```
/src/modules/ocpi/
├── components/          # Shared OCPI components
│   ├── OCPILayout.tsx   # Layout wrapper for all OCPI pages
│   └── RoleSwitcher.tsx # Role switching component
├── contexts/
│   └── OCPIRoleContext.tsx # Context for managing OCPI role
├── navigation/
│   └── ocpiNavigation.tsx  # Navigation configuration
├── pages/
│   ├── dashboards/      # Dashboard pages for CPO & EMSP
│   ├── shared/          # Pages shared between roles
│   ├── cpo/            # CPO-specific pages
│   ├── emsp/           # EMSP-specific pages
│   └── RoleSwitcherPage.tsx # Role selection page
├── services/
│   ├── ocpiService.ts      # Core OCPI API service
│   └── roleBasedApiService.ts # Role-specific API service
└── OCPIWrapper.tsx     # Main wrapper component for OCPI
```

## Key Components

### OCPIRoleContext

The `OCPIRoleContext` manages the current OCPI role and synchronizes it with the backend. It provides:

- Current role state (CPO or EMSP)
- Available roles for the current user
- Role switching functionality
- Backend synchronization
- Error handling for role switching

Example usage:

```tsx
import { useOCPIRole } from '../contexts/OCPIRoleContext';

const MyComponent = () => {
  const { role, syncRoleWithBackend } = useOCPIRole();
  
  return (
    <div>Current role: {role}</div>
  );
};
```

### RoleSwitcher

The `RoleSwitcher` component provides a user interface for switching between CPO and EMSP roles. It uses the `OCPIRoleContext` to perform the role switch and navigate to the appropriate dashboard.

### roleBasedApiService

The `roleBasedApiService` provides role-specific API endpoints for OCPI operations. It automatically adjusts the API paths based on the current role and handles common error scenarios.

Example usage:

```tsx
import { useRoleBasedApiService } from '../services/roleBasedApiService';

const MyComponent = () => {
  const { get, post, put, delete: deleteRequest } = useRoleBasedApiService();
  
  const fetchData = async () => {
    const response = await get('tokens');
    return response.data;
  };
  
  return <div>...</div>;
};
```

## Features

### Role Switching

Users can switch between CPO and EMSP roles, with the UI adapting dynamically based on the selected role.

### Connection Management

The Connections page allows users to:
- Create new OCPI connections with external parties
- View and manage existing connections
- Test connection status
- Delete connections

### Token Validation

The Token Validator allows users to:
- Validate OCPI tokens against the network
- View token details
- Check token validation status

### Dashboards

Role-specific dashboards provide:
- Key metrics for the current role
- Status of connections
- Recent activity
- Performance indicators

### Location Management

- CPOs can manage their charging locations, EVSEs, and connectors
- EMSPs can browse and search for charging locations

## Route Structure

The OCPI module uses the following route structure:

- `/ocpi/select-role` - Role selection page
- `/ocpi/connections` - Shared connections management
- `/ocpi/cpo/*` - CPO-specific routes
- `/ocpi/emsp/*` - EMSP-specific routes

## API Endpoints

The OCPI module uses the following API endpoint structure:

- `/api/ocpi/role` - Role management endpoints
- `/ocpi/versions` - OCPI protocol versions endpoint
- `/ocpi/2.2/credentials` - OCPI credentials endpoint
- `/api/ocpi/connections` - Connection management endpoints
- `/api/ocpi/cpo/*` - CPO-specific endpoints
- `/api/ocpi/emsp/*` - EMSP-specific endpoints

## Implementation Notes

- The module is designed to work with OCPI versions 2.1.1, 2.2, and 2.2.1
- Role persistence is handled via localStorage with backend synchronization
- Error handling includes both UI feedback and console logging
- All API calls include proper error handling and loading states

## Usage

### Role Management

The OCPI role can be switched using the `RoleSwitcher` component or through the `RoleSwitcherPage`:

```tsx
import { useOCPIRole } from '@/modules/ocpi/contexts/OCPIRoleContext';

const MyComponent = () => {
  const { role, setRole } = useOCPIRole();
  
  return (
    <div>
      <p>Current role: {role}</p>
      <button onClick={() => setRole('CPO')}>Switch to CPO</button>
      <button onClick={() => setRole('EMSP')}>Switch to EMSP</button>
    </div>
  );
};
```

### API Service

To make role-based API calls, use the `useRoleBasedApiService` hook:

```tsx
import { useRoleBasedApiService } from '@/modules/ocpi/services/roleBasedApiService';

const MyComponent = () => {
  const api = useRoleBasedApiService();
  
  const fetchData = async () => {
    // This will automatically use the correct endpoint based on the active role
    const response = await api.get('locations');
    return response.data;
  };
  
  return (
    // Component implementation
  );
};
```

### Navigation

The OCPI navigation can be integrated into the main application navigation using the `useOCPINavigationConfig` hook:

```tsx
import { useOCPINavigationConfig } from '@/modules/ocpi/navigation/OCPINavigationConfig';
import { navigationConfig } from '@/components/layout/navigationConfig';

const CustomNavigation = () => {
  const ocpiNavSection = useOCPINavigationConfig();
  
  // Find and replace the existing OCPI section
  const updatedNavigation = navigationConfig.map(section => 
    section.id === 'ocpi' ? ocpiNavSection : section
  );
  
  return (
    // Render navigation with the updated config
  );
};
```

## Routes

The OCPI routes are defined in `/routes/ocpiRoutes.tsx` and include paths for both CPO and EMSP functionality:

- `/ocpi/role-switcher`: Role switching page
- `/ocpi/cpo/dashboard`: CPO-specific dashboard
- `/ocpi/emsp/dashboard`: EMSP-specific dashboard
- `/ocpi/cpo/locations`: CPO location management
- `/ocpi/emsp/locations`: EMSP location discovery
- `/ocpi/emsp/sessions`: EMSP session management

## Theming

The module includes role-specific theming via the `OCPITheme` component:

- CPO mode uses blue as the primary color
- EMSP mode uses green as the primary color

## Additional Resources

- [OCPI Documentation](https://evroaming.org/ocpi/)
- [OCPI GitHub Repository](https://github.com/ocpi/ocpi)
