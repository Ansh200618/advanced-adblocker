// Popup Script - Advanced Ad Blocker
document.addEventListener('DOMContentLoaded', async () => {
  // Get DOM elements
  const toggleBtn = document.getElementById('toggleBtn');
  const themeToggle = document.getElementById('themeToggle');
  const statusText = document.getElementById('statusText');
  const statusCard = document.querySelector('.status-card');
  const adsBlocked = document.getElementById('adsBlocked');
  const trackersBlocked = document.getElementById('trackersBlocked');
  const scriptsBlocked = document.getElementById('scriptsBlocked');
  const totalBlocked = document.getElementById('totalBlocked');
  const whitelistBtn = document.getElementById('whitelistBtn');
  const pickerBtn = document.getElementById('pickerBtn');
  const resetBtn = document.getElementById('resetBtn');
  const settingsBtn = document.getElementById('settingsBtn');

  // Load initial state
  await loadStats();
  await loadEnabledState();
  await loadTheme();

  // Theme toggle event
  themeToggle.addEventListener('click', async () => {
    const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.body.classList.toggle('dark-mode');
    
    try {
      await chrome.storage.local.set({ theme: newTheme });
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  });

  // Toggle button event
  toggleBtn.addEventListener('click', async () => {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'toggleEnabled' });
      updateEnabledUI(response.enabled);
    } catch (error) {
      console.error('Error toggling:', error);
    }
  });

  // Whitelist button
  whitelistBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = new URL(tab.url);
      const domain = url.hostname;
      
      await chrome.runtime.sendMessage({
        action: 'addToWhitelist',
        domain: domain
      });
      
      showNotification('Site whitelisted successfully');
    } catch (error) {
      console.error('Error whitelisting:', error);
      showNotification('Error whitelisting site', true);
    }
  });

  // Element picker button
  pickerBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.sendMessage(tab.id, { action: 'startPicker' });
      window.close();
    } catch (error) {
      console.error('Error starting picker:', error);
      showNotification('Error starting element picker', true);
    }
  });

  // Reset stats button
  resetBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset all statistics?')) {
      try {
        await chrome.runtime.sendMessage({ action: 'resetStats' });
        await loadStats();
        showNotification('Statistics reset successfully');
      } catch (error) {
        console.error('Error resetting stats:', error);
        showNotification('Error resetting statistics', true);
      }
    }
  });

  // Settings button
  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Functions
  async function loadStats() {
    try {
      const stats = await chrome.runtime.sendMessage({ action: 'getStats' });
      if (stats) {
        adsBlocked.textContent = formatNumber(stats.adsBlocked || 0);
        trackersBlocked.textContent = formatNumber(stats.trackersBlocked || 0);
        scriptsBlocked.textContent = formatNumber(stats.scriptsBlocked || 0);
        totalBlocked.textContent = formatNumber(stats.totalBlocked || 0);
        
        // Animate numbers
        animateNumbers();
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  async function loadEnabledState() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getEnabled' });
      updateEnabledUI(response.enabled);
    } catch (error) {
      console.error('Error loading enabled state:', error);
      updateEnabledUI(true); // Default to enabled
    }
  }

  async function loadTheme() {
    try {
      const result = await chrome.storage.local.get('theme');
      const theme = result.theme || 'light';
      
      if (theme === 'dark') {
        document.body.classList.add('dark-mode');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  }

  function updateEnabledUI(enabled) {
    if (enabled) {
      toggleBtn.classList.add('enabled');
      toggleBtn.classList.remove('disabled');
      statusText.textContent = 'Active';
      statusCard.classList.remove('disabled');
    } else {
      toggleBtn.classList.remove('enabled');
      toggleBtn.classList.add('disabled');
      statusText.textContent = 'Disabled';
      statusCard.classList.add('disabled');
    }
  }

  function formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  function animateNumbers() {
    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach(el => {
      el.style.animation = 'none';
      setTimeout(() => {
        el.style.animation = 'fadeIn 0.3s ease-out';
      }, 10);
    });
  }

  function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${isError ? '#ef4444' : '#10b981'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      animation: slideDown 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideUp 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  // Auto-refresh stats every 2 seconds
  setInterval(loadStats, 2000);
});

// Additional animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
  
  @keyframes slideUp {
    from {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    to {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
  }
`;
document.head.appendChild(style);
