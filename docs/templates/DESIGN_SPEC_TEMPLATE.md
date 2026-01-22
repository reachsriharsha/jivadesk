# Design Specification: [FEATURE_NAME]

**Design ID:** DES-[XXX]
**Feature ID:** FEAT-[XXX] (Link to Feature Spec)
**Version:** 1.0
**Status:** Draft | In Review | Approved | In Development | Completed
**Created:** [YYYY-MM-DD]
**Last Updated:** [YYYY-MM-DD]
**Author:** [Name]

---

## 1. Overview

[Brief description of what this design document covers. Reference the feature specification for business context.]

**Scope:**

- [What this design covers]
- [What this design does NOT cover]

**Related Documents:**

- Feature Spec: [Link to FEAT-XXX.md]
- API Spec: [Link to API documentation]
- Database Schema: [Link to schema documentation]

---

## 2. Architecture Overview

### 2.1 System Context Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Jivadesk System                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────────┐  │
│  │   Frontend   │      │   Backend    │      │    Database      │  │
│  │   (Web App)  │◄────►│   (API)      │◄────►│   (PostgreSQL)   │  │
│  └──────────────┘      └──────────────┘      └──────────────────┘  │
│         │                     │                      │              │
│         │                     ▼                      │              │
│         │              ┌──────────────┐              │              │
│         │              │    Cache     │              │              │
│         └─────────────►│   (Redis)    │◄─────────────┘              │
│                        └──────────────┘                             │
│                               │                                     │
│                               ▼                                     │
│                        ┌──────────────┐                             │
│                        │  External    │                             │
│                        │  Services    │                             │
│                        └──────────────┘                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Impact

| Component       | Files Modified    | New Files         | Deleted Files |
| --------------- | ----------------- | ----------------- | ------------- |
| **Backend API** | [List files]      | [List files]      | [List files]  |
| **Frontend**    | [List files]      | [List files]      | [List files]  |
| **Database**    | [List migrations] | [List migrations] | -             |

---

## 3. Detailed Design

### 3.1 Backend API

#### 3.1.1 Database Schema Changes

**New Table: [table_name]**

```sql
CREATE TABLE [table_name] (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    [column1] VARCHAR(255) NOT NULL,
    [column2] TEXT,
    [column3] BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX ix_[table]_organization_id ON [table_name](organization_id);
CREATE INDEX ix_[table]_[column] ON [table_name]([column]);

-- Constraints
ALTER TABLE [table_name] ADD CONSTRAINT [constraint_name]
    CHECK ([condition]);
```

**Modified Table: [existing_table]**

```sql
-- Add new column
ALTER TABLE [table_name] ADD COLUMN [column] [type] [default];

-- Migration strategy
-- 1. Add column as nullable
-- 2. Backfill existing data
-- 3. Add NOT NULL constraint if needed
```

#### 3.1.2 API Endpoints

**Endpoint: [METHOD] /api/v1/[endpoint]**

| Attribute     | Value                             |
| ------------- | --------------------------------- |
| Method        | GET / POST / PUT / PATCH / DELETE |
| Path          | /api/v1/[endpoint]                |
| Auth Required | Yes                               |
| Permissions   | [Required permissions]            |
| Rate Limit    | [X requests/min]                  |
| Description   | [What it does]                    |

**Request Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
X-Organization-ID: <organization_id>
```

**Request Body:**

```json
{
  "field1": "string (required) - description",
  "field2": "number (optional) - description",
  "field3": {
    "nested_field": "string (required) - description"
  }
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "field1": "value",
    "field2": 123,
    "created_at": "2026-01-22T10:00:00Z"
  },
  "meta": {
    "request_id": "uuid"
  }
}
```

**Error Responses:**

| Code | Condition     | Response                                                               |
| ---- | ------------- | ---------------------------------------------------------------------- |
| 400  | Invalid input | `{"status": "error", "message": "Validation failed", "errors": [...]}` |
| 401  | Unauthorized  | `{"status": "error", "message": "Authentication required"}`            |
| 403  | Forbidden     | `{"status": "error", "message": "Insufficient permissions"}`           |
| 404  | Not found     | `{"status": "error", "message": "Resource not found"}`                 |
| 409  | Conflict      | `{"status": "error", "message": "Resource already exists"}`            |
| 500  | Server error  | `{"status": "error", "message": "Internal server error"}`              |

#### 3.1.3 Service Layer

**File:** `src/services/[service_name].py` (or appropriate path)

```python
class [ServiceName]:
    """
    Service for handling [feature] operations.

    Responsibilities:
    - [Responsibility 1]
    - [Responsibility 2]
    """

    def __init__(self, db: Database, cache: Cache):
        self.db = db
        self.cache = cache

    async def create_[entity](self, data: CreateDTO) -> Entity:
        """
        Create a new [entity].

        Args:
            data: The creation data transfer object

        Returns:
            The created entity

        Raises:
            ValidationError: If data is invalid
            ConflictError: If entity already exists
        """
        # Implementation details
        pass

    async def get_[entity](self, id: UUID) -> Optional[Entity]:
        """
        Retrieve an [entity] by ID.
        """
        pass
```

#### 3.1.4 Background Jobs (if applicable)

**Job:** `process_[job_name]`

```python
@job_queue.task(queue='[queue_name]', retry=3)
async def process_[job_name](entity_id: str, **kwargs):
    """
    Background job for [description].

    Args:
        entity_id: The ID of the entity to process
        **kwargs: Additional parameters

    Processing steps:
    1. [Step 1]
    2. [Step 2]
    3. [Step 3]
    """
    pass
```

---

### 3.2 Frontend

#### 3.2.1 Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    [Feature] Components                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    [Feature]Page                         │    │
│  │  ┌─────────────────┐  ┌──────────────────────────────┐  │    │
│  │  │  [Sidebar]      │  │  [MainContent]               │  │    │
│  │  │                 │  │  ┌────────────────────────┐  │  │    │
│  │  │  - Filter 1     │  │  │  [ListComponent]       │  │  │    │
│  │  │  - Filter 2     │  │  │                        │  │  │    │
│  │  │  - Actions      │  │  │  [ItemComponent] x N   │  │  │    │
│  │  │                 │  │  │                        │  │  │    │
│  │  └─────────────────┘  │  └────────────────────────┘  │  │    │
│  │                       └──────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 3.2.2 UI Components

**Component: [ComponentName]**

**File:** `src/components/[feature]/[ComponentName].tsx`

````typescript
interface [ComponentName]Props {
  /** Description of prop */
  propName: PropType;
  /** Description of callback */
  onAction?: (value: Type) => void;
}

/**
 * [Component description]
 *
 * Usage:
 * ```tsx
 * <[ComponentName] propName={value} onAction={handleAction} />
 * ```
 */
export function [ComponentName]({ propName, onAction }: [ComponentName]Props) {
  // Component implementation
}
````

#### 3.2.3 State Management

**Store/Context: [FeatureName]**

```typescript
interface [FeatureName]State {
  // State fields
  items: Item[];
  selectedItem: Item | null;
  isLoading: boolean;
  error: Error | null;
}

interface [FeatureName]Actions {
  // Action methods
  fetchItems: () => Promise<void>;
  selectItem: (id: string) => void;
  createItem: (data: CreateItemDTO) => Promise<Item>;
  updateItem: (id: string, data: UpdateItemDTO) => Promise<Item>;
  deleteItem: (id: string) => Promise<void>;
}
```

**State Flow:**

```
┌───────────────────────────────────────────────────────────────────┐
│                    State Machine                                   │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│            ┌─────────────────────┐                               │
│            │       IDLE          │                               │
│            └──────────┬──────────┘                               │
│                       │ action()                                 │
│                       ▼                                          │
│            ┌─────────────────────┐                               │
│            │     LOADING         │                               │
│            └──────────┬──────────┘                               │
│                       │                                          │
│            ┌──────────┴──────────┐                               │
│            │                     │                               │
│         Success               Failure                            │
│            │                     │                               │
│            ▼                     ▼                               │
│   ┌─────────────────┐   ┌─────────────────┐                     │
│   │     SUCCESS     │   │     ERROR       │                     │
│   └─────────────────┘   └─────────────────┘                     │
│            │                     │                               │
│            └──────────┬──────────┘                               │
│                       │ reset()                                  │
│                       ▼                                          │
│            ┌─────────────────────┐                               │
│            │       IDLE          │                               │
│            └─────────────────────┘                               │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

#### 3.2.4 API Integration

**File:** `src/api/[feature].ts`

```typescript
import { apiClient } from './client';

export const [feature]Api = {
  getAll: async (params?: GetAllParams): Promise<PaginatedResponse<Item>> => {
    return apiClient.get('/api/v1/[endpoint]', { params });
  },

  getById: async (id: string): Promise<Item> => {
    return apiClient.get(`/api/v1/[endpoint]/${id}`);
  },

  create: async (data: CreateItemDTO): Promise<Item> => {
    return apiClient.post('/api/v1/[endpoint]', data);
  },

  update: async (id: string, data: UpdateItemDTO): Promise<Item> => {
    return apiClient.patch(`/api/v1/[endpoint]/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/api/v1/[endpoint]/${id}`);
  },
};
```

---

## 4. Data Flow

### 4.1 Primary Flow

```
┌───────────────────────────────────────────────────────────────────┐
│                    [Flow Name]                                     │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  User                                                             │
│   │                                                               │
│   │ 1. [User action - e.g., clicks button]                        │
│   ▼                                                               │
│  Frontend                                                         │
│   │                                                               │
│   │ 2. [Frontend action - e.g., dispatches action, calls API]     │
│   ▼                                                               │
│  Backend API                                                      │
│   │                                                               │
│   │ 3. [Backend processing - e.g., validates, processes]          │
│   ▼                                                               │
│  Database                                                         │
│   │                                                               │
│   │ 4. [Data operation - e.g., insert, update]                    │
│   ▼                                                               │
│  Response flows back to User                                      │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### 4.2 Sequence Diagram

```
┌──────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐
│ User │     │ Frontend │     │ Backend │     │ Database │
└──┬───┘     └────┬─────┘     └────┬────┘     └────┬─────┘
   │              │                │               │
   │ 1. Action    │                │               │
   │─────────────>│                │               │
   │              │                │               │
   │              │ 2. API Request │               │
   │              │───────────────>│               │
   │              │                │               │
   │              │                │ 3. Query      │
   │              │                │──────────────>│
   │              │                │               │
   │              │                │ 4. Result     │
   │              │                │<──────────────│
   │              │                │               │
   │              │ 5. Response    │               │
   │              │<───────────────│               │
   │              │                │               │
   │ 6. Update UI │                │               │
   │<─────────────│                │               │
   │              │                │               │
```

---

## 5. Algorithm Details

### 5.1 [Algorithm Name]

**Purpose:** [What this algorithm does]

**Input:**

- [Input 1]: [Type] - [Description]
- [Input 2]: [Type] - [Description]

**Output:**

- [Output]: [Type] - [Description]

**Pseudocode:**

```
FUNCTION [algorithm_name](input1, input2):
    // Step 1: [Description]
    intermediate_result = process(input1)

    // Step 2: [Description]
    IF condition THEN
        result = operation1(intermediate_result)
    ELSE
        result = operation2(intermediate_result)
    END IF

    // Step 3: [Description]
    final_result = finalize(result, input2)

    RETURN final_result
END FUNCTION
```

**Complexity:**

- Time: O([complexity])
- Space: O([complexity])

---

## 6. Configuration

### 6.1 Environment Variables

| Variable     | Default     | Description   | Required |
| ------------ | ----------- | ------------- | -------- |
| `[VAR_NAME]` | `[default]` | [Description] | Yes/No   |
| `[VAR_NAME]` | `[default]` | [Description] | Yes/No   |

### 6.2 Application Constants

**Backend:**

```python
# Feature Configuration
[CONSTANT_NAME] = [value]  # [Description]
[CONSTANT_NAME] = [value]  # [Description]
```

**Frontend:**

```typescript
// Feature Configuration
export const [CONSTANT_NAME] = [value]; // [Description]
export const [CONSTANT_NAME] = [value]; // [Description]
```

### 6.3 Feature Flags

| Flag                     | Default | Description        |
| ------------------------ | ------- | ------------------ |
| `feature_[name]_enabled` | false   | [What it controls] |

---

## 7. Error Handling

### 7.1 Error Cases

| Error     | Detection      | Recovery Action | User Message     |
| --------- | -------------- | --------------- | ---------------- |
| [Error 1] | [How detected] | [What to do]    | [What user sees] |
| [Error 2] | [How detected] | [What to do]    | [What user sees] |
| [Error 3] | [How detected] | [What to do]    | [What user sees] |

### 7.2 Logging Strategy

**Log Levels:**

| Level   | Usage                     | Example                           |
| ------- | ------------------------- | --------------------------------- |
| DEBUG   | Detailed operational info | `Processing item: {id}`           |
| INFO    | Significant events        | `Item created successfully: {id}` |
| WARNING | Potential issues          | `Retry attempt 2 of 3`            |
| ERROR   | Failures                  | `Failed to create item: {error}`  |

**Log Format:**

```
[TIMESTAMP] [LEVEL] [SERVICE] [REQUEST_ID] - [MESSAGE] {context}
```

---

## 8. Security Considerations

### 8.1 Authentication & Authorization

- [ ] All endpoints require authentication
- [ ] Role-based access control implemented
- [ ] Organization-level data isolation enforced
- [ ] [Specific security requirement]

### 8.2 Data Protection

- [ ] Sensitive data encrypted in transit (TLS)
- [ ] Sensitive data encrypted at rest
- [ ] PII handling compliant with privacy policies
- [ ] [Specific data protection requirement]

### 8.3 Input Validation

| Field    | Validation Rules                                |
| -------- | ----------------------------------------------- |
| [field1] | [Validation rules - type, length, format, etc.] |
| [field2] | [Validation rules]                              |

---

## 9. Performance Considerations

### 9.1 Database Optimization

| Query     | Expected Frequency | Optimization           |
| --------- | ------------------ | ---------------------- |
| [Query 1] | [X per minute]     | [Index, caching, etc.] |
| [Query 2] | [X per minute]     | [Index, caching, etc.] |

### 9.2 Caching Strategy

| Data     | Cache Key       | TTL        | Invalidation       |
| -------- | --------------- | ---------- | ------------------ |
| [Data 1] | `[key_pattern]` | [Duration] | [When invalidated] |
| [Data 2] | `[key_pattern]` | [Duration] | [When invalidated] |

### 9.3 API Response Times

| Endpoint         | Target  | Notes   |
| ---------------- | ------- | ------- |
| GET /[endpoint]  | < 100ms | [Notes] |
| POST /[endpoint] | < 200ms | [Notes] |

---

## 10. Testing Strategy

### 10.1 Unit Tests

| Component   | Test File              | Coverage Target |
| ----------- | ---------------------- | --------------- |
| [Service]   | `test_[service].py`    | 80%             |
| [Component] | `[Component].test.tsx` | 80%             |

### 10.2 Integration Tests

| Scenario     | Test Description |
| ------------ | ---------------- |
| [Scenario 1] | [Description]    |
| [Scenario 2] | [Description]    |

### 10.3 Test Data

```json
{
  "test_entity": {
    "id": "test-uuid",
    "field1": "test_value",
    "field2": 123
  }
}
```

---

## 11. Migration Strategy

### 11.1 Database Migration

**Migration Steps:**

1. [Step 1 - e.g., Create new table]
2. [Step 2 - e.g., Migrate existing data]
3. [Step 3 - e.g., Add constraints]

**Rollback Plan:**

1. [Rollback step 1]
2. [Rollback step 2]

### 11.2 Data Migration

| Source            | Destination       | Transformation         |
| ----------------- | ----------------- | ---------------------- |
| [Old field/table] | [New field/table] | [Transformation logic] |

---

## 12. Implementation Checklist

### 12.1 Backend

- [ ] Database schema migration created
- [ ] Models/entities defined
- [ ] Service layer implemented
- [ ] API endpoints implemented
- [ ] Input validation added
- [ ] Error handling implemented
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] API documentation updated

### 12.2 Frontend

- [ ] Components created
- [ ] State management implemented
- [ ] API integration completed
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Unit tests written
- [ ] E2E tests written
- [ ] Accessibility verified

### 12.3 Infrastructure

- [ ] Environment variables configured
- [ ] Feature flags set up
- [ ] Monitoring/alerts configured
- [ ] Documentation updated

---

## Revision History

| Version | Date         | Author | Changes        |
| ------- | ------------ | ------ | -------------- |
| 1.0     | [YYYY-MM-DD] | [Name] | Initial draft  |
| 1.1     | [YYYY-MM-DD] | [Name] | [Changes made] |

---

## Approvals

| Role            | Name | Date | Status           |
| --------------- | ---- | ---- | ---------------- |
| Tech Lead       |      |      | Pending/Approved |
| Architect       |      |      | Pending/Approved |
| Security Review |      |      | Pending/Approved |

---

**End of Design Specification**
