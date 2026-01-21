import sql from 'mssql';

class CarRepo {
  constructor() {
    this.config = {
      user: 'webprog',
      password: 'yourpassword',
      server: 'yourserver',
      database: 'yourdatabase',
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    };

    this.pool = new sql.ConnectionPool(this.config);
    this.poolConnect = this.pool
      .connect()
      .then(() => console.log(' Sikeres csatlakozás az SQL Szerverhez!'))
      .catch((err) => console.error(' Adatbázis hiba: ', err));
  }

  async getPool() {
    await this.poolConnect;
    return this.pool;
  }

  // --- FELHASZNÁLÓK ---
  async getUserByName(name) {
    const pool = await this.getPool();
    const request = pool.request();
    request.input('name', name);
    return request.query('SELECT * FROM users WHERE name = @name');
  }

  async createUser(name, password, role) {
    const pool = await this.getPool();
    const request = pool.request();
    request.input('name', name);
    request.input('password', password);
    request.input('role', role);
    return request.query('INSERT INTO users (name, password, role) VALUES (@name, @password, @role)');
  }

  async getAllUsers() {
    const pool = await this.getPool();
    return pool.request().query('SELECT * FROM users');
  }

  // --- HIRDETÉSEK ---
  async getCars(filters = {}) {
    const pool = await this.getPool();
    const request = pool.request();

    let sqlQuery = `
      SELECT ads.*, users.name as owner_name 
      FROM ads 
      JOIN users ON ads.user_id = users.id 
      WHERE 1=1
    `;

    if (filters.brand) {
      sqlQuery += ' AND ads.brand LIKE @brand';
      request.input('brand', `%${filters.brand}%`);
    }
    if (filters.city) {
      sqlQuery += ' AND ads.city LIKE @city';
      request.input('city', `%${filters.city}%`);
    }
    if (filters.minPrice) {
      sqlQuery += ' AND ads.price >= @minPrice';
      request.input('minPrice', filters.minPrice);
    }
    if (filters.maxPrice) {
      sqlQuery += ' AND ads.price <= @maxPrice';
      request.input('maxPrice', filters.maxPrice);
    }

    sqlQuery += ' ORDER BY created_at DESC';
    return request.query(sqlQuery);
  }

  async getCarById(id) {
    const pool = await this.getPool();
    const request = pool.request();
    request.input('id', id);

    return request.query(`
      SELECT ads.*, users.name as owner_name 
      FROM ads 
      JOIN users ON ads.user_id = users.id 
      WHERE ads.id = @id
    `);
  }

  async getCarCreatedAt(id) {
    const pool = await this.getPool();
    const request = pool.request();
    request.input('id', id);
    return request.query('SELECT created_at FROM ads WHERE id = @id');
  }

  async createCar({ brand, city, price, year, userId }) {
    const pool = await this.getPool();
    const request = pool.request();

    request.input('brand', brand);
    request.input('city', city);
    request.input('price', price);
    request.input('year', year);
    request.input('userId', userId);

    return request.query(`
      INSERT INTO ads (brand, city, price, year, user_id)
      VALUES (@brand, @city, @price, @year, @userId);
    `);
  }

  // --- KÉPEK ---
  async getPhotosByCarId(carId) {
    const pool = await this.getPool();
    const request = pool.request();
    request.input('id', carId);
    return request.query('SELECT * FROM photos WHERE ad_id = @id');
  }

  async getPhotoById(id) {
    const pool = await this.getPool();
    const request = pool.request();
    request.input('id', id);
    return request.query('SELECT * FROM photos WHERE id = @id');
  }

  async addPhoto(filename, carId) {
    const pool = await this.getPool();
    const request = pool.request();
    request.input('filename', filename);
    request.input('carId', carId);

    return request.query(`
      INSERT INTO photos (filename, ad_id)
      VALUES (@filename, @carId)
    `);
  }

  async deletePhoto(id) {
    const pool = await this.getPool();
    const request = pool.request();
    request.input('id', id);
    return request.query('DELETE FROM photos WHERE id = @id');
  }

  // LOGOLÁS
  async logRequest(url, method) {
    const pool = await this.getPool();
    const request = pool.request();
    request.input('url', url);
    request.input('method', method);
    return request.query('INSERT INTO request_logs (url, method) VALUES (@url, @method)');
  }
}

const db = new CarRepo();
export default db;
