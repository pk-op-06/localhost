const { ipcRenderer } = require("electron");

function getCurrentWindow() {
  return window;
}

function openMenu(x, y, tagId) {
  ipcRenderer.send('display-app-menu_' + tagId, { x, y });
}

function openContextMenu(x, y, tagId) {
  ipcRenderer.send('showContextMenu_' + tagId, { x, y });
}

function minimizeWindow(tagId) {
  ipcRenderer.send('minimize_' + tagId)
}

function toggleMaxMinWindow(tagId) {
  ipcRenderer.send('toggle-maximize-window_' + tagId);
}

function closeWindow(browserWindow = getCurrentWindow()) {
  browserWindow.close();
}

function openDevTools(t, d, tagId) {
  ipcRenderer.send('open-devtools_' + tagId, t, d);
}

function openNewWindow(url, tagId) {
  ipcRenderer.send('add-window_' + tagId, url);
}

module.exports = {
  getCurrentWindow,
  openMenu,
  minimizeWindow,
  toggleMaxMinWindow,
  closeWindow,
  openContextMenu,
  openDevTools,
  openNewWindow,
};