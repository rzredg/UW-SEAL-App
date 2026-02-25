How to set up and run this system locally:

1. Download PostgreSQL and create a database for the seal system
2. Import the most up-to-date seal-database-schema.sql file into the database you created (\i directory/file_name)
3. In the root of the backend folder, add a .env file and fill it in with the required data values (copy the format of the .env.example file)
4. Navigate to the backend folder on a terminal window and run "npm run dev" to start the backend server
5. Open a second terminal, navigate to the frontend folder, and run "npm run dev" again, which will start the frontend of the website in a test environment
6. Navigate to the localhost website on a browser of your choice to access the application.
