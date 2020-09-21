# mediumScraper
    Recursively crawling website https://medium.com using Node.js and harvesting all possible hyperlinks that belong to medium.com and storing them in MongoDB.

# Instructions to run Code on local machine 
    Run Command - git clone https://github.com/shrutiparanjape/mediumScraper.git
    docker-compose build
    docker-compose up

# APIs available
    To start scraping of the website - localhost:3001/api/startScraping
    To fetch the scraped url and it's related details from DB - localhost:3001/api/getUrls

    Postman Collection - https://www.getpostman.com/collections/11a385d50a4f5df7fc08