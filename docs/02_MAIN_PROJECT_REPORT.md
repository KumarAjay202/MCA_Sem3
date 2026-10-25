# MCA PROJECT REPORT
## SmartHR — Employee Management & Leave Tracking System

**Submitted in partial fulfillment of the degree of**  
**MASTER OF COMPUTER APPLICATIONS (MCA)**  
**Kurukshetra University**

| Field | Details |
|---|---|
| Student Name | Ajay Kumar |
| Roll No. / Student ID | 10976147 |
| Enrollment Number | 24DEOJULYMCA00126 |
| Semester | MCA 3rd Semester |
| Academic Year | 2024–2026 |
| Project Title | SmartHR: Employee Management & Leave Tracking System |
| Guide Name | ________________________ *(fill before binding)* |
| Guide Qualification | MCA with 3+ years IT experience *(fill)* |
| Guide Mobile / Email | ________________________ *(fill)* |

---

# ACKNOWLEDGEMENT

I express my sincere gratitude to my project guide for continuous guidance, constructive feedback, and encouragement throughout the development of this MCA project. I thank the faculty members of the MCA programme at Kurukshetra University for providing the academic foundation in software engineering, database systems, and web technologies that made this work possible.

I also acknowledge the open-source community behind Next.js, Prisma, React, and related libraries that enabled rapid, reliable implementation. Finally, I thank my family and peers for their support during the project period.

**— Ajay Kumar**

---

# CERTIFICATE FROM GUIDE (Annexure A)

This is to certify that this project entitled **“SmartHR: Employee Management & Leave Tracking System”** submitted in partial fulfillment of the degree of MASTER IN COMPUTER APPLICATION (MCA) to the Kurukshetra University done by **Mr. Ajay Kumar, Roll No. 10976147** is an authentic work carried out by him under my guidance. The matter embodied in this project work has not been submitted earlier for award of any degree or diploma to the best of my knowledge and belief.

Signature of the student ________________  
Signature of the Guide ________________  
Date: ________________

*(Student already has signed certificates; paste official signed copy in the hard-bound report.)*

---

# CHAPTER 1 — OBJECTIVE & SCOPE OF THE PROJECT

## 1.1 Objective

The primary objective is to design, develop, test, and document a **full-stack Employee Management & Leave Tracking System** that:

1. Centralizes employee master data in a relational database.  
2. Enforces role-based access (Admin / HR / Employee).  
3. Supports leave application and approval workflow.  
4. Records attendance and produces management reports.  
5. Provides a live UI suitable for viva demonstration and LMS soft-copy submission.

## 1.2 Scope

**Functional scope**

- Authentication with secure session cookies  
- Employee CRUD + soft delete  
- Department CRUD (delete blocked if employees exist)  
- Leave request create / list / approve / reject  
- Attendance upsert and day-wise listing  
- Dashboard KPIs and charts  
- Reports: high-salary list, leave summary, department salary averages  

**Users helped**

- **Admin:** full control, soft-delete employees, review leaves, view reports  
- **HR:** manage workforce & leave pipeline without destructive admin-only actions where restricted  
- **Employee:** view own context, request leave, see attendance  

## 1.3 Out of Scope

Payroll engines, statutory compliance, biometric devices, mobile native apps, and multi-tenant SaaS billing.

---

# CHAPTER 2 — THEORETICAL BACKGROUND

## 2.1 Web Application Architecture

SmartHR uses a **three-tier** model:

1. **Presentation tier:** Next.js React pages (App Router)  
2. **Application / API tier:** Next.js Route Handlers (`/api/*`)  
3. **Data tier:** SQLite via Prisma ORM  

## 2.2 REST & JSON

Client and server exchange JSON over HTTP. Resources map to nouns (`/api/employees`, `/api/leaves`). Status codes communicate success (200/201), client error (400/401/403/404/409), and server error (500).

## 2.3 Authentication & Authorization

- Passwords hashed with **bcrypt**  
- Sessions issued as **JWT** (HS256) stored in **httpOnly** cookies  
- Middleware guards protected routes  
- Role checks in API handlers (`requireSession([...roles])`)  

## 2.4 ORM & Relational Modelling

Prisma provides type-safe queries over tables: `User`, `Department`, `Employee`, `LeaveRequest`, `Attendance`. Soft delete is implemented by setting `Employee.status = INACTIVE` rather than hard deleting rows.

## 2.5 Software Engineering Concepts Applied

- SDLC phases, modularization, validation, RBAC, ER modelling, DFD, testing strategy, cost-benefit analysis, and user manual — as required by university guidelines.

---

# CHAPTER 3 — DEFINITION OF PROBLEM

Organizations need a trustworthy system for the employee record lifecycle:

**Create → Update → Search → Deactivate → Report**,  
plus **Leave Request → Review → Decision**,  
and **Attendance capture**.

Without software, the problems are duplication, weak security, missing audit of leave decisions, and slow reporting. SmartHR defines the problem as building a maintainable web system that addresses these operational gaps while remaining simple enough to deploy for academic demonstration (SQLite + single Node process).

---

# CHAPTER 4 — SYSTEM ANALYSIS & DESIGN VIS-À-VIS USER REQUIREMENTS

## 4.1 User Requirements

| Role | Key requirements |
|---|---|
| Admin | Manage all modules; deactivate employees; delete empty departments; approve leaves; view reports |
| HR | Create/update employees & departments; mark attendance; approve/reject leaves; view reports |
| Employee | Login; submit leave; view own leave/attendance context |

## 4.2 Non-Functional Requirements

- Usability: clear navigation and demo accounts on login screen  
- Security: hashed passwords, httpOnly cookies, role checks  
- Portability: SQLite file DB for easy laptop demo  
- Maintainability: TypeScript + modular API routes  

## 4.3 System Architecture Diagram (textual)

```
[Browser UI]
     |
     | HTTPS / HTTP
     v
[Next.js App Router Pages] -----> [Middleware JWT check]
     |
     v
[API Route Handlers] ---> [Auth / Zod validation / RBAC]
     |
     v
[Prisma Client] ---> [SQLite database file]
```

## 4.4 Process Logic of Each Module

1. **Auth:** validate credentials → issue JWT cookie → redirect to dashboard.  
2. **Employees:** list with filters → create/update via forms → Admin soft-deletes.  
3. **Departments:** list with headcount → create → Admin delete if empty.  
4. **Leaves:** create PENDING → HR/Admin PATCH to APPROVED/REJECTED with reviewer id.  
5. **Attendance:** upsert unique (employeeId, date).  
6. **Dashboard/Reports:** aggregate queries + charts.

---

# CHAPTER 5 — SYSTEM PLANNING (PERT Chart)

## 5.1 Activities & Estimated Effort (person-hours)

| ID | Activity | Predecessor | Optimistic | Likely | Pessimistic | TE=(O+4M+P)/6 |
|---|---|---|---:|---:|---:|---:|
| A | Requirement gathering & topic freeze | — | 4 | 6 | 10 | 6.3 |
| B | UI wireframes & module list | A | 4 | 8 | 12 | 8.0 |
| C | Database ER design | A | 4 | 6 | 10 | 6.3 |
| D | Auth + middleware | B,C | 6 | 10 | 16 | 10.3 |
| E | Employee & Department modules | D | 10 | 16 | 24 | 16.3 |
| F | Leave & Attendance modules | D | 8 | 14 | 20 | 14.0 |
| G | Dashboard & Reports | E,F | 6 | 10 | 14 | 10.0 |
| H | Seed data + testing | E,F,G | 6 | 10 | 14 | 10.0 |
| I | Documentation (synopsis + report) | A–H | 10 | 16 | 24 | 16.3 |
| J | Demo rehearsal & packaging | H,I | 4 | 6 | 10 | 6.3 |

**Critical path (illustrative):** A → B/C → D → E → G → H → I → J  

## 5.2 Milestones

- M1 Requirements freeze  
- M2 Schema ready  
- M3 Auth complete  
- M4 Core CRUD complete  
- M5 Leave/Attendance complete  
- M6 Testing sign-off  
- M7 Report & soft-copy ready  

---

# CHAPTER 6 — METHODOLOGY, IMPLEMENTATION, HARDWARE & SOFTWARE

## 6.1 Methodology Adopted

Iterative waterfall: design → implement module → smoke test → next module → integrate → document.

## 6.2 Technology Stack

| Layer | Choice | Reason |
|---|---|---|
| Language | TypeScript | Type safety for academic maintainability |
| Framework | Next.js 15 (App Router) | UI + API in one deployable app |
| UI | React 19 + Tailwind CSS | Fast, responsive screens |
| Charts | Recharts | Dashboard / report visualization |
| ORM | Prisma 5 | Clear schema + migrations/push |
| DB | SQLite | Zero-install demo |
| Auth | jose (JWT) + bcryptjs | Industry-standard patterns |
| Validation | Zod | Request schema validation |

## 6.3 Implementation Highlights

- Soft delete preserves history  
- Leave review stores `reviewedById` and `reviewedAt`  
- Attendance uniqueness on `(employeeId, date)`  
- Employee list supports search, department filter, status filter, pagination  
- Middleware blocks unauthenticated access to app pages and APIs  

## 6.4 Hardware & Software Used (as built)

**Hardware:** Standard development laptop (8 GB+ RAM).  
**Software:** Node.js 22, npm, Prisma CLI, Chromium-based browser, Git.

---

# CHAPTER 7 — DETAILED LIFE CYCLE OF THE PROJECT

## 7.1 ER Diagram (entities & relationships)

- `User` 1──0..1 `Employee`  
- `Department` 1──* `Employee`  
- `Employee` 1──* `LeaveRequest`  
- `User` 1──* `LeaveRequest` (as reviewer)  
- `Employee` 1──* `Attendance`  

Key attributes are listed in the Data Dictionary (Annexure).

## 7.2 Data Flow Diagrams (Level-0 / Context)

```
            +------------------+
Employee -->|                  |
HR -------->|     SmartHR      |--> Reports / Screens
Admin ----->|   Application    |
            +--------+---------+
                     |
                     v
                 SQLite DB
```

### Level-1 (major processes)

1. Authenticate User  
2. Manage Employees  
3. Manage Departments  
4. Process Leave Requests  
5. Record Attendance  
6. Generate Dashboard/Reports  

## 7.3 Input and Output Screen Design

| Screen | Inputs | Outputs |
|---|---|---|
| Login | email, password | session cookie / error |
| Dashboard | — | KPI cards, charts, recent lists |
| Employees | search, filters, form fields | paginated table |
| Departments | code, name, description | department cards |
| Leaves | type, dates, reason | request cards + approve/reject |
| Attendance | date, status, times | day table |
| Reports | — | salary & leave analytics |

## 7.4 Process Involved

Request → Middleware JWT verify → API role check → Zod validate → Prisma query → JSON response → UI render.

## 7.5 Testing Methodology

### Types of tests

1. **Unit-like validation tests** (invalid email, end date before start date)  
2. **Functional UI tests** (create employee, approve leave)  
3. **Authorization tests** (Employee blocked from Reports API → 403)  
4. **Regression** after reseeding database  

### Sample Test Report

| # | Test case | Steps | Expected | Result |
|---|---|---|---|---|
| T1 | Admin login | Use admin@smarthr.demo / Admin@123 | Dashboard loads | Pass |
| T2 | Invalid login | Wrong password | Error message, no session | Pass |
| T3 | Create employee | Admin fills form | Row appears in list | Pass |
| T4 | Soft delete | Admin deactivates | Status INACTIVE | Pass |
| T5 | Leave approve | HR approves pending | Status APPROVED + reviewer | Pass |
| T6 | Employee reports access | Login as employee, open /reports | Redirect / 403 | Pass |
| T7 | Attendance upsert | Mark same employee twice | One row updated | Pass |
| T8 | Department delete blocked | Delete dept with staff | Error message | Pass |

*(Attach screenshots from the live demo in the printed report.)*

---

# CHAPTER 8 — SYSTEM MAINTENANCE & EVALUATION

## 8.1 Maintenance

- Re-seed demo data: `npm run db:reset`  
- Rotate `JWT_SECRET` in `.env` for production  
- Backup: copy `prisma/dev.db`  
- Add indexes / migrate to PostgreSQL if concurrency grows  

## 8.2 Evaluation Criteria

- Correctness of CRUD and workflows  
- Enforcement of roles  
- Clarity of UI for viva  
- Completeness of documentation against university checklist  

---

# CHAPTER 9 — COST AND BENEFIT ANALYSIS

## 9.1 Cost (academic estimate)

| Item | Approx. cost |
|---|---|
| Student development time (~100–120 man-hours) | Opportunity cost (academic) |
| Hardware already owned | ₹0 incremental |
| Software (open source) | ₹0 |
| Optional cloud hosting (Vercel free tier) | ₹0–₹500/month if upgraded |

## 9.2 Benefits

- Reduced spreadsheet errors  
- Faster leave decisions with reviewer trail  
- Instant headcount and salary insights  
- Strong viva demonstration artefact  
- Extensible base for future HR modules  

**Conclusion of CBA:** Benefits outweigh costs for academic and SME pilot use because tooling is free and operational gains are immediate.

---

# CHAPTER 10 — USER / OPERATIONAL MANUAL

## 10.1 Installation (local)

```bash
git clone <your-repo-url>
cd MCA_Sem3Assignment   # or repo root
npm install
cp .env.example .env
npm run setup
npm run dev
```

Open **http://127.0.0.1:43123**

## 10.2 Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@smarthr.demo | Admin@123 |
| HR | hr@smarthr.demo | Hr@12345 |
| Employee | employee@smarthr.demo | Emp@12345 |

## 10.3 Security Aspects

- Passwords stored as bcrypt hashes  
- JWT in httpOnly cookie (not readable by JavaScript)  
- Role checks on sensitive APIs  
- Soft delete instead of irreversible hard delete for employees  

## 10.4 Access Rights

| Feature | Admin | HR | Employee |
|---|---|---|---|
| Dashboard | Yes | Yes | Yes |
| Employees manage | Yes | Yes | View only |
| Soft delete employee | Yes | No | No |
| Departments manage | Yes | Yes | View |
| Delete department | Yes | No | No |
| Leave approve/reject | Yes | Yes | No |
| Attendance mark | Yes | Yes | View |
| Reports | Yes | Yes | No |

## 10.5 Backup & Controls

- **Backup:** copy `prisma/dev.db` regularly  
- **Restore:** replace file and restart server  
- **Controls:** login required; CSRF risk reduced by same-site cookies; validate all inputs with Zod  

---

# CHAPTER 11 — CONCLUSION

SmartHR successfully delivers a **complete, explainable, and live-demoable** MCA project. The innovation is not a single algorithm, but an integrated approach: clean relational design, enforced RBAC, soft-delete safety, leave auditability, and visual analytics—packaged so evaluators can watch the system work. Main achievements include a working multi-role UI, seeded realistic data, API-backed modules, and documentation aligned to Kurukshetra University submission guidelines.

**Future enhancements:** email notifications, PostgreSQL deployment, advanced audit logs, payroll module, and SSO.

---

# ANNEXURES

## Annexure 1 — Organization Background

Academic project developed independently for MCA Semester 3. Organization context: hypothetical mid-size IT services firm using SmartHR as an internal people-operations pilot. *(Write NA for industry internship if not applicable.)*

## Annexure 2 — Data Dictionary

| Data Name | Alias | Length / Size | Type | Description |
|---|---|---|---|---|
| User.id | — | cuid ~25 | Alpha | Primary key |
| User.email | login id | 255 | Alpha | Unique login |
| User.passwordHash | — | 60+ | Alpha | bcrypt hash |
| User.role | — | 10 | Alpha | ADMIN/HR/EMPLOYEE |
| User.name | — | 100 | Alpha | Display name |
| Department.id | — | cuid | Alpha | PK |
| Department.code | — | 10 | Alpha | Unique short code |
| Department.name | — | 80 | Alpha | Department name |
| Department.description | — | 255 | Alpha | Optional text |
| Employee.id | — | cuid | Alpha | PK |
| Employee.empCode | staff id | 20 | Alpha | Unique code |
| Employee.firstName | — | 50 | Alpha | First name |
| Employee.lastName | — | 50 | Alpha | Last name |
| Employee.email | — | 255 | Alpha | Unique email |
| Employee.phone | mobile | 15 | Alpha | Optional |
| Employee.designation | job title | 80 | Alpha | Role title |
| Employee.salary | CTC | — | Numeric | Annual salary |
| Employee.hireDate | DOJ | — | Date | Joining date |
| Employee.status | — | 10 | Alpha | ACTIVE/INACTIVE |
| Employee.departmentId | — | cuid | Alpha | FK → Department |
| LeaveRequest.id | — | cuid | Alpha | PK |
| LeaveRequest.leaveType | — | 10 | Alpha | CASUAL/SICK/… |
| LeaveRequest.startDate | from | — | Date | Start |
| LeaveRequest.endDate | to | — | Date | End |
| LeaveRequest.reason | — | 500 | Alpha | Justification |
| LeaveRequest.status | — | 10 | Alpha | PENDING/… |
| LeaveRequest.reviewedById | — | cuid | Alpha | FK → User |
| Attendance.id | — | cuid | Alpha | PK |
| Attendance.date | — | — | Date | Attendance day |
| Attendance.checkIn | — | 5 | Alpha | HH:MM |
| Attendance.checkOut | — | 5 | Alpha | HH:MM |
| Attendance.status | — | 10 | Alpha | PRESENT/… |

## Annexure 3 — List of Abbreviations, Figures, Tables

**Abbreviations**

- MCA — Master of Computer Applications  
- RBAC — Role-Based Access Control  
- JWT — JSON Web Token  
- ORM — Object-Relational Mapping  
- DFD — Data Flow Diagram  
- ERD — Entity Relationship Diagram  
- SDLC — Software Development Life Cycle  
- API — Application Programming Interface  

**Figures (suggested for printout)**

1. System architecture  
2. ER diagram  
3. DFD Level-0 and Level-1  
4. PERT / Gantt style plan  
5. Screenshots: Login, Dashboard, Employees, Leaves, Reports  

**Tables**

1. User requirements matrix  
2. Access rights matrix  
3. Test report  
4. Data dictionary  
5. Cost-benefit summary  

## Annexure 4 — References / Bibliography / Websites

1. Fielding, R. T., *Architectural Styles and the Design of Network-based Software Architectures* (REST), Ph.D. dissertation, UC Irvine, 2000.  
2. Martin, J., *Computer Data-base Organization*, Prentice-Hall, Englewood Cliffs, NJ.  
3. Pressman, R. S., *Software Engineering: A Practitioner’s Approach*, McGraw-Hill.  
4. Next.js Documentation — https://nextjs.org/docs  
5. Prisma Documentation — https://www.prisma.io/docs  
6. OWASP Authentication Cheat Sheet — https://cheatsheetseries.owasp.org/  
7. MDN Web Docs — HTTP, Cookies — https://developer.mozilla.org/  
8. Kurukshetra University MCA Project Guidelines (Assignment PDF provided by the department).  

## Annexure 5 — Soft Copy

Submit this repository ZIP / GitHub link / LMS upload including:

- Source code (`src/`, `prisma/`)  
- Documentation (`docs/`)  
- README with run instructions  
- Database seed script  

## Annexure 6 — Guide Details *(fill before submission)*

- Guide Name: ______________________________  
- Full Address: ______________________________  
- Qualification: ______________________________  
- Mobile: ______________________________  
- Email: ______________________________  

## Annexure 7 — Certificate from Guide

*(Attach signed Annexure A.)*
