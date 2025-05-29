// controllers/wordController.js
const db = require('../config/db');

exports.getAllWords = async (req, res) => {
  try {
    console.log("Query params recibidos:", req.query); // Debug
    
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ error: "Se requiere userId" });
    }

    // Ejemplo de consulta - ajusta según tu esquema de BD
    const query = `
      SELECT * FROM words 
      WHERE user_id = ? 
      ORDER BY id DESC
    `;
    
    const results = await db.query(query, [userId]);
    
    res.json(results);
  } catch (error) {
    console.error("Error en getAllWords:", error);
    res.status(500).json({ 
      error: "Error al obtener palabras",
      details: error.message 
    });
  }
};

exports.getAllWordsIds = async (req, res) => {
  try {
    console.log("Query params recibidos:", req.query); // Debug
    
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ error: "Se requiere userId" });
    }

    // Ejemplo de consulta - ajusta según tu esquema de BD
    const query = `
      SELECT id FROM words 
      WHERE user_id = ? 
      ORDER BY id DESC
    `;
    
    const results = await db.query(query, [userId]);
    
    res.json(results);
  } catch (error) {
    console.error("Error en getAllWords:", error);
    res.status(500).json({ 
      error: "Error al obtener palabras",
      details: error.message 
    });
  }
};

exports.getWordById = async (req, res) => {
  try {
    console.log("Query params recibidos:", req.query); // Debug
    
    const wordId = req.query.wordId;
    
    if (!wordId) {
      return res.status(400).json({ error: "Se requiere wordId" });
    }

    // Ejemplo de consulta - ajusta según tu esquema de BD
    const query = `
      SELECT * FROM words 
      WHERE id = ? 
      ORDER BY id DESC
    `;
    
    const results = await db.query(query, [wordId]);
    
    res.json(results);
  } catch (error) {
    console.error("Error en getWordById:", error);
    res.status(500).json({ 
      error: "Error al obtener palabra",
      details: error.message 
    });
  }
};

  // Obtener palabras por room_id (equivalente a wrdRoomLeer)
  exports.getWordsByRoom = async (req, res) => {
    try {
      const { roomid } = req.body; // Ahora se obtiene del body
      
      if (!roomid) {
        return res.status(400).json({ 
          success: 0,
          message: 'Se requiere el ID de la sala en el cuerpo de la petición' 
        });
      }
  
      const rows = await db.query(
        `SELECT words.* FROM words 
        JOIN room_has_word ON words.id = room_has_word.word_id 
        WHERE room_has_word.room_id = ? AND words.isactive = 1`,
        [roomid]
      );
      
      if (rows.length > 0) {
        return res.status(200).json(rows);
      } else {
        return res.status(200).json([]); // Devuelve array vacío en lugar de objeto
      }
    } catch (error) {
      console.error('Error al obtener palabras por sala:', error);
      return res.status(500).json({ 
        success: 0,
        message: 'Error al obtener palabras por sala',
        error: error.message 
      });
    }
  };

  // Crear una nueva palabra
exports.createWord = async (req, res) => {
    try {
      const { word, spanish, type, clue, simplepast, example, userId } = req.body;
      
      if (!word || !spanish || !type || !clue || !simplepast || !example || !userId) {
        return res.status(400).json({ 
          success: 0,
          message: 'Todos los campos son requeridos' 
        });
      }

      const result = await db.query(
        'INSERT INTO words (isactive, word, spanish, type, clue, simplepast, example, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [1, word, spanish, type, clue, simplepast, example, userId]
      );
      
      if (result) {
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
      const { id, word, type, spanish, clue, simplepast, example } = req.body;
      
      if (!id || !word || !spanish || !type) {
        return res.status(400).json({ 
          success: 0,
          message: 'Todos los campos son requeridos' 
        });
      }

      const result = await db.query(
        'UPDATE words SET word = ?, type = ?, spanish = ?, clue = ?, simplepast = ?, example = ? WHERE id = ?',
        [word, type, spanish, clue, simplepast, example, id]
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

      const result = await db.query(
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

exports.failsType = async (req, res) => {
    try {
        const { roomId } = req.params;
        
        if (!roomId) {
            return res.status(400).json({ 
                success: 0,
                message: 'Se requiere el ID de la sala' 
            });
        }

        const result = await db.query(
            'SELECT words.*, room_has_word.typefails FROM words JOIN room_has_word ON words.id = room_has_word.word_id WHERE room_has_word.room_id = ? ORDER BY room_has_word.typefails DESC',
            [roomId]
        );
        
        if (result.length > 0) {
            return res.status(200).json(result);
        } else {
            return res.status(200).json([]); // Devuelve array vacío en lugar de objeto
        }
    } catch (error) {
        console.error('Error al obtener palabras por sala:', error);
        return res.status(500).json({ 
            success: 0,
            message: 'Error al obtener palabras por sala',
            error: error.message 
        });
    }
}

exports.failsPast = async (req, res) => {
    try {
        const { roomId } = req.params;
        
        if (!roomId) {
            return res.status(400).json({ 
                success: 0,
                message: 'Se requiere el ID de la sala' 
            });
        }

        const result = await db.query(
            'SELECT words.*, room_has_word.pastfails FROM words JOIN room_has_word ON words.id = room_has_word.word_id WHERE room_has_word.room_id = ? ORDER BY room_has_word.pastfails DESC',
            [roomId]
        );
        
        if (result.length > 0) {
            return res.status(200).json(result);
        } else {
            return res.status(200).json([]); // Devuelve array vacío en lugar de objeto
        }
    } catch (error) {
        console.error('Error al obtener palabras por sala:', error);
        return res.status(500).json({ 
            success: 0,
            message: 'Error al obtener palabras por sala',
            error: error.message 
        });
    }
}

exports.getInactiveWords = async (req, res) => {
    try {
        const { roomId } = req.params;
        
        if (!roomId) {
            return res.status(400).json({ 
                success: 0,
                message: 'Se requiere el ID de la sala' 
            });
        }

        const result = await db.query(
            'SELECT words.*, room_has_word.used FROM words JOIN room_has_word ON words.id = room_has_word.word_id WHERE room_has_word.room_id = ? ORDER BY room_has_word.used ASC',
            [roomId]
        );
        
        if (result.length > 0) {
            return res.status(200).json(result);
        } else {
            return res.status(200).json([]); // Devuelve array vacío en lugar de objeto
        }
    } catch (error) {
        console.error('Error al obtener palabras por sala:', error);
        return res.status(500).json({ 
            success: 0,
            message: 'Error al obtener palabras por sala',
            error: error.message 
        });
    }
}
