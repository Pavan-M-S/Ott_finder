const sites = [
    {
        name: '4KHD Hub',
        icon: 'fa-solid fa-play',
        url: (q) => `https://4khdhub.one/?s=${q}`
    }, 
    {
        name: 'FullRaces',
        icon: 'fa-solid fa-trophy',
        url: (q) => `https://fullraces.com/search/?q=${q}`
    }, 
    {
        name: 'MovieRulz',
        icon: 'fa-solid fa-film',
        url: (q) => `https://www.5movierulz.support/search_movies?s=${q}`
    },
    {
        name: 'Full Movies',
        icon: 'fa-solid fa-film',
        url: (q) => `https://watchfullmovies.online/?s=${q}`
    },
    {
        name: 'Films Look',
        icon: 'fa-solid fa-film',
        url: (q) => `https://filmslook.com/search/?s=${q}`
    }, 
    {
        name: 'Movies4U',
        icon: 'fa-solid fa-video',
        url: (q) => `https://movies4u.ss/?s=${q}`
    }, 
    {
        name: 'Filmywap',
        icon: 'fa-solid fa-download',
        url: (q) => `https://www.filmywap.farm/mobile/search?find=${q}`
    }, 
    {
        name: 'WorldFree4U (dog)',
        icon: 'fa-solid fa-globe',
        url: (q) => `https://worldfree4u.dog/?s=${q}`
    }, 
    {
        name: 'WorldFree4U (video)',
        icon: 'fa-solid fa-globe',
        url: (q) => `https://worldfree4u.video/?s=${q}`
    }, 
    {
        name: 'JustWatch (OTT)',
        icon: 'fa-solid fa-tv',
        url: (q) => `https://www.justwatch.com/in/search?q=${encodeURIComponent(q.replace(/\+/g, ' '))}`
    }, 
    {
        name: 'Google',
        icon: 'fa-brands fa-google',
        url: (q) => `https://www.google.com/search?q=${q}+where+to+watch+online`
    }, 
    {
        name: 'IMDb',
        icon: 'fa-brands fa-imdb',
        url: (q) => `https://www.imdb.com/find?q=${encodeURIComponent(q.replace(/\+/g, ' '))}`
    }, 
    {
        name: 'TMDB',
        icon: 'fa-solid fa-clapperboard',
        url: (q) => `https://www.themoviedb.org/search?query=${q}`
    }
];