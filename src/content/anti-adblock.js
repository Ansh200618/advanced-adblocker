// Anti-Adblock Bypass Script - Enhanced Stealth Mode
// This script runs in the page context to prevent adblock detection
// Uses advanced techniques to remain completely undetectable
(function() {
  'use strict';
  
  // Override common adblock detection methods
  const noop = function() {};
  const noopPromise = function() { return Promise.resolve(); };
  const noopArray = function() { return []; };
  const noopObject = function() { return {}; };
  const trueFunc = function() { return true; };
  const falseFunc = function() { return false; };
  
  // ============================================
  // ENHANCED STEALTH MODE - MAKE UNDETECTABLE
  // ============================================
  
  // Intercept and neutralize ALL known adblock detection libraries
  const adblockDetectionLibraries = [
    'FuckAdBlock', 'BlockAdBlock', 'SniffAdBlock', 'fuckAdBlock', 
    'blockAdBlock', 'adBlockDetected', 'AdBlockDetector', 'antiAdBlock',
    'adblock', 'ab', 'adb', 'adBlocker', 'adblock_detector'
  ];
  
  adblockDetectionLibraries.forEach(lib => {
    try {
      Object.defineProperty(window, lib, {
        configurable: false,
        writable: false,
        value: undefined
      });
    } catch (e) {}
  });
  
  // Override adblock detection functions with non-configurable properties
  const antiDetectionProps = {
    canRunAds: true,
    isAdBlockActive: false,
    adBlockEnabled: false,
    adBlockDetected: false,
    adblockDetected: false,
    adblocker: false,
    AdBlocker: false,
    hasAdblock: false,
    adblock: false
  };
  
  Object.keys(antiDetectionProps).forEach(prop => {
    try {
      Object.defineProperty(window, prop, {
        configurable: false,
        writable: false,
        value: antiDetectionProps[prop]
      });
    } catch (e) {}
  });
  
  // Mock Google AdSense to appear as if it's loaded
  Object.defineProperty(window, 'adsbygoogle', {
    configurable: false,
    writable: false,
    value: []
  });
  
  // Create fake ad elements to trick detection scripts
  function createFakeAdElements() {
    const fakeAds = [
      { id: 'ad-banner', class: 'ad-container' },
      { id: 'google_ads_iframe', class: 'google-ad' },
      { class: 'adsbygoogle' }
    ];
    
    fakeAds.forEach(ad => {
      const div = document.createElement('div');
      if (ad.id) div.id = ad.id;
      if (ad.class) div.className = ad.class;
      div.style.cssText = 'width:1px;height:1px;position:absolute;left:-9999px;';
      div.innerHTML = '&nbsp;';
      document.body.appendChild(div);
    });
  }
  
  // Run fake ad creation after page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFakeAdElements);
  } else {
    createFakeAdElements();
  }
  
  // Intercept fetch/XMLHttpRequest to fake ad script loading
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    // Detect if it's checking for ad script availability
    if (typeof url === 'string' && (
      url.includes('doubleclick') || 
      url.includes('googlesyndication') ||
      url.includes('google-analytics') ||
      url.includes('googleadservices')
    )) {
      // Return fake successful response
      return Promise.resolve(new Response('', {
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'Content-Type': 'text/javascript' })
      }));
    }
    return originalFetch.apply(this, args);
  };
  
  // Override XMLHttpRequest for older detection methods
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    if (typeof url === 'string' && (
      url.includes('doubleclick') || 
      url.includes('googlesyndication') ||
      url.includes('/ads/') ||
      url.includes('/ad.')
    )) {
      // Intercept and fake success
      this.addEventListener('readystatechange', function() {
        if (this.readyState === 4) {
          Object.defineProperty(this, 'status', { value: 200, writable: false });
          Object.defineProperty(this, 'responseText', { value: '', writable: false });
        }
      });
    }
    return originalXHROpen.apply(this, [method, url, ...rest]);
  };
  
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
        /adf\.ly/i,
        /bc\.vc/i,
        /linkbucks/i,
        /sh\.st/i,
        /ouo\.io/i,
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
  
  // Override setTimeout/setInterval for ad-related code AND download timers
  const originalSetTimeout = window.setTimeout;
  const originalSetInterval = window.setInterval;
  
  // Timer patterns for download/wait detection
  const timerPatterns = [
    /wait/i,
    /download/i,
    /countdown/i,
    /timer/i,
    /second/i,
    /please/i
  ];
  
  window.setTimeout = function(callback, delay, ...args) {
    // Check if callback contains ad-related code
    if (typeof callback === 'function') {
      const callbackStr = callback.toString();
      
      // Neutralize adblock detection patterns - STEALTH MODE
      const adPatterns = [
        /adblock/i,
        /ublock/i,
        /antiblock/i,
        /ad[\s_-]?block/i,
        /detector/i,
        /adblocker/i
      ];
      
      for (const pattern of adPatterns) {
        if (pattern.test(callbackStr)) {
          // Return fake timer ID but don't execute
          return originalSetTimeout.call(this, noop, delay);
        }
      }
      
      // Speed up download wait timers (reduce long delays to 1 second)
      if (delay > 1000) {
        let isTimerRelated = false;
        for (const pattern of timerPatterns) {
          if (pattern.test(callbackStr)) {
            isTimerRelated = true;
            break;
          }
        }
        
        // Check page content for wait/download context
        const bodyText = document.body ? document.body.textContent : '';
        const hasWaitText = /wait|countdown|download|please wait/i.test(bodyText);
        
        if (isTimerRelated || (hasWaitText && delay > 5000)) {
          delay = 1000; // Reduce to 1 second
        }
      }
    }
    return originalSetTimeout.apply(this, [callback, delay, ...args]);
  };
  
  window.setInterval = function(callback, delay, ...args) {
    if (typeof callback === 'function') {
      const callbackStr = callback.toString();
      const adPatterns = [
        /adblock/i,
        /ublock/i,
        /antiblock/i,
        /ad[\s_-]?block/i,
        /detector/i
      ];
      
      for (const pattern of adPatterns) {
        if (pattern.test(callbackStr)) {
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
      return;
    }
    return originalClear.apply(this, arguments);
  };
  
  // Override document.write to prevent ad blocker detection messages
  const originalDocWrite = document.write;
  document.write = function(content) {
    if (typeof content === 'string') {
      // Block ad blocker warning messages
      if (/adblock|ad[\s-]?blocker|disable.*ad|turn off.*ad/i.test(content)) {
        return;
      }
    }
    return originalDocWrite.apply(this, arguments);
  };
  
  // Intercept and neutralize iframe-based ad detection
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(this, tagName);
    if (tagName.toLowerCase() === 'iframe') {
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name, value) {
        // Detect if iframe is being used for ad detection
        if (name === 'src' && typeof value === 'string' && (
          value.includes('/ads/') || 
          value.includes('doubleclick') ||
          value.includes('googlesyndication')
        )) {
          // Prevent it from loading but don't throw error
          return;
        }
        return originalSetAttribute.apply(this, arguments);
      };
    }
    return element;
  };
  
  // Neutralize MutationObserver-based detection
  const originalObserve = MutationObserver.prototype.observe;
  MutationObserver.prototype.observe = function(target, options) {
    // Filter out observations that might detect ad blocking
    if (options && options.childList && target) {
      const originalCallback = this.callback;
      this.callback = function(mutations, observer) {
        // Filter out ad-related mutations
        const filteredMutations = mutations.filter(mutation => {
          const addedNodes = Array.from(mutation.addedNodes || []);
          const hasAdElements = addedNodes.some(node => {
            if (node.className && typeof node.className === 'string') {
              return /ad|banner|sponsor/i.test(node.className);
            }
            return false;
          });
          return !hasAdElements;
        });
        if (filteredMutations.length > 0) {
          return originalCallback.call(this, filteredMutations, observer);
        }
      };
    }
    return originalObserve.apply(this, arguments);
  };
  
  // ============================================
  // DOWNLOAD TIMER BYPASS - Additional Features
  // Skip "Please wait X seconds" countdown timers
  // ============================================
  
  // Monitor for download buttons and auto-enable them
  function enableDownloadButtons() {
    // Common selectors for download buttons
    const buttonSelectors = [
      'button[disabled]',
      'a[disabled]',
      'input[type="button"][disabled]',
      'input[type="submit"][disabled]',
      '.download-button[disabled]',
      '.btn-download[disabled]',
      '#download[disabled]',
      '[id*="download"][disabled]',
      '[class*="download"][disabled]',
      '[id*="btn"][disabled]',
      '[class*="btn"][disabled]',
      'a[style*="pointer-events"]',
      'button[style*="pointer-events"]'
    ];
    
    buttonSelectors.forEach(selector => {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach(btn => {
        // Check if button text suggests it's a download button or action button
        const text = btn.textContent || btn.innerText || btn.value || '';
        if (/download|get file|continue|click here|proceed|go to|skip|next/i.test(text)) {
          btn.removeAttribute('disabled');
          btn.disabled = false;
          btn.style.pointerEvents = 'auto';
          btn.style.opacity = '1';
          btn.style.cursor = 'pointer';
          // Remove any overlay that might be covering the button
          const parent = btn.parentElement;
          if (parent) {
            const overlays = parent.querySelectorAll('[style*="position: absolute"]');
            overlays.forEach(overlay => {
              if (overlay !== btn && overlay.style.zIndex > 0) {
                overlay.style.display = 'none';
              }
            });
          }
        }
      });
    });
    
    // Also look for any countdown/timer elements and try to force them to 0
    const timerElements = document.querySelectorAll('[id*="timer"], [class*="timer"], [id*="countdown"], [class*="countdown"], [id*="wait"], [class*="wait"]');
    timerElements.forEach(el => {
      const text = el.textContent || '';
      if (/\d+/.test(text)) {
        // Try to set the text to 0 or empty
        if (el.tagName === 'INPUT') {
          el.value = '0';
        } else {
          el.textContent = '0';
        }
      }
    });
  }
  

  
  // Remove countdown timer displays AND ad blocker warnings
  function removeCountdownDisplays() {
    const countdownSelectors = [
      '[id*="countdown"]',
      '[class*="countdown"]',
      '[id*="timer"]',
      '[class*="timer"]',
      '[id*="wait"]',
      '[class*="wait"]',
      '[id*="adblock"]',
      '[class*="adblock"]',
      '[id*="ad-block"]',
      '[class*="ad-block"]'
    ];
    
    countdownSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        const text = el.textContent || '';
        // If it shows "wait X seconds" or countdown numbers OR adblock warnings
        if (/wait.*\d+|countdown.*\d+|\d+.*second|adblock|ad blocker|disable.*ad|turn off/i.test(text)) {
          el.style.display = 'none';
          el.remove(); // Actually remove from DOM
        }
      });
    });
    
    // Also check for overlay/modal warnings
    const overlays = document.querySelectorAll('[class*="modal"], [class*="overlay"], [class*="popup"], [id*="modal"], [id*="overlay"], [id*="popup"]');
    overlays.forEach(el => {
      const text = el.textContent || '';
      if (/adblock|ad blocker|disable.*ad|turn off.*ad|please.*disable/i.test(text)) {
        el.style.display = 'none';
        el.remove();
      }
    });
  }
  
  // Run checks periodically (balanced approach)
  setInterval(() => {
    enableDownloadButtons();
    removeCountdownDisplays();
  }, 500); // Check every 500ms - balanced between responsiveness and performance
  
  // Listen for DOM changes to catch dynamically added buttons
  if (document.body) {
    const observer = new MutationObserver(() => {
      enableDownloadButtons();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true, // Watch for attribute changes too (like disabled being added)
      attributeFilter: ['disabled', 'style', 'class']
    });
  }
  
  console.log('[AdBlocker] Anti-adblock bypass + Download timer bypass activated (no auto-click)');
})();
