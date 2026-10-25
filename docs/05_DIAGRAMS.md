# Diagrams (paste into Word / draw.io)

## ER Diagram (Mermaid — render at https://mermaid.live)

```mermaid
erDiagram
  USER ||--o| EMPLOYEE : "optional link"
  DEPARTMENT ||--|{ EMPLOYEE : "has"
  EMPLOYEE ||--|{ LEAVE_REQUEST : "raises"
  USER ||--o{ LEAVE_REQUEST : "reviews"
  EMPLOYEE ||--|{ ATTENDANCE : "marks"

  USER {
    string id PK
    string email UK
    string passwordHash
    string role
    string name
  }
  DEPARTMENT {
    string id PK
    string code UK
    string name
    string description
  }
  EMPLOYEE {
    string id PK
    string empCode UK
    string firstName
    string lastName
    string email UK
    float salary
    string status
    string departmentId FK
    string userId FK
  }
  LEAVE_REQUEST {
    string id PK
    string employeeId FK
    string leaveType
    date startDate
    date endDate
    string reason
    string status
    string reviewedById FK
  }
  ATTENDANCE {
    string id PK
    string employeeId FK
    date date
    string checkIn
    string checkOut
    string status
  }
```

## DFD Level-0 (Context)

```mermaid
flowchart LR
  Admin([Admin]) --> SmartHR[SmartHR System]
  HR([HR Manager]) --> SmartHR
  Emp([Employee]) --> SmartHR
  SmartHR --> DB[(SQLite Database)]
  SmartHR --> Screens[Dashboards / Reports / Forms]
```

## DFD Level-1

```mermaid
flowchart TB
  U[Users] --> A[1.0 Authenticate]
  A --> B[2.0 Manage Employees]
  A --> C[3.0 Manage Departments]
  A --> D[4.0 Process Leaves]
  A --> E[5.0 Record Attendance]
  A --> F[6.0 Generate Reports]
  B --> DB[(Database)]
  C --> DB
  D --> DB
  E --> DB
  F --> DB
```

## Leave process flowchart

```mermaid
flowchart TD
  Start([Employee / HR submits leave]) --> Pending[Status = PENDING]
  Pending --> Review{HR or Admin reviews}
  Review -->|Approve| Approved[APPROVED + reviewer + timestamp]
  Review -->|Reject| Rejected[REJECTED + reviewer + timestamp]
  Approved --> End([Visible in lists / reports])
  Rejected --> End
```

## PERT-style activity network

```mermaid
flowchart LR
  A[Requirements] --> B[UI Design]
  A --> C[DB Design]
  B --> D[Auth]
  C --> D
  D --> E[Employees/Depts]
  D --> F[Leaves/Attendance]
  E --> G[Dashboard/Reports]
  F --> G
  G --> H[Testing]
  H --> I[Documentation]
  I --> J[Demo pack]
```
