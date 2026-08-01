import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { get, getDatabase, push, ref, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// ⚠️ REPLACE THIS WITH YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDgIc8TL1Fo8YubnvDoq54wIUzglUfyTcU",
  authDomain: "my-projects-21980.firebaseapp.com",
  databaseURL: "https://my-projects-21980-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "my-projects-21980",
  storageBucket: "my-projects-21980.firebasestorage.app",
  messagingSenderId: "44660039234",
  appId: "1:44660039234:web:a1c4f8484d92ae792197db",
  measurementId: "G-XFJLB900ZT"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Base path for this specific project
const DB_PATH = 'ott-finder/links';

// 1. SYNC offline links.js TO FIREBASE
window.syncLocalToFirebase = async function (localLinks) {
    try {
        const specificTemplates = localLinks.specificurl.map(site => ({
            name: site.name,
            icon: site.icon,
            baseUrl: site.baseUrl || site.url("{q}"),
            urlTemplate: typeof site.url === 'function' ? site.url("{q}") : site.url
        }));

        const unspecificTemplates = localLinks.unspecificurl.map(site => ({
            name: site.name,
            icon: site.icon,
            baseUrl: site.url,
            urlTemplate: site.url
        }));

        // Overwrite the "defaults" node under ott-finder
        await set(ref(db, `${DB_PATH}/defaults/specific`), specificTemplates);
        await set(ref(db, `${DB_PATH}/defaults/unspecific`), unspecificTemplates);
        console.log("✅ Offline links.js successfully synced to Firebase RDB under ott-finder!");
    } catch (e) {
        console.error("❌ Firebase Sync Error:", e);
    }
};

// 2. FETCH EVERYTHING FROM FIREBASE
window.fetchFromFirebase = async function () {
    try {
        const snapshot = await get(ref(db, DB_PATH));
        if (snapshot.exists()) {
            const data = snapshot.val();

            // Extract synced defaults
            const defaultSpec = data.defaults?.specific || [];
            const defaultUnspec = data.defaults?.unspecific || [];

            // Extract custom links added via the Admin UI
            const customSpec = data.custom?.specific ? Object.values(data.custom.specific) : [];
            const customUnspec = data.custom?.unspecific ? Object.values(data.custom.unspecific) : [];

            return {
                specific: [...defaultSpec, ...customSpec],
                unspecific: [...defaultUnspec, ...customUnspec]
            };
        }
        return { specific: [], unspecific: [] };
    } catch (e) {
        console.error("❌ Firebase Fetch Error:", e);
        return { specific: [], unspecific: [] };
    }
};

// 3. ADD NEW LINK VIA ADMIN UI
window.saveToFirebase = async function (type, name, icon, url, baseUrl) {
    try {
        const customRef = ref(db, `${DB_PATH}/custom/${type}`);
        const newLinkRef = push(customRef);
        await set(newLinkRef, {
            name: name,
            icon: icon,
            urlTemplate: url,
            baseUrl: baseUrl || url
        });
        return true;
    } catch (e) {
        console.error("❌ Firebase Save Error:", e);
        return false;
    }
};