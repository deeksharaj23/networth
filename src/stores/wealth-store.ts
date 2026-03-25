import {
  assetBreakdownFromInvestments,
  categoryTotalsFromInvestments,
  netWorthFromInvestments,
} from "@/lib/networth";
import { createSeedAppData } from "@/lib/seed";
import { localStorageAdapter } from "@/lib/storage/local-storage-adapter";
import { parseAppData } from "@/lib/storage/parse-app-data";
import type { StorageAdapter } from "@/lib/storage/types";
import type { AppData, Contribution, Goal, Investment, MonthlySnapshot } from "@/types/app-data";
import { emptyAppData } from "@/types/app-data";
import { formatMonth, startOfMonth } from "@/lib/utils";
import { create } from "zustand";

let storageRef: StorageAdapter = localStorageAdapter;

export function configureWealthStorage(adapter: StorageAdapter) {
  storageRef = adapter;
}

function newId() {
  return crypto.randomUUID();
}

function pickAppData(s: WealthStore): AppData {
  return {
    investments: s.investments,
    snapshots: s.snapshots,
    goals: s.goals,
    contributions: s.contributions,
  };
}

type WealthStore = AppData & {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  persist: () => Promise<void>;
  syncSnapshotForCurrentMonth: () => void;
  addInvestment: (input: Omit<Investment, "id" | "createdAt">) => void;
  updateInvestment: (id: string, patch: Partial<Investment>) => void;
  deleteInvestment: (id: string) => void;
  addGoal: (input: Omit<Goal, "id">) => void;
  deleteGoal: (id: string) => void;
  addContribution: (input: Omit<Contribution, "id">) => void;
  importData: (json: string) => boolean;
  exportData: () => string;
  resetData: () => Promise<void>;
};

async function write(adapter: StorageAdapter, data: AppData) {
  await adapter.saveData(data);
}

export const useWealthStore = create<WealthStore>((set, get) => ({
  ...emptyAppData(),
  hydrated: false,

  hydrate: async () => {
    let data = await storageRef.getData();
    const empty =
      data.investments.length === 0 &&
      data.snapshots.length === 0 &&
      data.goals.length === 0 &&
      (data.contributions?.length ?? 0) === 0;
    if (empty) {
      data = createSeedAppData();
      await storageRef.saveData(data);
    }
    set({
      investments: data.investments,
      snapshots: data.snapshots,
      goals: data.goals,
      contributions: data.contributions ?? [],
      hydrated: true,
    });
    get().syncSnapshotForCurrentMonth();
  },

  persist: async () => {
    await write(storageRef, pickAppData(get()));
  },

  syncSnapshotForCurrentMonth: () => {
    const { investments, contributions, snapshots } = get();
    const monthKey = formatMonth(startOfMonth(new Date()));
    const nw = netWorthFromInvestments(investments);
    const categoryTotals = categoryTotalsFromInvestments(investments) as Record<
      string,
      number
    >;
    const assetBreakdown = assetBreakdownFromInvestments(investments);
    const totalContributions = contributions
      .filter((c) => c.month === monthKey)
      .reduce((s, c) => s + c.amount, 0);

    const sorted = [...snapshots].sort((a, b) => a.month.localeCompare(b.month));
    const prev = sorted.filter((s) => s.month < monthKey).pop();
    const prevNw = prev?.netWorth ?? null;
    const changeAbsolute = prevNw != null ? nw - prevNw : 0;
    const changePercent =
      prevNw != null && prevNw !== 0 ? (changeAbsolute / Math.abs(prevNw)) * 100 : 0;

    const nextSnap: MonthlySnapshot = {
      id: sorted.find((s) => s.month === monthKey)?.id ?? newId(),
      month: monthKey,
      netWorth: nw,
      changePercent,
      changeAbsolute,
      categoryTotals,
      assetBreakdown,
      totalContributions,
    };

    const withoutCurrent = snapshots.filter((s) => s.month !== monthKey);
    const nextList = [...withoutCurrent, nextSnap].sort((a, b) =>
      a.month.localeCompare(b.month),
    );

    set({ snapshots: nextList });
    void write(storageRef, pickAppData(get()));
  },

  addInvestment: (input) => {
    const inv: Investment = {
      ...input,
      id: newId(),
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ investments: [...s.investments, inv] }));
    get().syncSnapshotForCurrentMonth();
  },

  updateInvestment: (id, patch) => {
    set((s) => ({
      investments: s.investments.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    }));
    get().syncSnapshotForCurrentMonth();
  },

  deleteInvestment: (id) => {
    set((s) => ({
      investments: s.investments.filter((i) => i.id !== id),
      contributions: s.contributions.filter((c) => c.investmentId !== id),
      goals: s.goals.map((g) => ({
        ...g,
        linkedInvestmentIds: g.linkedInvestmentIds.filter((x) => x !== id),
      })),
    }));
    get().syncSnapshotForCurrentMonth();
  },

  addGoal: (input) => {
    const g: Goal = { ...input, id: newId() };
    set((s) => ({ goals: [...s.goals, g] }));
    void write(storageRef, pickAppData(get()));
  },

  deleteGoal: (id) => {
    set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }));
    void write(storageRef, pickAppData(get()));
  },

  addContribution: (input) => {
    const c: Contribution = { ...input, id: newId() };
    set((s) => ({ contributions: [...s.contributions, c] }));
    get().syncSnapshotForCurrentMonth();
  },

  importData: (json) => {
    try {
      const parsed = JSON.parse(json) as unknown;
      const data = parseAppData(parsed);
      set({
        investments: data.investments,
        snapshots: data.snapshots,
        goals: data.goals,
        contributions: data.contributions,
      });
      get().syncSnapshotForCurrentMonth();
      void write(storageRef, pickAppData(get()));
      return true;
    } catch {
      return false;
    }
  },

  exportData: () => JSON.stringify(pickAppData(get()), null, 2),

  resetData: async () => {
    await storageRef.removeData();
    set({ ...emptyAppData(), hydrated: true });
    await write(storageRef, pickAppData(get()));
  },
}));
