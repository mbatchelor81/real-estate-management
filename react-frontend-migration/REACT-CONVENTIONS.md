# React Conventions and Style Guide

This document establishes coding conventions for the React migration of the Real Estate Management application. All contributors must follow these guidelines to ensure consistency across the codebase.

## TypeScript Strict Typing Guidelines

### General Rules

All code must pass TypeScript strict mode checks. The following compiler options are enforced:

- `strict: true` - Enables all strict type-checking options
- `noImplicitAny: true` - Disallow implicit `any` types
- `strictNullChecks: true` - Null and undefined are distinct types
- `strictFunctionTypes: true` - Strict checking of function types
- `strictBindCallApply: true` - Strict checking of bind, call, and apply
- `strictPropertyInitialization: true` - Class properties must be initialized
- `noImplicitReturns: true` - All code paths must return a value
- `noUnusedLocals: true` - Report errors on unused local variables
- `noUnusedParameters: true` - Report errors on unused parameters

### Type Annotations

Always provide explicit type annotations for function parameters, return types, and complex variables:

```typescript
// Good
function calculateTotal(price: number, quantity: number): number {
  return price * quantity;
}

// Bad - implicit any and return type
function calculateTotal(price, quantity) {
  return price * quantity;
}
```

### Avoid `any` Type

Never use `any` type. Use `unknown` for truly unknown types and narrow with type guards:

```typescript
// Good
function processData(data: unknown): string {
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
  throw new Error('Expected string');
}

// Bad
function processData(data: any): string {
  return data.toUpperCase();
}
```

### Interface vs Type

Use `interface` for object shapes that may be extended. Use `type` for unions, intersections, and primitives:

```typescript
// Interface for extendable objects
interface User {
  id: string;
  name: string;
}

interface AdminUser extends User {
  permissions: string[];
}

// Type for unions and complex types
type PropertyType = 'residential' | 'commercial' | 'industrial' | 'land';
type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };
```

### Generics

Use generics for reusable components and functions:

```typescript
// Good
function useApiCall<T>(fetcher: () => Promise<T>): { data: T | null; loading: boolean } {
  // implementation
}

// Component with generic props
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactElement;
}
```

## Component Conventions

### File Naming

- Components: `PascalCase.tsx` (e.g., `PropertyCard.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useProperties.ts`)
- Utils: `camelCase.ts` (e.g., `formatCurrency.ts`)
- Types: `camelCase.ts` (e.g., `property.ts`)
- Constants: `SCREAMING_SNAKE_CASE` in `constants.ts`

### Component Structure

Follow this order within component files:

1. Imports (external, then internal, then styles)
2. Type definitions
3. Constants
4. Component function
5. Export

```typescript
// 1. Imports
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui';
import type { Property } from '@/types';

// 2. Type definitions
interface PropertyCardProps {
  property: Property;
  onSelect: (id: string) => void;
}

// 3. Constants
const DEFAULT_IMAGE = '/placeholder.png';

// 4. Component function
export function PropertyCard({ property, onSelect }: PropertyCardProps): React.ReactElement {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    // JSX
  );
}
```

### Props Typing

Always define props interfaces explicitly:

```typescript
// Good
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function Button({ variant, size = 'md', disabled = false, onClick, children }: ButtonProps): React.ReactElement {
  // implementation
}
```

### Return Types

Always specify return types for components:

```typescript
// Good
export function MapPage(): React.ReactElement {
  return <div>Map</div>;
}

// For components that may return null
export function ConditionalComponent({ show }: { show: boolean }): React.ReactElement | null {
  if (!show) return null;
  return <div>Content</div>;
}
```

## Hooks Conventions

### Custom Hook Naming

All custom hooks must start with `use`:

```typescript
// Good
function useProperties(): { properties: Property[]; loading: boolean } {
  // implementation
}

// Bad
function getProperties(): { properties: Property[]; loading: boolean } {
  // implementation
}
```

### Hook Return Types

Always define return types for hooks:

```typescript
interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
}

function useAuth(): UseAuthReturn {
  // implementation
}
```

## State Management Conventions

### Redux Toolkit

Use typed hooks from the store:

```typescript
// In store/hooks.ts
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// In components
const dispatch = useAppDispatch();
const { properties, isLoading } = useAppSelector((state) => state.properties);
```

### Slice Naming

- Slice files: `{domain}Slice.ts` (e.g., `authSlice.ts`, `propertiesSlice.ts`)
- Action creators: `camelCase` verbs (e.g., `fetchProperties`, `setUser`)
- Selectors: `select{Domain}{Property}` (e.g., `selectAuthUser`, `selectPropertiesLoading`)

## API Conventions

### API Functions

Group API functions by domain:

```typescript
// api/properties.ts
export const propertiesApi = {
  getProperties: async (filters: PropertyFilters): Promise<ApiResponse<PropertiesResponse>> => {
    // implementation
  },
  getProperty: async (id: string): Promise<ApiResponse<Property>> => {
    // implementation
  },
};
```

### Error Handling

Always handle errors with proper typing:

```typescript
try {
  const response = await propertiesApi.getProperty(id);
  return response.data;
} catch (error) {
  if (error instanceof AxiosError) {
    throw new Error(error.response?.data?.message ?? 'Request failed');
  }
  throw error;
}
```

## Folder Structure

```
src/
├── api/              # API client and endpoint functions
├── components/       # Reusable components
│   └── ui/          # Base UI components (Button, Input, Modal)
├── hooks/           # Custom hooks
├── pages/           # Page components (route-level)
├── routes/          # Router configuration and guards
├── store/           # Redux store and slices
│   └── slices/      # Individual slice files
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── test/            # Test setup and utilities
```

## Import Aliases

Use path aliases for cleaner imports:

```typescript
// Good
import { Button } from '@/components/ui';
import { useAppSelector } from '@/store';
import type { Property } from '@/types';

// Bad
import { Button } from '../../../components/ui';
import { useAppSelector } from '../../../store';
```

## Testing Conventions

### Test File Naming

- Unit tests: `{ComponentName}.test.tsx`
- Integration tests: `{feature}.integration.test.tsx`

### Test Structure

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PropertyCard } from './PropertyCard';

describe('PropertyCard', () => {
  const mockProperty: Property = {
    property_id: '1',
    name: 'Test Property',
    // ... other required fields
  };

  it('renders property name', () => {
    render(<PropertyCard property={mockProperty} onSelect={() => {}} />);
    expect(screen.getByText('Test Property')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', async () => {
    const handleSelect = vi.fn();
    render(<PropertyCard property={mockProperty} onSelect={handleSelect} />);
    await userEvent.click(screen.getByRole('button'));
    expect(handleSelect).toHaveBeenCalledWith('1');
  });
});
```

## ESLint and Prettier

All code must pass ESLint and Prettier checks before committing. Run:

```bash
npm run lint        # Check for linting errors
npm run lint:fix    # Auto-fix linting errors
npm run format      # Format code with Prettier
npm run typecheck   # Run TypeScript type checking
```

## Forbidden Patterns

The following patterns are strictly forbidden:

1. Using `any` type
2. Using `@ts-ignore` or `@ts-nocheck`
3. Using `as` type assertions without proper validation
4. Mutating Redux state directly
5. Using `var` keyword
6. Using `==` instead of `===`
7. Leaving console.log statements in production code
8. Using inline styles (use Tailwind classes instead)
9. Creating components without explicit return types
10. Using `getattr`, `setattr`, or dynamic property access without type guards
