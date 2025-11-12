// Advanced Ad Blocker - Background Service Worker
// Core blocking engine and statistics tracking

class AdBlocker {
  constructor() {
    this.stats = {
      adsBlocked: 0,
      trackersBlocked: 0,
      scriptsBlocked: 0,
      totalBlocked: 0
    };
    this.whitelist = new Set();
    this.customFilters = [];
    this.enabled = true;
    this.init();
  }

  async init() {
    // Load saved data
    await this.loadData();
    
    // Set up listeners
    this.setupListeners();
    
    // Initialize filter lists
    await this.initializeFilters();
    
    console.log('Advanced Ad Blocker initialized');
  }

  async loadData() {
    try {
      const data = await chrome.storage.local.get(['stats', 'whitelist', 'customFilters', 'enabled']);
      if (data.stats) this.stats = data.stats;
      if (data.whitelist) this.whitelist = new Set(data.whitelist);
      if (data.customFilters) this.customFilters = data.customFilters;
      if (data.enabled !== undefined) this.enabled = data.enabled;
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  async saveData() {
    try {
      await chrome.storage.local.set({
        stats: this.stats,
        whitelist: Array.from(this.whitelist),
        customFilters: this.customFilters,
        enabled: this.enabled
      });
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  setupListeners() {
    // Listen for messages from popup/content scripts
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep channel open for async response
    });

    // Listen for navigation events
    chrome.webNavigation.onCommitted.addListener((details) => {
      if (details.frameId === 0) {
        this.updateBadge(details.tabId);
      }
    });

    // Track blocked requests using declarativeNetRequest
    if (chrome.declarativeNetRequest && chrome.declarativeNetRequest.onRuleMatchedDebug) {
      chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((details) => {
        this.incrementStats('request');
      });
    }

    // Context menu
    chrome.contextMenus.create({
      id: 'blockElement',
      title: 'Block this element',
      contexts: ['all']
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === 'blockElement') {
        chrome.tabs.sendMessage(tab.id, { action: 'startPicker' });
      }
    });
  }

  async initializeFilters() {
    // Enable declarative net request rules
    try {
      const rulesets = await chrome.declarativeNetRequest.getEnabledRulesets();
      console.log('Enabled rulesets:', rulesets);
      
      // Update dynamic rules if enabled state changed
      await this.updateDynamicRules();
    } catch (error) {
      console.error('Error initializing filters:', error);
    }
  }

  async updateDynamicRules() {
    try {
      // Get existing dynamic rules
      const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
      const existingRuleIds = existingRules.map(rule => rule.id);
      
      // Create rules for whitelisted domains
      const whitelistRules = Array.from(this.whitelist).map((domain, index) => ({
        id: 10000 + index,
        priority: 2,
        action: { type: 'allow' },
        condition: {
          urlFilter: `*://*.${domain}/*`,
          resourceTypes: ['main_frame', 'sub_frame', 'script', 'xmlhttprequest', 'image', 'media']
        }
      }));
      
      // Update dynamic rules
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingRuleIds,
        addRules: whitelistRules
      });
    } catch (error) {
      console.error('Error updating dynamic rules:', error);
    }
  }

  isWhitelisted(hostname) {
    for (const domain of this.whitelist) {
      if (hostname.includes(domain)) {
        return true;
      }
    }
    return false;
  }

  incrementStats(type) {
    this.stats.totalBlocked++;
    
    if (type === 'script') {
      this.stats.scriptsBlocked++;
    } else if (type === 'image' || type === 'media') {
      this.stats.adsBlocked++;
    } else if (type === 'xmlhttprequest' || type === 'beacon') {
      this.stats.trackersBlocked++;
    } else {
      this.stats.adsBlocked++;
    }

    this.saveData();
  }

  async handleMessage(message, sender, sendResponse) {
    switch (message.action) {
      case 'getStats':
        sendResponse(this.stats);
        break;
      
      case 'toggleEnabled':
        this.enabled = !this.enabled;
        await this.saveData();
        sendResponse({ enabled: this.enabled });
        break;
      
      case 'getEnabled':
        sendResponse({ enabled: this.enabled });
        break;
      
      case 'addToWhitelist':
        this.whitelist.add(message.domain);
        await this.saveData();
        await this.updateDynamicRules();
        sendResponse({ success: true });
        break;
      
      case 'removeFromWhitelist':
        this.whitelist.delete(message.domain);
        await this.saveData();
        await this.updateDynamicRules();
        sendResponse({ success: true });
        break;
      
      case 'getWhitelist':
        sendResponse({ whitelist: Array.from(this.whitelist) });
        break;
      
      case 'addCustomFilter':
        this.customFilters.push(message.filter);
        await this.saveData();
        sendResponse({ success: true });
        break;
      
      case 'getCustomFilters':
        sendResponse({ filters: this.customFilters });
        break;
      
      case 'resetStats':
        this.stats = {
          adsBlocked: 0,
          trackersBlocked: 0,
          scriptsBlocked: 0,
          totalBlocked: 0
        };
        await this.saveData();
        sendResponse({ success: true });
        break;
      
      default:
        sendResponse({ error: 'Unknown action' });
    }
  }

  async updateBadge(tabId) {
    try {
      await chrome.action.setBadgeText({
        tabId: tabId,
        text: this.stats.totalBlocked > 0 ? String(this.stats.totalBlocked) : ''
      });
      await chrome.action.setBadgeBackgroundColor({
        tabId: tabId,
        color: '#FF0000'
      });
    } catch (error) {
      console.error('Error updating badge:', error);
    }
  }
}

// Initialize the ad blocker
const adBlocker = new AdBlocker();
