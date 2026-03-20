# Webprogramozás laborfeladatok

Kesziteni kell egy Microsoft sql car_dealer adatbazis:

IF NOT EXISTS(SELECT \* FROM sys.databases WHERE name = 'car_dealer')
BEGIN
CREATE DATABASE car_dealer;
END
GO

USE car_dealer;
GO

IF NOT EXISTS (SELECT \* FROM sys.tables WHERE name = 'users')
BEGIN
CREATE TABLE users (
id INT IDENTITY(1,1) PRIMARY KEY,
name NVARCHAR(100) NOT NULL
);
END
GO

IF NOT EXISTS (SELECT \* FROM sys.tables WHERE name = 'ads')
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

IF NOT EXISTS (SELECT \* FROM sys.tables WHERE name = 'photos')
BEGIN
CREATE TABLE photos (
id INT IDENTITY(1,1) PRIMARY KEY,
filename NVARCHAR(255) NOT NULL,
ad_id INT NOT NULL,
FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE
);
END
GO

IF NOT EXISTS (SELECT \* FROM sys.tables WHERE name = 'request_logs')
BEGIN
CREATE TABLE request_logs (
id INT IDENTITY(1,1) PRIMARY KEY,
url NVARCHAR(2048),
method NVARCHAR(10),
created_at DATETIME DEFAULT GETDATE()
);
END
GO

IF NOT EXISTS (SELECT \* FROM users)
BEGIN
INSERT INTO users (name) VALUES ('Teszt Elek'), ('Jancsika Mancsika'), ('Kovács János');
END

IF NOT EXISTS (SELECT \* FROM ads)
BEGIN
INSERT INTO ads (brand, city, price, year, user_id)
VALUES ('Opel Astra', 'Szeged', 1500, 2005, 1),
('Suzuki Swift', 'Budapest', 800, 2001, 2);
END
GO

a kepek a public/images mappaba kerulnek
a program a webprog felhasznalot hasznalom
a kod:Titkos1232004

LAB6
azert toroltem ki hogy tiszta lappal kezdjem, valamint egy uj oszlopot alkottam ahol a nevet es a jelszot tarolom
USE car_dealer;
GO

DELETE FROM photos;
DELETE FROM ads;
DELETE FROM users;
GO

IF NOT EXISTS (SELECT \* FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'password')
BEGIN
ALTER TABLE users ADD password NVARCHAR(255);
END
GO

IF NOT EXISTS (SELECT \* FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'role')
BEGIN
ALTER TABLE users ADD role NVARCHAR(50) DEFAULT 'user';
END
GO

SELECT \* FROM users;
