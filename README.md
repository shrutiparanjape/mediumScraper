# mediumScraper
    Recursively crawling website https://medium.com using Node.js and harvesting all possible hyperlinks that belong to medium.com and storing them in MongoDB.

# Instructions to run on local machine 
    1. Run Command - git clone https://github.com/shrutiparanjape/mediumScraper.git
    2. Run npm install
    3. Run npm start

# Docker Image
    Image is already built and pushed to docker hub - to pull the existing image run docker pull 9993shruti/medium_scarper
    
# APIs Available
    To start scraping of the website - localhost:{port running on local machine}/api/startScraping
    To fetch the scraped url and it's related details from DB - localhost:{port running on local machine}/api/getUrls