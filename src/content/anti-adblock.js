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
