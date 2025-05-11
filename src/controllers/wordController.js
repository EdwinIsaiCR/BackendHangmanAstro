// controllers/wordController.js
const db = require('../config/db');

exports.getAllWords = async (req, res) => {
    try {
      const rows = await db.query('SELECT * FROM words');
      
      res.json({
        success: true,
        count: rows.length,
        data: rows
      });
    } catch (error) {
      console.error('Error al obtener palabras:', error);
      return res.status(500).json({ 
        success: 0,
        message: 'Error al obtener palabras',
        error: error.message 
      });
    }
  },

  // Obtener palabras por room_id (equivalente a wrdRoomLeer)
exports.getWordsByRoom = async (req, res) => {
    try {
      const { roomid } = req.body;
      
      if (!roomid) {
        return res.status(400).json({ 
          success: 0,
          message: 'Se requiere el ID de la sala' 
        });
      }

      const [rows] = await db.query(
        `SELECT words.* FROM words 
        JOIN room_has_word ON words.id = room_has_word.word_id 
        WHERE room_has_word.room_id = ? AND isactive = 1`,
        [roomid]
      );
      
      if (rows.length > 0) {
        return res.status(200).json(rows);
      } else {
        return res.status(200).json([{ success: 0 }]);
      }
    } catch (error) {
      console.error('Error al obtener palabras por sala:', error);
      return res.status(500).json({ 
        success: 0,
        message: 'Error al obtener palabras por sala',
        error: error.message 
      });
    }
  },

  // Crear una nueva palabra
exports.createWord = async (req, res) => {
    try {
      const { word, past, participle, spanish, type, user_id = 1 } = req.body;
      
      if (!word || !past || !participle || !spanish || !type) {
        return res.status(400).json({ 
          success: 0,
          message: 'Todos los campos son requeridos' 
        });
      }

      const [result] = await db.query(
        'INSERT INTO words (word, past, participle, spanish, type, user_id) VALUES (?, ?, ?, ?, ?, ?)',
        [word, past, participle, spanish, type, user_id]
      );
      
      if (result.affectedRows) {
        return res.status(201).json({ 
          success: 1,
          message: 'Palabra creada exitosamente',
          id: result.insertId 
        });
      } else {
        return res.status(400).json({ 
          success: 0,
          message: 'No se pudo crear la palabra' 
        });
      }
    } catch (error) {
      console.error('Error al crear palabra:', error);
      return res.status(500).json({ 
        success: 0,
        message: 'Error al crear palabra',
        error: error.message 
      });
    }
  },

  // Actualizar una palabra existente
exports.updateWord = async (req, res) => {
    try {
      const { id, word, past, participle, spanish, type } = req.body;
      
      if (!id || !word || !past || !participle || !spanish || !type) {
        return res.status(400).json({ 
          success: 0,
          message: 'Todos los campos son requeridos' 
        });
      }

      const [result] = await db.query(
        'UPDATE words SET word = ?, past = ?, participle = ?, spanish = ?, type = ? WHERE id = ?',
        [word, past, participle, spanish, type, id]
      );
      
      if (result.affectedRows) {
        return res.status(200).json({ 
          success: 1,
          message: 'Palabra actualizada exitosamente' 
        });
      } else {
        return res.status(404).json({ 
          success: 0,
          message: 'Palabra no encontrada' 
        });
      }
    } catch (error) {
      console.error('Error al actualizar palabra:', error);
      return res.status(500).json({ 
        success: 0,
        message: 'Error al actualizar palabra',
        error: error.message 
      });
    }
  },

  // Eliminar una palabra
exports.deleteWord = async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ 
          success: 0,
          message: 'Se requiere el ID de la palabra' 
        });
      }

      const [result] = await db.query(
        'DELETE FROM words WHERE id = ?',
        [id]
      );
      
      if (result.affectedRows) {
        return res.status(200).json({ 
          success: 1,
          message: 'Palabra eliminada exitosamente' 
        });
      } else {
        return res.status(404).json({ 
          success: 0,
          message: 'Palabra no encontrada' 
        });
      }
    } catch (error) {
      console.error('Error al eliminar palabra:', error);
      return res.status(500).json({ 
        success: 0,
        message: 'Error al eliminar palabra',
        error: error.message 
      });
    }
  }