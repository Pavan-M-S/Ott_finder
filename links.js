// URLs that require a search query parameter (Now includes baseUrl)
var specificurl = [
    {
        name: 'KM Movies',
        icon: 'fa-solid fa-trophy',
        url: (q) => `https://kmmovies.online/?s=${q}`,
        baseUrl: 'https://kmmovies.online/'
    },
    {
        name: '4KHD Hub',
        icon: 'fa-solid fa-play',
        url: (q) => `https://4khdhub.one/?s=${q}`,
        baseUrl: 'https://4khdhub.one/'
    }, 
    {
        name: 'FullRaces',
        icon: 'fa-solid fa-trophy',
        url: (q) => `https://fullraces.com/search/?q=${q}`,
        baseUrl: 'https://fullraces.com/'
    }, 
    {
        name: 'MovieRulz',
        icon: 'fa-solid fa-film',
        url: (q) => `https://www.5movierulz.support/search_movies?s=${q}`,
        baseUrl: 'https://www.5movierulz.support/'
    },
    {
        name: 'Full Movies',
        icon: 'fa-solid fa-film',
        url: (q) => `https://watchfullmovies.online/?s=${q}`,
        baseUrl: 'https://watchfullmovies.online/'
    },
    {
        name: 'Films Look',
        icon: 'fa-solid fa-film',
        url: (q) => `https://filmslook.com/search/?s=${q}`,
        baseUrl: 'https://filmslook.com/'
    }, 
    {
        name: 'Movies4U',
        icon: 'fa-solid fa-video',
        url: (q) => `https://movies4u.ss/?s=${q}`,
        baseUrl: 'https://movies4u.ss/'
    }, 
    {
        name: 'Filmywap',
        icon: 'fa-solid fa-download',
        url: (q) => `https://www.filmywap.farm/mobile/search?find=${q}`,
        baseUrl: 'https://www.filmywap.farm/'
    }, 
    {
        name: 'WorldFree4U (dog)',
        icon: 'fa-solid fa-globe',
        url: (q) => `https://worldfree4u.dog/?s=${q}`,
        baseUrl: 'https://worldfree4u.dog/'
    }, 
    {
        name: 'WorldFree4U (video)',
        icon: 'fa-solid fa-globe',
        url: (q) => `https://worldfree4u.video/?s=${q}`,
        baseUrl: 'https://worldfree4u.video/'
    }, 
    {
        name: 'JustWatch (OTT)',
        icon: 'fa-solid fa-tv',
        url: (q) => `https://www.justwatch.com/in/search?q=${encodeURIComponent(q.replace(/\+/g, ' '))}`,
        baseUrl: 'https://www.justwatch.com/in/'
    }, 
    {
        name: 'Google',
        icon: 'fa-brands fa-google',
        url: (q) => `https://www.google.com/search?q=${q}+where+to+watch+online`,
        baseUrl: 'https://www.google.com/'
    }, 
    {
        name: 'IMDb',
        icon: 'fa-brands fa-imdb',
        url: (q) => `https://www.imdb.com/find?q=${encodeURIComponent(q.replace(/\+/g, ' '))}`,
        baseUrl: 'https://www.imdb.com/'
    }, 
    {
        name: 'TMDB',
        icon: 'fa-solid fa-clapperboard',
        url: (q) => `https://www.themoviedb.org/search?query=${q}`,
        baseUrl: 'https://www.themoviedb.org/'
    }
];

// Direct links that do NOT need a search query (Static homepages)
var unspecificurl = [
    {
        name: '1FMovies',
        icon: 'fa-solid fa-film',
        url: 'https://1fmovies.us/'
    },
    {
        name: 'Netflix',
        icon: 'fa-solid fa-n',
        url: 'https://www.netflix.com/'
    },
    {
        name: 'Prime Video',
        icon: 'fa-brands fa-amazon',
        url: 'https://www.primevideo.com/'
    }
];

// Combined Object (Easily accessible from index.html)
var allurl = {
    specificurl: specificurl,
    unspecificurl: unspecificurl,
    combined: [].concat(specificurl, unspecificurl) 
};