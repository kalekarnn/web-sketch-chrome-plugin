// Drawing state
let isDrawing = false;
let isDrawingModeActive = false;
let currentX = 0;
let currentY = 0;
let drawingCanvas = null;
let ctx = null;
let drawingHistory = [];
let redoHistory = [];
let currentSettings = {
  tool: 'pencil',
  color: '#000000',
  size: 3,
  persistent: false
};
let modeIndicator = null;
let indicatorTimeout = null;

// Initialize the drawing canvas
function initializeCanvas() {
  // Create canvas if it doesn't exist
  if (!drawingCanvas) {
    drawingCanvas = document.createElement('canvas');
    drawingCanvas.id = 'webpage-drawing-canvas';
    document.body.appendChild(drawingCanvas);
    
    // Set canvas size to match window
    resizeCanvas();
    
    // Get canvas context
    ctx = drawingCanvas.getContext('2d');
    
    // Set initial canvas state
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentSettings.color;
    ctx.lineWidth = currentSettings.size;
    
    // Add mouse event listeners
    drawingCanvas.addEventListener('mousedown', startDrawing);
    document.addEventListener('mousemove', draw);
    document.addEventListener('mouseup', stopDrawing);
    document.addEventListener('mouseleave', stopDrawing);
    
    // Add touch event listeners for mobile
    drawingCanvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    
    // Create mode indicator
    modeIndicator = document.createElement('div');
    modeIndicator.className = 'drawing-mode-indicator hidden';
    modeIndicator.textContent = 'Drawing Mode: OFF';
    document.body.appendChild(modeIndicator);
    
    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
    
    console.log('Drawing canvas initialized');
    
    // Ensure drawing mode is off by default
    isDrawingModeActive = false;
    drawingCanvas.classList.remove('active');
    document.body.style.cursor = 'default';
    drawingCanvas.style.pointerEvents = 'none';
  }
}

// Handle touch events
function handleTouchStart(e) {
  if (!isDrawingModeActive) {
    console.log('Touch drawing prevented - mode inactive');
    return;
  }
  
  e.preventDefault(); // Prevent scrolling when drawing
  
  const touch = e.touches[0];
  const rect = drawingCanvas.getBoundingClientRect();
  currentX = touch.clientX - rect.left;
  currentY = touch.clientY - rect.top;
  
  isDrawing = true;
  
  // Start a new path
  ctx.beginPath();
  ctx.moveTo(currentX, currentY);
  
  // Save current state for undo
  saveCurrentState();
  
  console.log('Touch drawing started at', currentX, currentY);
}

function handleTouchMove(e) {
  e.preventDefault(); // Prevent scrolling when drawing
  if (!isDrawing || !isDrawingModeActive) return;
  
  const touch = e.touches[0];
  const rect = drawingCanvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  
  ctx.beginPath();
  
  if (currentSettings.tool === 'pencil') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = currentSettings.color;
  } else if (currentSettings.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
  }
  
  ctx.lineWidth = currentSettings.size;
  
  // Draw line from previous position to current position
  ctx.moveTo(currentX, currentY);
  ctx.lineTo(x, y);
  ctx.stroke();
  
  // Update current position
  currentX = x;
  currentY = y;
}

function handleTouchEnd(e) {
  e.preventDefault();
  if (isDrawing) {
    isDrawing = false;
    updateUndoRedoState();
  }
}

// Resize canvas to match window size
function resizeCanvas() {
  if (drawingCanvas) {
    // Save current drawing
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = drawingCanvas.width || window.innerWidth;
    tempCanvas.height = drawingCanvas.height || window.innerHeight;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (drawingCanvas.width && drawingCanvas.height) {
      tempCtx.drawImage(drawingCanvas, 0, 0);
    }
    
    // Resize canvas
    drawingCanvas.width = window.innerWidth;
    drawingCanvas.height = window.innerHeight;
    
    // Restore drawing
    ctx = drawingCanvas.getContext('2d');
    
    if (tempCanvas.width && tempCanvas.height) {
      ctx.drawImage(tempCanvas, 0, 0);
    }
    
    console.log('Canvas resized to', window.innerWidth, window.innerHeight);
  }
}

// Start drawing
function startDrawing(e) {
  if (!isDrawingModeActive) {
    console.log('Drawing prevented - mode inactive');
    return;
  }
  
  const rect = drawingCanvas.getBoundingClientRect();
  currentX = e.clientX - rect.left;
  currentY = e.clientY - rect.top;
  
  isDrawing = true;
  
  // Start a new path
  ctx.beginPath();
  ctx.moveTo(currentX, currentY);
  
  // Save current state for undo
  saveCurrentState();
  
  console.log('Drawing started at', currentX, currentY);
}

// Draw on the canvas
function draw(e) {
  if (!isDrawing || !isDrawingModeActive) {
    return;
  }
  
  const rect = drawingCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  ctx.beginPath();
  
  if (currentSettings.tool === 'pencil') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = currentSettings.color;
  } else if (currentSettings.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
  }
  
  ctx.lineWidth = currentSettings.size;
  
  // Draw line from previous position to current position
  ctx.moveTo(currentX, currentY);
  ctx.lineTo(x, y);
  ctx.stroke();
  
  // Update current position
  currentX = x;
  currentY = y;
}

// Stop drawing
function stopDrawing() {
  if (isDrawing) {
    isDrawing = false;
    updateUndoRedoState();
  }
}

// Toggle drawing mode
function toggleDrawingMode() {
  isDrawingModeActive = !isDrawingModeActive;
  
  if (drawingCanvas) {
    if (isDrawingModeActive) {
      drawingCanvas.classList.add('active');
      document.body.style.cursor = 'crosshair';
    } else {
      drawingCanvas.classList.remove('active');
      document.body.style.cursor = 'default';
      // Stop any ongoing drawing when toggling off
      isDrawing = false;
    }
    
    // Update pointer-events style directly
    drawingCanvas.style.pointerEvents = isDrawingModeActive ? 'auto' : 'none';
  }
  
  // Show mode indicator
  showModeIndicator();
  
  console.log('Drawing mode toggled:', isDrawingModeActive);
  
  // Send state update to background script
  chrome.runtime.sendMessage({
    action: 'drawingModeChanged',
    isActive: isDrawingModeActive
  });
}

// Show mode indicator with auto-hide
function showModeIndicator() {
  if (modeIndicator) {
    modeIndicator.textContent = `Drawing Mode: ${isDrawingModeActive ? 'ON' : 'OFF'}`;
    modeIndicator.classList.remove('hidden');
    
    // Clear existing timeout
    if (indicatorTimeout) {
      clearTimeout(indicatorTimeout);
    }
    
    // Hide after 2 seconds
    indicatorTimeout = setTimeout(() => {
      modeIndicator.classList.add('hidden');
    }, 2000);
  }
}

// Save current canvas state for undo
function saveCurrentState() {
  if (!ctx || !drawingCanvas) return;
  
  try {
    const imageData = ctx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
    drawingHistory.push(imageData);
    
    // Clear redo history when new drawing occurs
    redoHistory = [];
    
    // Update undo/redo state
    updateUndoRedoState();
  } catch (e) {
    console.error('Error saving canvas state:', e);
  }
}

// Undo last drawing action
function undo() {
  if (drawingHistory.length > 0 && ctx && drawingCanvas) {
    try {
      // Save current state to redo history
      const currentState = ctx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
      redoHistory.push(currentState);
      
      // Pop the last state from history
      const previousState = drawingHistory.pop();
      
      // Clear canvas
      ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
      
      // Restore previous state
      if (previousState) {
        ctx.putImageData(previousState, 0, 0);
      }
      
      // Update undo/redo state
      updateUndoRedoState();
      
      console.log('Undo performed');
    } catch (e) {
      console.error('Error during undo:', e);
    }
  }
}

// Redo last undone action
function redo() {
  if (redoHistory.length > 0 && ctx && drawingCanvas) {
    try {
      // Save current state to undo history
      const currentState = ctx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
      drawingHistory.push(currentState);
      
      // Pop the last state from redo history
      const nextState = redoHistory.pop();
      
      // Clear canvas
      ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
      
      // Restore next state
      if (nextState) {
        ctx.putImageData(nextState, 0, 0);
      }
      
      // Update undo/redo state
      updateUndoRedoState();
      
      console.log('Redo performed');
    } catch (e) {
      console.error('Error during redo:', e);
    }
  }
}

// Clear all drawings
function clearAll() {
  if (ctx && drawingCanvas) {
    try {
      // Save current state for undo
      saveCurrentState();
      
      // Clear canvas
      ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
      
      // Update undo/redo state
      updateUndoRedoState();
      
      console.log('Canvas cleared');
    } catch (e) {
      console.error('Error clearing canvas:', e);
    }
  }
}

// Save canvas as image
function saveAsImage() {
  if (drawingCanvas) {
    try {
      // Temporarily hide the drawing canvas to capture the webpage
      const originalDisplay = drawingCanvas.style.display;
      drawingCanvas.style.display = 'none';
      
      // Load html2canvas if not already loaded
      loadHtml2Canvas().then(() => {
        // Capture webpage as image
        html2canvas(document.body, {
          useCORS: true,
          allowTaint: true,
          foreignObjectRendering: true,
          logging: true,
          scale: window.devicePixelRatio,
          backgroundColor: null
        }).then(webpageCanvas => {
          // Show drawing canvas again
          drawingCanvas.style.display = originalDisplay;
          
          // Create a composite canvas
          const compositeCanvas = document.createElement('canvas');
          compositeCanvas.width = window.innerWidth;
          compositeCanvas.height = window.innerHeight;
          const compositeCtx = compositeCanvas.getContext('2d');
          
          // Draw webpage first
          compositeCtx.drawImage(webpageCanvas, 0, 0);
          
          // Draw our drawings on top
          compositeCtx.drawImage(drawingCanvas, 0, 0);
          
          // Convert to image and download
          const link = document.createElement('a');
          link.download = 'webpage-drawing.png';
          link.href = compositeCanvas.toDataURL('image/png', 1.0);
          link.click();
          
          console.log('Image saved with webpage content and drawings');
        }).catch(err => {
          console.error('Error capturing webpage:', err);
          
          // Show drawing canvas again
          drawingCanvas.style.display = originalDisplay;
          
          // Fallback: just save the drawing without the webpage
          const link = document.createElement('a');
          link.download = 'drawing.png';
          link.href = drawingCanvas.toDataURL('image/png', 1.0);
          link.click();
          
          console.log('Fallback image saved (drawing only)');
        });
      }).catch(err => {
        console.error('Error loading html2canvas:', err);
        
        // Show drawing canvas again
        drawingCanvas.style.display = originalDisplay;
        
        // Fallback: just save the drawing without the webpage
        const link = document.createElement('a');
        link.download = 'drawing.png';
        link.href = drawingCanvas.toDataURL('image/png', 1.0);
        link.click();
        
        console.log('Fallback image saved (drawing only)');
      });
    } catch (e) {
      console.error('Error saving image:', e);
    }
  }
}

// Update undo/redo buttons state
function updateUndoRedoState() {
  chrome.runtime.sendMessage({
    action: 'updateUndoRedoState',
    canUndo: drawingHistory.length > 0,
    canRedo: redoHistory.length > 0
  });
}

// Load html2canvas library for saving as image
function loadHtml2Canvas() {
  return new Promise((resolve, reject) => {
    if (window.html2canvas) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
    script.onload = () => {
      console.log('html2canvas loaded successfully');
      resolve();
    };
    script.onerror = (err) => {
      console.error('Failed to load html2canvas:', err);
      reject(err);
    };
    document.head.appendChild(script);
  });
}

// Initialize immediately and also when DOM is ready
initializeCanvas();

// Also initialize when DOM is ready to ensure it works in all scenarios
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM content loaded, initializing drawing tool');
  
  // Request settings from background script
  chrome.runtime.sendMessage({action: 'getSettings'}, function(settings) {
    if (settings) {
      currentSettings = settings;
      console.log('Received settings from background:', settings);
    } else {
      console.log('No settings received, using defaults');
    }
    
    // Initialize canvas
    initializeCanvas();
    
    // Load html2canvas for saving images
    loadHtml2Canvas().catch(err => {
      console.error('Failed to preload html2canvas:', err);
    });
    
    // Only activate drawing mode if persistent mode is enabled
    if (currentSettings.persistent) {
      toggleDrawingMode();
    }
  });
});

// Add keyboard shortcut listener
document.addEventListener('keydown', function(e) {
  // Check for Alt+D shortcut
  if (e.altKey && e.key.toLowerCase() === 'd') {
    e.preventDefault(); // Prevent default browser behavior
    toggleDrawingMode();
  }
});

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log('Message received in content script:', message);
  
  // Initialize canvas if not already done
  if (!drawingCanvas) {
    initializeCanvas();
  }
  
  switch (message.action) {
    case 'toggleDrawingMode':
      toggleDrawingMode();
      break;
    case 'updateSettings':
      currentSettings = message.settings;
      console.log('Settings updated:', currentSettings);
      break;
    case 'undo':
      undo();
      break;
    case 'redo':
      redo();
      break;
    case 'clearAll':
      clearAll();
      break;
    case 'saveAsImage':
      saveAsImage();
      break;
  }
  
  // Send response if needed
  if (sendResponse) {
    sendResponse({success: true});
  }
  
  return true; // Keep the message channel open for async responses
}); 