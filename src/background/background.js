// Advanced Ad Blocker - Background Service Worker
// Core blocking engine with uBlock Origin-like features and statistics tracking

class AdBlocker {
  constructor() {
    this.stats = {
      adsBlocked: 0,
      trackersBlocked: 0,
      scriptsBlocked: 0,
      totalBlocked: 0,
      sessionsBlocked: 0,
      requestsAnalyzed: 0
    };
    this.whitelist = new Set();
    this.customFilters = [];
    this.dynamicRules = [];
    this.sessionRules = new Map();
    this.blockedDomains = new Map();
    this.enabled = true;
    this.loggingEnabled = false;
    this.requestLog = [];
    this.maxLogEntries = 1000;
    this.init();
  }

  async init() {
    // Load saved data
    await this.loadData();
    
    // Set up listeners
    this.setupListeners();
    
    // Initialize filter lists
    await this.initializeFilters();
    
    // Setup dynamic rules
    await this.setupDynamicRules();
    
    console.log('Advanced Ad Blocker initialized with enhanced features');
  }

  async loadData() {
    try {
      const data = await chrome.storage.local.get([
        'stats', 
        'whitelist', 
        'customFilters', 
        'enabled',
        'loggingEnabled',
        'dynamicRules',
        'blockedDomains'
      ]);
      
      if (data.stats) this.stats = data.stats;
      if (data.whitelist) this.whitelist = new Set(data.whitelist);
      if (data.customFilters) this.customFilters = data.customFilters;
      if (data.enabled !== undefined) this.enabled = data.enabled;
      if (data.loggingEnabled !== undefined) this.loggingEnabled = data.loggingEnabled;
      if (data.dynamicRules) this.dynamicRules = data.dynamicRules;
      if (data.blockedDomains) this.blockedDomains = new Map(data.blockedDomains);
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
        enabled: this.enabled,
        loggingEnabled: this.loggingEnabled,
        dynamicRules: this.dynamicRules,
        blockedDomains: Array.from(this.blockedDomains.entries())
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

    // Listen for completed web requests to log blocked items
    chrome.webNavigation.onCompleted.addListener((details) => {
      if (details.frameId === 0) {
        this.logPageLoad(details);
      }
    });

    // Context menu - check if it exists first to avoid duplicate error
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: 'blockElement',
        title: 'Block this element',
        contexts: ['all']
      });
      
      chrome.contextMenus.create({
        id: 'blockDomain',
        title: 'Block this domain',
        contexts: ['link', 'page']
      });
      
      chrome.contextMenus.create({
        id: 'whitelistSite',
        title: 'Whitelist this site',
        contexts: ['page']
      });
      
      chrome.contextMenus.create({
        id: 'viewLogger',
        title: 'View request logger',
        contexts: ['all']
      });
    });

    chrome.contextMenus.onClicked.addListener(async (info, tab) => {
      switch (info.menuItemId) {
        case 'blockElement':
          chrome.tabs.sendMessage(tab.id, { action: 'startPicker' });
          break;
        case 'blockDomain':
          await this.blockDomain(info.linkUrl || tab.url);
          break;
        case 'whitelistSite':
          const url = new URL(tab.url);
          await this.addToWhitelist(url.hostname);
          break;
        case 'viewLogger':
          chrome.tabs.create({ url: 'src/logger/logger.html' });
          break;
      }
    });
  }

  async initializeFilters() {
    // Enable declarative net request rules
    try {
      const rulesets = await chrome.declarativeNetRequest.getEnabledRulesets();
      console.log('Enabled rulesets:', rulesets);
      
      // Listen for rule matches to track statistics
      // Note: onRuleMatchedDebug is only available in unpacked extensions
      if (chrome.declarativeNetRequest.onRuleMatchedDebug) {
        chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((details) => {
          this.stats.requestsAnalyzed++;
          this.incrementStats(details.request.type);
          
          if (this.loggingEnabled) {
            this.logRequest(details);
          }
        });
      }
      
      // Get current dynamic rules
      const dynamicRules = await chrome.declarativeNetRequest.getDynamicRules();
      console.log('Dynamic rules loaded:', dynamicRules.length);
      
    } catch (error) {
      console.error('Error initializing filters:', error);
    }
  }

  async setupDynamicRules() {
    // Setup dynamic rules for custom filters
    try {
      // Remove old dynamic rules
      const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
      const ruleIds = existingRules.map(rule => rule.id);
      
      if (ruleIds.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: ruleIds
        });
      }
      
      // Add custom filter rules
      if (this.customFilters.length > 0) {
        const newRules = this.customFilters.map((filter, index) => ({
          id: 1000 + index,
          priority: 1,
          action: { type: 'block' },
          condition: {
            urlFilter: filter,
            resourceTypes: ['script', 'xmlhttprequest', 'image', 'media', 'stylesheet', 'font', 'other']
          }
        }));
        
        await chrome.declarativeNetRequest.updateDynamicRules({
          addRules: newRules
        });
        
        console.log('Added', newRules.length, 'dynamic rules');
      }
    } catch (error) {
      console.error('Error setting up dynamic rules:', error);
    }
  }

  async addDynamicRule(urlPattern, resourceTypes = ['script', 'xmlhttprequest', 'image', 'other']) {
    try {
      const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
      const newId = existingRules.length > 0 
        ? Math.max(...existingRules.map(r => r.id)) + 1 
        : 1000;
      
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [{
          id: newId,
          priority: 1,
          action: { type: 'block' },
          condition: {
            urlFilter: urlPattern,
            resourceTypes: resourceTypes
          }
        }]
      });
      
      this.dynamicRules.push({ id: newId, pattern: urlPattern });
      await this.saveData();
      
      return { success: true, id: newId };
    } catch (error) {
      console.error('Error adding dynamic rule:', error);
      return { success: false, error: error.message };
    }
  }

  async removeDynamicRule(ruleId) {
    try {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [ruleId]
      });
      
      this.dynamicRules = this.dynamicRules.filter(r => r.id !== ruleId);
      await this.saveData();
      
      return { success: true };
    } catch (error) {
      console.error('Error removing dynamic rule:', error);
      return { success: false, error: error.message };
    }
  }

  async blockDomain(url) {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      
      // Add to blocked domains
      this.blockedDomains.set(domain, {
        addedAt: Date.now(),
        url: url
      });
      
      // Add dynamic rule
      await this.addDynamicRule(domain);
      await this.saveData();
      
      return { success: true, domain };
    } catch (error) {
      console.error('Error blocking domain:', error);
      return { success: false, error: error.message };
    }
  }

  logRequest(details) {
    if (this.requestLog.length >= this.maxLogEntries) {
      this.requestLog.shift(); // Remove oldest entry
    }
    
    this.requestLog.push({
      timestamp: Date.now(),
      url: details.request.url,
      type: details.request.type,
      tabId: details.request.tabId,
      ruleId: details.rule.ruleId,
      rulesetId: details.rule.rulesetId
    });
  }

  logPageLoad(details) {
    // Track page load for statistics
    this.stats.requestsAnalyzed++;
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
    this.stats.requestsAnalyzed++;
    
    if (type === 'script') {
      this.stats.scriptsBlocked++;
    } else if (type === 'image' || type === 'media') {
      this.stats.adsBlocked++;
    } else if (type === 'xmlhttprequest' || type === 'ping') {
      this.stats.trackersBlocked++;
    } else {
      this.stats.adsBlocked++;
    }

    // Update badge immediately after blocking
    this.updateAllTabBadges();
    
    // Debounced save to avoid excessive writes
    if (!this.saveTimeout) {
      this.saveTimeout = setTimeout(() => {
        this.saveData();
        this.saveTimeout = null;
      }, 1000);
    }
  }

  async handleMessage(message, sender, sendResponse) {
    switch (message.action) {
      case 'getStats':
        sendResponse(this.stats);
        break;
      
      case 'toggleEnabled':
        this.enabled = !this.enabled;
        await this.saveData();
        
        // Enable/disable declarative net request rules
        const rulesets = await chrome.declarativeNetRequest.getEnabledRulesets();
        if (this.enabled) {
          await chrome.declarativeNetRequest.updateEnabledRulesets({
            enableRulesetIds: ['easylist', 'easyprivacy', 'annoyances', 'social-annoyances', 'security', 'custom']
          });
        } else {
          await chrome.declarativeNetRequest.updateEnabledRulesets({
            disableRulesetIds: ['easylist', 'easyprivacy', 'annoyances', 'social-annoyances', 'security', 'custom']
          });
        }
        
        sendResponse({ enabled: this.enabled });
        break;
      
      case 'getEnabled':
        sendResponse({ enabled: this.enabled });
        break;
      
      case 'addToWhitelist':
        this.whitelist.add(message.domain);
        await this.saveData();
        sendResponse({ success: true });
        break;
      
      case 'removeFromWhitelist':
        this.whitelist.delete(message.domain);
        await this.saveData();
        sendResponse({ success: true });
        break;
      
      case 'getWhitelist':
        sendResponse({ whitelist: Array.from(this.whitelist) });
        break;
      
      case 'addCustomFilter':
        this.customFilters.push(message.filter);
        await this.setupDynamicRules();
        await this.saveData();
        sendResponse({ success: true });
        break;
      
      case 'getCustomFilters':
        sendResponse({ filters: this.customFilters });
        break;
      
      case 'updateCustomFilters':
        this.customFilters = message.filters;
        await this.setupDynamicRules();
        await this.saveData();
        sendResponse({ success: true });
        break;
      
      case 'addDynamicRule':
        const result = await this.addDynamicRule(message.pattern, message.resourceTypes);
        sendResponse(result);
        break;
      
      case 'removeDynamicRule':
        const removeResult = await this.removeDynamicRule(message.ruleId);
        sendResponse(removeResult);
        break;
      
      case 'blockDomain':
        const blockResult = await this.blockDomain(message.url);
        sendResponse(blockResult);
        break;
      
      case 'getBlockedDomains':
        sendResponse({ domains: Array.from(this.blockedDomains.entries()) });
        break;
      
      case 'unblockDomain':
        this.blockedDomains.delete(message.domain);
        await this.saveData();
        sendResponse({ success: true });
        break;
      
      case 'toggleLogging':
        this.loggingEnabled = !this.loggingEnabled;
        await this.saveData();
        sendResponse({ enabled: this.loggingEnabled });
        break;
      
      case 'getRequestLog':
        sendResponse({ log: this.requestLog });
        break;
      
      case 'clearLog':
        this.requestLog = [];
        sendResponse({ success: true });
        break;
      
      case 'resetStats':
        this.stats = {
          adsBlocked: 0,
          trackersBlocked: 0,
          scriptsBlocked: 0,
          totalBlocked: 0,
          sessionsBlocked: 0,
          requestsAnalyzed: 0
        };
        await this.saveData();
        sendResponse({ success: true });
        break;
      
      case 'exportData':
        const exportData = {
          whitelist: Array.from(this.whitelist),
          customFilters: this.customFilters,
          blockedDomains: Array.from(this.blockedDomains.entries()),
          stats: this.stats
        };
        sendResponse({ data: exportData });
        break;
      
      case 'importData':
        if (message.data.whitelist) {
          this.whitelist = new Set(message.data.whitelist);
        }
        if (message.data.customFilters) {
          this.customFilters = message.data.customFilters;
          await this.setupDynamicRules();
        }
        if (message.data.blockedDomains) {
          this.blockedDomains = new Map(message.data.blockedDomains);
        }
        await this.saveData();
        sendResponse({ success: true });
        break;
      
      default:
        sendResponse({ error: 'Unknown action' });
    }
  }

  async updateBadge(tabId) {
    try {
      const text = this.stats.totalBlocked > 0 
        ? (this.stats.totalBlocked > 999999
          ? Math.floor(this.stats.totalBlocked / 1000000) + 'M'
          : this.stats.totalBlocked > 999 
          ? Math.floor(this.stats.totalBlocked / 1000) + 'K' 
          : String(this.stats.totalBlocked))
        : '0';
        
      await chrome.action.setBadgeText({
        tabId: tabId,
        text: text
      });
      
      // Color based on state: green when enabled, gray when disabled
      await chrome.action.setBadgeBackgroundColor({
        tabId: tabId,
        color: this.enabled ? '#10b981' : '#6b7280'
      });
      
      // Optional: Add tooltip
      await chrome.action.setTitle({
        tabId: tabId,
        title: `Advanced Ad Blocker\n${this.stats.totalBlocked.toLocaleString()} ads blocked\n${this.stats.adsBlocked.toLocaleString()} ads | ${this.stats.trackersBlocked.toLocaleString()} trackers | ${this.stats.scriptsBlocked.toLocaleString()} scripts`
      });
    } catch (error) {
      console.error('Error updating badge:', error);
    }
  }

  async updateAllTabBadges() {
    try {
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        await this.updateBadge(tab.id);
      }
    } catch (error) {
      console.error('Error updating all badges:', error);
    }
  }

  async addToWhitelist(domain) {
    this.whitelist.add(domain);
    await this.saveData();
    
    // Update declarative rules to allow this domain
    // Note: We'd need to use session rules or modify existing rules
    console.log('Whitelisted domain:', domain);
  }
}

// Initialize the ad blocker
const adBlocker = new AdBlocker();
