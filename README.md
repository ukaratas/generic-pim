# PIM – Product Information Management

A small yet production-oriented PIM app built with ASP.NET Core 9 Minimal API, EF Core (SQLite) and Angular + PrimeNG.

## Contents
- Architecture
- Features
- Getting Started (Dev)
- API Overview
- Data Model
- Dynamic Attributes & Validation
- Frontend Overview
- Conventions & Rules
- Troubleshooting

## Architecture
- Backend: `Pim.Api` (ASP.NET Core 9 Minimal API)
  - EF Core + SQLite (`data/pim.db`)
  - Entities: `Product`, `ProductType`, `PropertyDefinition`, `DataType` enum
  - Soft-delete via `IsActive` + global filters
  - Attribute validation via `AttributeValidationService`
  - Enum strings supported by `JsonStringEnumConverter`
- Frontend: `pim-web` (Angular standalone)
  - Material toolbar/buttons; data grid via PrimeNG `p-table`
  - Proxy to backend using `proxy.conf.json`
  - PrimeNG theming via `providePrimeNG({ theme: { preset: Aura } })`

## Features
- Products: list (includes inactive), create, edit, activate/deactivate (never hard-delete)
- Product Types: list/create/edit, activate/deactivate
- Property Definitions per Product Type: list/create/edit, activate/deactivate
- Dynamic product attributes stored in `Product.AttributesJson` (JSON)
- Server-side validation of attributes against property rules
- Product list shows Type and renders group headers by Type

## Getting Started (Dev)
1) Backend
```
cd Pim.Api
dotnet build
DOTNET_ENVIRONMENT=Development dotnet run
# HTTPS: https://localhost:7117  HTTP: http://localhost:5110
```
- DB auto-migrates on startup. SQLite file is at `data/pim.db`.

2) Frontend
```
cd pim-web
npm i
npm start -- --port 4201
# Open http://localhost:4201
```
- Proxy routes `/api/*` to `http://localhost:5110` for local dev.

## API Overview
- `/api/products`
  - `GET` list (uses `IgnoreQueryFilters()` to include inactive)
  - `GET /{id}` get (ignore filters)
  - `POST` create (validates attributes)
  - `PUT /{id}` update (validates attributes)
  - `PUT /{id}/deactivate` soft-delete
  - `PUT /{id}/activate` reactivate
- `/api/product-types`
  - `GET` list (can include properties)
  - `POST`, `PUT`, `PUT /{id}/activate`, `PUT /{id}/deactivate`
- `/api/product-types/{productTypeId}/properties`
  - `GET`, `POST`, `PUT`, `PUT /{id}/activate`, `PUT /{id}/deactivate`

## Data Model
- Product
  - `Id, Name, Code, Description, IsActive, CreatedAt, UpdatedAt`
  - `ProductTypeId?` (nullable FK, `SetNull` on type delete)
  - `AttributesJson` (TEXT) – dynamic attribute bag
- ProductType
  - `Id, Name, Code (unique), IsActive, CreatedAt, UpdatedAt`
  - Nav: `Properties`, `Products`
- PropertyDefinition
  - `Id, ProductTypeId, Name, Key (unique per type), DataType, IsRequired`
  - `OptionsJson` (for Enum), `Min/Max` (Number), `Regex` (Text), `SortOrder`, `IsActive`
- DataType
  - `Enum | Number | Text | Boolean | Date`

## Dynamic Attributes & Validation
- Attributes are stored as a flat JSON object in `Product.AttributesJson`.
- On POST/PUT of products, `AttributeValidationService` ensures:
  - JSON is valid
  - Required fields exist and are non-empty
  - Data types match definitions
  - Enum value is in allowed options (string)
  - Number within `Min/Max`, Text matches `Regex`
- Keep `JsonStringEnumConverter` registered so `DataType` binds from string values.

## Frontend Overview
- Routes
  - `/products`: primary list; shows Type name; group headers by Type; actions: create/edit/activate/deactivate
  - `/types`: product types CRUD and activation
  - `/types/:id/properties`: property definitions CRUD and activation
- PrimeNG `p-table`
  - Sorting and basic filtering via header inputs
  - Groups are rendered as custom rows (type headers) followed by products
- Edit dialogs
  - Product edit renders dynamic fields for the selected Type (Enum/Number/Text)
  - `attributesJson` parsed/edited/stringified

## Conventions & Rules
- No hard-deletes for products
- Keep deactivated items visible and re-activatable
- Maintain DB integrity: unique codes and keys as defined
- When adding fields:
  - Backend: model, mapping, migration, endpoints, validation
  - Frontend: models, services, components, forms
- Clean code: explicit names, short functions, guard clauses, handle edge cases first

## Troubleshooting
- 404 after adding endpoints: restart backend
- UI freeze on save: check enum string binding and validator messages
- Node engine warnings: prefer Node 20 LTS; dev mode still works
- PrimeNG theme: configured via `providePrimeNG` in `app.config.ts` (no CSS imports needed)

## License
MIT 

## Roadmap (Next Goals)

- Search, Advanced Filtering, Pagination
- Bulk Operations & Import/Export (CSV/Excel)
- Audit Log (Change History) for Products and Attributes
- Authentication & Role-Based Access Control
- Media Management (Product Images / Files)
- Localization (i18n) and Currency/Unit Handling
- UX Polishing for Dynamic Attribute Editors (validation hints, masks)
- Performance: Large Lists (virtual scroll), Server-Side Paging/Filtering
- Automated Testing: Unit (API/UI), Integration (EF Core), E2E (Playwright)
- OpenAPI/Swagger First API Docs and Client Generation
- CI/CD pipeline, Containerization (Docker) and Dev Containers
- Backup & Migration Strategy; Seed/Demo Data Profiles
- Observability: Structured Logging, Health Checks, Metrics
- API Versioning & Backward Compatibility Policy
- Caching & ETags (conditional GET) for list endpoints
- Webhooks/Integrations (ERP, e-commerce) and Eventing
- Multi-tenant Readiness (schema or discriminator approach)
- Theming/Dark Mode and Accessibility (WCAG) 