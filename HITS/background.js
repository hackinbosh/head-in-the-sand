chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    blockedKeywords: [
      "Trump", "Kamala", "Harris", "donald", "GOP", "Dems", "democratic", "republican", "votes", "Repubs",
      "Ukraine", "Israel", "Palestinians", "Hamas", "Russia", 
      // Additional Keywords
      "Biden", "election", "politics", "conservative", "liberal", "right-wing", "left-wing", "scandal",
      "conflict", "invasion", "bombing", "missiles", "nuclear", "NATO", "terrorism", "jihad",
      "Covid", "pandemic", "vaccine", "lockdown",
      "inflation", "recession", "unemployment", "stock market",
      "abortion", "gun control", "immigration", "racism", "climate change", "protest", "activist"
    ]
  }, () => {
    console.log("Head In The Sand: Default blocked keywords set.");
  });
});
