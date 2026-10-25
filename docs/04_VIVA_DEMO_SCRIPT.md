# Viva / Demo Script (10–12 minutes)

Use this script when showing SmartHR to examiners.

## Before you start

1. Run `npm run setup && npm run dev`  
2. Open http://127.0.0.1:43123  
3. Have this repo / docs folder ready  

## Minute-by-minute

### 1. Introduce the problem (1 min)

> “Organizations manage employees and leave in spreadsheets. That causes duplicate data, weak security, and no leave approval trail. My project SmartHR is a full-stack web system that fixes this.”

### 2. Landing + login (1 min)

- Show branded home page → Open console  
- Login as **Admin** (`admin@smarthr.demo` / `Admin@123`) using the quick demo buttons  

### 3. Dashboard (1–2 min)

- Point to KPIs: total employees, active, departments, pending leaves  
- Explain bar chart = headcount by department  
- Explain pie = today’s attendance mix  

### 4. Employees module (2 min)

- Search / filter by department  
- Add a sample employee  
- Edit designation/salary  
- Soft-delete (deactivate) and show status becomes INACTIVE  
- Say: “Soft delete keeps history; we don’t hard-delete rows.”

### 5. Leave workflow (2 min)

- Show pending leave  
- Approve one as Admin/HR  
- Mention reviewer name is stored  
- Switch to Employee login and submit a new leave  

### 6. Attendance + Reports (2 min)

- Load attendance for a date  
- Open Reports: high salary list + department avg salary chart  
- State role restriction: Employee cannot open Reports  

### 7. Architecture wrap-up (1–2 min)

> “Next.js UI + API routes, Prisma ORM, SQLite for portable demo, JWT httpOnly cookie auth, Zod validation, RBAC middleware. Documentation covers synopsis, ERD/DFD, PERT, test cases, and user manual as per university format.”

## Likely viva questions & short answers

**Q: Why Next.js instead of only ASP.NET API?**  
A: Previous API-only submission was hard to demo. Full UI + API in one app is clearer for evaluation and still teaches REST, auth, ORM, and SDLC.

**Q: Why SQLite?**  
A: Zero-install academic demo. Schema is relational; production can switch Prisma datasource to PostgreSQL/SQL Server with minimal model changes.

**Q: How is security handled?**  
A: bcrypt password hashes, JWT in httpOnly cookie, middleware route protection, role checks in APIs.

**Q: What is soft delete?**  
A: Employee status set to INACTIVE so records remain for audit/history.

**Q: What is your contribution?**  
A: End-to-end system with leave workflow audit, RBAC, reports, and complete MCA documentation—not only CRUD endpoints.
