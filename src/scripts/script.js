let id = 0;
const ids = [];
const inputValues = {};
const internal = window.electron.getInternal();
const DEFAULT_SEARCH_ENGINE = internal['default_search_engine'];
const history = [];
let selectedURL = '';
let hasUpdated = false;

createTab();

// load a tab and webview
function createTab(loadURL = '') {
  const url = loadURL || internal['newWindowURL'];
  if (internal['newWindowURL']) {
    window.electron.updateInternal({newWindowURL: ''});
    internal['newWindowURL'] = '';
  }
  // remove selected class from all previous tabs.
  const currTabs = document.getElementsByClassName("tab");
  for (let i = 0;i < currTabs.length;i++) {
    currTabs[i].classList.remove('selected');
  }
  
  const tab = document.createElement("div");
  tab.setAttribute('id', 'tab_' + id);
  tab.classList.add('tab');
  const tabTitle = document.createElement("span");
  tabTitle.innerHTML = 'New Tab';
  tabTitle.setAttribute("id", "tabTitle_" + id);
  tab.classList.add('selected');

  const rContainer = document.createElement("span");
  rContainer.classList.add('rContainer');

  // create a tab remove element
  const remove = document.createElement("span");
  remove.setAttribute("id", "remove_" + id);
  remove.classList.add(...['fas', 'fa-times', 'remove']);
  remove.style.display = "none";

  remove.addEventListener('click', function (e) {
    removeCurrentTab(this);

    e.stopPropagation();
  });
  tab.appendChild(tabTitle);
  rContainer.appendChild(remove);
  tab.appendChild(rContainer);

  const tabs = document.getElementById("tabs");

  // display remove icon on tab hover
  tab.addEventListener('mouseover', function (e) {
    const currID = this.getAttribute("id").split("_")[1];

    document.getElementById("remove_" + currID).style.display = "inline";
  });

  // hide remove icon on tab mouseleave event
  tab.addEventListener('mouseleave', function (e) {
    const currID = this.getAttribute("id").split("_")[1];

    document.getElementById("remove_" + currID).style.display = "none";
  });
  tabs.appendChild(tab);
  
  // set default url
  inputValues[id] = url;
  document.getElementById("localhost-url-input").value = inputValues[id];
  document.getElementById("localhost-url-input").focus();

  // set the clicked tab as current while loading correct webview
  document.getElementById("tab_" + id).addEventListener("click", function (e) {
    const tabs = document.getElementsByClassName("tab");
    const currID = this.getAttribute("id").split("_")[1];
    window.selectedTab = currID;
    for (let i = 0;i < tabs.length;i++) {
      tabs[i].classList.remove('selected');
    }

    this.classList.add('selected');

    // iterate all over webview to get related webview on top.
    const webviews = document.querySelectorAll("webview");
    for (let i = 0; i < webviews.length; i++) {
      webviews[i].classList.remove('selected-webview');
    }
    document.getElementById("localhost-url-input").value = inputValues[currID];
    document.getElementById("webview_" + currID).classList.add('selected-webview');
  });

  const webview = createWebview(id, url);

  const container = document.getElementsByClassName("container")[0];
  container.appendChild(webview);

  window.selectedTab = id;

  ids.push(id);
  history[id] = {
    back: [],
    forward: [],
  };
  id++;
}

function createWebview(id, url) {
    // create webview
    const webview = document.createElement("webview");
    webview.setAttribute('id','webview_' + id);
    webview.setAttribute("src", url || "../pages/welcome.html");
    webview.setAttribute("webPreferences", "nodeintegration=true, contextisolation=true");

    webview.addEventListener('did-start-loading', function (e) {
      // console.log('start loading...', this.getTitle(), this.getURL(), selectedURL);

      document.getElementById("reload").classList.remove("fa-repeat");
      document.getElementById("reload").classList.add("fa-times");
      
      // if anyone clicks on a link...
      if (selectedURL) {

        // console.log('Updating history on load');
        hasUpdated = true;
        history[window.selectedTab].back.unshift({
          title: this.getTitle(),
          url: inputValues[window.selectedTab],
        });
        document.getElementById('localhost-url-input').value = selectedURL;
        inputValues[window.selectedTab] = selectedURL;
        selectedURL = '';
      } else {
        hasUpdated = false;
      }
    });

    webview.addEventListener('did-stop-loading', function (e) {
      // console.log('stop loading...', this.getTitle(), this.getURL());
      document.getElementById("reload").classList.remove("fa-times");  
      document.getElementById("reload").classList.add("fa-repeat");

      // disable/enable back/forward buttons as per the history available
      const back = document.getElementById("go-back");
      const forward = document.getElementById("go-forward");
      const idx = window.selectedTab;

      if (history[idx].back.length === 0) {
        back.classList.add('disabled');
      } else {
        back.classList.remove('disabled');
      }

      if (history[idx].forward.length === 0) {
        forward.classList.add('disabled');
      } else {
        forward.classList.remove('disabled');
      }
    });

    // capture previous url from where the current internal page comes
    webview.addEventListener('will-navigate', function (e) {
      // console.log('will-navigate:', this.getTitle(), this.getURL(), hasUpdated);
      if (!hasUpdated) {
        // console.log('Updating history on will - navigate');
        history[window.selectedTab].back.unshift({
          title: this.getTitle(),
          url: this.getURL(),
        })

        hasUpdated = true;
      }
    })

    // capture the url on which cursor is on.
    webview.addEventListener('update-target-url', function (e) {
      // console.log('update-target-url:', this.getTitle(), this.getURL(), e.url, e);

      selectedURL = e.url;
    })

    webview.addEventListener('did-fail-load', function (e) {
      console.log('Failed', e);
      document.getElementById("reload").classList.remove("fa-times");  
      document.getElementById("reload").classList.add("fa-repeat");
    });

    // to capture current src displayed on the above input box
    webview.addEventListener('did-finish-load', function (e) {
      // console.log('finished loading...', this.getTitle(), this.getURL());

      const idx = window.selectedTab;
      const src = this.getURL();
      document.getElementById("tabTitle_" + idx).innerHTML = this.getTitle();
      if (src.includes('./notfound.html') || src.includes('/pages/notfound.html')) {
        // DO NOTHING
      } else if (src.includes('/pages/welcome.html')) {
        document.getElementById("localhost-url-input").value = '';
      } else {
        inputValues[idx] = src;
        document.getElementById("localhost-url-input").value = src;
      }
    });

    webview.addEventListener("mouseover", function (e) {
      document.getElementsByClassName("webview-popup-menu")[0].style.display = "none";
    })

    // open context menu
    webview.addEventListener('context-menu', function (e) {
      // ipcRender does not accepts and object or function for its params
      // so, as developers mostly uses inspect element, creating my own for now till I get a soltion for this.
      let x = e.params.x;
      let y = e.params.y;
  
      // hide previous one
      const div = document.getElementsByClassName("webview-popup-menu")[0];
      div.style.display = "none";
  
      // calculate context menu position
      if (x + 286 > window.innerWidth) {
        x = x - 282;
      } else {
        x = x - 19;
      }
      if (y + 50 > window.innerHeight) {
        y = y - 46;
      } else {
        y = y - 7;
      }
  
      // open dev tools inside webview
      document.getElementById("toggle-inspect").addEventListener("click", function () {
        openDevTools(e.params.x, e.params.y);
      });

      div.style.left = x + "px";
      div.style.top = y + "px";
      div.style.display = "block";

      // window.electron.openContextMenu(e.x, e.y);
    });

    // find all webview and set their z-index as 0;
    const webviews = document.querySelectorAll("webview");
    for (let i = 0; i < webviews.length; i++) {
      webviews[i].classList.remove('selected-webview');
    }
  
    // set current as selected
    webview.classList.add('selected-webview');
    
    return webview;
}

function removeCurrentTab(ele) {
  const currID = ele.getAttribute("id").split("_")[1];

  // remove tab plus the webview
  document.getElementById("tab_" + currID).remove();
  document.getElementById("webview_" + currID).remove();
  ids.splice(ids.indexOf(parseInt(currID)), 1);
  delete inputValues[currID];

  if (ids.length === 0) {
    window.electron.closeWindow();
  }

  // calculate valid left/right tab
  const id = parseInt(currID);
  let newId = null;
  if (id === 0 && ids.length > 0) {
    newId = ids[0];
  } else if (id > 0) {
    for (let i = id; i >= 0; i--) {
      if (ids.includes(i)) {
        newId = i;
        break;
      }
    }
  }

  // display valid tab
  if (newId === 0 || newId) {
    window.selectedTab = '' + newId;
    const tabs = document.getElementsByClassName("tab");
    for (let i = 0;i < tabs.length;i++) {
      tabs[i].classList.remove('selected');
    }
    document.getElementById("tab_" + window.selectedTab).classList.add('selected');
    document.getElementById("localhost-url-input").value = inputValues[newId];
  } else {
    window.selectedTab = null;
    document.getElementById("localhost-url-input").value = '';
  }
}

function goHome() {
  document.getElementById("webview_"+ window.selectedTab).loadURL("https://google.com");
}

async function goBack() {
  const idx = window.selectedTab;
  const webview = document.getElementById("webview_"+ idx);
  
  // grab the current input box value and set into the forward array
  history[idx].forward.unshift({
    title: webview.getTitle(),
    url: inputValues[idx],
  });

  // pull url from previous history
  const { url } = history[idx].back[0];
  inputValues[idx] = url;
  document.getElementById("localhost-url-input").value = inputValues[idx];
  history[idx].back.splice(0, 1);

  await goURL(true, url === '');
}

async function goForward() {
  const idx = window.selectedTab;
  const webview = document.getElementById("webview_"+ idx);
  
  // grab the current input box value and set into the forward array
  history[idx].back.unshift({
    title: webview.getTitle(),
    url: inputValues[idx],
  });

  // pull url from previous history
  const { url } = history[idx].forward[0];
  inputValues[idx] = url;
  document.getElementById("localhost-url-input").value = url;
  history[idx].forward.splice(0, 1);

  await goURL(true, url === '');
}

async function reload() {
  await document.getElementById("webview_"+ window.selectedTab).reload();
}

function openDevTools(x, y) {
  /*
    Below lines should open the dev tools inside the current container i.e. side-by-side of the current webview
    but, rn electron is passing a VICHITRA Error which they don't have proper explaination till now.

    const targetId = document.getElementById("webview_"+ window.selectedTab).getWebContentsId();
    const devToolsId = document.getElementById("devtools").getWebContentsId();

    window.electron.openDevTools(targetId, devToolsId);
  */

  document.getElementById("webview_"+ window.selectedTab).inspectElement(x, y);
  document.getElementsByClassName("webview-popup-menu")[0].style.display = "none";
}

// manipulate URL as we enter
async function goURL(skipHistory = false, isRoot = false, sendURL = false) {
  selectedURL = '';
  let url = document.getElementById("localhost-url-input").value;
  if (!url && !isRoot) return;

  if (!(url.startsWith('http://') || url.startsWith('https://'))) {
    if (url.startsWith('localhost:')) {
      url = 'http://' + url;
    } else if (!url.startsWith('https://')) {
      var expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
      var regex = new RegExp(expression);

      if (url.match(regex)) {
        url = "https://" + url;
      } else {
        url = DEFAULT_SEARCH_ENGINE + decodeURIComponent(url);
      }
    }
  }

  // for welcome page
  if (isRoot) {
    url = '';
  }

  if (sendURL) {
    return url;
  }

  let curr = {};
  const idx = window.selectedTab;
  const webview = document.getElementById("webview_"+ idx);
  curr = {
    url: inputValues[idx],
    title: webview.getTitle(),
  }

  if (!url) {
    webview.setAttribute("src", '../pages/welcome.html');
  } else {
    try {
      inputValues[idx] = url;
      await webview.loadURL(url);
    } catch (e) {
      webview.setAttribute("src", '../pages/notfound.html');
    }
  
    if (!skipHistory) {
      history[idx].back.unshift({ ...curr });
    }
  }

  return;
}

async function submit(e) {
  // open in same browser
  if (e.code.includes('Enter') && !e.shiftKey) {
    await goURL();
    return;
  }

  // open in new browser
  if (e.shiftKey && e.code.includes('Enter')) {
    // close current tab
    const newWindowURL = await goURL(false, false, true);
    window.electron.openNewWindow(newWindowURL, window.tagId);
    setTimeout(() => {
      removeCurrentTab(document.getElementById('webview_' + window.selectedTab));
    }, 10);
  }
}
