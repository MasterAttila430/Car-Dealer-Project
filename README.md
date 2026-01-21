# 🚗 Used Car Dealer Platform

A Full Stack web application for managing used car advertisements. Users can register, log in, upload cars with photos, and search for vehicles based on specific criteria.

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** Microsoft SQL Server (MSSQL)
- **Frontend:** EJS Templates, CSS
- **Authentication:** Session-based auth with Bcrypt
- **File Handling:** Multer for image uploads

## ✨ Key Features

- **User Authentication:** Secure registration and login system.
- **Car Management:** Users can upload car advertisements with details (Brand, Price, City, Year).
- **Image Gallery:** Support for uploading multiple photos for each car listing.
- **Search & Filter:** Filter cars by brand, price range, and city.
- **MVC Architecture:** Organized codebase using Models, Views, and Controllers.

## ⚙️ Database Setup (SQL Script)

To run this project, you need a Microsoft SQL Server instance. Run the following script to create the database and tables:

```sql
-- 1. Create Database
IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'car_dealer')
BEGIN
    CREATE DATABASE car_dealer;
END
GO

USE car_dealer;
GO

-- 2. Create Users Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
    CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        password NVARCHAR(255), -- Stores hashed passwords
        role NVARCHAR(50) DEFAULT 'user' -- Roles: 'user' or 'admin'
    );
END
GO

-- 3. Create Ads Table
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

-- 4. Create Photos Table
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

-- 5. Create Logs Table
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

-- 6. Insert Dummy Data (Optional)
IF NOT EXISTS (SELECT * FROM users)
BEGIN
    -- Note: Passwords here are not hashed, meant for testing only.
    -- In the app, new users will have hashed passwords.
    INSERT INTO users (name, role) VALUES ('Test User', 'user'), ('Admin User', 'admin');
END
GO
🚀 How to Run
Clone the repository:

Bash

git clone [https://github.com/YOUR-USERNAME/Car-Dealer-App.git](https://github.com/YOUR-USERNAME/Car-Dealer-App.git)
(Replace YOUR-USERNAME with your GitHub username)

Install dependencies: Navigate to the project folder and run:

Bash

npm install
Configure Database:

Open config/db.js.

Update the user, password, and server fields with your local SQL Server credentials.

Run the server:

Bash

node index.js
Open in browser: Visit http://localhost:3000

Created as a University Project at Babeș-Bolyai University (UBB).
```
