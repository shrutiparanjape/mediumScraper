# mediumScraper
    Recursively crawling website https://medium.com using Node.js and harvesting all possible hyperlinks that belong to medium.com and storing them in MongoDB.

# Instructions to run on local machine 
    1. Run Command - git clone https://github.com/shrutiparanjape/mediumScraper.git
    2. Run npm install
    3. Run npm start

# Docker Image
    Image is already built and pushed to docker hub, run below commands to pull the image and run docker in local machine. 
    docker pull 9993shruti/medium_scarper
    docker run -p 3001:3001 -d 9993shruti/medium_scarper:shruti
    docker ps -a

# APIs Available
    To start scraping of the website - localhost:3001/api/startScraping
    To fetch the scraped url and it's related details from DB - localhost:3001/api/getUrls