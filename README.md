# Northcoders News API

# Link
The NCNews api is hosted at: https://nc-news-28fh.onrender.com/

# What is nc-news?

nc-news is an api for accessing and modifying an applications data. nc-news stores its data in an SQL database and the application has been written in javascript. The applications goal is to provide the backend service for a hosted website.

# How to Clone and setup your own nc-news
Please ensure you version of node is at least version v21.4.0 and you have at least version 8.11.3 of postgres. Lower versions are not supported and may cause the app to not function as intended.

# Cloning
To Clone nc-news copy the url from the github page (found in the green code button) and then run the following command in your terminal in directory you want the project to be cloned to:
Git clone <url>

Replacing the <url> with the url you copied from github. The url shhould look something like this: "https://github.com/basilkelly/nc-news.git"

# Install Dependencies
nc-news requires some dependancies in order to function correctly. These are: dotenv, express, pg and husky

To install these run the following commands in the terminal:

npm install dotenv
npm install express
npm install pg
npm install husky

# Seeding the Local Database
To seed the database run the following command in the terminal:

npm seed

# Running Tests
To run the tests run the following command in the terminal:

npm test

# Creating Environments Variables
Two .env files must be created. one for the test database and the other for the development database.

These should be named ".env.test" for the test environment file and ".env.development" for the development environment file (without the quotation marks).

The .env.test file should connect to the nc_news_test database.
The .env.development file should connect to the nc_news database.

An example of how to do this is given in the ".env.example" file.
A password may be required, in this case include your password using the command PGPASSWORD=examplepassword on a new line in the env file(replace examplepassword with your password).

# Links
- [View the Frontend repo for this project](https://github.com/basilkelly/fe-nc-news)
