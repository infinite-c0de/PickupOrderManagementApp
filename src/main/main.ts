import { app, BrowserWindow, Menu } from "electron";
import {
  registerAppProtocolSchemes,
  registerAppProtocol,
  applyProductionCsp,
  createMainWindow,
} from "./window";
import { buildAppMenu } from "./menu";
import { registerIpcHandlers } from "./ipc";
import { initDatabase } from "./database/db";
import { createLogger } from "./utils/logger";

const log = createLogger("main");

// Privileged scheme must be registered before the app is ready.
registerAppProtocolSchemes();

app.whenReady().then(() => {
  initDatabase();
  registerAppProtocol();
  applyProductionCsp();
  registerIpcHandlers();

  const win = createMainWindow();
  Menu.setApplicationMenu(buildAppMenu(win));

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const next = createMainWindow();
      Menu.setApplicationMenu(buildAppMenu(next));
    }
  });

  log.info("application ready");
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
