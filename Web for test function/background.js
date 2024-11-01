chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['jquery-3.7.1.js', 'colorBlind.js', 'colorSimulator.js', 'colorPicker.js']
    });
});
