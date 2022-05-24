const { app, Menu } = require("electron");

const isMac = process.platform === "darwin";

const template = [
  {
    label: "File",
    submenu: [isMac ? { role: "close" } : { role: "quit" }]
  },
  // { role: 'editMenu' }
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" }
    ]
  },
  // { role: 'viewMenu' }
  {
    label: "View",
    submenu: [
      { role: "reload" , accelerator: 'Ctrl+R'},
      { role: "forcereload" , accelerator: 'Ctrl+Shift+R' },
      { role: "toggledevtools" }, // enable only in dev mode.
      { type: "separator" },
      { role: "resetzoom" },
      { role: "zoomin" },
      { role: "zoomout" },
      { type: "separator" },
      { role: "togglefullscreen" }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: "Window",
    submenu: [{ role: "minimize" }, { role: "zoom" }]
  },
  {
    role: "help",
    submenu: [
      {
        label: "Learn More",
        click: async () => {
          const { shell } = require("electron");
          await shell.openExternal("https://electronjs.org");
        }
      }
    ]
  }
];

// Future use.
const inspectTemplate = [
  {
    label: "File",
    submenu: [isMac ? { role: "close" } : { role: "quit" }]
  },
  { type: "separator" },
  { role: "toggledevtools", accelerator: 'F12' },  
]

const menu = Menu.buildFromTemplate(template);
const inspectMenu = Menu.buildFromTemplate(inspectTemplate);
Menu.setApplicationMenu(menu);

module.exports = {
  menu,
  inspectMenu,
};