// Options Page Script
document.addEventListener('DOMContentLoaded', async () => {
  // Get DOM elements first
  const enableToggle = document.getElementById('enableToggle');
  const darkModeToggle = document.getElementById('darkModeToggle');
  
  // Load theme function
  async function loadTheme() {
    try {
      const result = await chrome.storage.local.get('theme');
      const theme = result.theme || 'light';
      
      if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        if (darkModeToggle) darkModeToggle.checked = true;
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  }
  
  // Load theme
  await loadTheme();
  
  // Tab navigation
  const navItems = document.querySelectorAll('.nav-item');
  const tabContents = document.querySelectorAll('.tab-content');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.dataset.tab;
      
      // Update nav items
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      // Update tab contents
      tabContents.forEach(tab => tab.classList.remove('active'));
      document.getElementById(`${tabId}-tab`).classList.add('active');
    });
  });
  
  // Dark mode toggle
  if (darkModeToggle) {
    darkModeToggle.addEventListener('change', async () => {
      const isDark = darkModeToggle.checked;
      document.body.classList.toggle('dark-mode', isDark);
      
      try {
        await chrome.storage.local.set({ theme: isDark ? 'dark' : 'light' });
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    });
  }
  
  enableToggle.addEventListener('change', async () => {
    try {
      await chrome.runtime.sendMessage({ action: 'toggleEnabled' });
    } catch (error) {
      console.error('Error toggling:', error);
    }
  });

  // Load enabled state
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getEnabled' });
    enableToggle.checked = response.enabled;
  } catch (error) {
    console.error('Error loading enabled state:', error);
  }

  // Whitelist Management
  const whitelistInput = document.getElementById('whitelistInput');
  const addWhitelistBtn = document.getElementById('addWhitelistBtn');
  const whitelistList = document.getElementById('whitelistList');

  addWhitelistBtn.addEventListener('click', async () => {
    const domain = whitelistInput.value.trim();
    if (domain) {
      try {
        await chrome.runtime.sendMessage({
          action: 'addToWhitelist',
          domain: domain
        });
        whitelistInput.value = '';
        await loadWhitelist();
        showNotification('Site added to whitelist', false);
      } catch (error) {
        console.error('Error adding to whitelist:', error);
        showNotification('Error adding site', true);
      }
    }
  });

  whitelistInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addWhitelistBtn.click();
    }
  });

  async function loadWhitelist() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getWhitelist' });
      whitelistList.innerHTML = '';
      
      if (response.whitelist && response.whitelist.length > 0) {
        response.whitelist.forEach(domain => {
          const li = document.createElement('li');
          li.innerHTML = `
            <span>${domain}</span>
            <button onclick="removeFromWhitelist('${domain}')">Remove</button>
          `;
          whitelistList.appendChild(li);
        });
      }
    } catch (error) {
      console.error('Error loading whitelist:', error);
    }
  }

  window.removeFromWhitelist = async (domain) => {
    try {
      await chrome.runtime.sendMessage({
        action: 'removeFromWhitelist',
        domain: domain
      });
      await loadWhitelist();
      showNotification('Site removed from whitelist', false);
    } catch (error) {
      console.error('Error removing from whitelist:', error);
      showNotification('Error removing site', true);
    }
  };

  // Custom Filters Management
  const customFilterInput = document.getElementById('customFilterInput');
  const addFilterBtn = document.getElementById('addFilterBtn');
  const customFilterList = document.getElementById('customFilterList');

  addFilterBtn.addEventListener('click', async () => {
    const filter = customFilterInput.value.trim();
    if (filter) {
      try {
        await chrome.runtime.sendMessage({
          action: 'addCustomFilter',
          filter: filter
        });
        customFilterInput.value = '';
        await loadCustomFilters();
        showNotification('Filter added successfully', false);
      } catch (error) {
        console.error('Error adding filter:', error);
        showNotification('Error adding filter', true);
      }
    }
  });

  customFilterInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addFilterBtn.click();
    }
  });

  async function loadCustomFilters() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getCustomFilters' });
      customFilterList.innerHTML = '';
      
      if (response.filters && response.filters.length > 0) {
        response.filters.forEach((filter, index) => {
          const li = document.createElement('li');
          li.innerHTML = `
            <span>${filter}</span>
            <button onclick="removeCustomFilter(${index})">Remove</button>
          `;
          customFilterList.appendChild(li);
        });
      }
    } catch (error) {
      console.error('Error loading custom filters:', error);
    }
  }

  window.removeCustomFilter = async (index) => {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getCustomFilters' });
      if (response.filters) {
        response.filters.splice(index, 1);
        // Update the filters (this would need a new action in background.js)
        await chrome.runtime.sendMessage({
          action: 'updateCustomFilters',
          filters: response.filters
        });
        await loadCustomFilters();
        showNotification('Filter removed successfully', false);
      }
    } catch (error) {
      console.error('Error removing filter:', error);
      showNotification('Error removing filter', true);
    }
  };

  // Statistics
  const totalBlockedStat = document.getElementById('totalBlockedStat');
  const adsBlockedStat = document.getElementById('adsBlockedStat');
  const trackersBlockedStat = document.getElementById('trackersBlockedStat');
  const scriptsBlockedStat = document.getElementById('scriptsBlockedStat');
  const resetStatsBtn = document.getElementById('resetStatsBtn');

  async function loadStats() {
    try {
      const stats = await chrome.runtime.sendMessage({ action: 'getStats' });
      if (stats) {
        totalBlockedStat.textContent = formatNumber(stats.totalBlocked || 0);
        adsBlockedStat.textContent = formatNumber(stats.adsBlocked || 0);
        trackersBlockedStat.textContent = formatNumber(stats.trackersBlocked || 0);
        scriptsBlockedStat.textContent = formatNumber(stats.scriptsBlocked || 0);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  resetStatsBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset all statistics? This action cannot be undone.')) {
      try {
        await chrome.runtime.sendMessage({ action: 'resetStats' });
        await loadStats();
        showNotification('Statistics reset successfully', false);
      } catch (error) {
        console.error('Error resetting stats:', error);
        showNotification('Error resetting statistics', true);
      }
    }
  });

  function formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${isError ? '#ef4444' : '#10b981'};
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Initial load
  await loadWhitelist();
  await loadCustomFilters();
  await loadStats();

  // Auto-refresh stats every 5 seconds
  setInterval(loadStats, 5000);
});

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100px);
    }
  }
`;
document.head.appendChild(style);
