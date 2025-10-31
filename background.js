chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes("udio.com")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  } else {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => alert("This extension only works on udio.com")
    });
  }
});