// Popup UI Controller
class PopupController {
  constructor() {
    this.init();
  }

  async init() {
    // Load current stats
    await this.loadStats();
    
    // Load blocker state
    await this.loadBlockerState();
    
    // Set up event listeners
    this.setupListeners();
    
    // Update stats periodically
    setInterval(() => this.loadStats(), 2000);
  }

  async loadStats() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getStats' });
      if (response) {
        document.getElementById('ads-blocked').textContent = response.adsBlocked || 0;
        document.getElementById('trackers-blocked').textContent = response.trackersBlocked || 0;
        document.getElementById('scripts-blocked').textContent = response.scriptsBlocked || 0;
        document.getElementById('total-blocked').textContent = response.totalBlocked || 0;
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  async loadBlockerState() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getEnabled' });
      if (response) {
        const toggle = document.getElementById('toggle-blocker');
        toggle.checked = response.enabled;
        this.updateStatus(response.enabled);
      }
    } catch (error) {
      console.error('Error loading blocker state:', error);
    }
  }

  setupListeners() {
    // Toggle blocker
    document.getElementById('toggle-blocker').addEventListener('change', async (e) => {
      const enabled = e.target.checked;
      await chrome.runtime.sendMessage({ action: 'toggleEnabled' });
      this.updateStatus(enabled);
    });

    // Reset stats
    document.getElementById('reset-stats').addEventListener('click', async () => {
      if (confirm('Are you sure you want to reset all statistics?')) {
        await chrome.runtime.sendMessage({ action: 'resetStats' });
        await this.loadStats();
      }
    });

    // Whitelist current site
    document.getElementById('whitelist-btn').addEventListener('click', async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        const url = new URL(tab.url);
        const domain = url.hostname;
        
        // Check if already whitelisted
        const whitelistResponse = await chrome.runtime.sendMessage({ action: 'getWhitelist' });
        const isWhitelisted = whitelistResponse.whitelist.some(d => domain.includes(d));
        
        if (isWhitelisted) {
          // Remove from whitelist
          await chrome.runtime.sendMessage({ 
            action: 'removeFromWhitelist', 
            domain: domain 
          });
          this.showNotification('Site removed from whitelist');
          document.getElementById('whitelist-btn').querySelector('.btn-text').textContent = 'Whitelist This Site';
        } else {
          // Add to whitelist
          await chrome.runtime.sendMessage({ 
            action: 'addToWhitelist', 
            domain: domain 
          });
          this.showNotification('Site added to whitelist');
          document.getElementById('whitelist-btn').querySelector('.btn-text').textContent = 'Remove from Whitelist';
        }
      }
    });

    // Element picker
    document.getElementById('element-picker-btn').addEventListener('click', async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        await chrome.tabs.sendMessage(tab.id, { action: 'startPicker' });
        window.close();
      }
    });

    // Settings
    document.getElementById('settings-btn').addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });

    // Update whitelist button on load
    this.updateWhitelistButton();
  }

  async updateWhitelistButton() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        const url = new URL(tab.url);
        const domain = url.hostname;
        
        const whitelistResponse = await chrome.runtime.sendMessage({ action: 'getWhitelist' });
        const isWhitelisted = whitelistResponse.whitelist.some(d => domain.includes(d));
        
        const btn = document.getElementById('whitelist-btn');
        if (isWhitelisted) {
          btn.querySelector('.btn-text').textContent = 'Remove from Whitelist';
        }
      }
    } catch (error) {
      console.error('Error updating whitelist button:', error);
    }
  }

  updateStatus(enabled) {
    const statusText = document.getElementById('status-text');
    const statusDot = document.querySelector('.status-dot');
    
    if (enabled) {
      statusText.textContent = 'Protection Active';
      statusDot.classList.add('active');
    } else {
      statusText.textContent = 'Protection Disabled';
      statusDot.classList.remove('active');
    }
  }

  showNotification(message) {
    // Create a simple toast notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #374151;
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 13px;
      z-index: 1000;
      animation: slideUp 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 2000);
  }
}

// Initialize popup controller
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});
