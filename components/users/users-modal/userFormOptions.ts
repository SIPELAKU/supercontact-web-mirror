// Shared by Add User and Edit User. The department names are a fixed list in
// the API (DepartmentName); each department + branch pair is its own record.

export const DEPARTMENT_OPTIONS = [
  { value: "", label: "Select department" },
  { value: "Marketing", label: "Marketing" },
  { value: "Sales", label: "Sales" },
  { value: "Human Resources", label: "Human Resources" },
  { value: "Customer Support", label: "Customer Support" },
];

export const DEPARTMENT_POSITIONS: Record<string, string[]> = {
  Marketing: ["Brand Manager", "Content writer", "Performance Marketing", "Marketing Coordinator", "SEO specialist"],
  Sales: ["Sales Manager", "Business Development", "Sales Executive", "Account Manager"],
  "Customer Support": ["CS Manager", "CS Representative"],
  "Human Resources": ["HR Manager", "HR Generalist"],
};

export const LEVEL_OPTIONS = [
  { value: "Admin", label: "Admin" },
  { value: "Manager", label: "Manager" },
  { value: "Staff", label: "Staff" },
];

export function positionOptionsFor(department: string) {
  return (DEPARTMENT_POSITIONS[department] ?? []).map((position) => ({ value: position, label: position }));
}
