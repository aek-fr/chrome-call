const MENU_ID = "call-selection";

// Rebuilt on install and on browser startup, so the entry picks up the current UI
// language instead of keeping whatever it was created with.
function createMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      // getMessage() returns "" for a missing or misspelled key, and an empty title makes
      // create() fail outright — leaving no menu entry at all. Fall back to English so a
      // broken catalog degrades to untranslated rather than invisible.
      title: chrome.i18n.getMessage("menuTitle") || "Call %s",
      // Keep this to "selection" only: the browser substitutes %s from the selection, so
      // in any other context the title would render with nothing in its place.
      contexts: ["selection"],
    });
  });
}

chrome.runtime.onInstalled.addListener(createMenu);
chrome.runtime.onStartup.addListener(createMenu);

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== MENU_ID) return;

  let text = info.selectionText;
  if (text.includes("+")) {
    text = text.replace(/\(0\)/g, "");
  }
  const number = text.replace(/[^0-9+]/g, "");
  if (!/\d/.test(number)) return;

  chrome.tabs.create({ url: "tel:" + number });
});
