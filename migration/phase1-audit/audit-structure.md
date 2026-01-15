# Angular to React Migration Audit - Structure Report

**Repository:** mbatchelor81/real-estate-management  
**Branch:** main  
**Audit Date:** 2026-01-15  
**Focus Modules:** properties, map, mortgage-calc

---

## 1. Module Inventory

### 1.1 PropertiesPageModule
**File:** `frontend/src/app/properties/properties.module.ts`

**Imports:**
- CommonModule
- IonicModule
- PropertiesPageRoutingModule
- SharedModule
- EnquiriesPageModule
- MortgageCalcPageModule

**Declarations:**
| Component | File Path |
|-----------|-----------|
| PropertiesPage | `properties/properties.page.ts` |
| PropertiesNewComponent | `properties/properties-new-modal/properties-new.component.ts` |
| PropertiesListComponent | `properties/properties-list/properties-list.component.ts` |
| PropertiesCardComponent | `properties/properties-card/properties-card.component.ts` |
| PropertiesDetailComponent | `properties/properties-detail/properties-detail.component.ts` |
| PropertiesEditComponent | `properties/properties-edit-modal/properties-edit.component.ts` |
| PropertiesCoordinatesComponent | `properties/properties-coordinates-modal/properties-coordinates.component.ts` |
| PropertiesUploadsComponent | `properties/properties-uploads-modal/properties-uploads.component.ts` |
| PropertiesGalleryComponent | `properties/properties-gallery/properties-gallery.component.ts` |
| PropertiesCurrentImagesComponent | `properties/properties-uploads-modal/properties-current-images/properties-current-images.component.ts` |
| PropertiesListItemComponent | `properties/properties-list-item/properties-list-item.component.ts` |

**Exports:**
- PropertiesListComponent
- PropertiesCardComponent

---

### 1.2 MapPageModule
**File:** `frontend/src/app/map/map.module.ts`

**Imports:**
- CommonModule
- FormsModule
- IonicModule
- MapPageRoutingModule
- SharedModule
- PropertiesPageModule

**Declarations:**
| Component | File Path |
|-----------|-----------|
| MapPage | `map/map.page.ts` |
| MapPopupComponent | `map/map-popup/map-popup.component.ts` |
| MapMarkersLegendComponent | `map/map-markers-legend/map-markers-legend.component.ts` |
| ModalSearchComponent | `shared/components/modal-search/modal-search.component.ts` |

**Note:** MapLeafletComponent and MapSearchFieldComponent are declared in SharedModule.

---

### 1.3 MortgageCalcPageModule
**File:** `frontend/src/app/mortgage-calc/mortgage-calc.module.ts`

**Imports:**
- CommonModule
- FormsModule
- IonicModule
- MortgageCalcPageRoutingModule
- SharedModule

**Declarations:**
| Component | File Path |
|-----------|-----------|
| MortgageCalcPage | `mortgage-calc/mortgage-calc.page.ts` |
| MortgageCoreCalcComponent | `mortgage-calc/mortgage-core-calc/mortgage-core-calc.component.ts` |
| MortgagePieChartComponent | `mortgage-calc/mortgage-pie-chart/mortgage-pie-chart.component.ts` |
| MortgageLineChartComponent | `mortgage-calc/mortgage-line-chart/mortgage-line-chart.component.ts` |

**Exports:**
- MortgageCoreCalcComponent

---

### 1.4 SharedModule
**File:** `frontend/src/app/shared/shared.module.ts`

**Declarations:**
| Component | File Path |
|-----------|-----------|
| ActionPopupComponent | `shared/components/action-popup/action-popup.component.ts` |
| PropertyBadgeComponent | `shared/components/property-badge/property-badge.component.ts` |
| DivHorizontalSlideComponent | `shared/components/div-horizontal-slide/div-horizontal-slide.component.ts` |
| AlertCardComponent | `shared/components/alert-card/alert-card.component.ts` |
| ContactFormComponent | `shared/components/contact-form/contact-form.component.ts` |
| EnquiryBadgeComponent | `shared/components/enquiry-badge/enquiry-badge.component.ts` |
| MapLeafletComponent | `map/map-leaflet/map-leaflet.component.ts` |
| MapSearchFieldComponent | `map/map-search-field/map-search-field.component.ts` |
| FooterComponent | `shared/components/footer/footer.component.ts` |
| NeedSigninContinueComponent | `shared/components/need-signin-continue/need-signin-continue.component.ts` |
| NotificationBellComponent | `shared/components/notification-bell/notification-bell.component.ts` |
| NotificationBadgeComponent | `shared/components/notification-badge/notification-badge.component.ts` |

---

## 2. Component Inventory

### 2.1 Properties Module Components

#### PropertiesPage
**File:** `frontend/src/app/properties/properties.page.ts`  
**Selector:** `app-properties`  
**Standalone:** false  
**Change Detection:** Default

**Inputs:** None

**Outputs:** None

**Signals:**
- `search = signal<string>('')`
- `filterBy = signal<PropertyType[]>([])`
- `sortBy = signal<string>('latest')`
- `disableInfinitScroll = signal(false)`
- `displayOption = signal<PropertiesDisplayOption>(PropertiesDisplayOption.CardView)`
- `isLoading = computed<boolean>(() => this.propertiesService.isLoading())`
- `properties = toSignal(this.propertiesService.properties$)`
- `queryParams = toSignal(this.activatedRoutes.queryParams)`

**Lifecycle Hooks:**
- `ngOnInit`

**Dependencies (DI):**
- ModalController (Ionic)
- UserService
- Router
- ToastController (Ionic)
- PropertiesService
- ActivatedRoute

---

#### PropertiesDetailComponent
**File:** `frontend/src/app/properties/properties-detail/properties-detail.component.ts`  
**Selector:** `app-properties-detail`  
**Standalone:** false

**Inputs:** None

**Outputs:** None

**Signals:**
- `property = signal<Property>(undefined)`
- `ready = signal(false)`
- `isOwner = computed(() => this.userService.isPropertyOwner(this.property()))`

**Lifecycle Hooks:**
- `ngOnInit`

**Dependencies (DI):**
- Location
- UserService
- Router
- PropertiesService
- PopoverController (Ionic)
- ModalController (Ionic)
- ToastController (Ionic)
- ActivatedRoute
- RestrictionService
- AlertController (Ionic)

---

#### PropertiesListComponent
**File:** `frontend/src/app/properties/properties-list/properties-list.component.ts`  
**Selector:** `app-properties-list`  
**Standalone:** false

**Signal-based Inputs:**
- `displayOption = input<PropertiesDisplayOption>(PropertiesDisplayOption.CardView)`
- `singleCol = input<boolean>(false)`
- `horizontalSlide = input<boolean>(false)`
- `limit = input<number>(0)`
- `enableOwnedBadge = input<boolean>(false)`
- `enablePopupOptions = input<boolean>(false)`
- `properties = input<Property[]>()`

**Signal-based Model:**
- `disableInfinitScroll = model(false)`

**Computed Signals:**
- `hasNoMore = computed<boolean>(() => !this.propertiesService.hasMore())`
- `propertiesList = computed<Property[]>(() => {...})`
- `queryParams = toSignal(this.activatedRoute.queryParams)`

**Lifecycle Hooks:**
- `ngOnInit`

**Dependencies (DI):**
- ActivatedRoute
- PropertiesService

---

#### PropertiesNewComponent
**File:** `frontend/src/app/properties/properties-new-modal/properties-new.component.ts`  
**Selector:** `app-properties-new`  
**Standalone:** false

**Inputs:** None

**Outputs:** None

**Lifecycle Hooks:**
- `ngOnInit`

**Dependencies (DI):**
- ModalController (Ionic)
- UntypedFormBuilder
- PropertiesService
- ToastController (Ionic)
- RestrictionService

**Forms:**
- `propertyForm: UntypedFormGroup` with fields: name, address, description, type, transactionType, price, paymentFrequency, currency, features, lat, lng

---

#### PropertiesEditComponent
**File:** `frontend/src/app/properties/properties-edit-modal/properties-edit.component.ts`  
**Selector:** `app-properties-edit`  
**Standalone:** false

**Inputs:**
- `@Input() property: Property`

**Lifecycle Hooks:**
- `ngOnInit`

**Dependencies (DI):**
- ModalController (Ionic)
- UntypedFormBuilder
- PropertiesService
- ToastController (Ionic)
- RestrictionService

**Forms:**
- `propertyForm: UntypedFormGroup` with same fields as PropertiesNewComponent

---

#### PropertiesCardComponent
**File:** `frontend/src/app/properties/properties-card/properties-card.component.ts`  
**Selector:** `app-properties-card`  
**Standalone:** false

**Inputs:**
- `@Input() property: Property`

**Lifecycle Hooks:** None

**Dependencies (DI):**
- Router
- UserService

---

#### PropertiesCoordinatesComponent
**File:** `frontend/src/app/properties/properties-coordinates-modal/properties-coordinates.component.ts`  
**Selector:** `app-properties-coordinates`  
**Standalone:** false

**Inputs:**
- `@Input() title = 'Set Property Marker'`

**Lifecycle Hooks:**
- `ngOnInit`

**Dependencies (DI):**
- ModalController (Ionic)

---

#### PropertiesUploadsComponent
**File:** `frontend/src/app/properties/properties-uploads-modal/properties-uploads.component.ts`  
**Selector:** `app-properties-uploads`  
**Standalone:** false

**Inputs:**
- `@Input() property: Property`

**Lifecycle Hooks:**
- `ngOnInit`

**Dependencies (DI):**
- ModalController (Ionic)
- PropertiesService
- ToastController (Ionic)
- RestrictionService

---

#### PropertiesGalleryComponent
**File:** `frontend/src/app/properties/properties-gallery/properties-gallery.component.ts`  
**Selector:** `app-properties-gallery`  
**Standalone:** false

**Signal-based Inputs:**
- `readonly images = input<string[]>()`
- `readonly showEdit = input<boolean>(false)`

**Outputs:**
- `@Output() edit = new EventEmitter<boolean>()`

**Lifecycle Hooks:**
- `ngOnInit`

---

### 2.2 Map Module Components

#### MapPage
**File:** `frontend/src/app/map/map.page.ts`  
**Selector:** `app-map`  
**Standalone:** false

**Signals:**
- `properties = toSignal<Property[]>(this.propertiesService.properties$)`
- `visibleType = signal<string[]>([...])`

**Lifecycle Hooks:** None

**Dependencies (DI):**
- PropertiesService

---

#### MapLeafletComponent
**File:** `frontend/src/app/map/map-leaflet/map-leaflet.component.ts`  
**Selector:** `app-map-leaflet`  
**Standalone:** false

**Signal-based Inputs:**
- `clickAddMarker = input<boolean>(false)`
- `showPropertyMarkers = input<boolean>(true)`
- `visibleMarkerType = input<string[]>([])`

**Signal-based Outputs:**
- `clickedAt = output<Coord>()`

**Lifecycle Hooks:**
- `ngAfterViewInit`
- `ngOnChanges`

**Dependencies (DI via inject()):**
- MapService
- PropertiesService
- ViewContainerRef
- StorageService
- ActivatedRoute

**RxJS Interop:**
- `takeUntilDestroyed()` for automatic subscription cleanup

---

#### MapPopupComponent
**File:** `frontend/src/app/map/map-popup/map-popup.component.ts`  
**Selector:** `app-map-popup`  
**Standalone:** false

**Inputs:**
- `@Input() property: Property`

**Lifecycle Hooks:**
- `ngOnInit`

**Dependencies (DI):**
- ChangeDetectorRef
- Router

---

#### MapMarkersLegendComponent
**File:** `frontend/src/app/map/map-markers-legend/map-markers-legend.component.ts`  
**Selector:** `app-map-markers-legend`  
**Standalone:** false

**Outputs:**
- `@Output() toggledMarker = new EventEmitter<{ type: string; isChecked: boolean }>()`

**Lifecycle Hooks:**
- `ngOnInit`

---

#### MapSearchFieldComponent
**File:** `frontend/src/app/map/map-search-field/map-search-field.component.ts`  
**Selector:** `app-map-search-field`  
**Standalone:** false

**Outputs:**
- `@Output() selectedLocation = new EventEmitter<Coord>()`

**Lifecycle Hooks:**
- `ngOnInit`

**Dependencies (DI):**
- ModalController (Ionic)

---

### 2.3 Mortgage Calculator Module Components

#### MortgageCalcPage
**File:** `frontend/src/app/mortgage-calc/mortgage-calc.page.ts`  
**Selector:** `app-mortgage-calc`  
**Standalone:** false

**Lifecycle Hooks:**
- `ngOnInit`

---

#### MortgageCoreCalcComponent
**File:** `frontend/src/app/mortgage-calc/mortgage-core-calc/mortgage-core-calc.component.ts`  
**Selector:** `app-mortgage-core-calc`  
**Standalone:** false

**Inputs:**
- `@Input() payPerYear = 12`
- `@Input() simpleMode = false`
- `@Input() boxShadow = true`

**Outputs:**
- `@Output() formValue = new EventEmitter<{totalMonth, interest, tax, insurance}>()`
- `@Output() amortizationSchedule = new EventEmitter<AmortizationEntry[]>()`
- `@Output() scheduleChanged = new EventEmitter<boolean>()`

**Lifecycle Hooks:**
- `ngAfterViewInit`

**Dependencies (DI):**
- UntypedFormBuilder

**Forms:**
- `mortgageForm: UntypedFormGroup` with fields: price, downPayment, interest, term, propertyTax, insurance
- Custom validator: `CustomValidators.isGreaterValidator`

---

#### MortgagePieChartComponent
**File:** `frontend/src/app/mortgage-calc/mortgage-pie-chart/mortgage-pie-chart.component.ts`  
**Selector:** `app-mortgage-pie-chart`  
**Standalone:** false

**Lifecycle Hooks:**
- `ngOnInit`

**Dependencies (DI):**
- StorageService

**Third-Party Integration:**
- Chart.js (doughnut chart)

---

#### MortgageLineChartComponent
**File:** `frontend/src/app/mortgage-calc/mortgage-line-chart/mortgage-line-chart.component.ts`  
**Selector:** `app-mortgage-line-chart`  
**Standalone:** false

**Outputs:**
- `@Output() generateSchedule = new EventEmitter<boolean>()`

**Lifecycle Hooks:**
- `ngOnInit`

**Dependencies (DI):**
- StorageService

**Third-Party Integration:**
- Chart.js (line chart)

---

## 3. Service Inventory

### 3.1 PropertiesService
**File:** `frontend/src/app/properties/properties.service.ts`  
**Provided In:** root

**State Management:**
- `isLoading = signal(false)`
- `hasMore = signal(true)`
- `properties$: Observable<Property[]>` (from BehaviorSubject)
- `propertiesOwned$: Observable<Property[]>` (from BehaviorSubject)
- Private BehaviorSubjects for state

**HTTP Endpoints:**
| Method | HTTP Verb | Endpoint | Description |
|--------|-----------|----------|-------------|
| fetchProperties | GET | `/properties` | List properties with pagination |
| fetchProperty | GET | `/properties/:id` | Get single property |
| addProperty | POST | `/properties` | Create new property |
| addPropertyImage | POST | `/properties/upload/images/:id` | Upload images |
| deletePropertyImage | DELETE | `/properties/upload/images/:id` | Delete images |
| removeProperty | DELETE | `/properties/:id` | Delete property |
| updateProperty | PATCH | `/properties/:id` | Update property |
| fetchOwnedProperties | GET | `/properties/me` | Get user's properties |

**Dependencies (DI):**
- HttpClient
- UserService

---

### 3.2 MapService
**File:** `frontend/src/app/map/map.service.ts`  
**Provided In:** root

**Methods:**
- `addTiles(map: L.Map, isDark: boolean)` - Adds tile layer to map
- `addMarker(map: L.Map, coord: Coord, options)` - Creates and returns marker

**Third-Party Integration:**
- Leaflet (L.tileLayer, L.marker)

---

### 3.3 StorageService
**File:** `frontend/src/app/shared/services/storage/storage.service.ts`  
**Provided In:** root

**Methods:**
- `init()` - Initialize Ionic Storage
- `set(key, value)` / `get(key)` - Generic storage
- `setDarkTheme(value)` / `getDartTheme()` - Theme persistence
- `setCoord(coord)` / `getCoord()` - Map coordinates persistence
- `setUser(user)` / `getUser()` / `removeUser()` - User session persistence

**Dependencies (DI):**
- Storage (@ionic/storage-angular)

---

### 3.4 RestrictionService
**File:** `frontend/src/app/shared/services/restriction/restriction.service.ts`  
**Provided In:** root

**Properties:**
- `restricted: boolean` (getter from environment)

**Methods:**
- `showToast(duration?, message?, heading?)` - Display restriction toast
- `showAlert(message?, heading?)` - Display restriction alert

**Dependencies (DI):**
- ToastController (Ionic)
- AlertController (Ionic)

---

### 3.5 UserService
**File:** `frontend/src/app/user/user.service.ts`  
**Provided In:** root

**State Management:**
- `user$: Observable<UserSignedIn>` (from BehaviorSubject)
- Private `userSub: BehaviorSubject<UserSignedIn>`

**HTTP Endpoints:**
| Method | HTTP Verb | Endpoint | Description |
|--------|-----------|----------|-------------|
| signIn | POST | `/auth/signin` | User login |
| register | POST | `/auth/register` | User registration |
| googleAuth | POST | `/auth/google` | Google OAuth |
| changePassword | POST | `/auth/change-password` | Change password |
| updateUser | PATCH | `/users/me` | Update profile |
| getCurrentUser | GET | `/users/me` | Get current user |

**Dependencies (DI):**
- HttpClient
- StorageService
- Router

---

## 4. Directives and Pipes Inventory

### Custom Directives
No custom directives found in the focused modules.

### Pipes Used
| Pipe | Usage Location | Description |
|------|----------------|-------------|
| currency | properties-detail.component.html | Format price with currency symbol |
| *ngFor | Multiple templates | Iteration directive |
| *ngIf | Multiple templates | Conditional rendering |

---

## 5. Interfaces and Enums

### Property Interface
**File:** `frontend/src/app/shared/interface/property.ts`

```typescript
interface Property {
  property_id: string;
  name: string;
  address: string;
  description?: string;
  type: PropertyType;
  transactionType: TransactionType;
  position: Coord;
  price: number;
  paymentFrequency?: PaymentFrequency;
  enquiries?: string[];
  features?: string[];
  images?: string[];
  currency?: string;
  contactNumber?: string;
  contactEmail?: string;
  createdAt?: Date;
  updatedAt?: Date;
  user_id: string;
}
```

### Enums
**File:** `frontend/src/app/shared/enums/property.ts`

```typescript
enum PropertyType {
  residential = 'residential',
  commercial = 'commercial',
  industrial = 'industrial',
  land = 'land'
}

enum TransactionType {
  forSale = 'sale',
  forRent = 'rent'
}

enum PaymentFrequency {
  yearly = 'yearly',
  quarterly = 'quarterly',
  monthly = 'monthly',
  biWeekly = 'bi-weekly',
  weekly = 'weekly',
  daily = 'daily'
}

enum PropertiesDisplayOption {
  CardView = 'cards',
  ListView = 'list'
}
```

---

## 6. Custom Validators

**File:** `frontend/src/app/shared/validators/custom.validator.ts`

| Validator | Description | Usage |
|-----------|-------------|-------|
| isSame | Check if two controls have same value | - |
| isDifferent | Check if two controls have different values | - |
| isGreaterValidator | Check if first control > second control | MortgageCoreCalcComponent |
| patternValidator | Validate against regex pattern | - |
| emailValidation | Validate email format | - |
| confirmPasswordValidator | Validate password confirmation | - |

---

## 7. Test Coverage Summary

### Properties Module Tests
| Test File | Component/Service |
|-----------|-------------------|
| properties.page.spec.ts | PropertiesPage |
| properties.service.spec.ts | PropertiesService |
| properties-detail.component.spec.ts | PropertiesDetailComponent |
| properties-list.component.spec.ts | PropertiesListComponent |
| properties-card.component.spec.ts | PropertiesCardComponent |
| properties-new.component.spec.ts | PropertiesNewComponent |
| properties-edit.component.spec.ts | PropertiesEditComponent |
| properties-coordinates.component.spec.ts | PropertiesCoordinatesComponent |
| properties-uploads.component.spec.ts | PropertiesUploadsComponent |
| properties-gallery.component.spec.ts | PropertiesGalleryComponent |
| properties-list-item.component.spec.ts | PropertiesListItemComponent |
| properties-current-images.component.spec.ts | PropertiesCurrentImagesComponent |

### Map Module Tests
| Test File | Component/Service |
|-----------|-------------------|
| map.page.spec.ts | MapPage |
| map.service.spec.ts | MapService |
| map-leaflet.component.spec.ts | MapLeafletComponent |
| map-popup.component.spec.ts | MapPopupComponent |
| map-markers-legend.component.spec.ts | MapMarkersLegendComponent |
| map-search-field.component.spec.ts | MapSearchFieldComponent |

### Mortgage Calculator Module Tests
| Test File | Component/Service |
|-----------|-------------------|
| mortgage-calc.page.spec.ts | MortgageCalcPage |
| mortgage-core-calc.component.spec.ts | MortgageCoreCalcComponent |
| mortgage-pie-chart.component.spec.ts | MortgagePieChartComponent |
| mortgage-line-chart.component.spec.ts | MortgageLineChartComponent |

**Total Test Files:** 22 spec files for focused modules
