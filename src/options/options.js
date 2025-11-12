// Options Page Controller
class OptionsController {
  constructor() {
    this.init();
  }

  async init() {
    // Set up tab navigation
    this.setupTabs();
    
    // Load settings
    await this.loadSettings();
    
    // Load stats
    await this.loadStats();
    
    // Load whitelist
    await this.loadWhitelist();
    
    // Load custom filters
    await this.loadCustomFilters();
    
    // Set up event listeners
    this.setupListeners();
  }

  setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked button and corresponding content
        button.classList.add('active');
        const tabId = button.getAttribute('data-tab') + '-tab';
        document.getElementById(tabId).classList.add('active');
      });
    });
  }

  async loadSettings() {
    try {
      const data = await chrome.storage.local.get([
        'enabled',
        'blockTrackers',
        'cosmeticFiltering',
        'showBadge'
      ]);

      document.getElementById('enable-blocking').checked = data.enabled !== false;
      document.getElementById('block-trackers').checked = data.blockTrackers !== false;
      document.getElementById('cosmetic-filtering').checked = data.cosmeticFiltering !== false;
      document.getElementById('show-badge').checked = data.showBadge !== false;
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async loadStats() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getStats' });
      if (response) {
        document.getElementById('total-ads').textContent = response.adsBlocked || 0;
        document.getElementById('total-trackers').textContent = response.trackersBlocked || 0;
        document.getElementById('total-scripts').textContent = response.scriptsBlocked || 0;
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  async loadWhitelist() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getWhitelist' });
      if (response && response.whitelist) {
        const list = document.getElementById('whitelist-list');
        const emptyState = document.getElementById('whitelist-empty');
        
        list.innerHTML = '';
        
        if (response.whitelist.length === 0) {
          emptyState.style.display = 'block';
        } else {
          emptyState.style.display = 'none';
          response.whitelist.forEach(domain => {
            this.addWhitelistItem(domain);
          });
        }
      }
    } catch (error) {
      console.error('Error loading whitelist:', error);
    }
  }

  async loadCustomFilters() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getCustomFilters' });
      if (response && response.filters) {
        const list = document.getElementById('custom-filter-list');
        const emptyState = document.getElementById('custom-filter-empty');
        
        list.innerHTML = '';
        
        if (response.filters.length === 0) {
          emptyState.style.display = 'block';
        } else {
          emptyState.style.display = 'none';
          response.filters.forEach(filter => {
            this.addCustomFilterItem(filter);
          });
        }
      }
    } catch (error) {
      console.error('Error loading custom filters:', error);
    }
  }

  setupListeners() {
    // General settings
    document.getElementById('enable-blocking').addEventListener('change', async (e) => {
      await chrome.storage.local.set({ enabled: e.target.checked });
      await chrome.runtime.sendMessage({ action: 'toggleEnabled' });
    });

    document.getElementById('block-trackers').addEventListener('change', async (e) => {
      await chrome.storage.local.set({ blockTrackers: e.target.checked });
    });

    document.getElementById('cosmetic-filtering').addEventListener('change', async (e) => {
      await chrome.storage.local.set({ cosmeticFiltering: e.target.checked });
    });

    document.getElementById('show-badge').addEventListener('change', async (e) => {
      await chrome.storage.local.set({ showBadge: e.target.checked });
    });

    // Clear stats
    document.getElementById('clear-stats').addEventListener('click', async () => {
      if (confirm('Are you sure you want to clear all statistics?')) {
        await chrome.runtime.sendMessage({ action: 'resetStats' });
        await this.loadStats();
        this.showNotification('Statistics cleared');
      }
    });

    // Add whitelist domain
    document.getElementById('add-whitelist').addEventListener('click', async () => {
      const input = document.getElementById('whitelist-input');
      const domain = input.value.trim();
      
      if (domain) {
        await chrome.runtime.sendMessage({ 
          action: 'addToWhitelist', 
          domain: domain 
        });
        this.addWhitelistItem(domain);
        input.value = '';
        document.getElementById('whitelist-empty').style.display = 'none';
        this.showNotification('Domain added to whitelist');
      }
    });

    // Add custom filter
    document.getElementById('add-custom-filter').addEventListener('click', async () => {
      const input = document.getElementById('custom-filter-input');
      const filter = input.value.trim();
      
      if (filter) {
        await chrome.runtime.sendMessage({ 
          action: 'addCustomFilter', 
          filter: filter 
        });
        this.addCustomFilterItem(filter);
        input.value = '';
        document.getElementById('custom-filter-empty').style.display = 'none';
        this.showNotification('Custom filter added');
      }
    });

    // Allow Enter key to submit
    document.getElementById('whitelist-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('add-whitelist').click();
      }
    });

    document.getElementById('custom-filter-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('add-custom-filter').click();
      }
    });
  }

  addWhitelistItem(domain) {
    const list = document.getElementById('whitelist-list');
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${domain}</span>
      <button class="remove-btn" data-domain="${domain}">Remove</button>
    `;
    
    li.querySelector('.remove-btn').addEventListener('click', async (e) => {
      const domain = e.target.getAttribute('data-domain');
      await chrome.runtime.sendMessage({ 
        action: 'removeFromWhitelist', 
        domain: domain 
      });
      li.remove();
      
      if (list.children.length === 0) {
        document.getElementById('whitelist-empty').style.display = 'block';
      }
      
      this.showNotification('Domain removed from whitelist');
    });
    
    list.appendChild(li);
  }

  addCustomFilterItem(filter) {
    const list = document.getElementById('custom-filter-list');
    const li = document.createElement('li');
    li.innerHTML = `
      <span><code>${filter}</code></span>
      <button class="remove-btn" data-filter="${filter}">Remove</button>
    `;
    
    li.querySelector('.remove-btn').addEventListener('click', async (e) => {
      const filterToRemove = e.target.getAttribute('data-filter');
      
      // Get current filters and remove the one
      const response = await chrome.runtime.sendMessage({ action: 'getCustomFilters' });
      if (response && response.filters) {
        const updatedFilters = response.filters.filter(f => f !== filterToRemove);
        await chrome.storage.local.set({ customFilters: updatedFilters });
      }
      
      li.remove();
      
      if (list.children.length === 0) {
        document.getElementById('custom-filter-empty').style.display = 'block';
      }
      
      this.showNotification('Custom filter removed');
    });
    
    list.appendChild(li);
  }

  showNotification(message) {
    // Create a toast notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: #374151;
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 1000;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Initialize options controller
document.addEventListener('DOMContentLoaded', () => {
  new OptionsController();
});
