import { STORAGE } from "./storageKeys";

type FavoritesMap = Record<string, number[]>;

function readAll(): FavoritesMap {
  try {
    const raw = localStorage.getItem(STORAGE.FAVORITES);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as FavoritesMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(map: FavoritesMap): void {
  localStorage.setItem(STORAGE.FAVORITES, JSON.stringify(map));
}

function key(userId: number): string {
  return String(userId);
}

export const favoritesService = {
  list(userId: number): number[] {
    const map = readAll();
    return map[key(userId)] ?? [];
  },

  has(userId: number, productId: number): boolean {
    return this.list(userId).includes(productId);
  },

  add(userId: number, productId: number): void {
    const map = readAll();
    const k = key(userId);
    const cur = new Set(map[k] ?? []);
    cur.add(productId);
    map[k] = Array.from(cur);
    writeAll(map);
  },

  remove(userId: number, productId: number): void {
    const map = readAll();
    const k = key(userId);
    map[k] = (map[k] ?? []).filter((id) => id !== productId);
    writeAll(map);
  },

  toggle(userId: number, productId: number): boolean {
    if (this.has(userId, productId)) {
      this.remove(userId, productId);
      return false;
    }
    this.add(userId, productId);
    return true;
  },
};
