chrome.storage.sync.get("blockedKeywords", ({ blockedKeywords }) => {
  if (!Array.isArray(blockedKeywords) || blockedKeywords.length === 0) {
    console.log("No blocked keywords found.");
    return;
  }

  // Combine keywords into a single regular expression for efficiency
  const keywordRegex = new RegExp(blockedKeywords.join('|'), 'i');
  console.log("Blocked Keywords:", blockedKeywords);
  console.log("Compiled Regex:", keywordRegex);

  // Updated selectors for Reddit and X.com
  const redditSelectors = [
    "div[data-testid='post-container']",  // Reddit post container
    "div[data-test-id='post']",            // Reddit post
    "div.Post"                             // Generic Reddit post class as a fallback
  ];
  const twitterTweetSelector = "article div[data-testid='tweetText']";  // Specific to tweet content

  /**
   * Recursively searches for and blocks content containing specified keywords.
   * Traverses shadow DOMs to access content within web components.
   * @param {Node} node - The starting node for traversal.
   */
  function traverseAndBlock(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      let textContent = node.innerText || node.textContent || '';

      // Check if the element contains any of the blocked keywords
      if (keywordRegex.test(textContent)) {
        node.classList.add('hidden-by-extension');
        console.log('Blocked element:', node);
        return; // Stop further traversal as this node is blocked
      }

      // Traverse shadow DOM if present
      if (node.shadowRoot) {
        traverseAndBlock(node.shadowRoot);
      }

      // Traverse child nodes
      node.childNodes.forEach(child => traverseAndBlock(child));
    }
  }

  // Initial traversal and blocking on Reddit and Twitter
  const initialRedditElements = document.querySelectorAll(redditSelectors.join(', '));
  const initialTwitterElements = document.querySelectorAll(twitterTweetSelector);
  initialRedditElements.forEach(element => traverseAndBlock(element));
  initialTwitterElements.forEach(element => traverseAndBlock(element));

  // Set up MutationObserver to watch for new content
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Block newly added Reddit posts or tweets
          if (node.matches(redditSelectors.join(', ')) || node.matches(twitterTweetSelector)) {
            traverseAndBlock(node);
          }

          // Also check its children
          traverseAndBlock(node);
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
  console.log('MutationObserver initialized.');

  // Listen for updates to keywords
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateKeywords') {
      chrome.storage.sync.get('blockedKeywords', ({ blockedKeywords }) => {
        if (!Array.isArray(blockedKeywords) || blockedKeywords.length === 0) {
          console.log('No blocked keywords found after update.');
          return;
        }
        keywordRegex = new RegExp(blockedKeywords.join('|'), 'i');
        console.log('Blocked Keywords updated:', blockedKeywords);
        console.log('New Compiled Regex:', keywordRegex);

        // Re-run traversal to apply new keywords
        traverseAndBlock(document.body);
      });
    }
  });

  console.log('Head In The Sand content script loaded.');
});
