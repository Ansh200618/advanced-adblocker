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
          console.log('[AdBlocker] Enabled button:', text.trim());
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
  
  // Auto-click download buttons when timer completes
  function autoClickDownloadButton() {
    const clickableSelectors = [
      'button:not([disabled])',
      'a:not([disabled])',
      'a.download',
      '.download-button:not([disabled])',
      '.btn-download:not([disabled])',
      '#download:not([disabled])',
      '[id*="download"]:not([disabled])',
      '[class*="download"]:not([disabled])',
      '.btn-primary:not([disabled])',
      '.btn:not([disabled])',
      '[href*="download"]'
    ];
    
    clickableSelectors.forEach(selector => {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach(btn => {
        const text = btn.textContent || btn.innerText || btn.value || btn.title || '';
        const href = btn.href || '';
        // Only auto-click if it's clearly a download button and visible
        if (/download|get file|continue|click here|proceed|skip|next|go to/i.test(text.trim()) || /download/i.test(href)) {
          const isVisible = btn.offsetParent !== null;
          const computedStyle = window.getComputedStyle(btn);
          const actuallyVisible = computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden' && computedStyle.opacity !== '0';
          
          if (isVisible && actuallyVisible && !btn.dataset.autoClicked) {
            btn.dataset.autoClicked = 'true';
            console.log('[AdBlocker] Auto-clicking button:', text.trim() || href);
            setTimeout(() => {
              btn.click();
            }, 100);
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
  
  // Run checks periodically (balanced approach)
  setInterval(() => {
    enableDownloadButtons();
    removeCountdownDisplays();
  }, 500); // Check every 500ms - balanced between responsiveness and performance
  
  // Run auto-click check after potential timer completion (more attempts)
  setTimeout(() => {
    autoClickDownloadButton();
  }, 1000);
  
  setTimeout(() => {
    autoClickDownloadButton();
  }, 2000);
  
  setTimeout(() => {
    autoClickDownloadButton();
  }, 3000);
  
  setTimeout(() => {
    autoClickDownloadButton();
  }, 5000);
  
  setTimeout(() => {
    autoClickDownloadButton();
  }, 10000);
  
  // Listen for DOM changes to catch dynamically added buttons
  if (document.body) {
    const observer = new MutationObserver(() => {
      enableDownloadButtons();
      // Try auto-click immediately when DOM changes
      setTimeout(autoClickDownloadButton, 500);
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true, // Watch for attribute changes too (like disabled being added)
      attributeFilter: ['disabled', 'style', 'class']
    });
  }
  
  console.log('[AdBlocker] Anti-adblock bypass + Download timer bypass activated');
})();
