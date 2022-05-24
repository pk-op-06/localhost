/**
 * @author Prakhar Khandelwal
 * @date 10th May 2022
 * @description This Project is build up to solve the RAM issues what Chrome and Firefox have nowadays.
 *              This woll eventually enhance the local server loading and will not end up hanging our PC's up.
 * @link check out electron docs to start with this project.
 * @version 1.0.0
 */


// Modules to control application life and create native browser window
const { app, BrowserWindow, webContents } = require("electron");
const path = require("path");
const { menu, inspectMenu } = require("./src/scripts/menu");
const ipc = require("electron").ipcMain;
const fs = require('fs');

function updateFile(content) {
  let sendData = {
    ...content,
  };
  fs.readFile('./internal.json', 'utf8', function (err, data) {
    if (err) {
      console.log('read err', err);
      return;
    }

    const d = JSON.parse(data);
    sendData = {
      ...d,
      ...content,
    }
    if (sendData) {
      writeFile(JSON.stringify(sendData));
    }
  });
}

function writeFile(content) {
  fs.writeFile('./internal.json', content, (err) => {
    if (err) {
        console.log('write err:',err);
        return;
    }

    console.log('Added Content')
  });
}

let windows = new Set();
let idx = 0
function createWindow (url = '') {

  // Create the browser window.
  let window = new BrowserWindow({
    width: 1000,
    height: 800,
    minWidth: 735,
    minHeight: 800,
    icon: 'src/assets/icons8-easy-100.png',
    webPreferences: {
      preload: path.join(__dirname, "src/scripts/preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: true,
      webviewTag: true,
    },
    frame: false,
  });

  windows.add(window);
  window.on("closed", function() {
    windows.delete(window);
    window = null;
  });
  window.webContents.executeJavaScript("window.tagId = "+ idx);
  // window.webContents.executeJavaScript("window.tagId").then((res) => console.log(res));

  if (url) {
    updateFile({newWindowURL: url});
  }

  window.loadFile('src/pages/index.html')

  ipc.on('display-app-menu_' + idx, function(e, args) {
    menu.popup({
      window,
      x: args.x,
      y: args.y
    })
  });

  ipc.on('display-app-context_' + idx, function(e, args) {
    inspectMenu.popup({
      window,
      x: args.x,
      y: args.y
    })
  });

  // toggle maximize
  ipc.on('toggle-maximize-window_' + idx, function(event) {
    if(window.isMaximized()) {
      window.unmaximize();
    } else {
        window.maximize();
    }
  });

  // minimize current window
  ipc.on('minimize_' + idx, function (e) {
    if (window.minimizable) {
      window.minimize();
    }
  });

  // open dev tools on same window
  // not working currently but will get to a solution for this.
  ipc.on('open-devtools_' + idx, (event, targetContentsId, devtoolsContentsId) => {
    const target = webContents.fromId(targetContentsId)
    const devtools = webContents.fromId(devtoolsContentsId)
    target.setDevToolsWebContents(devtools)
    target.toggleDevTools()
  });

  ipc.on('add-window_' + idx, (e, url) => {
    console.log('Creating new window');
    createWindow(url);
  });
  idx++;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (windows.size === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  console.log('all closed');
  if (process.platform !== 'darwin') app.quit()
});
