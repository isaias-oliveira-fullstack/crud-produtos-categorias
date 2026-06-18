export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export class User {
  id: number;
  username: string;
  email: string;
  role: UserRole;

  constructor(id: number, username: string, email: string, role: UserRole) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.role = role;
  }
}

