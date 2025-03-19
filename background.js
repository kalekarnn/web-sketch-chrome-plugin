// Listen for keyboard shortcut commands
chrome.commands.onCommand.addListener((command) => {
  console.log('Command received:', command);
  
  if (command === 'toggle-drawing') {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs && tabs[0] && tabs[0].id) {
        console.log('Sending toggleDrawingMode to tab:', tabs[0].id);
        chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleDrawingMode'}, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError);
          } else {
            console.log('Toggle drawing mode response:', response);
          }
        });
      } else {
        console.error('No active tab found');
      }
    });
  }
});

// Listen for installation
chrome.runtime.onInstalled.addListener(function(details) {
  console.log('Extension installed/updated:', details.reason);
  
  // Initialize default settings
  const defaultSettings = {
    tool: 'pencil',
    color: '#000000',
    size: 3,
    persistent: false
  };
  
  chrome.storage.local.set({
    drawingSettings: defaultSettings
  }, function() {
    console.log('Default settings initialized:', defaultSettings);
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log('Message received in background:', message, 'from:', sender);
  
  if (message.action === 'getSettings') {
    chrome.storage.local.get(['drawingSettings'], function(result) {
      const settings = result.drawingSettings || {
        tool: 'pencil',
        color: '#000000',
        size: 3,
        persistent: false
      };
      
      console.log('Sending settings to content script:', settings);
      sendResponse(settings);
    });
    return true; // Required for async sendResponse
  }
  
  return false;
}); 