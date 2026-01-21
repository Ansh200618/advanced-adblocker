// Ad Blocker Tester Script
(function() {
    'use strict';

    // Test configuration
    const tests = {
        'google-analytics': {
            scriptUrl: 'https://www.google-analytics.com/analytics.js',
            checkElement: '.google-analytics-test',
            checkFunction: () => typeof window.ga !== 'undefined' || typeof window._gaq !== 'undefined'
        },
        'facebook-pixel': {
            scriptUrl: 'https://connect.facebook.net/en_US/fbevents.js',
            checkElement: '.facebook-pixel-test',
            checkFunction: () => typeof window.fbq !== 'undefined'
        },
        'doubleclick': {
            scriptUrl: 'https://googleads.g.doubleclick.net/pagead/id',
            checkElement: '.doubleclick-test',
            checkFunction: () => typeof window.googletag !== 'undefined'
        },
        'google-tag-manager': {
            scriptUrl: 'https://www.googletagmanager.com/gtm.js?id=GTM-XXXXXX',
            checkElement: '.gtm-test',
            checkFunction: () => typeof window.dataLayer !== 'undefined'
        },
        'hotjar': {
            scriptUrl: 'https://static.hotjar.com/c/hotjar-000000.js',
            checkElement: '.hotjar-test',
            checkFunction: () => typeof window.hj !== 'undefined'
        },
        'mixpanel': {
            scriptUrl: 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js',
            checkElement: '.mixpanel-test',
            checkFunction: () => typeof window.mixpanel !== 'undefined'
        },
        'sentry': {
            scriptUrl: 'https://browser.sentry-cdn.com/5.0.0/bundle.min.js',
            checkElement: '.sentry-test',
            checkFunction: () => typeof window.Sentry !== 'undefined'
        },
        'rollbar': {
            scriptUrl: 'https://cdnjs.cloudflare.com/ajax/libs/rollbar.js/2.0.0/rollbar.min.js',
            checkElement: '.rollbar-test',
            checkFunction: () => typeof window.Rollbar !== 'undefined'
        }
    };

    let testResults = {};
    let totalTests = 0;
    let passedTests = 0;

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('runTestBtn').addEventListener('click', startTests);
    });

    function startTests() {
        const btn = document.getElementById('runTestBtn');
        btn.disabled = true;
        btn.textContent = 'Testing...';
        btn.classList.add('testing');

        // Reset results
        testResults = {};
        totalTests = 0;
        passedTests = 0;

        // Run tests for each service
        runAnalyticsTests();
        runBannerTests();

        // Calculate results after a delay to allow async tests to complete
        setTimeout(() => {
            calculateAndDisplayResults();
            btn.disabled = false;
            btn.textContent = 'Run Test Again';
            btn.classList.remove('testing');
        }, 3000);
    }

    function runAnalyticsTests() {
        // Google Analytics Test
        testService('google-analytics', async () => {
            totalTests += 2;
            const scriptLoaded = await testScriptLoading('https://www.google-analytics.com/analytics.js');
            const blockVisible = testElementVisibility('.google-analytics-test');
            
            updateTestResult('google-analytics', 'script-loading', scriptLoaded);
            updateTestResult('google-analytics', 'block-visibility', blockVisible);
            
            if (!scriptLoaded) passedTests++;
            if (!blockVisible) passedTests++;
            
            return !scriptLoaded && !blockVisible;
        });

        // Facebook Pixel Test
        testService('facebook-pixel', async () => {
            totalTests += 2;
            const scriptLoaded = await testScriptLoading('https://connect.facebook.net/en_US/fbevents.js');
            const blockVisible = testElementVisibility('.facebook-pixel-test');
            
            updateTestResult('facebook-pixel', 'script-loading', scriptLoaded);
            updateTestResult('facebook-pixel', 'block-visibility', blockVisible);
            
            if (!scriptLoaded) passedTests++;
            if (!blockVisible) passedTests++;
            
            return !scriptLoaded && !blockVisible;
        });

        // DoubleClick Test
        testService('doubleclick', async () => {
            totalTests += 2;
            const scriptLoaded = await testScriptLoading('https://googleads.g.doubleclick.net/pagead/id');
            const blockVisible = testElementVisibility('.doubleclick-test');
            
            updateTestResult('doubleclick', 'script-loading', scriptLoaded);
            updateTestResult('doubleclick', 'block-visibility', blockVisible);
            
            if (!scriptLoaded) passedTests++;
            if (!blockVisible) passedTests++;
            
            return !scriptLoaded && !blockVisible;
        });

        // Google Tag Manager Test
        testService('google-tag-manager', async () => {
            totalTests += 2;
            const scriptLoaded = await testScriptLoading('https://www.googletagmanager.com/gtm.js?id=GTM-XXXXXX');
            const scriptExecuted = typeof window.dataLayer !== 'undefined';
            
            updateTestResult('google-tag-manager', 'script-loading', scriptLoaded);
            updateTestResult('google-tag-manager', 'script-execution', scriptExecuted);
            
            if (!scriptLoaded) passedTests++;
            if (!scriptExecuted) passedTests++;
            
            return !scriptLoaded && !scriptExecuted;
        });

        // Hotjar Test
        testService('hotjar', async () => {
            totalTests += 2;
            const scriptLoaded = await testScriptLoading('https://static.hotjar.com/c/hotjar-123456.js');
            const scriptExecuted = typeof window.hj !== 'undefined';
            
            updateTestResult('hotjar', 'script-loading', scriptLoaded);
            updateTestResult('hotjar', 'script-execution', scriptExecuted);
            
            if (!scriptLoaded) passedTests++;
            if (!scriptExecuted) passedTests++;
            
            return !scriptLoaded && !scriptExecuted;
        });

        // Mixpanel Test
        testService('mixpanel', async () => {
            totalTests += 2;
            const scriptLoaded = await testScriptLoading('https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js');
            const scriptExecuted = typeof window.mixpanel !== 'undefined';
            
            updateTestResult('mixpanel', 'script-loading', scriptLoaded);
            updateTestResult('mixpanel', 'script-execution', scriptExecuted);
            
            if (!scriptLoaded) passedTests++;
            if (!scriptExecuted) passedTests++;
            
            return !scriptLoaded && !scriptExecuted;
        });

        // Sentry Test
        testService('sentry', async () => {
            totalTests += 2;
            const scriptLoaded = await testScriptLoading('https://browser.sentry-cdn.com/5.0.0/bundle.min.js');
            const scriptExecuted = typeof window.Sentry !== 'undefined';
            
            updateTestResult('sentry', 'script-loading', scriptLoaded);
            updateTestResult('sentry', 'script-execution', scriptExecuted);
            
            if (!scriptLoaded) passedTests++;
            if (!scriptExecuted) passedTests++;
            
            return !scriptLoaded && !scriptExecuted;
        });

        // Rollbar Test
        testService('rollbar', async () => {
            totalTests += 2;
            const scriptLoaded = await testScriptLoading('https://cdnjs.cloudflare.com/ajax/libs/rollbar.js/2.0.0/rollbar.min.js');
            const scriptExecuted = typeof window.Rollbar !== 'undefined';
            
            updateTestResult('rollbar', 'script-loading', scriptLoaded);
            updateTestResult('rollbar', 'script-execution', scriptExecuted);
            
            if (!scriptLoaded) passedTests++;
            if (!scriptExecuted) passedTests++;
            
            return !scriptLoaded && !scriptExecuted;
        });
    }

    function runBannerTests() {
        // Banner Ad Tests
        testService('banner-ad-1', () => {
            totalTests += 2;
            const fileLoaded = testImageLoading('banner-ad-1');
            const blockVisible = testAdContainerVisibility('banner-ad-1');
            
            updateTestResult('banner-ad-1', 'file-loading', fileLoaded);
            updateTestResult('banner-ad-1', 'block-visibility', blockVisible);
            
            if (!fileLoaded) passedTests++;
            if (!blockVisible) passedTests++;
            
            return !fileLoaded && !blockVisible;
        });

        testService('banner-ad-2', () => {
            totalTests += 2;
            const fileLoaded = testImageLoading('banner-ad-2');
            const blockVisible = testAdContainerVisibility('banner-ad-2');
            
            updateTestResult('banner-ad-2', 'file-loading', fileLoaded);
            updateTestResult('banner-ad-2', 'block-visibility', blockVisible);
            
            if (!fileLoaded) passedTests++;
            if (!blockVisible) passedTests++;
            
            return !fileLoaded && !blockVisible;
        });
    }

    async function testScriptLoading(url) {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = url;
            
            const timeout = setTimeout(() => {
                script.remove();
                resolve(false); // Script was blocked or failed to load
            }, 2000);
            
            script.onload = () => {
                clearTimeout(timeout);
                script.remove();
                resolve(true); // Script loaded successfully
            };
            
            script.onerror = () => {
                clearTimeout(timeout);
                script.remove();
                resolve(false); // Script was blocked
            };
            
            document.head.appendChild(script);
        });
    }

    function testElementVisibility(selector) {
        const element = document.querySelector(selector);
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        
        return rect.width > 0 && 
               rect.height > 0 && 
               style.display !== 'none' && 
               style.visibility !== 'hidden' &&
               style.opacity !== '0';
    }

    function testImageLoading(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return false;
        
        // Check if any images are loaded in the container
        const images = container.getElementsByTagName('img');
        return images.length > 0 && images[0].complete;
    }

    function testAdContainerVisibility(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return false;
        
        const rect = container.getBoundingClientRect();
        const style = window.getComputedStyle(container);
        
        return rect.width > 0 && 
               rect.height > 0 && 
               style.display !== 'none' && 
               style.visibility !== 'hidden';
    }

    async function testService(serviceName, testFunction) {
        try {
            const result = await testFunction();
            testResults[serviceName] = result;
            
            const statusIndicator = document.querySelector(`[data-service="${serviceName}"] .status-indicator`);
            if (statusIndicator) {
                if (result) {
                    statusIndicator.textContent = '✅ Passed';
                    statusIndicator.setAttribute('data-status', 'passed');
                } else {
                    statusIndicator.textContent = '❌ Failed';
                    statusIndicator.setAttribute('data-status', 'failed');
                }
            }
        } catch (error) {
            console.error(`Error testing ${serviceName}:`, error);
            testResults[serviceName] = false;
        }
    }

    function updateTestResult(serviceName, testName, passed) {
        const testElement = document.querySelector(
            `[data-service="${serviceName}"] [data-test="${testName}"] .test-status`
        );
        
        if (testElement) {
            if (passed) {
                testElement.textContent = '❌ test failed';
                testElement.style.color = 'var(--danger-color)';
            } else {
                testElement.textContent = '✅ test passed';
                testElement.style.color = 'var(--success-color)';
            }
        }
    }

    function calculateAndDisplayResults() {
        // Calculate score (0-100)
        const score = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
        const servicesCount = Object.keys(testResults).length;
        
        // Update score display
        document.getElementById('totalScore').textContent = score;
        document.getElementById('servicesCount').textContent = `${servicesCount} services tested`;
        document.getElementById('checksCount').textContent = `${totalTests} checks performed`;
        
        // Update score circle color based on performance
        const scoreCircle = document.querySelector('.score-circle');
        if (score >= 80) {
            scoreCircle.style.borderColor = 'var(--success-color)';
            scoreCircle.querySelector('.score-number').style.color = 'var(--success-color)';
        } else if (score >= 50) {
            scoreCircle.style.borderColor = 'var(--warning-color)';
            scoreCircle.querySelector('.score-number').style.color = 'var(--warning-color)';
        } else {
            scoreCircle.style.borderColor = 'var(--danger-color)';
            scoreCircle.querySelector('.score-number').style.color = 'var(--danger-color)';
        }
        
        // Show results summary
        const summarySection = document.getElementById('resultsSummary');
        summarySection.style.display = 'block';
        
        document.getElementById('finalScore').textContent = score;
        document.getElementById('scoreBreakdown').textContent = 
            `${passedTests} out of ${totalTests} checks passed across ${servicesCount} services`;
        
        // Scroll to results
        summarySection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

})();
