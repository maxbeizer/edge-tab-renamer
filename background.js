// Create context menu item on the tab strip
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "renameTab",
      title: "Rename Tab",
      contexts: ["tab"]
    });
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "renameTab" || !tab) return;

  try {
    // Activate the tab so the prompt is visible
    await chrome.tabs.update(tab.id, { active: true });

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (currentTitle) => prompt("Rename tab:", currentTitle),
      args: [tab.title]
    });
    const newTitle = results?.[0]?.result;
    if (newTitle) {
      if (!tab.url) return;

      // Store original title if not already stored
      const urlKey = `original_url_${tab.url}`;
      const originalResult = await chrome.storage.local.get([`original_${tab.id}`, urlKey]);
      if (!originalResult[`original_${tab.id}`] && !originalResult[urlKey]) {
        await chrome.storage.local.set({
          [`original_${tab.id}`]: tab.title,
          [urlKey]: tab.title
        });
      }
      await chrome.storage.local.set({ [`tab_${tab.id}`]: newTitle });
      await renameTab(tab.id, newTitle);
    }
  } catch (error) {
    console.error('Context menu rename failed:', error);
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'renameTab') {
    renameTab(request.tabId, request.newTitle)
      .then(() => sendResponse({ success: true }))
      .catch((error) => {
        console.error('Error renaming tab:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async response
  }

  if (request.action === 'resetTab') {
    resetTab(request.tabId, request.originalTitle)
      .then(() => sendResponse({ success: true }))
      .catch((error) => {
        console.error('Error resetting tab:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async response
  }
});

// Rename tab by injecting script
async function renameTab(tabId, newTitle) {
  try {
    // Get the tab URL to store by URL as well
    const tab = await chrome.tabs.get(tabId);

    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (title) => {
        document.title = title;
      },
      args: [newTitle]
    });

    // Also store by URL so it persists across browser restarts
    if (tab.url) {
      await chrome.storage.local.set({ [`url_${tab.url}`]: newTitle });
    }
  } catch (error) {
    console.error('Failed to inject script:', error);
    throw error;
  }
}

// Reset tab to original title
async function resetTab(tabId, originalTitle) {
  try {
    // Get the tab URL to remove URL-based storage as well
    const tab = await chrome.tabs.get(tabId);

    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (title) => {
        document.title = title;
      },
      args: [originalTitle]
    });

    // Also remove URL-based storage
    if (tab.url) {
      await chrome.storage.local.remove([`url_${tab.url}`]);
    }
  } catch (error) {
    console.error('Failed to inject script:', error);
    throw error;
  }
}

// Clean up storage when tabs are closed
chrome.tabs.onRemoved.addListener(async (tabId) => {
  await chrome.storage.local.remove([`tab_${tabId}`, `original_${tabId}`]);
});

// Restore custom tab names when extension loads or tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only process when page is loaded
  if (changeInfo.status === 'complete') {
    // Check both by tabId and by URL
    const urlKey = `url_${tab.url}`;
    const result = await chrome.storage.local.get([`tab_${tabId}`, urlKey]);

    let customName = result[`tab_${tabId}`];

    // If no custom name for this tab ID, check if we have one stored for this URL
    if (!customName && result[urlKey]) {
      customName = result[urlKey];
      // Also store it with the current tab ID for faster access
      await chrome.storage.local.set({ [`tab_${tabId}`]: customName });
    }

    if (customName) {
      // Restore custom name
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: (title) => {
            document.title = title;
          },
          args: [customName]
        });
      } catch (error) {
        console.error('Failed to restore custom tab name:', error);
      }
    }
  }
});
