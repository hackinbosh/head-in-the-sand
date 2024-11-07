document.addEventListener("DOMContentLoaded", () => {
  const keywordsTextArea = document.getElementById("keywords");
  const saveButton = document.getElementById("save");
  const exportButton = document.getElementById("export");
  const importButton = document.getElementById("import");
  const importFile = document.getElementById("importFile");
  const status = document.getElementById('status');

  // Load existing keywords
  chrome.storage.sync.get("blockedKeywords", ({ blockedKeywords }) => {
    keywordsTextArea.value = blockedKeywords ? blockedKeywords.join(", ") : '';
  });

  // Save new keywords
  saveButton.addEventListener("click", () => {
    const newKeywords = keywordsTextArea.value.split(",").map(kw => kw.trim()).filter(Boolean);
    chrome.storage.sync.set({ blockedKeywords: newKeywords }, () => {
      // Notify content script to update keywords
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: "updateKeywords" });
        }
      });
      status.textContent = "Keywords updated successfully!";
      setTimeout(() => { status.textContent = ''; }, 2000);
    });
  });

  // Export keywords to a text file
  exportButton.addEventListener('click', () => {
    chrome.storage.sync.get("blockedKeywords", ({ blockedKeywords }) => {
      const blob = new Blob([blockedKeywords.join(", ")], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'blockedKeywords.txt';
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  // Trigger import file dialog
  importButton.addEventListener('click', () => {
    importFile.click();
  });

  // Handle imported file
  importFile.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const newKeywords = reader.result.split(",").map(kw => kw.trim()).filter(Boolean);
        chrome.storage.sync.set({ blockedKeywords: newKeywords }, () => {
          keywordsTextArea.value = newKeywords.join(", ");
          // Notify content script to update keywords
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].id) {
              chrome.tabs.sendMessage(tabs[0].id, { action: "updateKeywords" });
            }
          });
          status.textContent = "Keywords imported successfully!";
          setTimeout(() => { status.textContent = ''; }, 2000);
        });
      };
      reader.readAsText(file);
    }
  });
});
