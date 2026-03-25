import { create } from "zustand";
import { formatMonth, startOfMonth } from "@/lib/utils";

type UiState = {
  monthKey: string;
  setMonthKey: (key: string) => void;
};

export const useUiStore = create<UiState>((set) => ({
  monthKey: formatMonth(startOfMonth(new Date())),
  setMonthKey: (monthKey) => set({ monthKey }),
}));
