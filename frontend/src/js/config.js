import WebSearchResult from "./app/search/results/components/types/WebSearchResult";

const providerVerticals = {
    'bing': new Map([
        ['web', WebSearchResult],
    ])
};

var config = {
    aboutPrefixAt: 1000,
    logTimeInterval: 5000,
    defaultProvider: 'bing',
    defaultVariant: 'S1',
    variantQueryParameter: false, 
    fallbackToS0ForGroupSize1: false, 
    providerVerticals: providerVerticals,
    interface: {
        chat: true, 
        star: true,
        saveTimestamp: true,
    }
};

export default config;