const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async findByUsername(username) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE username = ? AND role_id = 3',
      [username]
    );
    return rows[0];
  }

  static async validatePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  static async getAllDirectors() {
    const [rows] = await db.execute(
      'SELECT id, username, email FROM users WHERE role_id = 3'
    );
    return rows;
  }
}

module.exports = User;