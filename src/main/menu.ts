import { app, Menu, type BrowserWindow, type MenuItemConstructorOptions } from "electron";

// Builds the application menu. The "New Pickup Order" item asks the renderer to
// navigate via a simple location change (TanStack Router picks it up).
export function buildAppMenu(win: BrowserWindow): Menu {
  const isMac = process.platform === "darwin";

  const template: MenuItemConstructorOptions[] = [
    ...(isMac ? [{ role: "appMenu" as const }] : []),
    {
      label: "File",
      submenu: [
        {
          label: "New Pickup Order",
          accelerator: "CmdOrCtrl+N",
          click: () => win.webContents.executeJavaScript("window.location.assign('/new-pickup')"),
        },
        { type: "separator" },
        isMac ? { role: "close" } : { role: "quit" },
      ],
    },
    { role: "editMenu" },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      role: "help",
      submenu: [
        { label: "About Pickup Order App", enabled: false },
        { label: `Version ${app.getVersion()}`, enabled: false },
      ],
    },
  ];

  return Menu.buildFromTemplate(template);
}
