import type { AppData } from "@/types/app-data";
import { emptyAppData } from "@/types/app-data";
import type { StorageAdapter } from "@/lib/storage/types";
import { parseAppData } from "@/lib/storage/parse-app-data";

const STORAGE_KEY = "wealth-app-data";

export class LocalStorageAdapter implements StorageAdapter {
  async getData(): Promise<AppData> {
    if (typeof window === "undefined") return emptyAppData();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyAppData();
      return parseAppData(JSON.parse(raw));
    } catch {
      return emptyAppData();
    }
  }

  async saveData(data: AppData): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async removeData(): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const localStorageAdapter = new LocalStorageAdapter();
