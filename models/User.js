const db = require('../config/database');

class User {
  static async findByEmail(email) {
    const [rows] = await db.execute(
      'SELECT id, username, password, role_id, email FROM users WHERE email = ? AND role_id = 3',
      [email]
    );
    return rows[0];
  }

  static async validatePassword(password, hashedPassword) {
    // Para compatibilidade com senhas hasheadas pelo PHP password_hash()
    const bcrypt = require('bcryptjs');

    // Primeiro tenta verificar com bcrypt (caso seja uma senha nova)
    if (hashedPassword.startsWith('$2')) {
      return bcrypt.compare(password, hashedPassword);
    }

    // Se não for bcrypt, pode ser password_hash do PHP
    // Como não temos acesso direto ao password_verify do PHP no Node.js,
    // vamos assumir que as senhas serão migradas para bcrypt
    return bcrypt.compare(password, hashedPassword);
  }

  static async getAllDirectors() {
    const [rows] = await db.execute(
      'SELECT id, username, email FROM users WHERE role_id = 3'
    );
    return rows;
  }

  static async getRoleName(roleId) {
    try {
      const [rows] = await db.execute(
        'SELECT name FROM roles WHERE id = ?',
        [roleId]
      );
      return rows[0]?.name || null;
    } catch (error) {
      // Se a tabela roles não existir, retorna null
      return null;
    }
  }
}

module.exports = User;