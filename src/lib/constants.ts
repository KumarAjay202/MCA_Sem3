export const ROLES = ["ADMIN", "HR", "EMPLOYEE"] as const;
export const LEAVE_TYPES = ["CASUAL", "SICK", "EARNED", "UNPAID"] as const;
export const LEAVE_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export const EMP_STATUSES = ["ACTIVE", "INACTIVE"] as const;
export const ATTENDANCE_STATUSES = ["PRESENT", "ABSENT", "HALF_DAY", "ON_LEAVE"] as const;

export const DEMO_ACCOUNTS = [
  { email: "admin@smarthr.demo", password: "Admin@123", role: "ADMIN", label: "Administrator" },
  { email: "hr@smarthr.demo", password: "Hr@12345", role: "HR", label: "HR Manager" },
  { email: "employee@smarthr.demo", password: "Emp@12345", role: "EMPLOYEE", label: "Employee" },
] as const;
