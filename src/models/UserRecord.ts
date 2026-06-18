import type { UserRole } from "../classes/User";

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  /** Opcional — preenchido no cadastro/checkout */
  phone?: string;
  cpf?: string;
}
