import { getElectron } from "./types";

export const customerApi = {
  list: () => getElectron().customers.list(),
  search: (query: string) => getElectron().customers.search(query),
  getById: (id: string) => getElectron().customers.getById(id),
};
