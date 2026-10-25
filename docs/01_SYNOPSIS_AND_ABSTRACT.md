# SYNOPSIS / ABSTRACT
## SmartHR — Employee Management & Leave Tracking System

**Student Name:** Ajay Kumar  
**Student ID / Roll No.:** 10976147  
**Enrollment Number:** 24DEOJULYMCA00126  
**Programme:** Master of Computer Applications (MCA) — 3rd Semester  
**University:** Kurukshetra University  
**Academic Year:** 2024–2026  

---

### 1. Name / Title of the Project

**SmartHR: Employee Management & Leave Tracking System**  
*(Full-stack web application with role-based access control)*

### 2. Statement about the Problem

Most small and mid-size organizations still manage employee master data, leave applications, and attendance using spreadsheets or informal messaging tools. This creates:

- Duplicate and inconsistent employee records  
- Weak access control over sensitive fields such as salary  
- No clear approval trail for leave requests  
- Slow searching and reporting as headcount grows  
- Difficulty demonstrating a complete software lifecycle for academic evaluation  

SmartHR solves this by providing a centralized, browser-based system for employee lifecycle operations with authentication, authorization, and reporting.

### 3. Why this particular topic was chosen

1. **Industry relevance:** Employee / HR modules appear in almost every ERP and HRMS product.  
2. **Syllabus alignment:** Covers DBMS, web technologies, software engineering, security, SDLC, testing, and documentation.  
3. **Demo-friendly:** Unlike an API-only project, a full UI can be shown live during viva.  
4. **Clear modules:** Dashboard, Employees, Departments, Leaves, Attendance, and Reports map cleanly to DFDs, ER diagrams, and test cases.  
5. **Measurable contribution:** Soft delete, RBAC, pagination/filtering, and leave workflow show real engineering decisions.

### 4. Objective and Scope of the Project

**Objectives**

- Design and implement a secure multi-role employee management web application.  
- Support CRUD for employees and departments with search, filter, and pagination.  
- Implement leave request submission and HR/Admin approval workflow.  
- Capture daily attendance and produce management reports.  
- Document the complete SDLC as required by Kurukshetra University MCA guidelines.

**In scope**

- JWT session authentication (httpOnly cookie)  
- Roles: Admin, HR, Employee  
- Employee directory with soft delete (INACTIVE)  
- Department management  
- Leave request lifecycle (Pending → Approved/Rejected)  
- Attendance marking and day-wise listing  
- Dashboard charts and HR reports  
- Seeded demo data for viva walkthrough  

**Out of scope**

- Payroll calculation, PF/ESI statutory filings  
- Biometric device integration  
- Multi-company / multi-tenant SaaS billing  
- Native mobile apps  

### 5. Methodology (including summary of the project)

The project follows a classic SDLC waterfall-with-iteration approach:

1. Requirement analysis (functional + non-functional)  
2. System design (architecture, ERD, DFD, UI wireframes)  
3. Implementation (Next.js App Router, TypeScript, Prisma ORM, SQLite)  
4. Testing (functional, role-based authorization, validation)  
5. Documentation & demonstration  

**Summary:** Users sign in; Admins/HR manage employees and departments; employees (and HR) raise leave requests; HR/Admin approve or reject; attendance is recorded; dashboard and reports visualize workforce metrics.

### 6. Hardware & Software to be used

**Hardware (minimum)**

- Dual-core CPU, 8 GB RAM, 10 GB free disk  
- Keyboard, mouse, display  

**Software**

- OS: Windows 10/11, Linux, or macOS  
- Node.js 20+ and npm  
- Next.js 15, React 19, TypeScript  
- Prisma ORM + SQLite (portable; no separate DB server required for demo)  
- Visual Studio Code / Cursor  
- Modern browser (Chrome / Edge / Firefox)  

### 7. Testing Technologies used

- Manual functional testing via browser UI  
- Role-based negative testing (Employee cannot open Reports; Employee cannot deactivate staff)  
- API verification with browser DevTools / fetch  
- Validation testing with Zod schemas  
- Seed-data regression after `npm run db:reset`  

### 8. What contribution would the project make?

- Replaces ad-hoc spreadsheets with a structured, role-aware system  
- Provides a teachable reference implementation of modern full-stack patterns for MCA students  
- Demonstrates end-to-end engineering: database design → secure APIs → usable UI → documentation  
- Can be extended later into payroll, performance appraisal, or recruitment modules  

### 9. Resources and Limitations

**Resources:** Node.js toolchain, SQLite file database, open-source libraries (Next.js, Prisma, Recharts, jose, bcryptjs).  

**Limitations:** Single-file SQLite is ideal for demo/academic use but not for large concurrent enterprise load; email/SMS leave notifications and advanced audit logs are not included; OAuth SSO is not implemented.

### 10. Conclusion

SmartHR presents a complete, live-demonstrable MCA project that couples software engineering discipline with a practical HR problem. The innovation lies in combining a clear multi-module workflow, RBAC, soft-delete data safety, and visual dashboards so evaluators can see the system working—not only read about an API.
