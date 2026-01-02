// Logger Page Script
let loggingEnabled = false;
let requestLog = [];
let filteredLog = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Get DOM elements
  const toggleLoggingBtn = document.getElementById('toggleLoggingBtn');
  const clearLogBtn = document.getElementById('clearLogBtn');
  const refreshBtn = document.getElementById('refreshBtn');
  const typeFilter = document.getElementById('typeFilter');
  const searchInput = document.getElementById('searchInput');
  const logTableBody = document.getElementById('logTableBody');
  const totalRequests = document.getElementById('totalRequests');
  const blockedCount = document.getElementById('blockedCount');
  const loggingStatus = document.getElementById('loggingStatus');

  // Load initial data
  await loadLogData();

  // Toggle logging
  toggleLoggingBtn.addEventListener('click', async () => {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'toggleLogging' });
      loggingEnabled = response.enabled;
      updateLoggingUI();
      
      if (loggingEnabled) {
        showNotification('Logging enabled', false);
      } else {
        showNotification('Logging disabled', false);
      }
    } catch (error) {
      console.error('Error toggling logging:', error);
      showNotification('Error toggling logging', true);
    }
  });

  // Clear log
  clearLogBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all logged requests?')) {
      try {
        await chrome.runtime.sendMessage({ action: 'clearLog' });
        await loadLogData();
        showNotification('Log cleared', false);
      } catch (error) {
        console.error('Error clearing log:', error);
        showNotification('Error clearing log', true);
      }
    }
  });

  // Refresh
  refreshBtn.addEventListener('click', async () => {
    await loadLogData();
    showNotification('Log refreshed', false);
  });

  // Type filter
  typeFilter.addEventListener('change', () => {
    filterLog();
  });

  // Search
  searchInput.addEventListener('input', () => {
    filterLog();
  });

  // Functions
  async function loadLogData() {
    try {
      // Get logging status
      const data = await chrome.storage.local.get(['loggingEnabled']);
      loggingEnabled = data.loggingEnabled || false;
      updateLoggingUI();

      // Get request log
      const response = await chrome.runtime.sendMessage({ action: 'getRequestLog' });
      requestLog = response.log || [];
      
      // Get stats
      const stats = await chrome.runtime.sendMessage({ action: 'getStats' });
      totalRequests.textContent = stats.requestsAnalyzed || 0;
      blockedCount.textContent = stats.totalBlocked || 0;

      // Update table
      filterLog();
    } catch (error) {
      console.error('Error loading log data:', error);
    }
  }

  function updateLoggingUI() {
    if (loggingEnabled) {
      toggleLoggingBtn.classList.add('active');
      toggleLoggingBtn.querySelector('span').textContent = 'Logging Enabled';
      loggingStatus.textContent = 'Enabled';
      loggingStatus.classList.remove('status-disabled');
      loggingStatus.classList.add('status-enabled');
    } else {
      toggleLoggingBtn.classList.remove('active');
      toggleLoggingBtn.querySelector('span').textContent = 'Enable Logging';
      loggingStatus.textContent = 'Disabled';
      loggingStatus.classList.remove('status-enabled');
      loggingStatus.classList.add('status-disabled');
    }
  }

  function filterLog() {
    const typeValue = typeFilter.value;
    const searchValue = searchInput.value.toLowerCase();

    filteredLog = requestLog.filter(entry => {
      // Type filter
      if (typeValue !== 'all' && entry.type !== typeValue) {
        return false;
      }

      // Search filter
      if (searchValue && !entry.url.toLowerCase().includes(searchValue)) {
        return false;
      }

      return true;
    });

    renderLog();
  }

  function renderLog() {
    logTableBody.innerHTML = '';

    if (filteredLog.length === 0) {
      return;
    }

    // Sort by timestamp (newest first)
    filteredLog.sort((a, b) => b.timestamp - a.timestamp);

    filteredLog.forEach(entry => {
      const row = document.createElement('tr');
      
      // Time
      const timeCell = document.createElement('td');
      timeCell.textContent = formatTime(entry.timestamp);
      row.appendChild(timeCell);

      // Type
      const typeCell = document.createElement('td');
      typeCell.innerHTML = `<span class="type-badge type-${entry.type}">${entry.type}</span>`;
      row.appendChild(typeCell);

      // URL
      const urlCell = document.createElement('td');
      urlCell.textContent = entry.url;
      urlCell.title = entry.url;
      row.appendChild(urlCell);

      // Rule ID
      const ruleIdCell = document.createElement('td');
      ruleIdCell.innerHTML = `<span class="rule-badge">${entry.ruleId || 'N/A'}</span>`;
      row.appendChild(ruleIdCell);

      // Ruleset
      const rulesetCell = document.createElement('td');
      rulesetCell.innerHTML = `<span class="ruleset-badge">${entry.rulesetId || 'N/A'}</span>`;
      row.appendChild(rulesetCell);

      logTableBody.appendChild(row);
    });
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
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
    }, 2000);
  }

  // Auto-refresh every 3 seconds
  setInterval(loadLogData, 3000);
});

// Animations
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
