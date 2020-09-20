const fetch = require('isomorphic-fetch');
const cheerio = require('cheerio');

const urlModel = require('../model/urlSchema');

const scrapedUrl = "https://medium.com/";
const maxConnections = 5;
let inQueue = [];
let completedQueue = [];
let currentConnections = 0;
let completedUrlJson = {}

async function getUrlList (urlQueue) {
    try {
        let allUrls = [];

        //fetch single url from the list to start the scraping of data
        let url = urlQueue.shift();
        
        currentConnections++;
        console.log("+++++++", currentConnections)

        const response = await fetch(url);
        const htmlText = await response.text();

        const $ = cheerio.load(htmlText)
        hyperlinks = $('a');
        $(hyperlinks).each(function (i, link) {
            if($(link).attr('href').indexOf("https://medium.com/") > -1)
                allUrls.push($(link).attr('href'));
        });

        //logic to find the duplicate url from all urls
        if(allUrls){
            await processUrls(allUrls)
            await updateDB(completedUrlJson)
            completedQueue.push(url);
        }

        currentConnections--;
        console.log("-------", currentConnections)

        console.log("/////", inQueue.length, currentConnections, currentConnections < maxConnections)

        while (inQueue.length && currentConnections <= maxConnections) {
            console.log(">>>>>>", currentConnections)
            getUrlList(inQueue);
        }

        if(inQueue.length == 0){
            console.log("$$$$$$$$$ END $$$$$$$$")
        }

        return;
    } catch (error) {
        console.log("::getUrlList error", error)
        throw error;
    }
};

async function processUrls (allUrls) {
    try {
        allUrls.forEach(newUrl => {
            // For the original url to be unique.
            //1. Url is new
            //2. Params are diff
            //3. Param values are diff

            // Direct match original url with exisitng urls.
            if(completedQueue.includes(newUrl)){
                // Existing url and already scraped, increase the count of occurance
                let newUrlSplit = newUrl.split("?");
                console.log(":::newUrlSplit includes", newUrlSplit, newUrl)
                completedUrlJson[newUrlSplit[0]]["count"] += 1;
            } else {
                // New url could have diff params or same params diff values.
                inQueue.push(newUrl)

                let newUrlSplit = newUrl.split("?");
                console.log(":::newUrlSplit", newUrlSplit)
                if(newUrlSplit.length > 1) {
                    //Url has params
                    let urlParams = new URL(newUrl);
                    let searchParams = new URLSearchParams(urlParams.search);

                    //Matching url component of the url in existing scrapped urls.
                    if(newUrlSplit[0] in completedUrlJson) {
                        for(var key of searchParams.keys()) {
                            // Checking for unique params in exisitng params for each url.
                            if(completedUrlJson[newUrlSplit[0]]["params"].includes(key)){
                                //url already scraped, increase the count of occurance
                            } else {
                                completedUrlJson[newUrlSplit[0]]["params"] = [...completedUrlJson[newUrlSplit[0]]["params"], key]
                            }
                        }
                        completedUrlJson[newUrlSplit[0]]["count"] += 1;
                    } else {
                        // Url component has not yet been scrapped, initialize with reference count 1.
                        paramsArray = []
                        for(var key of searchParams.keys()) {
                            paramsArray.push(key)
                        }
                        completedUrlJson[newUrlSplit[0]] = {
                            params: paramsArray,
                            count: 1
                        }
                    }
                } else {
                    //Url does not have params
                    if(newUrlSplit[0] in completedUrlJson) {
                        //Url already scraped, increase the count of occurance
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
        completedUrlJson = {
            [scrapedUrl] : {
                params: [],
                count: 1
            }
        }
        await urlModel.deleteMany({}) // clear existing data
        getUrlList(inQueue);
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
        options = { upsert: true, new: true, setDefaultsOnInsert: true };
        urlModel.findOneAndUpdate(query, urlUpdate, options, function(error, result) {
            if (error) return;
            else if (result) return;
        });
    })
}

module.exports = {
    startScraping
}