import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.attendance.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = await bcrypt.hash("Admin@123", 10);
  const hrHash = await bcrypt.hash("Hr@12345", 10);
  const empHash = await bcrypt.hash("Emp@12345", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@smarthr.demo",
      passwordHash: adminHash,
      role: "ADMIN",
      name: "Ajay Kumar (Admin)",
    },
  });

  const hr = await prisma.user.create({
    data: {
      email: "hr@smarthr.demo",
      passwordHash: hrHash,
      role: "HR",
      name: "Neha Sharma (HR)",
    },
  });

  const empUser = await prisma.user.create({
    data: {
      email: "employee@smarthr.demo",
      passwordHash: empHash,
      role: "EMPLOYEE",
      name: "Rahul Verma",
    },
  });

  const departments = await Promise.all([
    prisma.department.create({
      data: {
        code: "ENG",
        name: "Engineering",
        description: "Product engineering and platform teams",
      },
    }),
    prisma.department.create({
      data: {
        code: "HR",
        name: "Human Resources",
        description: "People operations and talent management",
      },
    }),
    prisma.department.create({
      data: {
        code: "FIN",
        name: "Finance",
        description: "Accounts, payroll, and budgeting",
      },
    }),
    prisma.department.create({
      data: {
        code: "MKT",
        name: "Marketing",
        description: "Brand, growth, and communications",
      },
    }),
    prisma.department.create({
      data: {
        code: "OPS",
        name: "Operations",
        description: "Facilities and business operations",
      },
    }),
  ]);

  const [eng, hrDept, fin, mkt, ops] = departments;

  const employeesData = [
    {
      empCode: "EMP001",
      firstName: "Rahul",
      lastName: "Verma",
      email: "employee@smarthr.demo",
      phone: "9876543210",
      designation: "Software Engineer",
      salary: 850000,
      hireDate: new Date("2023-04-12"),
      departmentId: eng.id,
      userId: empUser.id,
      status: "ACTIVE",
    },
    {
      empCode: "EMP002",
      firstName: "Neha",
      lastName: "Sharma",
      email: "neha.sharma@smarthr.demo",
      phone: "9876543211",
      designation: "HR Manager",
      salary: 920000,
      hireDate: new Date("2022-01-15"),
      departmentId: hrDept.id,
      userId: hr.id,
      status: "ACTIVE",
    },
    {
      empCode: "EMP003",
      firstName: "Amit",
      lastName: "Patel",
      email: "amit.patel@smarthr.demo",
      phone: "9876543212",
      designation: "Senior Developer",
      salary: 1200000,
      hireDate: new Date("2021-08-01"),
      departmentId: eng.id,
      status: "ACTIVE",
    },
    {
      empCode: "EMP004",
      firstName: "Priya",
      lastName: "Singh",
      email: "priya.singh@smarthr.demo",
      phone: "9876543213",
      designation: "Financial Analyst",
      salary: 780000,
      hireDate: new Date("2023-11-20"),
      departmentId: fin.id,
      status: "ACTIVE",
    },
    {
      empCode: "EMP005",
      firstName: "Vikram",
      lastName: "Mehta",
      email: "vikram.mehta@smarthr.demo",
      phone: "9876543214",
      designation: "Marketing Lead",
      salary: 950000,
      hireDate: new Date("2022-06-10"),
      departmentId: mkt.id,
      status: "ACTIVE",
    },
    {
      empCode: "EMP006",
      firstName: "Sneha",
      lastName: "Reddy",
      email: "sneha.reddy@smarthr.demo",
      phone: "9876543215",
      designation: "QA Engineer",
      salary: 720000,
      hireDate: new Date("2024-02-01"),
      departmentId: eng.id,
      status: "ACTIVE",
    },
    {
      empCode: "EMP007",
      firstName: "Karan",
      lastName: "Joshi",
      email: "karan.joshi@smarthr.demo",
      phone: "9876543216",
      designation: "Operations Executive",
      salary: 560000,
      hireDate: new Date("2023-09-05"),
      departmentId: ops.id,
      status: "ACTIVE",
    },
    {
      empCode: "EMP008",
      firstName: "Ananya",
      lastName: "Gupta",
      email: "ananya.gupta@smarthr.demo",
      phone: "9876543217",
      designation: "HR Executive",
      salary: 610000,
      hireDate: new Date("2024-05-18"),
      departmentId: hrDept.id,
      status: "ACTIVE",
    },
    {
      empCode: "EMP009",
      firstName: "Rohan",
      lastName: "Kapoor",
      email: "rohan.kapoor@smarthr.demo",
      phone: "9876543218",
      designation: "DevOps Engineer",
      salary: 1100000,
      hireDate: new Date("2021-12-01"),
      departmentId: eng.id,
      status: "INACTIVE",
    },
    {
      empCode: "EMP010",
      firstName: "Meera",
      lastName: "Nair",
      email: "meera.nair@smarthr.demo",
      phone: "9876543219",
      designation: "Content Strategist",
      salary: 680000,
      hireDate: new Date("2023-03-22"),
      departmentId: mkt.id,
      status: "ACTIVE",
    },
  ];

  const employees = [];
  for (const data of employeesData) {
    employees.push(await prisma.employee.create({ data }));
  }

  const rahul = employees[0];
  const sneha = employees[5];
  const priya = employees[3];

  await prisma.leaveRequest.createMany({
    data: [
      {
        employeeId: rahul.id,
        leaveType: "CASUAL",
        startDate: new Date("2026-03-10"),
        endDate: new Date("2026-03-11"),
        reason: "Family function in hometown",
        status: "PENDING",
      },
      {
        employeeId: sneha.id,
        leaveType: "SICK",
        startDate: new Date("2026-02-20"),
        endDate: new Date("2026-02-21"),
        reason: "Medical rest recommended by doctor",
        status: "APPROVED",
        reviewedById: hr.id,
        reviewedAt: new Date("2026-02-19"),
      },
      {
        employeeId: priya.id,
        leaveType: "EARNED",
        startDate: new Date("2026-04-01"),
        endDate: new Date("2026-04-05"),
        reason: "Planned vacation with family",
        status: "PENDING",
      },
      {
        employeeId: employees[4].id,
        leaveType: "UNPAID",
        startDate: new Date("2026-01-15"),
        endDate: new Date("2026-01-16"),
        reason: "Personal work",
        status: "REJECTED",
        reviewedById: admin.id,
        reviewedAt: new Date("2026-01-14"),
      },
    ],
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Always seed "today" (even weekends) so the dashboard pie chart has demo data,
  // plus the previous 6 calendar days excluding pure weekend-only gaps where useful.
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() - dayOffset);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    if (isWeekend && dayOffset !== 0) continue;

    for (const emp of employees.filter((e) => e.status === "ACTIVE")) {
      const roll = (emp.empCode.charCodeAt(5) + dayOffset) % 10;
      let status = "PRESENT";
      let checkIn: string | null = "09:15";
      let checkOut: string | null = "18:05";
      if (roll === 0) {
        status = "ABSENT";
        checkIn = null;
        checkOut = null;
      } else if (roll === 1) {
        status = "HALF_DAY";
        checkIn = "09:20";
        checkOut = "13:00";
      } else if (roll === 2 && dayOffset === 1) {
        status = "ON_LEAVE";
        checkIn = null;
        checkOut = null;
      }
      await prisma.attendance.create({
        data: {
          employeeId: emp.id,
          date,
          checkIn,
          checkOut,
          status,
        },
      });
    }
  }

  console.log("SmartHR seed complete.");
  console.log("Demo logins:");
  console.log("  admin@smarthr.demo / Admin@123");
  console.log("  hr@smarthr.demo / Hr@12345");
  console.log("  employee@smarthr.demo / Emp@12345");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
