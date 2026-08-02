import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, get, push } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// ⚠️ REPLACE THIS WITH YOUR FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const DB_PATH = 'ott-finder/links';
const SETTINGS_PATH = 'ott-finder/settings';
const ADMIN_LOG_PATH = 'ott-finder/admin login';

// 1. SYNC LINKS TO FIREBASE
window.syncLocalToFirebase = async function(localLinks) {
    try {
        console.log("⏳ Syncing local links.js to Firebase...");
        const specificTemplates = localLinks.specificurl.map(site => ({
            name: site.name, icon: site.icon, baseUrl: site.baseUrl || site.url("{q}"), urlTemplate: typeof site.url === 'function' ? site.url("{q}") : site.url
        }));
        const unspecificTemplates = localLinks.unspecificurl.map(site => ({
            name: site.name, icon: site.icon, baseUrl: site.url, urlTemplate: site.url
        }));

        await set(ref(db, `${DB_PATH}/defaults/specific`), specificTemplates);
        await set(ref(db, `${DB_PATH}/defaults/unspecific`), unspecificTemplates);
        console.log("✅ Offline links successfully synced to Firebase RDB!");
    } catch (e) {
        console.error("❌ Firebase Links Sync Error:", e);
    }
};

// 2. FETCH LINKS FROM FIREBASE
window.fetchFromFirebase = async function() {
    try {
        console.log("⏳ Fetching live links from Firebase...");
        const snapshot = await get(ref(db, DB_PATH));
        if (snapshot.exists()) {
            const data = snapshot.val();
            const defaultSpec = data.defaults?.specific || [];
            const defaultUnspec = data.defaults?.unspecific || [];
            const customSpec = data.custom?.specific ? Object.values(data.custom.specific) : [];
            const customUnspec = data.custom?.unspecific ? Object.values(data.custom.unspecific) : [];
            console.log(`✅ Links fetched: ${defaultSpec.length + customSpec.length} Search | ${defaultUnspec.length + customUnspec.length} Direct`);
            return { specific: [...defaultSpec, ...customSpec], unspecific: [...defaultUnspec, ...customUnspec] };
        }
        console.warn("⚠️ No links found in Firebase.");
        return { specific: [], unspecific: [] };
    } catch (e) {
        console.error("❌ Firebase Links Fetch Error:", e);
        return { specific: [], unspecific: [] };
    }
};

// 3. ADD NEW LINK VIA ADMIN UI
window.saveToFirebase = async function(type, name, icon, url, baseUrl) {
    try {
        console.log(`⏳ Pushing new ${type} link to Firebase...`);
        const customRef = ref(db, `${DB_PATH}/custom/${type}`);
        await set(push(customRef), { name, icon, urlTemplate: url, baseUrl: baseUrl || url });
        console.log("✅ New link saved to cloud successfully!");
        return true;
    } catch (e) {
        console.error("❌ Firebase Link Save Error:", e);
        return false;
    }
};

// 4. SETTINGS ENGINE (SYNC, FETCH, UPDATE)
window.fetchSettingsFromFirebase = async function() {
    try {
        console.log("⏳ Fetching settings from Firebase...");
        const snapshot = await get(ref(db, SETTINGS_PATH));
        if (snapshot.exists()) {
            console.log("✅ Cloud settings fetched successfully!");
            return snapshot.val();
        }
        console.warn("⚠️ No settings found in Firebase. Proceeding to seed defaults.");
        return null;
    } catch (e) {
        console.error("❌ Firebase Settings Fetch Error:", e);
        return null;
    }
};

window.updateFirebaseSettings = async function(newSettings) {
    try {
        console.log("⏳ Updating global settings in Firebase...");
        await set(ref(db, SETTINGS_PATH), newSettings);
        console.log("✅ Firebase global settings updated successfully!");
    } catch (e) {
        console.error("❌ Firebase Settings Update Error:", e);
    }
};

// 5. ADMIN LOGIN TRACKER
window.logAdminLoginToFirebase = async function(trackerData, formattedTimestamp) {
    try {
        console.log("⏳ Logging admin session to Firebase...");
        // Uses the exact timestamp formatting for the node name
        const docRef = ref(db, `${ADMIN_LOG_PATH}/admin-${formattedTimestamp}`);
        await set(docRef, trackerData);
        console.log(`✅ Admin session securely logged under key: admin-${formattedTimestamp}`);
    } catch (e) {
        console.error("❌ Firebase Admin Logging Error:", e);
    }
};