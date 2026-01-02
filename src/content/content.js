// Content Script - Advanced Ad Blocker
// Handles cosmetic filtering, element hiding, and element picker
// With anti-adblock bypass and website compatibility features

class CosmeticFilter {
  constructor() {
    this.pickerActive = false;
    this.highlightedElement = null;
    this.init();
    this.setupAntiAdblockBypass();
  }
  
  async init() {
    // Get cosmetic filters for this domain
    const domain = window.location.hostname;
    const response = await chrome.runtime.sendMessage({ action: 'getFilters' });
    
    if (response && response.cosmetic) {
      this.applyCosmeticFilters(response.cosmetic, domain);
    }
    
    // Listen for messages from background
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
    
    // Observe DOM changes
    this.observeDOM();
  }

  setupAntiAdblockBypass() {
    // Prevent adblock detection scripts from breaking the site
    const script = document.createElement('script');
    script.textContent = `
      (function() {
        'use strict';
        
        // Override common adblock detection methods
        const noop = function() {};
        const noopPromise = function() { return Promise.resolve(); };
        const noopArray = function() { return []; };
        const noopObject = function() { return {}; };
        const trueFunc = function() { return true; };
        const falseFunc = function() { return false; };
        
        // Common adblock detection libraries
        if (typeof FuckAdBlock !== 'undefined') {
          window.FuckAdBlock = undefined;
        }
        if (typeof BlockAdBlock !== 'undefined') {
          window.BlockAdBlock = undefined;
        }
        
        // Override adblock detection functions
        window.canRunAds = true;
        window.isAdBlockActive = false;
        window.adBlockEnabled = false;
        window.adBlockDetected = false;
        
        // Prevent popup/popunder
        const _open = window.open;
        window.open = function(url, name, features) {
          // Allow user-initiated popups only
          const isUserInitiated = event && event.isTrusted;
          if (!isUserInitiated) {
            console.log('[AdBlocker] Blocked popup:', url);
            return null;
          }
          return _open.apply(this, arguments);
        };
        
        // Prevent redirect on click
        document.addEventListener('click', function(e) {
          // Check for suspicious redirects
          const target = e.target.closest('a');
          if (target && target.href) {
            const url = new URL(target.href, window.location.href);
            const suspiciousPatterns = [
              /adf\\.ly/i,
              /bc\\.vc/i,
              /linkbucks/i,
              /sh\\.st/i,
              /ouo\\.io/i,
              /adfly/i
            ];
            
            for (const pattern of suspiciousPatterns) {
              if (pattern.test(url.hostname)) {
                e.preventDefault();
                e.stopPropagation();
                console.log('[AdBlocker] Blocked redirect:', url.href);
                return false;
              }
            }
          }
        }, true);
        
        // Prevent beforeunload popups (except legitimate ones)
        let beforeunloadCount = 0;
        window.addEventListener('beforeunload', function(e) {
          beforeunloadCount++;
          // If multiple beforeunload events, likely spam
          if (beforeunloadCount > 2) {
            e.preventDefault();
            e.returnValue = '';
            return '';
          }
        }, true);
        
        // Override setTimeout/setInterval for ad-related code
        const originalSetTimeout = window.setTimeout;
        const originalSetInterval = window.setInterval;
        
        window.setTimeout = function(callback, delay, ...args) {
          // Check if callback contains ad-related code
          if (typeof callback === 'function') {
            const callbackStr = callback.toString();
            const adPatterns = [
              /adblock/i,
              /ublock/i,
              /antiblock/i
            ];
            
            for (const pattern of adPatterns) {
              if (pattern.test(callbackStr)) {
                console.log('[AdBlocker] Neutralized adblock detection timer');
                return originalSetTimeout.call(this, noop, delay);
              }
            }
          }
          return originalSetTimeout.apply(this, arguments);
        };
        
        window.setInterval = function(callback, delay, ...args) {
          if (typeof callback === 'function') {
            const callbackStr = callback.toString();
            const adPatterns = [
              /adblock/i,
              /ublock/i,
              /antiblock/i
            ];
            
            for (const pattern of adPatterns) {
              if (pattern.test(callbackStr)) {
                console.log('[AdBlocker] Neutralized adblock detection interval');
                return originalSetInterval.call(this, noop, delay);
              }
            }
          }
          return originalSetInterval.apply(this, arguments);
        };
        
        // Prevent console.clear() spam
        const originalClear = console.clear;
        let clearCount = 0;
        console.clear = function() {
          clearCount++;
          if (clearCount > 5) {
            console.log('[AdBlocker] Prevented excessive console.clear()');
            return;
          }
          return originalClear.apply(this, arguments);
        };
        
        // Neutralize common anti-adblock patterns
        Object.defineProperty(window, 'adsbygoogle', {
          configurable: false,
          get: function() { return []; },
          set: function() {}
        });
        
        console.log('[AdBlocker] Anti-adblock bypass activated');
      })();
    `;
    
    // Inject early to prevent detection
    (document.head || document.documentElement).appendChild(script);
    script.remove();
  }
  
  applyCosmeticFilters(filters, domain) {
    // Apply global filters
    if (filters['*']) {
      filters['*'].forEach(selector => {
        this.hideElements(selector);
      });
    }
    
    // Apply domain-specific filters
    if (filters[domain]) {
      filters[domain].forEach(selector => {
        this.hideElements(selector);
      });
    }
  }
  
  hideElements(selector) {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.style.display = 'none !important';
        el.setAttribute('data-blocked', 'true');
      });
    } catch (e) {
      console.warn('Invalid selector:', selector);
    }
  }
  
  observeDOM() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            this.checkNode(node);
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  async checkNode(node) {
    // Check if node matches any blocking rules
    const domain = window.location.hostname;
    const response = await chrome.runtime.sendMessage({ action: 'getFilters' });
    
    if (response && response.cosmetic) {
      this.applyCosmeticFilters(response.cosmetic, domain);
    }
  }
  
  handleMessage(request, sender, sendResponse) {
    switch (request.action) {
      case 'startPicker':
        this.startElementPicker();
        sendResponse({ success: true });
        break;
      case 'stopPicker':
        this.stopElementPicker();
        sendResponse({ success: true });
        break;
      default:
        sendResponse({ error: 'Unknown action' });
    }
    return true;
  }
  
  startElementPicker() {
    this.pickerActive = true;
    document.body.style.cursor = 'crosshair';
    
    // Add event listeners
    document.addEventListener('mouseover', this.handleMouseOver.bind(this), true);
    document.addEventListener('click', this.handleClick.bind(this), true);
    document.addEventListener('keydown', this.handleKeyDown.bind(this), true);
    
    // Show picker UI
    this.showPickerUI();
  }
  
  stopElementPicker() {
    this.pickerActive = false;
    document.body.style.cursor = 'default';
    
    // Remove event listeners
    document.removeEventListener('mouseover', this.handleMouseOver.bind(this), true);
    document.removeEventListener('click', this.handleClick.bind(this), true);
    document.removeEventListener('keydown', this.handleKeyDown.bind(this), true);
    
    // Remove highlight
    if (this.highlightedElement) {
      this.highlightedElement.style.outline = '';
      this.highlightedElement = null;
    }
    
    // Hide picker UI
    this.hidePickerUI();
  }
  
  handleMouseOver(event) {
    if (!this.pickerActive) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    // Remove previous highlight
    if (this.highlightedElement) {
      this.highlightedElement.style.outline = '';
    }
    
    // Highlight current element
    this.highlightedElement = event.target;
    this.highlightedElement.style.outline = '2px solid #DC3545';
  }
  
  async handleClick(event) {
    if (!this.pickerActive) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const element = event.target;
    const selector = this.getSelector(element);
    const domain = window.location.hostname;
    
    // Send to background to save filter
    await chrome.runtime.sendMessage({
      action: 'blockElement',
      selector: selector,
      domain: domain
    });
    
    // Hide the element
    element.style.display = 'none';
    
    // Stop picker
    this.stopElementPicker();
  }
  
  handleKeyDown(event) {
    if (!this.pickerActive) return;
    
    if (event.key === 'Escape') {
      this.stopElementPicker();
    }
  }
  
  getSelector(element) {
    // Generate unique selector for element
    if (element.id) {
      return '#' + element.id;
    }
    
    if (element.className && typeof element.className === 'string') {
      const classes = element.className.split(' ').filter(c => c.trim());
      if (classes.length > 0) {
        return '.' + classes.join('.');
      }
    }
    
    // Use tag name and nth-child
    const parent = element.parentElement;
    if (parent) {
      const index = Array.from(parent.children).indexOf(element) + 1;
      return this.getSelector(parent) + ' > ' + element.tagName.toLowerCase() + ':nth-child(' + index + ')';
    }
    
    return element.tagName.toLowerCase();
  }
  
  showPickerUI() {
    const ui = document.createElement('div');
    ui.id = 'adblocker-picker-ui';
    ui.innerHTML = `
      <div style="position: fixed; top: 10px; right: 10px; background: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); z-index: 999999; font-family: Arial, sans-serif;">
        <div style="font-weight: bold; margin-bottom: 10px;">Element Picker Active</div>
        <div style="font-size: 12px; color: #666;">Click on an element to block it</div>
        <div style="font-size: 12px; color: #666;">Press ESC to cancel</div>
      </div>
    `;
    document.body.appendChild(ui);
  }
  
  hidePickerUI() {
    const ui = document.getElementById('adblocker-picker-ui');
    if (ui) {
      ui.remove();
    }
  }
}

// Initialize cosmetic filter
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new CosmeticFilter();
  });
} else {
  new CosmeticFilter();
}