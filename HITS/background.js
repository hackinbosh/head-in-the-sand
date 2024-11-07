chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    blockedKeywords: ["Trump", "GOP", "Dems", "Repubs", "Ukraine", "Israel", "Palestinians", "Hamas", "Russia"]
  }, () => {
    console.log("Head In The Sand: Default blocked keywords set.");
  });
});
