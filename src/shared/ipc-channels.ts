// Single source of truth for IPC channel names, shared by the main process
// (ipcMain.handle) and the preload bridge (ipcRenderer.invoke).
export const CHANNELS = {
  app: {
    getVersion: "app:getVersion",
    ping: "app:ping",
  },
  customers: {
    list: "customers:list",
    search: "customers:search",
    getById: "customers:getById",
  },
  pickupOrders: {
    list: "pickupOrders:list",
    search: "pickupOrders:search",
    getById: "pickupOrders:getById",
    create: "pickupOrders:create",
    updateStatus: "pickupOrders:updateStatus",
  },
  print: {
    driverTicket: "print:driverTicket",
  },
  sync: {
    run: "sync:run",
    getStatus: "sync:getStatus",
    getHistory: "sync:getHistory",
  },
  settings: {
    get: "settings:get",
    update: "settings:update",
  },
} as const;
