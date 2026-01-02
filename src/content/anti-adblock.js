// Anti-Adblock Bypass Script
// This script runs in the page context to prevent adblock detection
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
      
      // Neutralize adblock detection patterns
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
          console.log('[AdBlocker] Accelerated download timer from ' + delay + 'ms to 1000ms');
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
      '.download-button[disabled]',
      '.btn-download[disabled]',
      '#download[disabled]',
      '[id*="download"][disabled]',
      '[class*="download"][disabled]'
    ];
    
    buttonSelectors.forEach(selector => {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach(btn => {
        // Check if button text suggests it's a download button
        const text = btn.textContent || btn.innerText || '';
        if (/download|get file|continue/i.test(text)) {
          btn.removeAttribute('disabled');
          btn.style.pointerEvents = 'auto';
          btn.style.opacity = '1';
          console.log('[AdBlocker] Enabled download button:', text.trim());
        }
      });
    });
  }
  
  // Auto-click download buttons when timer completes
  function autoClickDownloadButton() {
    const clickableSelectors = [
      'button:not([disabled])',
      'a.download',
      '.download-button:not([disabled])',
      '.btn-download:not([disabled])',
      '#download:not([disabled])',
      '[id*="download"]:not([disabled])',
      '.btn-primary:not([disabled])'
    ];
    
    clickableSelectors.forEach(selector => {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach(btn => {
        const text = btn.textContent || btn.innerText || '';
        // Only auto-click if it's clearly a download button and visible
        if (/^(download|get file|continue to download)/i.test(text.trim())) {
          const isVisible = btn.offsetParent !== null;
          if (isVisible && !btn.dataset.autoClicked) {
            btn.dataset.autoClicked = 'true';
            console.log('[AdBlocker] Auto-clicking download button:', text.trim());
            setTimeout(() => btn.click(), 100);
          }
        }
      });
    });
  }
  
  // Remove countdown timer displays
  function removeCountdownDisplays() {
    const countdownSelectors = [
      '[id*="countdown"]',
      '[class*="countdown"]',
      '[id*="timer"]',
      '[class*="timer"]',
      '[id*="wait"]',
      '[class*="wait"]'
    ];
    
    countdownSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        const text = el.textContent || '';
        // If it shows "wait X seconds" or countdown numbers
        if (/wait.*\d+|countdown.*\d+|\d+.*second/i.test(text)) {
          el.style.display = 'none';
          console.log('[AdBlocker] Hidden countdown display');
        }
      });
    });
  }
  
  // Run checks periodically
  setInterval(() => {
    enableDownloadButtons();
    removeCountdownDisplays();
  }, 500);
  
  // Run auto-click check after potential timer completion
  setTimeout(() => {
    autoClickDownloadButton();
  }, 2000);
  
  setTimeout(() => {
    autoClickDownloadButton();
  }, 5000);
  
  // Listen for DOM changes to catch dynamically added buttons
  if (document.body) {
    const observer = new MutationObserver(() => {
      enableDownloadButtons();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  console.log('[AdBlocker] Anti-adblock bypass + Download timer bypass activated');
})();
