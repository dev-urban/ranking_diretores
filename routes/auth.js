const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Email não encontrado ou usuário não é diretor' });
    }

    const isValid = await User.validatePassword(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    // Verificar se é diretor (role_id = 3)
    if (user.role_id !== 3) {
      return res.status(403).json({ error: 'Acesso negado. Apenas diretores podem acessar.' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role_id: user.role_id
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;