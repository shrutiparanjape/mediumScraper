const urlSchema = require('../model/urlSchema');

getUrls = async (req, res)=>{
    try {
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
        res.send({
            success: false,
            message: error
        })
    }

}

module.exports = { getUrls };