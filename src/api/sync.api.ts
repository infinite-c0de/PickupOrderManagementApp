import { getElectron } from "./types";

export const syncApi = {
  run: () => getElectron().sync.run(),
  getStatus: () => getElectron().sync.getStatus(),
  getHistory: () => getElectron().sync.getHistory(),
};
