const { contextBridge } = require('electron');
const pFs = require('fs');

const {
  openMenu,
  minimizeWindow,
  toggleMaxMinWindow,
  closeWindow,
  openContextMenu,
  openDevTools,
  openNewWindow,
} = require("./menu-functions");

contextBridge.exposeInMainWorld(
    'electron',
    {
      openMenu: (x, y, tagId) => openMenu(x, y, tagId),
      minimizeWindow: (t) => minimizeWindow(t),
      toggleMaxMinWindow: (t) => toggleMaxMinWindow(t),
      closeWindow: (bw) => closeWindow(bw),
      openContextMenu: (x, y, tagId) => openContextMenu(x, y, tagId),
      openDevTools: (t, d, tagId) => openDevTools(t, d, tagId),
      openNewWindow: (u, t) => openNewWindow(u, t),
      getInternal: () => {
        const data = pFs.readFileSync('./internal.json', 'utf-8');
        return JSON.parse(data);
      },
      updateInternal: (content) => {
        const data = pFs.readFileSync('./internal.json', 'utf-8');
        let d = JSON.parse(data);
        d = {
          ...d,
          ...content,
        }

        pFs.writeFile('./internal.json', JSON.stringify(d), (err) => {
          if (err) {
              console.log('write err:',err);
              return;
          }
      
          console.log('Updated Content')
        });
      },
    }
)
