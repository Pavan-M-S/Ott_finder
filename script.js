// ================================================================
//  COMPLETE BROWSER + OS + DEVICE DETECTION
// ================================================================
function getCompleteBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = { name: 'Unknown', version: 'Unknown', engine: 'Unknown' };

    if (ua.indexOf('Edg/') > -1) { browser.name = 'Microsoft Edge'; browser.version = ua.match(/Edg\/([\d.]+)/)?.[1] || 'Unknown'; browser.engine = 'Chromium'; }
    else if (ua.indexOf('Edge/') > -1) { browser.name = 'Microsoft Edge (Legacy)'; browser.version = ua.match(/Edge\/([\d.]+)/)?.[1] || 'Unknown'; browser.engine = 'EdgeHTML'; }
    else if (ua.indexOf('OPR/') > -1 || ua.indexOf('Opera/') > -1) { browser.name = ua.indexOf('GX') > -1 ? 'Opera GX' : 'Opera'; browser.version = ua.match(/(?:OPR|Opera)\/([\d.]+)/)?.[1] || 'Unknown'; browser.engine = 'Chromium'; }
    else if (ua.indexOf('Brave/') > -1) { browser.name = 'Brave'; browser.version = ua.match(/Brave\/([\d.]+)/)?.[1] || 'Unknown'; browser.engine = 'Chromium'; }
    else if (ua.indexOf('Vivaldi/') > -1) { browser.name = 'Vivaldi'; browser.version = ua.match(/Vivaldi\/([\d.]+)/)?.[1] || 'Unknown'; browser.engine = 'Chromium'; }
    else if (ua.indexOf('Firefox/') > -1 && ua.indexOf('Seamonkey') === -1) { browser.name = 'Firefox'; browser.version = ua.match(/Firefox\/([\d.]+)/)?.[1] || 'Unknown'; browser.engine = 'Firefox'; }
    else if (ua.indexOf('Safari/') > -1 && ua.indexOf('Chrome') === -1) { browser.name = 'Safari'; browser.version = ua.match(/Safari\/([\d.]+)/)?.[1] || 'Unknown'; browser.engine = 'WebKit'; }
    else if (ua.indexOf('Chrome/') > -1) { browser.name = 'Google Chrome'; browser.version = ua.match(/Chrome\/([\d.]+)/)?.[1] || 'Unknown'; browser.engine = 'Chromium'; }

    let os = { name: 'Unknown', version: 'Unknown', versionName: '' };
    if (ua.indexOf('Windows NT 10.0') > -1) { os.name = 'Windows'; os.version = '10.0'; const build = ua.match(/Windows NT 10.0; Win64; x64; ([\d.]+)/)?.[1] || '22000'; os.versionName = parseInt(build) >= 22000 ? '11' : '10'; }
    else if (ua.indexOf('Mac OS X') > -1) { os.name = 'macOS'; const vMatch = ua.match(/Mac OS X ([\d_]+)/); if (vMatch) { os.version = vMatch[1].replace(/_/g, '.'); os.versionName = `macOS`; } }
    else if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) { os.name = ua.indexOf('iPad') > -1 ? 'iPadOS' : 'iOS'; const vMatch = ua.match(/OS ([\d_]+)/); if (vMatch) os.version = vMatch[1].replace(/_/g, '.'); }
    else if (ua.indexOf('Android') > -1) { os.name = 'Android'; const vMatch = ua.match(/Android ([\d.]+)/); if (vMatch) os.version = vMatch[1]; }
    else if (ua.indexOf('Linux') > -1 && ua.indexOf('Android') === -1) { os.name = 'Linux'; }

    let device = { type: 'Unknown', name: 'Unknown', manufacturer: 'Unknown', model: 'Unknown' };
    if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) { device.type = /Tablet|iPad/i.test(ua) ? 'Tablet' : 'Mobile'; } else { device.type = 'Desktop'; }

    return {
        browser: browser.name, browserVersion: browser.version, browserEngine: browser.engine,
        os: os.name, osVersion: os.version, osVersionName: os.versionName,
        deviceType: device.type, deviceName: device.name, deviceManufacturer: device.manufacturer, deviceModel: device.model,
        summary: `${browser.name} v${browser.version} | ${os.name} | ${device.type}`
    };
}

(function () {
    'use strict';

    // Global Caches
    window.cloudLinksCache = { specific: [], unspecific: [] };
    window.firebaseSettingsCache = null;
    let adminOverrides = null;

    // DOM Elements
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const resultsSection = document.getElementById('resultsSection');
    const cornerSyncBadge = document.getElementById('cornerSyncBadge');

    const resultsGrid = document.getElementById('resultsGrid');
    const staticResultsGrid = document.getElementById('staticResultsGrid');
    const allLinksGrid = document.getElementById('allLinksGrid');

    const resultsHeader = document.getElementById('resultsHeader');
    const staticDivider = document.getElementById('staticDivider');
    const specificSettingsBar = document.getElementById('specificSettingsBar');
    const unspecificSettingsBar = document.getElementById('unspecificSettingsBar');
    const staticAddLinkWrapper = document.getElementById('staticAddLinkWrapper');
    const resultCount = document.getElementById('resultCount');
    const themeToggle = document.getElementById('themeToggle');
    const thumbIcon = document.getElementById('thumbIcon');

    // ===== NETWORK STATUS =====
    const networkUI = document.getElementById('networkStatusUI');
    const networkText = document.getElementById('networkStatusText');
    function updateNetworkStatus() {
        if (navigator.onLine) {
            networkUI.classList.remove('offline'); networkText.textContent = 'CONNECTED';
            console.log("🌐 System Network: ONLINE");
        } else {
            networkUI.classList.add('offline'); networkText.textContent = 'DISCONNECTED';
            console.log("⚠️ System Network: OFFLINE");
        }
    }
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus();

    // ===== INACTIVITY AUTO-LOGOUT (30s) =====
    let inactivityTimer;
    const INACTIVITY_LIMIT = 30000;
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        if (document.body.classList.contains('is-admin')) {
            inactivityTimer = setTimeout(() => {
                window.logoutAdmin();
                console.log("⏱️ Auto-logged out due to 30s inactivity.");
            }, INACTIVITY_LIMIT);
        }
    }
    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(evt => {
        document.addEventListener(evt, resetInactivityTimer, { passive: true });
    });

    // ===== RENDERING LOGIC =====
    function encodePlus(str) { return str.trim().replace(/\s+/g, '+'); }
    function getQuery() { return searchInput.value.trim(); }

    function getViewSettings() {
        if (document.body.classList.contains('is-admin') && adminOverrides) { return adminOverrides; }
        return window.firebaseSettingsCache || (typeof AppSettings !== 'undefined' ? AppSettings : {
            specificUrls: { embed: true, showLinks: false, showNames: true },
            unspecificUrls: { embed: false, showLinks: true, showNames: true }
        });
    }

    function buildResults(query) {
        let dynamicLinks = []; let staticLinks = []; let combinedAll = [];
        const plusQuery = query ? encodePlus(query) : '';
        const dummyQuery = query ? encodePlus(query) : 'search_term';

        if (query) {
            dynamicLinks = window.cloudLinksCache.specific.map(site => {
                let urlTemp = site.urlTemplate || site.url || "";
                let finalUrl = urlTemp.replace('{q}', plusQuery);
                return { name: site.name, icon: site.icon, baseUrl: site.baseUrl, url: finalUrl };
            });
        }

        staticLinks = window.cloudLinksCache.unspecific.map(site => ({
            name: site.name, icon: site.icon, baseUrl: site.baseUrl, url: site.urlTemplate || site.url
        }));

        combinedAll = [
            ...window.cloudLinksCache.specific.map(site => ({ name: `${site.name} (Search)`, icon: site.icon, url: (site.urlTemplate || site.url || "").replace('{q}', dummyQuery) })),
            ...window.cloudLinksCache.unspecific.map(site => ({ name: `${site.name} (Direct)`, icon: site.icon, url: site.urlTemplate || site.url }))
        ];

        return { dynamic: dynamicLinks, static: staticLinks, combinedAll: combinedAll };
    }

    window.toggleEmbed = function (btnElement, embedUrl) {
        const card = btnElement.closest('.result-card');
        const wrapper = card.querySelector('.embed-wrapper');
        const iframe = card.querySelector('iframe');
        const isOpen = card.classList.contains('expanded');

        document.querySelectorAll('.result-card.expanded').forEach(otherCard => {
            if (otherCard !== card) {
                otherCard.classList.remove('expanded');
                otherCard.querySelector('.embed-wrapper').classList.remove('open');
                otherCard.querySelector('iframe').src = '';
                const otherBtn = otherCard.querySelector('.open-btn');
                otherBtn.innerHTML = '<i class="fas fa-external-link-alt"></i> Open';
                otherBtn.classList.remove('close-mode');
            }
        });

        if (isOpen) {
            card.classList.remove('expanded'); wrapper.classList.remove('open');
            btnElement.classList.remove('close-mode'); btnElement.innerHTML = '<i class="fas fa-external-link-alt"></i> Open';
            setTimeout(() => { iframe.src = ''; }, 500);
        } else {
            card.classList.add('expanded'); wrapper.classList.add('open');
            iframe.src = embedUrl; btnElement.classList.add('close-mode');
            btnElement.innerHTML = '<i class="fas fa-times"></i> Close Frame';
            setTimeout(() => { card.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 350);
        }
    };

    function generateCardHTML(item, index, container, sectionSettings) {
        const card = document.createElement('div');
        card.className = 'result-card'; card.style.animationDelay = `${index * 40}ms`;

        const displayUrl = item.baseUrl || item.url;
        const nameHtml = sectionSettings.showNames ? `<span>${item.name}</span>` : ``;
        const urlHtml = sectionSettings.showLinks ? `<div class="site-url" title="${item.url}">${displayUrl}</div>` : ``;

        let actionHtml = ''; let embedContainer = '';
        if (sectionSettings.embed) {
            actionHtml = `<button class="open-btn" onclick="toggleEmbed(this, '${item.url}')"><i class="fas fa-external-link-alt"></i> Open</button>`;
            embedContainer = `<div class="embed-wrapper"><div class="iframe-container"><div class="resizable-frame"><iframe loading="lazy" sandbox="allow-same-origin allow-scripts allow-forms"></iframe><div class="resize-indicator"><i class="fas fa-compress-alt" style="transform: rotate(90deg);"></i></div></div></div></div>`;
        } else {
            actionHtml = `<a href="${item.url}" target="_blank" rel="noopener noreferrer" class="open-link"><i class="fas fa-external-link-alt"></i> Open in Tab</a>`;
        }

        card.innerHTML = `<div class="card-top-row"><div class="site-info"><div class="site-header"><i class="${item.icon || 'fa-solid fa-film'}"></i>${nameHtml}</div>${urlHtml}</div><div class="card-actions">${actionHtml}</div></div>${embedContainer}`;
        container.appendChild(card);
    }

    function render(query) {
        const results = buildResults(query);
        resultsGrid.innerHTML = ''; staticResultsGrid.innerHTML = ''; allLinksGrid.innerHTML = '';

        const currentSettings = getViewSettings();

        if (document.body.classList.contains('is-admin')) {
            results.combinedAll.forEach((item, index) => generateCardHTML(item, index, allLinksGrid, { embed: false, showNames: true, showLinks: true }));
        }

        if (results.dynamic.length === 0 && results.static.length === 0) {
            resultsHeader.style.display = 'none'; specificSettingsBar.style.display = 'none';
            staticDivider.style.display = 'none'; unspecificSettingsBar.style.display = 'none'; staticAddLinkWrapper.style.display = 'none';
            return;
        }

        if (results.dynamic.length > 0) {
            resultsHeader.style.display = 'flex'; specificSettingsBar.style.display = '';
            resultCount.textContent = `(${results.dynamic.length} sources)`;
            results.dynamic.forEach((item, index) => generateCardHTML(item, index, resultsGrid, currentSettings.specificUrls));
        } else { specificSettingsBar.style.display = 'none'; }

        if (results.static.length > 0) {
            staticDivider.style.display = 'flex'; unspecificSettingsBar.style.display = ''; staticAddLinkWrapper.style.display = 'flex';
            results.static.forEach((item, index) => generateCardHTML(item, index, staticResultsGrid, currentSettings.unspecificUrls));
        } else { unspecificSettingsBar.style.display = 'none'; }
    }

    function performSearch() {
        const query = getQuery();
        if (!query) {
            searchInput.style.borderColor = 'var(--accent)'; searchInput.style.transform = 'translateX(5px)';
            setTimeout(() => searchInput.style.transform = 'translateX(-5px)', 100); setTimeout(() => searchInput.style.transform = 'translateX(5px)', 200);
            setTimeout(() => { searchInput.style.transform = 'translateX(0)'; searchInput.style.borderColor = ''; }, 300); searchInput.focus(); return;
        }
        searchBtn.style.transform = 'scale(0.9)'; setTimeout(() => searchBtn.style.transform = '', 150);
        render(query);
    }

    // ===== ADMIN SETTINGS UI =====
    function updateTogglesUI() {
        if (!window.firebaseSettingsCache) return;
        document.querySelectorAll('.setting-toggle').forEach(btn => {
            const section = btn.getAttribute('data-section');
            const setting = btn.getAttribute('data-setting');
            if (window.firebaseSettingsCache[section] && window.firebaseSettingsCache[section][setting]) {
                btn.classList.add('active');
            } else { btn.classList.remove('active'); }
        });
    }

    document.querySelectorAll('.setting-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!window.firebaseSettingsCache) return;

            const section = btn.getAttribute('data-section');
            const setting = btn.getAttribute('data-setting');

            console.log(`🔧 Admin updated global setting: ${section} > ${setting}`);
            window.firebaseSettingsCache[section][setting] = !window.firebaseSettingsCache[section][setting];

            if (adminOverrides && adminOverrides[section]) {
                adminOverrides[section][setting] = window.firebaseSettingsCache[section][setting];
            }

            if (typeof window.updateFirebaseSettings === 'function') {
                window.updateFirebaseSettings(window.firebaseSettingsCache);
            }

            updateTogglesUI();
            render(getQuery());
        });
    });

    // ===== TRACKER ENGINE =====
    async function trackAdminLogin() {
        try {
            console.log("⏳ Fetching system data for tracker...");
            const bInfo = getCompleteBrowserInfo();
            let ipData = {};

            try {
                const res = await fetch('https://ipinfo.io/json?token=fd9d2987ec82ec');
                ipData = await res.json();
            } catch (e) {
                console.warn("⚠️ IPInfo failed, attempting IP-API fallback...");
                try {
                    const res = await fetch('http://ip-api.com/json/');
                    ipData = await res.json();
                } catch (err) { console.error("❌ All IP fetchers failed."); }
            }

            const now = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            // Formats exact timestamp required: 02-52-21-30-07-2026
            const formattedTimestamp = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}-${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;

            const payload = {
                browser: bInfo.browser,
                browserEngine: bInfo.browserEngine,
                browserVersion: bInfo.browserVersion,
                city: ipData.city || "Unknown",
                colorDepth: window.screen.colorDepth || 24,
                country: ipData.country || ipData.countryCode || "Unknown",
                countryCode: ipData.country || ipData.countryCode || "Unknown",
                deviceManufacturer: bInfo.deviceManufacturer,
                deviceModel: bInfo.deviceModel,
                deviceName: bInfo.deviceName,
                deviceType: bInfo.deviceType,
                formattedTimestamp: formattedTimestamp,
                language: navigator.language || "en-US",
                latitude: (ipData.loc || "").split(',')[0] || ipData.lat || "Unknown",
                longitude: (ipData.loc || "").split(',')[1] || ipData.lon || "Unknown",
                os: bInfo.os,
                osVersion: bInfo.osVersion,
                osVersionName: bInfo.osVersionName,
                pageTitle: document.title,
                pageUrl: window.location.href,
                postal: ipData.postal || ipData.zip || "Unknown",
                referrer: document.referrer || "Direct",
                region: ipData.region || ipData.regionName || "Unknown",
                screenSize: `${screen.width}x${screen.height}`,
                summary: bInfo.summary,
                timestamp: Date.now(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                viewportSize: `${window.innerWidth}x${window.innerHeight}`,
                visitTime: now.toLocaleString()
            };

            if (typeof window.logAdminLoginToFirebase === 'function') {
                await window.logAdminLoginToFirebase(payload, formattedTimestamp);
            }
        } catch (e) { console.error("❌ Tracking execution error:", e); }
    }

    // ===== AUTH UI =====
    window.openLoginModal = () => { document.getElementById('loginModal').classList.add('active'); document.getElementById('adminPassword').focus(); };
    window.closeModal = (id) => { document.getElementById(id).classList.remove('active'); if (id === 'loginModal') document.getElementById('loginError').style.display = 'none'; };

    window.verifyLogin = async () => {
        const pass = document.getElementById('adminPassword').value;
        if (pass === AppAuth.password) {
            console.log("🔓 Login Successful.");
            document.body.classList.add('is-admin');
            closeModal('loginModal');
            document.getElementById('adminPassword').value = '';

            // Condense cards by default when logged in
            adminOverrides = {
                specificUrls: { embed: false, showLinks: false, showNames: false },
                unspecificUrls: { embed: false, showLinks: false, showNames: false }
            };

            trackAdminLogin();
            updateTogglesUI();
            render(getQuery());
            resetInactivityTimer();
        } else {
            console.warn("🚫 Invalid login attempt.");
            document.getElementById('loginError').style.display = 'block';
        }
    };

    window.logoutAdmin = () => {
        console.log("🔒 Logging out admin.");
        document.body.classList.remove('is-admin');
        clearTimeout(inactivityTimer);
        adminOverrides = null;
        updateTogglesUI();
        render(getQuery());
    };

    window.openAddLinkModal = (type) => {
        document.getElementById('newLinkType').value = type; document.getElementById('newLinkName').value = '';
        document.getElementById('newLinkIcon').value = 'fa-solid fa-film'; document.getElementById('newLinkBase').value = '';
        document.getElementById('newLinkUrl').value = '';
        document.getElementById('addLinkHint').innerHTML = type === 'specific'
            ? "Put <strong>{q}</strong> where the movie name should go in the URL.<br>Example: <i>https://thesolarmovie.co/?s={q}</i>"
            : "Enter the direct website URL.<br>Example: <i>https://www.netflix.com/</i>";
        document.getElementById('addLinkModal').classList.add('active');
    };

    window.saveNewLink = async () => {
        const type = document.getElementById('newLinkType').value; const name = document.getElementById('newLinkName').value.trim();
        const icon = document.getElementById('newLinkIcon').value.trim() || 'fa-solid fa-film'; const base = document.getElementById('newLinkBase').value.trim();
        const url = document.getElementById('newLinkUrl').value.trim();

        if (!name || !url) { alert("Name and Search URL are required!"); return; }
        const saveBtn = document.getElementById('saveLinkBtn'); saveBtn.innerText = "Saving to Firebase...";

        if (typeof window.saveToFirebase === 'function') {
            await window.saveToFirebase(type, name, icon, url, base);
            window.cloudLinksCache = await window.fetchFromFirebase();
        }
        saveBtn.innerText = "Save Link to Cloud";
        closeModal('addLinkModal');
        render(getQuery());
    };

    // ===== CONTACT FORM =====
    window.handleContactSubmit = async function (e) {
        e.preventDefault();
        const btn = document.getElementById('contactSubmitBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Sending...';
        btn.disabled = true;

        const formData = {
            name: document.getElementById('contactName').value.trim(),
            email: document.getElementById('contactEmail').value.trim(),
            topic: document.getElementById('contactTopic').value.trim(),
            message: document.getElementById('contactMessage').value.trim(),
        };

        if (typeof window.submitFeedbackToFirebase === 'function') {
            const success = await window.submitFeedbackToFirebase(formData);
            if (success) {
                btn.innerHTML = 'Message Sent! <i class="fas fa-check"></i>';
                btn.style.background = '#3b82f6';
                btn.style.color = '#fff';
                document.getElementById('contactForm').reset();
                setTimeout(() => {
                    btn.innerHTML = originalText; btn.style.background = ''; btn.style.color = ''; btn.disabled = false;
                }, 4000);
            } else {
                btn.innerHTML = 'Error. Try Again.'; btn.style.background = 'var(--accent-danger)'; btn.style.color = '#fff';
                setTimeout(() => {
                    btn.innerHTML = originalText; btn.style.background = ''; btn.style.color = ''; btn.disabled = false;
                }, 4000);
            }
        } else {
            console.error("❌ Firebase module not loaded. Cannot submit form.");
            btn.innerHTML = 'Database Offline';
            setTimeout(() => { btn.innerHTML = originalText; btn.disabled = false; }, 3000);
        }
    };

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('movieportal-theme', next);
        thumbIcon.className = next === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }

    // ===== CORE BOOT SEQUENCE & FALLBACK =====
    async function init() {
        const stored = localStorage.getItem('movieportal-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', stored); thumbIcon.className = stored === 'dark' ? 'fas fa-moon' : 'fas fa-sun';

        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keydown', e => e.key === 'Enter' && performSearch());
        themeToggle.addEventListener('click', toggleTheme);

        cornerSyncBadge.classList.add('visible');
        let checkAttempts = 0;

        function bootApp() {
            if (typeof window.syncLocalToFirebase === 'function') {
                console.log("🚀 Firebase Module detected. Commencing Boot Sequence...");
                (async () => {
                    try {
                        await window.syncLocalToFirebase(allurl);
                        window.cloudLinksCache = await window.fetchFromFirebase();

                        let cSettings = await window.fetchSettingsFromFirebase();
                        if (!cSettings) {
                            console.log("⚙️ No cloud settings found. Bootstrapping defaults...");
                            cSettings = (typeof AppSettings !== 'undefined') ? AppSettings : {
                                specificUrls: { embed: true, showLinks: false, showNames: true }, unspecificUrls: { embed: false, showLinks: true, showNames: true }
                            };
                            await window.updateFirebaseSettings(cSettings);
                        }
                        window.firebaseSettingsCache = cSettings;
                        finishBoot();
                    } catch (e) {
                        console.error("❌ Firebase Execution Error:", e);
                        enableOfflineFallback();
                    }
                })();
            } else {
                checkAttempts++;
                if (checkAttempts > 15) {
                    console.error("❌ Firebase failed to load entirely. Entering Offline Mode.");
                    enableOfflineFallback();
                } else {
                    setTimeout(bootApp, 200);
                }
            }
        }

        function enableOfflineFallback() {
            window.cloudLinksCache = {
                specific: allurl.specificurl.map(site => ({
                    name: site.name, icon: site.icon, baseUrl: site.baseUrl || site.url(""), urlTemplate: typeof site.url === 'function' ? site.url("{q}") : site.url
                })),
                unspecific: allurl.unspecificurl.map(site => ({
                    name: site.name, icon: site.icon, baseUrl: site.url, urlTemplate: site.url
                }))
            };
            window.firebaseSettingsCache = (typeof AppSettings !== 'undefined') ? AppSettings : {
                specificUrls: { embed: true, showLinks: false, showNames: true }, unspecificUrls: { embed: false, showLinks: true, showNames: true }
            };

            cornerSyncBadge.innerHTML = "<i class='fas fa-exclamation-triangle'></i> Offline Mode";
            cornerSyncBadge.style.color = "var(--accent-danger)";
            setTimeout(() => cornerSyncBadge.classList.remove('visible'), 4000);
            finishBoot();
        }

        function finishBoot() {
            cornerSyncBadge.classList.remove('visible');
            resultsSection.style.display = 'block';
            updateTogglesUI();
            const initQuery = getQuery();
            render(initQuery);
            if (!initQuery) searchInput.focus();
            console.log("✅ Boot sequence complete.");
        }

        bootApp();
    }

    document.addEventListener('DOMContentLoaded', init);
})();