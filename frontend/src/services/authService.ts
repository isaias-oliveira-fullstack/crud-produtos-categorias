import { UserRole } from "@shared/classes/User";
import type { UserRecord } from "@shared/models/UserRecord";
import { STORAGE } from "./storageKeys";

function readUsers(): UserRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE.USERS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UserRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(users: UserRecord[]): void {
  localStorage.setItem(STORAGE.USERS, JSON.stringify(users));
}

function seedIfEmpty(): void {
  const users = readUsers();
  if (users.length > 0) return;
  const admin: UserRecord = {
    id: 1,
    name: "Administrador",
    email: "admin@loja.com",
    password: "admin123",
    role: UserRole.ADMIN,
  };
  writeUsers([admin]);
}

function readSessionUserId(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE.SESSION);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { userId?: number };
    return typeof parsed.userId === "number" ? parsed.userId : null;
  } catch {
    return null;
  }
}

function writeSession(userId: number): void {
  localStorage.setItem(STORAGE.SESSION, JSON.stringify({ userId }));
}

function clearSession(): void {
  localStorage.removeItem(STORAGE.SESSION);
}

export const authService = {
  init(): void {
    seedIfEmpty();
  },

  getUsers(): UserRecord[] {
    return readUsers();
  },

  findByEmail(email: string): UserRecord | undefined {
    return readUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  findById(id: number): UserRecord | undefined {
    return readUsers().find((u) => u.id === id);
  },

  register(payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    cpf?: string;
  }): { ok: true; user: UserRecord } | { ok: false; error: string } {
    seedIfEmpty();
    if (this.findByEmail(payload.email)) {
      return { ok: false, error: "E-mail já cadastrado." };
    }
    const users = readUsers();
    const nextId = users.reduce((m, u) => Math.max(m, u.id), 0) + 1;
    const user: UserRecord = {
      id: nextId,
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      role: UserRole.USER,
      phone: payload.phone?.trim() || undefined,
      cpf: payload.cpf?.trim() || undefined,
    };
    users.push(user);
    writeUsers(users);
    return { ok: true, user };
  },

  login(email: string, password: string): { ok: true; user: UserRecord } | { ok: false; error: string } {
    seedIfEmpty();
    const user = this.findByEmail(email);
    if (!user || user.password !== password) {
      return { ok: false, error: "E-mail ou senha inválidos." };
    }
    writeSession(user.id);
    return { ok: true, user };
  },

  logout(): void {
    clearSession();
  },

  getCurrentUser(): UserRecord | null {
    const id = readSessionUserId();
    if (id === null) return null;
    return this.findById(id) ?? null;
  },

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },

  isAdmin(): boolean {
    const u = this.getCurrentUser();
    return u?.role === UserRole.ADMIN;
  },

  countAdmins(): number {
    return readUsers().filter((u) => u.role === UserRole.ADMIN).length;
  },

  adminCreateUser(payload: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }): { ok: true; user: UserRecord } | { ok: false; error: string } {
    seedIfEmpty();
    if (this.findByEmail(payload.email)) {
      return { ok: false, error: "E-mail já cadastrado." };
    }
    const users = readUsers();
    const nextId = users.reduce((m, u) => Math.max(m, u.id), 0) + 1;
    const user: UserRecord = {
      id: nextId,
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      role: payload.role,
    };
    users.push(user);
    writeUsers(users);
    return { ok: true, user };
  },

  adminUpdateUser(
    id: number,
    patch: Partial<Pick<UserRecord, "name" | "email" | "password" | "role">>
  ): { ok: true } | { ok: false; error: string } {
    seedIfEmpty();
    const users = readUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return { ok: false, error: "Usuário não encontrado." };
    const current = users[idx];
    const nextRole = patch.role ?? current.role;
    if (current.role === UserRole.ADMIN && nextRole === UserRole.USER && this.countAdmins() <= 1) {
      return { ok: false, error: "Deve existir ao menos um administrador." };
    }
    const nextEmail = patch.email?.trim().toLowerCase() ?? current.email;
    if (nextEmail !== current.email && this.findByEmail(nextEmail)) {
      return { ok: false, error: "E-mail já cadastrado." };
    }
    users[idx] = {
      ...current,
      name: patch.name?.trim() ?? current.name,
      email: nextEmail,
      password: patch.password ?? current.password,
      role: nextRole,
    };
    writeUsers(users);
    return { ok: true };
  },

  updateSelf(patch: {
    name?: string;
    email?: string;
    password?: string;
  }): { ok: true } | { ok: false; error: string } {
    const current = this.getCurrentUser();
    if (!current) return { ok: false, error: "Não autenticado." };
    const users = readUsers();
    const idx = users.findIndex((u) => u.id === current.id);
    if (idx === -1) return { ok: false, error: "Usuário não encontrado." };
    const nextEmail = patch.email?.trim().toLowerCase() ?? users[idx].email;
    if (nextEmail !== users[idx].email && this.findByEmail(nextEmail)) {
      return { ok: false, error: "E-mail já cadastrado." };
    }
    users[idx] = {
      ...users[idx],
      name: patch.name?.trim() ?? users[idx].name,
      email: nextEmail,
      password: patch.password && patch.password.length > 0 ? patch.password : users[idx].password,
    };
    writeUsers(users);
    return { ok: true };
  },

  adminDeleteUser(id: number): { ok: true } | { ok: false; error: string } {
    seedIfEmpty();
    const users = readUsers();
    const target = users.find((u) => u.id === id);
    if (!target) return { ok: false, error: "Usuário não encontrado." };
    if (target.role === UserRole.ADMIN && this.countAdmins() <= 1) {
      return { ok: false, error: "Não é possível remover o único administrador." };
    }
    const next = users.filter((u) => u.id !== id);
    writeUsers(next);
    const sessionId = readSessionUserId();
    if (sessionId === id) {
      clearSession();
    }
    return { ok: true };
  },
};
