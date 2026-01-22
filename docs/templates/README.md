# Jivadesk Documentation Templates

This folder contains templates for documenting features, designs, and test plans for the Jivadesk solution.

## Available Templates

| Template                                               | Purpose              | When to Use                     |
| ------------------------------------------------------ | -------------------- | ------------------------------- |
| [FEATURE_SPEC_TEMPLATE.md](./FEATURE_SPEC_TEMPLATE.md) | Define WHAT to build | Before starting any new feature |
| [DESIGN_SPEC_TEMPLATE.md](./DESIGN_SPEC_TEMPLATE.md)   | Define HOW to build  | After feature spec is approved  |
| [TEST_SPEC_TEMPLATE.md](./TEST_SPEC_TEMPLATE.md)       | Define HOW to verify | Before or during implementation |

---

## How to Use These Templates

### Step 1: Feature Specification

When you have a new feature idea or requirement:

1. Copy the feature template:

   ```bash
   cp docs/templates/FEATURE_SPEC_TEMPLATE.md docs/features/FEAT-XXX_feature_name.md
   ```

2. Replace `[FEATURE_NAME]` with your feature name
3. Assign a unique Feature ID (e.g., `FEAT-001`, `FEAT-TKT001`)
4. Fill out all relevant sections
5. Get stakeholder approval before proceeding

### Step 2: Design Specification

After the feature spec is approved:

1. Copy the design template:

   ```bash
   cp docs/templates/DESIGN_SPEC_TEMPLATE.md docs/design/DES-XXX_feature_name.md
   ```

2. Link to the corresponding Feature Spec
3. Fill out technical implementation details
4. Include architecture diagrams, API specs, and database changes
5. Get technical review and approval

### Step 3: Test Specification

Before or during implementation:

1. Copy the test template:

   ```bash
   cp docs/templates/TEST_SPEC_TEMPLATE.md docs/test/TEST-XXX_feature_name.md
   ```

2. Link to both Feature Spec and Design Spec
3. Define test cases for all scenarios
4. Include unit, integration, and manual test cases
5. Execute tests and track results

---

## Document Naming Convention

### Feature ID Format

```
FEAT-[Category][Number]

Categories:
- TKT: Ticket management
- USR: User management
- ORG: Organization/workspace management
- NOT: Notifications
- RPT: Reports and analytics
- INT: Integrations
- UI: User interface improvements
- API: API changes
- SEC: Security features
- PERF: Performance optimizations

Examples: FEAT-TKT001, FEAT-USR002, FEAT-NOT003
```

### Design ID Format

```
DES-[XXX] (matches Feature ID number)
Example: DES-TKT001
```

### Test ID Format

```
TEST-[XXX] (matches Feature ID number)
Example: TEST-TKT001
```

---

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Feature Development Workflow                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Idea/Request                                                    │
│         │                                                           │
│         ▼                                                           │
│  2. Create Feature Spec ──────────► Review & Approve                │
│         │                                                           │
│         ▼                                                           │
│  3. Create Design Spec ───────────► Technical Review                │
│         │                                                           │
│         ▼                                                           │
│  4. Create Test Spec ─────────────► QA Review                       │
│         │                                                           │
│         ▼                                                           │
│  5. Implementation ───────────────► Code Review                     │
│         │                                                           │
│         ▼                                                           │
│  6. Testing ──────────────────────► Execute Test Plan               │
│         │                                                           │
│         ▼                                                           │
│  7. Deployment                                                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Tips for Writing Good Specifications

### Feature Specs

- Focus on the "what" and "why", not the "how"
- Include clear acceptance criteria
- Define success metrics upfront
- List out-of-scope items explicitly

### Design Specs

- Include architecture diagrams
- Document all API endpoints with request/response examples
- Specify database schema changes
- Address error handling and edge cases

### Test Specs

- Cover happy path, edge cases, and error scenarios
- Include performance and security tests where applicable
- Define clear pass/fail criteria
- Specify test data requirements

---

## Directory Structure

```
docs/
├── templates/                   # This folder - contains templates
│   ├── README.md               # How to use templates (this file)
│   ├── FEATURE_SPEC_TEMPLATE.md
│   ├── DESIGN_SPEC_TEMPLATE.md
│   └── TEST_SPEC_TEMPLATE.md
├── features/                    # Feature Specification Documents
│   └── FEAT-XXX_feature_name.md
├── design/                      # Design Specification Documents
│   └── DES-XXX_feature_name.md
└── test/                        # Test Plans
    └── TEST-XXX_feature_name.md
```

---

## Related Documentation

- [API Specification](../API_SPEC.md)
- [Database Schema](../DATABASE_SCHEMA.md)
- [Implementation Plan](../IMPLEMENTATION_PLAN.md)
- [UI Design](../UI_DESIGN.md)

---

**Maintained by:** Jivadesk Team
**Last Updated:** 2026-01-22
