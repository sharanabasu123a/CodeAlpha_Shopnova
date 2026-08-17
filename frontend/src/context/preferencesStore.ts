import { create } from 'zustand';

interface PreferencesState {
  showImages: boolean;
  toggleShowImages: () => void;
}

export const usePreferences = create<PreferencesState>((set) => ({
  showImages: localStorage.getItem('agc_show_images') !== 'false',
  toggleShowImages: () => set((state) => {
    const nextVal = !state.showImages;
    localStorage.setItem('agc_show_images', String(nextVal));
    return { showImages: nextVal };
  }),
}));
