const db = require('../config/db');

exports.getAllLists = async (req, res) => {
  const userId = req.query.userId;
  try {
    const rows = await db.query('SELECT * FROM lists WHERE user_id = ?', [userId]);
    
    if (rows.length === 0) {
      return res.json({
        success: true,
        count: 0,
        message: 'No hay listas disponibles para este usuario',
        data: []
      });
    }
    
    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error al obtener listas:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error al obtener listas',
      error: error.message 
    });
  }
}

exports.getListById = async (req, res) => {
  try {
    const listId = req.query.listId;
    
    if (!listId) {
      return res.status(400).json({ error: "Se requiere listId" });
    }

    const query = `
      SELECT * FROM lists 
      WHERE id = ? 
      ORDER BY id DESC
    `;
    
    const results = await db.query(query, [listId]);
    
    res.json(results);
  } catch (error) {
    console.error("Error en getListById:", error);
    res.status(500).json({ 
      error: "Error al obtener lista",
      details: error.message 
    });
  }
},

exports.getWordsByList = async (req, res) => {
    try {
      const listid = req.query.listId;
      
      if (!listid) {
        return res.status(400).json({ 
          success: 0,
          message: 'Se requiere el ID de la lista' 
        });
      }

      const rows = await db.query(
        `SELECT * FROM list_has_word
        WHERE list_id = ?`,
        [listid]
      );
      
      if (rows) {
        return res.status(200).json(rows);
      } else {
        return res.status(200).json([{ success: 0 }]);
      }
    } catch (error) {
      console.error('Error al obtener palabras por lista:', error);
      return res.status(500).json({ 
        success: 0,
        message: 'Error al obtener palabras por lista',
        error: error.message 
      });
    }
},


exports.getAllListsIds = async (req, res) => {
  const listId = req.query.listId;
  try {
    const words = await db.query(
      'SELECT word_id FROM list_has_word WHERE list_id = ?',
      [listId]
  );
  res.json(words);
  } catch (error) {
    console.error('Error al obtener palabras de la lista:', error);
    return res.status(500).json({ 
      success: 0,
      message: 'Error al obtener palabras de la lista',
      error: error.message 
    });
  }
},

exports.checkWord = async (req, res) => {
  try {
      const wordId = req.query.wordId;
      
      if (!wordId || isNaN(wordId)) {
          return res.status(400).json({ 
              success: false,
              message: 'ID de palabra inválido' 
          });
      }

      const listWords = await db.query(`
          SELECT l.id, l.listname 
          FROM lists l
          JOIN list_has_word lhw ON l.id = lhw.list_id
          WHERE lhw.word_id = ?
      `, [wordId]);

      res.json({ 
          success: true,
          inUse: listWords.length > 0,
          usageCount: listWords.length,
          lists: listWords,
          message: listWords.length > 0
              ? 'La palabra está siendo usada en listas'
              : 'La palabra no está en uso'
      });

  } catch (error) {
      console.error('Error al verificar palabra:', error);
      res.status(500).json({ 
          success: false,
          message: 'Error interno al verificar palabra' 
      });
  }
},

exports.addWords = async (req, res) => {
  try {
    const { listId, wordIds } = req.body;
    
    if (!listId || !wordIds || !Array.isArray(wordIds)) {
      return res.status(400).json({ 
        success: 0,
        message: 'Se requiere el ID de la lista y un array de IDs de palabras' 
      });
    }

    if (wordIds.length === 0) {
      return res.status(400).json({ 
        success: 0,
        message: 'No se seleccionaron palabras para agregar' 
      });
    }

    const placeholders = wordIds.map(() => '(?, ?)').join(', ');
    
    const flatValues = wordIds.flatMap(wordId => [parseInt(listId), parseInt(wordId)]);
    
    const result = await db.query(
      `INSERT INTO list_has_word (list_id, word_id) VALUES ${placeholders}`,
      flatValues
    );

    if (result.affectedRows) {
      return res.status(200).json({ 
        success: 1,
        message: `${result.affectedRows} palabras agregadas exitosamente` 
      });
    } else {
      return res.status(400).json({ 
        success: 0,
        message: 'No se pudo agregar las palabras' 
      });
    }
  } catch (error) {
    console.error('Error al agregar palabras:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: 0,
        message: 'Algunas palabras ya están en la lista' 
      });
    }
    
    return res.status(500).json({ 
      success: 0,
      message: 'Error al agregar palabras',
      error: error.message 
    });
  }
},

exports.createList = async (req, res) => {
    try {
        const { listName, description, userId } = req.body;

        if (!listName || !description || !userId) {
            return res.status(400).json({
                success: 0,
                message: 'Todos los campos son requeridos'
            });
        }

        const result = await db.query(
            'INSERT INTO lists (listname, description, user_id) VALUES (?, ?, ?)',
            [listName, description, userId]
        );
        if (result && result.affectedRows) {
            return res.status(201).json({ 
                success: 1,
                message: 'Lista creada exitosamente',
                id: result.insertId 
            });
        } else {
            return res.status(400).json({ 
                success: 0,
                message: 'No se pudo crear la lista' 
            });
        }
    } catch (error) {
        console.error('Error al crear lista:', error);
        return res.status(500).json({ 
            success: 0,
            message: 'Error al crear lista',
            error: error.message 
        });
    }
},

exports.updateList = async (req, res) => {
    try {
      const { id, listName, description } = req.body;
      
      if (!id || !listName || !description) {
        return res.status(400).json({ 
          success: 0,
          message: 'Todos los campos son requeridos' 
        });
      }

      const result = await db.query(
        'UPDATE lists SET listname = ?, description = ? WHERE id = ?',
        [listName, description, id]
      );
      
      if (result.affectedRows) {
        return res.status(200).json({ 
          success: 1,
          message: 'Lista actualizada exitosamente' 
        });
      } else {
        return res.status(404).json({ 
          success: 0,
          message: 'Lista no encontrada' 
        });
      }
    } catch (error) {
      console.error('Error al actualizar lista:', error);
      return res.status(500).json({ 
        success: 0,
        message: 'Error al actualizar lista',
        error: error.message 
      });
    }
},

exports.deleteList = async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ 
          success: 0,
          message: 'Se requiere el ID de la lista' 
        });
      }

      const result = await db.query(
        'DELETE FROM lists WHERE id = ?',
        [id]
      );
      
      if (result.affectedRows) {
        return res.status(200).json({ 
          success: 1,
          message: 'Lista eliminada exitosamente' 
        });
      } else {
        return res.status(404).json({ 
          success: 0,
          message: 'Lista no encontrada' 
        });
      }
    } catch (error) {
      console.error('Error al eliminar lista:', error);
      return res.status(500).json({ 
        success: 0,
        message: 'Error al eliminar lista',
        error: error.message 
      });
    }
}