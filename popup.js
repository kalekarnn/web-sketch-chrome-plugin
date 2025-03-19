document.addEventListener('DOMContentLoaded', function() {
  console.log('Popup DOM loaded');
  
  // Tool selection
  const pencilTool = document.getElementById('pencil-tool');
  const eraserTool = document.getElementById('eraser-tool');
  const clearAll = document.getElementById('clear-all');
  
  // Color selection
  const colorButtons = document.querySelectorAll('.color-btn');
  
  // Brush size
  const brushSize = document.getElementById('brush-size');
  const sizeDisplay = document.getElementById('size-display');
  
  // Current drawing settings
  let currentSettings = {
    tool: 'pencil',
    color: '#000000',
    size: 3
  };
  
  // Initialize with stored settings or defaults
  chrome.storage.local.get(['drawingSettings'], function(result) {
    console.log('Retrieved settings from storage:', result);
    
    if (result.drawingSettings) {
      currentSettings = result.drawingSettings;
      
      // Update UI to match stored settings
      if (currentSettings.tool === 'eraser') {
        pencilTool.classList.remove('active');
        eraserTool.classList.add('active');
      }
      
      colorButtons.forEach(btn => {
        if (btn.dataset.color === currentSettings.color) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      
      brushSize.value = currentSettings.size;
      sizeDisplay.textContent = currentSettings.size + 'px';
      
      console.log('UI updated with stored settings');
    }
    
    // Send initial settings when popup opens
    sendMessageToContent();
  });
  
  // Tool selection handlers
  pencilTool.addEventListener('click', function() {
    console.log('Pencil tool selected');
    currentSettings.tool = 'pencil';
    pencilTool.classList.add('active');
    eraserTool.classList.remove('active');
    saveSettings();
    sendMessageToContent();
  });
  
  eraserTool.addEventListener('click', function() {
    console.log('Eraser tool selected');
    currentSettings.tool = 'eraser';
    eraserTool.classList.add('active');
    pencilTool.classList.remove('active');
    saveSettings();
    sendMessageToContent();
  });
  
  clearAll.addEventListener('click', function() {
    console.log('Clear all button clicked');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs && tabs[0] && tabs[0].id) {
        console.log('Sending clearAll message to tab:', tabs[0].id);
        chrome.tabs.sendMessage(tabs[0].id, {action: 'clearAll'}, function(response) {
          if (chrome.runtime.lastError) {
            console.error('Error sending clearAll message:', chrome.runtime.lastError);
          } else {
            console.log('Clear all response:', response);
          }
        });
      } else {
        console.error('No active tab found for clearAll');
      }
    });
  });
  
  // Color selection handler
  colorButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const color = this.dataset.color;
      console.log('Color selected:', color);
      
      currentSettings.color = color;
      
      // Update active state
      colorButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      saveSettings();
      sendMessageToContent();
    });
  });
  
  // Brush size handler
  brushSize.addEventListener('input', function() {
    const size = this.value;
    console.log('Brush size changed:', size);
    
    currentSettings.size = size;
    sizeDisplay.textContent = size + 'px';
    saveSettings();
    sendMessageToContent();
  });
  
  // Save settings to storage
  function saveSettings() {
    chrome.storage.local.set({drawingSettings: currentSettings}, function() {
      console.log('Settings saved to storage:', currentSettings);
      
      if (chrome.runtime.lastError) {
        console.error('Error saving settings:', chrome.runtime.lastError);
      }
    });
  }
  
  // Send current settings to content script
  function sendMessageToContent() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs && tabs[0] && tabs[0].id) {
        console.log('Sending settings to tab:', tabs[0].id, currentSettings);
        
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateSettings',
          settings: currentSettings
        }, function(response) {
          if (chrome.runtime.lastError) {
            console.error('Error sending settings to content script:', chrome.runtime.lastError);
          } else {
            console.log('Settings update response:', response);
          }
        });
      } else {
        console.error('No active tab found for sending settings');
      }
    });
  }
});