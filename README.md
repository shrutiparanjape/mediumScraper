# mediumScraper
    Recursively crawling website https://medium.com using Node.js and harvesting all possible hyperlinks that belong to medium.com and storing them in MongoDB.

# Instructions to run Code on local machine 
    Run Command - git clone https://github.com/shrutiparanjape/mediumScraper.git
    docker-compose build
    docker-compose up

# Instructions to run Docker Image on local machine
    Image is already built and pushed to docker hub, run below commands to pull the image and run docker in local machine. 
    docker pull 9993shruti/medium_scarper:shruti
    docker run -p 3001:3001 -d 9993shruti/medium_scarper:shruti

    For logs
    docker ps -a
    docker logs --follow <CONTAINER_ID>

# APIs available
    To start scraping of the website - localhost:3001/api/startScraping
    To fetch the scraped url and it's related details from DB - localhost:3001/api/getUrls

    Postman Collection - https://www.getpostman.com/collections/11a385d50a4f5df7fc08