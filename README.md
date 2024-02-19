# Northcoders News API

# Creating Environments variables

Two .env files must be created. one for the test database and the other for the development database.

These should be named ".env.test" for the test environment file and ".env.development" for the development environment file (without the quotation marks).

The .env.test file should connect to the nc_news_test database. 
The .env.development file should connect to the nc_news database. 
An example of how to do this is given in the ".env.example" file. 


A password may be required, in this case include your password using the command PGPASSWORD=examplepassword on a new line in the env file(replace examplepassword with your password)