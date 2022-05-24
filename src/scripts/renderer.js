window.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.getElementById("menu-btn");
  const minimizeButton = document.getElementById("minimize-btn");
  const maxUnmaxButton = document.getElementById("max-unmax-btn");
  const closeButton = document.getElementById("close-btn");

  menuButton.addEventListener("click", e => {
    window.electron.openMenu(e.x - 100, e.y, window.tagId);
  });

  minimizeButton.addEventListener("click", e => {
    window.electron.minimizeWindow(window.tagId);
  });

  maxUnmaxButton.addEventListener("click", e => {
    const icon = maxUnmaxButton.querySelector("i.far");

    window.electron.toggleMaxMinWindow(window.tagId);
    if (window.outerWidth !== window.screen.availWidth) {
      icon.classList.remove("fa-square");
      icon.classList.add("fa-clone");
    } else {
      icon.classList.add("fa-square");
      icon.classList.remove("fa-clone");
    }
  });
  closeButton.addEventListener("click", e => {
    window.electron.closeWindow();
  });
});