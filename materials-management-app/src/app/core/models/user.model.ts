import { UserRole } from "./user-role.enum";

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  active: boolean;
  emailVerified: boolean;
  accountLocked: boolean;
  lastLogin: string;
  createdAt: string;
  roles: string[];
  permissions: string[];
  // Mantener compatibilidad con el campo role existente
  role?: UserRole;
  isActive?: boolean;
}
