const urlSchema = require('../model/urlSchema');

/**
 * @description Function to fetch all urls from DB
 */
getUrls = async (req, res)=>{
    try {
        console.log("Fetching URLs and details from DB")
        let urls = await urlSchema.find({});
        if(urls && urls.length>0){
            res.send({
                success: true,
                message: "URLs succefully fetched",
                urlCount: urls.length,
                urls: urls.map(item => {
                    return {params: item.params, url: item.url, referenceCount: item.count}
                })
            })
        }else{
            res.send({
                success: true,
                message: "Scraping in progress. Please try after some time."
            })
        }
        
    } catch (error) {
        console.log(":::getUrls error", error);
        res.send({
            success: false,
            message: error
        })
    }

}

module.exports = { getUrls };