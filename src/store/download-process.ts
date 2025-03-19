import { IDownloadProcess } from "src/interfaces";
import { create } from "zustand";

interface IDownloadProcessStore {
  downloadProcess: IDownloadProcess[];
  addProcess: (newProcess: IDownloadProcess) => void;
  removeProcess: (processId: string) => void;
  updateProcess: (
    processId: string,
    payload: Partial<IDownloadProcess>
  ) => void;
}

const useDownloadProcess = create<IDownloadProcessStore>((set) => ({
  downloadProcess: [],
  addProcess: (newProcess: IDownloadProcess) => {
    set((state) => ({
      downloadProcess: [...state.downloadProcess, newProcess],
    }));
  },
  removeProcess: (processId: string) => {
    set((state) => ({
      downloadProcess: state.downloadProcess.filter(
        (process) => process.id !== processId
      ),
    }));
  },
  updateProcess: (processId, payload) => {
    set((state) => ({
      downloadProcess: state.downloadProcess.map((process) =>
        process.id === processId ? { ...process, ...payload } : process
      ),
    }));
  },
}));

export default useDownloadProcess;
