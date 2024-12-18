import { create } from 'zustand';

interface useLabModalPage {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useLabModal = create<useLabModalPage>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
