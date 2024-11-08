chrome.storage.sync.get("blockedKeywords", ({ blockedKeywords }) => {
  if (!Array.isArray(blockedKeywords) || blockedKeywords.length === 0) {
    console.log("No blocked keywords found.");
    return;
  }

  // Compile keywords into a single regular expression
  let keywordRegex = new RegExp(blockedKeywords.join('|'), 'i');
  console.log("Blocked Keywords:", blockedKeywords);
  console.log("Compiled Regex:", keywordRegex);

  // Define updated post and comment selectors for Reddit and X.com
  const postSelectors = [
    "div[data-testid='post-container']", // Reddit posts
    "shreddit-post", // Reddit dynamic post component
    "a[data-ks-id^='t3_']", // Reddit anchor links for posts
    "article[data-testid='tweet']", // X.com tweets
    "div.Post", // Generic fallback for Reddit posts
    "div.css-1dbjc4n" // Generic class for X.com tweets
  ];

  const commentSelectors = [
    "div[data-testid='comment']", // Reddit comments
    "shreddit-comment", // Reddit comment component
    "div[role='article']", // X.com tweets/replies
  ];

  // Function to log content to local storage
  function logToFile(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${message}\n`;

    chrome.storage.local.get("logs", (result) => {
      let logs = result.logs ? result.logs : "";
      logs += logEntry;
      chrome.storage.local.set({ logs: logs });
    });
  }

  /**
   * Blocks content containing specified keywords.
   * @param {NodeList|Array} elements - Elements to check.
   * @param {RegExp} keywordRegex - Compiled regex of blocked keywords.
   */
  function blockContent(elements, keywordRegex) {
    elements.forEach(element => {
      if (keywordRegex.test(element.innerText)) {
        const parentPost = element.closest(postSelectors.join(', '));
        if (parentPost) {
          parentPost.classList.add('hidden-by-extension');
          logToFile(`Blocked Post: ${parentPost.outerHTML}`);
        } else {
          element.classList.add('hidden-by-extension');
          logToFile(`Blocked Element: ${element.outerHTML}`);
        }
      }
    });
  }

  // Initial blocking on page load
  const initialPosts = document.querySelectorAll(postSelectors.join(', '));
  const initialComments = document.querySelectorAll(commentSelectors.join(', '));
  blockContent(initialPosts, keywordRegex);
  blockContent(initialComments, keywordRegex);

  // Set up MutationObserver to monitor for dynamically added content
  const observer = new MutationObserver((mutations) => {
    const addedNodes = [];
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Only consider element nodes
          if (node.matches(postSelectors.join(', ')) || node.matches(commentSelectors.join(', '))) {
            addedNodes.push(node);
          } else {
            // If child nodes match post/comment selectors, add them too
            node.querySelectorAll(postSelectors.join(', ') + ',' + commentSelectors.join(', ')).forEach(childNode => {
              addedNodes.push(childNode);
            });
          }
        }
      });
    });
    if (addedNodes.length > 0) {
      blockContent(addedNodes, keywordRegex);
    }
  });

  // Observe mutations in the whole document body
  observer.observe(document.body, { childList: true, subtree: true });
  console.log("MutationObserver initialized.");

  // Update keywords if they change via the popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateKeywords") {
      chrome.storage.sync.get("blockedKeywords", ({ blockedKeywords }) => {
        if (!Array.isArray(blockedKeywords) || blockedKeywords.length === 0) {
          console.log("No blocked keywords found after update.");
          return;
        }
        keywordRegex = new RegExp(blockedKeywords.join('|'), 'i');
        console.log("Blocked Keywords updated:", blockedKeywords);
        const allPosts = document.querySelectorAll(postSelectors.join(', '));
        const allComments = document.querySelectorAll(commentSelectors.join(', '));
        blockContent(allPosts, keywordRegex);
        blockContent(allComments, keywordRegex);
      });
    }
  });

  console.log("Content script for 'Head In The Sand' loaded.");
});
