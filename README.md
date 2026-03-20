# Car Dealer Web App

A full-stack used car marketplace where users can register, log in, post car listings, upload photos and search for cars by brand, city or price range.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Templating:** EJS
- **Database:** Microsoft SQL Server (mssql)
- **Authentication:** bcrypt, express-session
- **File Upload:** Multer
- **Environment:** dotenv

## Features

- User registration and login with hashed passwords
- Session-based authentication and route protection
- Post and browse car listings with photo upload
- Filter listings by brand, city and price range
- Owner-only photo deletion
- HTTP request logging to the database

## Project Structure

├── config/ # Database connection
├── controllers/ # Auth and car listing logic
├── middleware/ # Auth guard, request logger
├── routes/ # Express routes
├── views/ # EJS templates and partials
├── public/ # CSS, JS, uploaded images
├── index.js # App entry point
└── .env.example # Environment variable template

text

## Getting Started

```bash
git clone https://github.com/MasterAttila430/Car-Dealer-Project.git
cd Car-Dealer-Project
npm install
Create a .env file based on .env.example:

text
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_SERVER=localhost
DB_NAME=car_dealer
SESSION_SECRET=your_secret_key
PORT=3000
Database Setup
Run the following SQL scripts in SQL Server Management Studio (SSMS):

sql
IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'car_dealer')
BEGIN
  CREATE DATABASE car_dealer;
END
GO

USE car_dealer;
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
  CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    password NVARCHAR(255),
    role NVARCHAR(50) DEFAULT 'user'
  );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ads')
BEGIN
  CREATE TABLE ads (
    id INT IDENTITY(1,1) PRIMARY KEY,
    brand NVARCHAR(100) NOT NULL,
    city NVARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    year INT NOT NULL,
    user_id INT,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'photos')
BEGIN
  CREATE TABLE photos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    filename NVARCHAR(255) NOT NULL,
    ad_id INT NOT NULL,
    FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE
  );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'request_logs')
BEGIN
  CREATE TABLE request_logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    url NVARCHAR(2048),
    method NVARCHAR(10),
    created_at DATETIME DEFAULT GETDATE()
  );
END
GO
Optionally seed some test data:

sql
INSERT INTO ads (brand, city, price, year, user_id)
VALUES ('Opel Astra', 'Szeged', 1500, 2005, 1),
       ('Suzuki Swift', 'Budapest', 800, 2001, 2);
Start the App
bash
npm start
The app runs at http://localhost:3000

Notes
Passwords are hashed with bcrypt before storing

Credentials are kept in .env and never committed to version control

Uploaded images are stored in public/images/ and excluded from the repository