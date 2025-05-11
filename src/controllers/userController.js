// backend/src/controllers/userController.js

const db = require('../config/db');

// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
  try {
    const users = await db.query('SELECT * FROM users ORDER BY name');
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios'
    });
  }
};

// Obtener un usuario por ID
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const users = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario'
    });
  }
};

// Crear un nuevo usuario
exports.createUser = async (req, res) => {
  try {
    const { nombre, email } = req.body;
    
    // Validar datos
    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: 'El nombre es obligatorio'
      });
    }
    
    // Insertar usuario
    const result = await db.query(
      'INSERT INTO users (name, email, created_at) VALUES (?, ?, NOW())',
      [nombre, email || null]
    );
    
    res.status(201).json({
      success: true,
      message: 'Usuario creado correctamente',
      data: {
        id: result.insertId,
        nombre,
        email
      }
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario'
    });
  }
};

// Actualizar un usuario
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { nombre, email } = req.body;
    
    // Validar que el usuario existe
    const users = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Actualizar usuario
    await db.query(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [nombre, email, userId]
    );
    
    res.json({
      success: true,
      message: 'Usuario actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario'
    });
  }
};

// Eliminar un usuario
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Validar que el usuario existe
    const users = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Eliminar usuario
    await db.query('DELETE FROM users WHERE id = ?', [userId]);
    
    res.json({
      success: true,
      message: 'Usuario eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario'
    });
  }
};

// Obtener puntuaciones de un usuario
exports.getUserScores = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Verificar que el usuario existe
    const users = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Obtener puntuaciones
    const scores = await db.query(
      'SELECT * FROM scores WHERE user_id = ? ORDER BY points DESC',
      [userId]
    );
    
    res.json({
      success: true,
      count: scores.length,
      data: scores
    });
  } catch (error) {
    console.error('Error al obtener puntuaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener puntuaciones'
    });
  }
};