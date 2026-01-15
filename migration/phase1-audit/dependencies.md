# Angular to React Migration Audit - Dependencies Report

**Repository:** mbatchelor81/real-estate-management  
**Branch:** main  
**Audit Date:** 2026-01-15  
**Focus Modules:** properties, map, mortgage-calc

---

## 1. Angular Core Packages

| Package | Version | Purpose | React Equivalent |
|---------|---------|---------|------------------|
| @angular/common | ^19.2.10 | Common utilities, pipes, directives | Built-in React + utility libraries |
| @angular/core | ^19.2.10 | Core framework | React 18+ |
| @angular/forms | ^19.2.10 | Reactive forms, validation | react-hook-form or Formik |
| @angular/platform-browser | ^19.2.10 | Browser platform | react-dom |
| @angular/platform-browser-dynamic | ^19.2.10 | JIT compilation | Not needed in React |
| @angular/router | ^19.2.10 | Routing | react-router-dom v6 |

**Migration Notes:**
- Angular's reactive forms map well to react-hook-form with similar validation patterns
- Angular's signals (signal(), computed(), toSignal()) map to React's useState, useMemo, and custom hooks
- Angular's dependency injection becomes React Context + custom hooks

---

## 2. Ionic Framework Packages

| Package | Version | Purpose | React Equivalent |
|---------|---------|---------|------------------|
| @ionic/angular | ^8.2.2 | Ionic Angular integration | @ionic/react |
| @ionic/core | ^8.2.2 | Ionic web components | @ionic/react (includes core) |
| @ionic/storage-angular | ^4.0.0 | Local storage abstraction | @capacitor/preferences or localforage |

**Migration Notes:**
- Ionic has official React bindings (@ionic/react) - most components have 1:1 equivalents
- IonModal, IonAlert, IonToast become useIonModal, useIonAlert, useIonToast hooks
- Ionic lifecycle hooks (ionViewDidEnter, etc.) become useIonViewDidEnter hooks
- IonicRouteStrategy for route reuse needs custom implementation in React

### Ionic Components Used in Focused Modules

| Ionic Component | Usage Location | React Equivalent |
|-----------------|----------------|------------------|
| ion-header | All pages | IonHeader |
| ion-toolbar | All pages | IonToolbar |
| ion-title | All pages | IonTitle |
| ion-buttons | All pages | IonButtons |
| ion-button | Multiple components | IonButton |
| ion-menu-button | All pages | IonMenuButton |
| ion-content | All pages | IonContent |
| ion-grid | Multiple templates | IonGrid |
| ion-row | Multiple templates | IonRow |
| ion-col | Multiple templates | IonCol |
| ion-card | Properties, Map, Mortgage | IonCard |
| ion-card-header | Properties detail | IonCardHeader |
| ion-card-content | Properties detail | IonCardContent |
| ion-card-title | Properties detail | IonCardTitle |
| ion-searchbar | Properties page | IonSearchbar |
| ion-select | Properties page | IonSelect |
| ion-select-option | Properties page | IonSelectOption |
| ion-list | Properties page | IonList |
| ion-item | Properties page | IonItem |
| ion-icon | Multiple components | IonIcon |
| ion-fab | Properties page | IonFab |
| ion-fab-button | Properties page | IonFabButton |
| ion-progress-bar | Properties page/detail | IonProgressBar |
| ion-badge | Properties detail | IonBadge |
| ion-text | Multiple components | IonText |
| ion-spinner | Properties detail | IonSpinner |
| ion-infinite-scroll | Properties list | IonInfiniteScroll |

### Ionic Services Used

| Service | Usage | React Equivalent |
|---------|-------|------------------|
| ModalController | Properties, Map | useIonModal hook |
| ToastController | Properties, App | useIonToast hook |
| AlertController | Properties, App | useIonAlert hook |
| PopoverController | Properties detail | useIonPopover hook |
| Platform | App component | usePlatform hook from @ionic/react |

---

## 3. Capacitor Packages

| Package | Version | Purpose | React Equivalent |
|---------|---------|---------|------------------|
| @capacitor/core | ^4.8.2 | Capacitor runtime | Same - works with React |
| @capacitor/android | ^4.8.2 | Android platform | Same - works with React |
| @capacitor/app | ^4.0.0 | App lifecycle events | Same - use with useEffect |
| @capacitor/haptics | ^4.0.0 | Haptic feedback | Same - works with React |
| @capacitor/keyboard | ^4.0.0 | Keyboard events | Same - works with React |
| @capacitor/status-bar | ^4.0.0 | Status bar control | Same - works with React |

**Migration Notes:**
- All Capacitor plugins work identically with React - no changes needed
- Capacitor config (capacitor.config.json) remains the same
- Mobile build process (npx cap sync, npx cap run) unchanged

### Capacitor Configuration
```json
{
  "appId": "io.ionic.starter",
  "appName": "real-estate-management",
  "webDir": "www",
  "bundledWebRuntime": false
}
```

---

## 4. Third-Party UI Libraries

| Package | Version | Purpose | React Equivalent |
|---------|---------|---------|------------------|
| chart.js | ^3.5.1 | Charts (pie, line) | react-chartjs-2 + chart.js |
| leaflet | ^1.9.4 | Interactive maps | react-leaflet |
| leaflet-geosearch | ^3.7.0 | Location search | Same - works with react-leaflet |
| swiper | ^11.0.4 | Image carousels | swiper/react |

### Chart.js Integration Details

**Current Usage:**
- MortgagePieChartComponent: Doughnut chart for payment breakdown
- MortgageLineChartComponent: Line chart for amortization schedule

**React Migration:**
```jsx
// Install: npm install react-chartjs-2 chart.js
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// Usage is nearly identical - pass data and options as props
<Doughnut data={chartData} options={chartOptions} />
```

### Leaflet Integration Details

**Current Usage:**
- MapLeafletComponent: Main map with markers, popups, layer groups
- MapService: Tile layer and marker management
- Custom marker icons for property types

**React Migration:**
```jsx
// Install: npm install react-leaflet leaflet
import { MapContainer, TileLayer, Marker, Popup, LayerGroup } from 'react-leaflet';

// Component-based approach instead of imperative
<MapContainer center={[lat, lng]} zoom={18}>
  <TileLayer url={tileUrl} />
  <LayerGroup>
    {properties.map(p => (
      <Marker key={p.id} position={[p.lat, p.lng]} icon={customIcon}>
        <Popup>{popupContent}</Popup>
      </Marker>
    ))}
  </LayerGroup>
</MapContainer>
```

### Swiper Integration Details

**Current Usage:**
- Registered globally in app.component.ts: `register()` from swiper/element/bundle
- Used for image galleries

**React Migration:**
```jsx
// Install: npm install swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

<Swiper spaceBetween={10} slidesPerView={1}>
  {images.map(img => (
    <SwiperSlide key={img}><img src={img} /></SwiperSlide>
  ))}
</Swiper>
```

---

## 5. RxJS and Related Utilities

| Package | Version | Purpose | React Equivalent |
|---------|---------|---------|------------------|
| rxjs | ^7.5.0 | Reactive programming | @tanstack/react-query + Zustand |

### RxJS Patterns Used and React Equivalents

| RxJS Pattern | Usage | React Equivalent |
|--------------|-------|------------------|
| BehaviorSubject | State management in services | Zustand store or useState |
| Observable.pipe() | Data transformation | useMemo or custom hooks |
| firstValueFrom() | Convert Observable to Promise | Direct async/await |
| map() operator | Transform data | Array.map() or useMemo |
| takeUntilDestroyed() | Auto-unsubscribe | useEffect cleanup |
| toSignal() | Observable to Signal | Custom hook with useState |

**Migration Example:**
```typescript
// Angular with RxJS
private propertiesSub = new BehaviorSubject<Property[]>([]);
public properties$ = this.propertiesSub.asObservable();

// React with Zustand
const usePropertiesStore = create((set) => ({
  properties: [],
  setProperties: (properties) => set({ properties }),
}));
```

---

## 6. Utility Libraries

| Package | Version | Purpose | React Equivalent |
|---------|---------|---------|------------------|
| tslib | ^2.3.1 | TypeScript helpers | Same |
| zone.js | ^0.15.0 | Angular change detection | Not needed in React |

---

## 7. Markdown Libraries

| Package | Version | Purpose | React Equivalent |
|---------|---------|---------|------------------|
| ngx-markdown | ^19.1.1 | Markdown rendering | react-markdown |
| @ngx-markdown/core | ^0.2.2 | Markdown core | react-markdown |

---

## 8. Editor Libraries

| Package | Version | Purpose | React Equivalent |
|---------|---------|---------|------------------|
| @ckeditor/ckeditor5-angular | ^6.0.1 | Rich text editor | @ckeditor/ckeditor5-react |
| @ckeditor/ckeditor5-build-classic | ^37.0.0 | CKEditor build | Same build works with React |

---

## 9. Type Definitions

| Package | Version | Purpose | React Equivalent |
|---------|---------|---------|------------------|
| @types/google.maps | ^3.51.0 | Google Maps types | Same |
| @types/leaflet | ^1.7.5 | Leaflet types | Same |
| @types/node | ^12.20.23 | Node.js types | Same |

---

## 10. CSS Framework

| Package | Version | Purpose | React Equivalent |
|---------|---------|---------|------------------|
| tailwindcss | ^4.1.6 | Utility CSS | Same - works with React |
| @tailwindcss/cli | ^4.1.6 | Tailwind CLI | Same |

**Migration Notes:**
- Tailwind CSS works identically with React
- Keep existing tailwind.config.js
- Update build scripts for React (Vite or CRA)

---

## 11. Dev Dependencies Summary

| Category | Angular Packages | React Equivalents |
|----------|------------------|-------------------|
| Build | @angular-devkit/build-angular | Vite or Create React App |
| CLI | @angular/cli | Vite CLI or CRA scripts |
| Linting | @angular-eslint/* | eslint + eslint-plugin-react |
| Testing | karma, jasmine | Jest + React Testing Library |
| TypeScript | typescript ^5.7.3 | Same version |

---

## 12. Recommended React Stack

### Core Framework
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.7.3"
}
```

### Routing
```json
{
  "react-router-dom": "^6.x"
}
```

### State Management
```json
{
  "@tanstack/react-query": "^5.x",
  "zustand": "^4.x"
}
```

### UI Framework
```json
{
  "@ionic/react": "^8.x",
  "@ionic/react-router": "^8.x"
}
```

### Forms
```json
{
  "react-hook-form": "^7.x",
  "zod": "^3.x"
}
```

### Maps & Charts
```json
{
  "react-leaflet": "^4.x",
  "leaflet": "^1.9.x",
  "react-chartjs-2": "^5.x",
  "chart.js": "^4.x"
}
```

### Mobile
```json
{
  "@capacitor/core": "^5.x",
  "@capacitor/android": "^5.x",
  "@capacitor/app": "^5.x",
  "@capacitor/haptics": "^5.x",
  "@capacitor/keyboard": "^5.x",
  "@capacitor/status-bar": "^5.x",
  "@capacitor/preferences": "^5.x"
}
```

### Styling
```json
{
  "tailwindcss": "^4.x"
}
```

### Build Tool
```json
{
  "vite": "^5.x",
  "@vitejs/plugin-react": "^4.x"
}
```

---

## 13. Package.json Migration Template

```json
{
  "name": "real-estate-management-react",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint src --ext ts,tsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@ionic/react": "^8.2.2",
    "@ionic/react-router": "^8.2.2",
    "@tanstack/react-query": "^5.8.0",
    "zustand": "^4.4.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "react-leaflet": "^4.2.0",
    "leaflet": "^1.9.4",
    "leaflet-geosearch": "^3.7.0",
    "react-chartjs-2": "^5.2.0",
    "chart.js": "^4.4.0",
    "swiper": "^11.0.4",
    "@capacitor/core": "^5.5.0",
    "@capacitor/app": "^5.0.0",
    "@capacitor/haptics": "^5.0.0",
    "@capacitor/keyboard": "^5.0.0",
    "@capacitor/status-bar": "^5.0.0",
    "@capacitor/preferences": "^5.0.0",
    "axios": "^1.6.0",
    "tailwindcss": "^4.1.6"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/leaflet": "^1.9.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.7.3",
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.1.0",
    "eslint": "^8.53.0",
    "eslint-plugin-react": "^7.33.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "@capacitor/cli": "^5.5.0",
    "@capacitor/android": "^5.5.0"
  }
}
```
