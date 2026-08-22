const MENU_ID = "call-selection";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: "Appeler %s",
    contexts: ["selection"],
  });
});

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
