document.addEventListener("DOMContentLoaded", () => {
  const keywordsTextArea = document.getElementById("keywords");
  const saveButton = document.getElementById("save");
  const exportButton = document.getElementById("export");
  const importButton = document.getElementById("import");
  const importFileInput = document.getElementById("importFile");
  const exportLogsButton = document.getElementById("exportLogs");
  const statusMessage = document.getElementById("status");

  // Load blocked keywords from Chrome storage and populate the textarea
  chrome.storage.sync.get("blockedKeywords", ({ blockedKeywords }) => {
    if (Array.isArray(blockedKeywords)) {
      keywordsTextArea.value = blockedKeywords.join(", ");
    } else {
      keywordsTextArea.value = "";
    }
  });

  // Save new keywords to Chrome storage
  saveButton.addEventListener("click", () => {
    const newKeywords = keywordsTextArea.value.split(",").map(kw => kw.trim()).filter(kw => kw.length > 0);
    chrome.storage.sync.set({ blockedKeywords: newKeywords }, () => {
      statusMessage.textContent = "Keywords updated successfully!";
      statusMessage.style.color = "green";
      setTimeout(() => {
        statusMessage.textContent = "";
      }, 3000);
    });
  });

  // Export keywords to a text file
  exportButton.addEventListener("click", () => {
    chrome.storage.sync.get("blockedKeywords", ({ blockedKeywords }) => {
      const keywordsContent = blockedKeywords.join(", ");
      const blob = new Blob([keywordsContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      // Create a link to download the keyword file
      const a = document.createElement('a');
      a.href = url;
      a.download = 'blocked_keywords.txt';
      a.click();

      // Cleanup
      URL.revokeObjectURL(url);
    });
  });

  // Trigger the file input to import keywords
  importButton.addEventListener("click", () => {
    importFileInput.click();
  });

  // Handle importing keywords from a file
  importFileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const importedKeywords = e.target.result.split(",").map(kw => kw.trim()).filter(kw => kw.length > 0);
        chrome.storage.sync.set({ blockedKeywords: importedKeywords }, () => {
          keywordsTextArea.value = importedKeywords.join(", ");
          statusMessage.textContent = "Keywords imported successfully!";
          statusMessage.style.color = "green";
          setTimeout(() => {
            statusMessage.textContent = "";
          }, 3000);
        });
      };
      reader.readAsText(file);
    }
  });

  // Export logs to a text file
  exportLogsButton.addEventListener("click", () => {
    chrome.storage.local.get({ logs: [] }, ({ logs }) => {
      const logContent = logs.join('\n');
      const blob = new Blob([logContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      // Create a link to download the log file
      const a = document.createElement('a');
      a.href = url;
      a.download = 'head_in_the_sand_logs.txt';
      a.click();

      // Cleanup
      URL.revokeObjectURL(url);
    });
  });
});
