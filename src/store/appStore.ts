import { create } from "zustand";
import type { Meter } from "@/types";

interface AppState {
  meters: Meter[];
  activeMeterId: string | null;
  setMeters: (meters: Meter[]) => void;
  setActiveMeter: (id: string | null) => void;
  activeMeter: () => Meter | null;
}

export const useAppStore = create<AppState>((set, get) => ({
  meters: [],
  activeMeterId: null,
  setMeters: (meters) =>
    set((s) => ({
      meters,
      activeMeterId:
        s.activeMeterId && meters.some((m) => m.$id === s.activeMeterId)
          ? s.activeMeterId
          : (meters.find((m) => m.isDefault) ?? meters[0])?.$id ?? null,
    })),
  setActiveMeter: (activeMeterId) => set({ activeMeterId }),
  activeMeter: () => {
    const { meters, activeMeterId } = get();
    return meters.find((m) => m.$id === activeMeterId) ?? meters[0] ?? null;
  },
}));
