import { create } from 'zustand';

interface AppState {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
