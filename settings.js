var AppSettings = {
    // 1. Settings for the search-based websites WITH your movie query
    specificUrls: {
        embed: false,
        showLinks: false,
        showNames: true
    },

    // 2. Settings for the direct OTT websites (e.g., Netflix)
    unspecificUrls: {
        embed: false,
        showLinks: true,
        showNames: true
    },

    // 3. NEW: Settings for all your search websites' Homepages (without the ?s= query)
    baseUrls: {
        embed: false,     // false is usually better for homepages so they open in a new tab
        showLinks: true,
        showNames: true
    }
};