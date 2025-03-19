import { ICurrentUser } from "src/interfaces";
import { create } from "zustand";

interface ICurrentUserStore {
  currentUser: ICurrentUser | null;
  setCurrentUser: (currentUser: ICurrentUser | null) => void;
}

const useCurrentUserStore = create<ICurrentUserStore>((set) => ({
  currentUser: null,
  setCurrentUser: (currentUser: ICurrentUser | null) =>
    set(() => ({ currentUser })),
}));

export default useCurrentUserStore;
