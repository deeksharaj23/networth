import type { AppData } from "@/types/app-data";

/** Pluggable persistence — swap for FirebaseAdapter / APIAdapter later. */
export interface StorageAdapter {
  getData(): Promise<AppData>;
  saveData(data: AppData): Promise<void>;
  removeData(): Promise<void>;
}
