const fetch = require('isomorphic-fetch');
const cheerio = require('cheerio');

const urlModel = require('../model/urlSchema');

const scrapedUrl = "https://medium.com/";
const maxConnections = 5;
let inQueue = [];
let completedQueue = [];
let currentConnections = 0;
let completedUrlJson = {}

/**
 * @description Function to get all urls in medium.com
 * @param urlQueue Array of URLs to be scraped
 */
async function getUrlList (urlQueue) {
    try {
        let allUrls = [];

        let url = urlQueue.shift(); // Fetch single url from the list to start the scraping of data
        
        currentConnections++; // Increase the count of current connection

        // Gets an html code of page in response
        const response = await fetch(url); 
        const htmlText = await response.text();

        // Parse the reponse received and fetch only medium.com related urls 
        const $ = cheerio.load(htmlText)
        hyperlinks = $('a');
        $(hyperlinks).each(function (i, link) {
            if($(link).attr('href').indexOf("https://medium.com/") > -1)
                allUrls.push($(link).attr('href'));
        });

        // Logic to find the duplicate url from all urls fetched
        if(allUrls){
            await processUrls(allUrls)
            await updateDB(completedUrlJson)
            completedQueue.push(url);
        }

        currentConnections--; // Decrement the count of current connection, once a url is processed

        console.log(`Length of total urls in queue to be parsed - ${inQueue.length}, current connections - ${currentConnections}`)

        // Run this function on loop until there are urls to be scraped in inQueue array and the current connections are below 6
        while (inQueue.length && currentConnections <= maxConnections) {
            getUrlList(inQueue);
        }

        return;
    } catch (error) {
        console.log("::getUrlList error", error)
        throw error;
    }
};

/**
 * @description Function to process on the urls scraped from medium.com
 * @param allUrls Array of all the URLs fetched
 */
async function processUrls (allUrls) {
    try {
        allUrls.forEach(newUrl => {
            // Direct match original url with exisitng urls.
            if(completedQueue.includes(newUrl)){
                // Existing url and already scraped, increase the count of occurance
                let newUrlSplit = newUrl.split("?");
                console.log(":::newUrlSplit if includes in completed queue", newUrlSplit, newUrl)
                completedUrlJson[newUrlSplit[0]]["count"] += 1;
            } else {
                // New url could have diff params or same params with diff values.
                inQueue.push(newUrl)

                let newUrlSplit = newUrl.split("?");
                console.log(":::newUrlSplit", newUrlSplit)
                if(newUrlSplit.length > 1) {
                    // Url has params
                    let urlParams = new URL(newUrl);
                    let searchParams = new URLSearchParams(urlParams.search);

                    // Matching url component of the url in existing scrapped urls.
                    if(newUrlSplit[0] in completedUrlJson) {
                        for(var key of searchParams.keys()) {
                            // Checking for unique params in exisitng params for each url.
                            if(completedUrlJson[newUrlSplit[0]]["params"].includes(key)){
                                // Url is already scraped, increase the count of occurance at the end of this for loop
                            } else {
                                completedUrlJson[newUrlSplit[0]]["params"] = [...completedUrlJson[newUrlSplit[0]]["params"], key]
                            }
                        }
                        completedUrlJson[newUrlSplit[0]]["count"] += 1;
                    } else {
                        // Url component has not been scrapped, initialize with reference count 1.
                        paramsArray = []
                        for(var key of searchParams.keys()) {
                            // Array of params from the url
                            paramsArray.push(key)
                        }
                        completedUrlJson[newUrlSplit[0]] = {
                            params: paramsArray,
                            count: 1
                        }
                    }
                } else {
                    // Url does not have params
                    if(newUrlSplit[0] in completedUrlJson) {
                        // Url is already scraped, increase the count of occurance
                        completedUrlJson[newUrlSplit[0]]["count"] += 1;
                    } else {
                        // New url initialize with reference count 1.
                        completedUrlJson[newUrlSplit[0]] = {
                            params: [],
                            count: 1
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.log("::processUrls error", error)
        throw error;
    }
}

async function startScraping (req, res) {
    try {
        inQueue.push(scrapedUrl);
        // Initial count for the medium.com url
        completedUrlJson = {
            [scrapedUrl] : {
                params: [],
                count: 1
            }
        }
        await urlModel.deleteMany({}) // Clear existing data before scraping
        getUrlList(inQueue); // Start the scraping of data
        res.json({ status: "success", message: "Scraping of Data is initiated." });
    } catch (error){
        console.log("::startScraping error", error)
        res.json({ status: "error", message: error });
    }
}

async function updateDB (completedUrlJson) {
    Object.keys(completedUrlJson).forEach ( key => {
        let query = { url: key },
        urlUpdate = { url: key, ...completedUrlJson[key]},
        options = { upsert: true, new: true };
        urlModel.findOneAndUpdate(query, urlUpdate, options, function(error, result) {
            if (error) return;
            else if (result) return;
        });
    })
}

module.exports = {
    startScraping
}