const db = require('../config/db');

exports.getAllRooms = async (req, res) => {
  try {
      const userId = req.query.userId;
      
      if (!userId || isNaN(userId)) {
          return res.status(400).json({
              success: false,
              message: "Se requiere un userId válido"
          });
      }

      const query = `
          SELECT 
              id,
              roomname,
              description,
              lives,
              CAST(clue AS UNSIGNED) as clue,
              clueafter,
              CAST(feedback AS UNSIGNED) as feedback,
              CAST(random AS UNSIGNED) as random,
              CAST(isopen AS UNSIGNED) as isopen,
              CAST(isgeneral AS UNSIGNED) as isgeneral,
              lists_id,
              hasstartdatetime,
              startdatetime,
              hasenddatetime,
              enddatetime,
              roomcode,
              qrstring,
              user_id,
              timestamp
          FROM room 
          WHERE user_id = ?
          ORDER BY timestamp DESC
      `;

      const results = await db.query(query, [userId]);

      const processRooms = (rooms) => {
          return rooms.map(room => ({
              ...room,
              clue: room.clue?.data?.[0] || room.clue || 0,
              feedback: room.feedback?.data?.[0] || room.feedback || 0,
              random: room.random?.data?.[0] || room.random || 0,
              isopen: room.isopen?.data?.[0] || room.isopen || 0,
              isgeneral: room.isgeneral?.data?.[0] || room.isgeneral || 0,
              hasstartdatetime: room.hasstartdatetime?.data?.[0] || room.hasstartdatetime || 0,
              hasenddatetime: room.hasenddatetime?.data?.[0] || room.hasenddatetime || 0
          }));
      };

      const processedRooms = processRooms(results);

      return res.json({
          success: true,
          count: processedRooms.length,
          data: processedRooms
      });

  } catch (error) {
      console.error('Error al obtener salas:', error);
      return res.status(500).json({ 
          success: false,
          message: 'Error al obtener salas',
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const roomId = req.query.roomId;
    
    if (!roomId || isNaN(roomId)) {
      return res.status(400).json({ 
        success: false,
        message: "Se requiere un roomId válido" 
      });
    }

    const query = `
      SELECT 
        id,
        roomname,
        description,
        lives,
        CAST(clue AS UNSIGNED) as clue,
        clueafter,
        CAST(feedback AS UNSIGNED) as feedback,
        CAST(random AS UNSIGNED) as random,
        CAST(isopen AS UNSIGNED) as isopen,
        CAST(isgeneral AS UNSIGNED) as isgeneral,
        lists_id,
        CAST(hasstartdatetime AS UNSIGNED) as hasstartdatetime,
        startdatetime,
        CAST(hasenddatetime AS UNSIGNED) as hasenddatetime,
        enddatetime,
        roomcode,
        qrstring,
        user_id,
        timestamp
      FROM room 
      WHERE id = ?
      LIMIT 1
    `;
    
    const [rows] = await db.query(query, [roomId]);
    
    if (!rows) {
      return res.status(404).json({
        success: false,
        message: "Sala no encontrada"
      });
    }

    const processRoom = (room) => ({
      ...room,
      clue: room.clue?.data?.[0] ?? room.clue,
      feedback: room.feedback?.data?.[0] ?? room.feedback,
      random: room.random?.data?.[0] ?? room.random,
      isopen: room.isopen?.data?.[0] ?? room.isopen,
      isgeneral: room.isgeneral?.data?.[0] ?? room.isgeneral,
      hasstartdatetime: room.hasstartdatetime?.data?.[0] ?? room.hasstartdatetime,
      hasenddatetime: room.hasenddatetime?.data?.[0] ?? room.hasenddatetime
    });

    const processedRoom = processRoom(rows);

    return res.json({
      success: true,
      data: processedRoom
    });

  } catch (error) {
    console.error("Error en getRoomById:", error);
    return res.status(500).json({ 
      success: false,
      message: "Error al obtener sala",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.getPlayers = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    
    if (!roomId) {
      return res.status(400).json({ 
        success: false,
        message: 'No se proporcionó el ID de la sala' 
      });
    }

    const players = await db.query('SELECT gameroom.*, users.name FROM gameroom JOIN users ON gameroom.user_id = users.id WHERE gameroom.room_id = ? ORDER BY gameroom.score DESC', [roomId]);
    res.json({ success: true, players });
  } catch (error) {
    console.error('Error al obtener jugadores de la sala:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener jugadores de la sala',
      error: error.message
    });
  }
};

exports.getWords = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    
    if (!roomId) {
      return res.status(400).json({ 
        success: false,
        message: 'No se proporcionó el ID de la sala' 
      });
    }

    const words = await db.query('SELECT * FROM room_has_word WHERE room_id = ?', [roomId]);
    res.json({ success: true, words });
  } catch (error) {
    console.error('Error al obtener palabras de la sala:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener palabras de la sala',
      error: error.message
    });
  }
};

exports.infoUser = async (req, res) => {
    try {
        const gameroomid = req.params.gameroomid;
        
        if (!gameroomid) {
            return res.status(400).json({ 
                success: false,
                message: 'No se proporcionó el ID del jugador' 
            });
        }

        const player = await db.query('SELECT detailgameroom.*, words.word FROM detailgameroom JOIN words ON detailgameroom.word_id = words.id WHERE detailgameroom.gameroom_id = ? ORDER BY detailgameroom.pointsperword DESC', [gameroomid]);
        res.json({ success: true, player });
    } catch (error) {
        console.error('Error al obtener datos del jugador:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al obtener datos del jugador',
            error: error.message
        });
    }
};

exports.checkList = async (req, res) => {
  try {
      const listId = req.query.listId;
      
      if (!listId || isNaN(listId)) {
          return res.status(400).json({ 
              success: false,
              message: 'ID de lista inválido' 
          });
      }

      const rooms = await db.query(
          'SELECT id, roomname FROM room WHERE lists_id = ?',
          [listId]
      );

      res.json({ 
          success: true,
          inUse: rooms.length > 0,
          usageCount: rooms.length,
          rooms: rooms,
          message: rooms.length > 0 
              ? 'La lista está siendo usada en salas' 
              : 'La lista no está en uso'
      });

  } catch (error) {
      console.error('Error al verificar lista:', error);
      res.status(500).json({ 
          success: false,
          message: 'Error interno al verificar lista' 
      });
  }
}

exports.checkCode = async (req, res) => {
  try {
    const code = req.query.code;
    
    if (!code) {
      return res.status(400).json({
        success: 0,
        message: 'Parámetro "code" es requerido'
      });
    }
    
    const query = `SELECT roomcode FROM room WHERE roomcode = ?`;
    const result = await db.query(query, [code]);
    
    return res.status(200).json({
      success: 1,
      exists: result.length > 0
    });
    
  } catch (error) {
    console.error('Error al verificar código de sala:', error);
    return res.status(500).json({
      success: 0,
      message: 'Error al verificar código de sala',
      error: error.message
    });
  }
}

exports.checkRoom = async (req, res) => {
  try {
    const { roomcode, userId } = req.body;

    const room = await db.query(
      'SELECT id, isopen, hasstartdatetime, startdatetime, hasenddatetime, enddatetime FROM room WHERE roomcode = ?', 
      [roomcode]
    );

    if (room.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'No se encontró la sala' 
      });
    }

    const roomData = room[0];
    const roomId = roomData.id;
    const now = new Date();

    // Verificar si la sala está cerrada
    if (!roomData.isopen) {
      return res.json({ 
        success: false,
        canJoin: false,
        message: 'La sala está cerrada' 
      });
    }

    // Verificar horario de inicio si está configurado
    if (roomData.hasstartdatetime && roomData.startdatetime) {
      const startTime = new Date(roomData.startdatetime);
      if (now < startTime) {
        return res.json({ 
          success: false,
          canJoin: false,
          startdatetime: roomData.startdatetime,
          message: `La sala no está disponible aún. Se abrirá el ${startTime.toLocaleString()}`
        });
      }
    }

    // Verificar horario de cierre si está configurado
    if (roomData.hasenddatetime && roomData.enddatetime) {
      const endTime = new Date(roomData.enddatetime);
      if (now > endTime) {
        return res.json({ 
          success: false,
          canJoin: false,
          enddatetime: roomData.enddatetime,
          message: `La sala ya cerró. El período terminó el ${endTime.toLocaleString()}`
        });
      }
    }

    // Verificar si la sala tiene palabras
    const words = await db.query(
      'SELECT word_id FROM room_has_word WHERE room_id = ?',
      [roomId]
    );

    if (words.length === 0) {
      return res.json({ 
        success: false,
        canJoin: false,
        message: 'La sala no tiene palabras seleccionadas' 
      });
    }

    // Si pasa todas las validaciones, permitir unirse
    res.json({ 
      success: true,
      canJoin: true,
      message: 'Puedes unirte a la sala' 
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al verificar la sala' 
    });
  }
}

exports.createRoom = async (req, res) => {
  const { 
      userId,
      roomName, 
      roomDescription, 
      lives, 
      clue, 
      clueafter, 
      feedback, 
      random, 
      isOpen, 
      isgeneral, 
      lists_id, 
      hasstartdatetime, 
      startdatetime, 
      hasenddatetime, 
      enddatetime,
      roomcode,
      qrcode
  } = req.body;

  const formattedStartDatetime = startdatetime && startdatetime !== 'null' ? startdatetime : null;
  const formattedEndDatetime = enddatetime && enddatetime !== 'null' ? enddatetime : null;

  try {
      const result = await db.query(
          'INSERT INTO room (user_id, roomname, description, lives, clue, clueafter, feedback, random, isopen, isgeneral, lists_id, hasstartdatetime, startdatetime, hasenddatetime, enddatetime, roomcode, qrstring) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
              userId,
              roomName, 
              roomDescription, 
              lives, 
              clue, 
              clueafter, 
              feedback, 
              random, 
              isOpen, 
              isgeneral, 
              lists_id, 
              hasstartdatetime, 
              formattedStartDatetime, 
              hasenddatetime, 
              formattedEndDatetime,
              roomcode,
              qrcode
          ]
      );
      
      const roomId = result.insertId || result[0]?.insertId || result?.id;

      if (!roomId) {
          throw new Error('No se pudo obtener el ID de la sala creada');
      }

      res.json({
          success: true,
          roomId: roomId,
          data: result
      });
  } catch (error) {
      console.error('Error al crear sala:', error);
      return res.status(500).json({ 
          success: false,
          message: 'Error al crear sala',
          error: error.message 
      });
  }
}

exports.addWords = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const { roomId, wordIds } = req.body;

    if (!wordIds || !wordIds.length) {
      return res.status(400).json({ 
        success: false,
        message: 'No se proporcionaron palabras para agregar' 
      });
    }

    const query = `
      INSERT INTO room_has_word 
      (room_id, word_id, used, guessed, typefails, pastfails) 
      VALUES (?, ?, 0, 0, 0, 0)
    `;

    for (const wordId of wordIds) {
      await connection.query(query, [roomId, wordId]);
    }

    await connection.commit();
    res.json({ success: true });
    
  } catch (error) {
    console.error('Error detallado:', error);
    
    if (connection) {
      await connection.rollback().catch(rollbackError => {
        console.error('Error al hacer rollback:', rollbackError);
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error al agregar palabras a la sala',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { 
      id,
      roomName, 
      roomDescription, 
      lives, 
      clue, 
      clueafter, 
      feedback, 
      random, 
      isOpen, 
      isgeneral, 
      lists_id, 
      hasstartdatetime, 
      startdatetime, 
      hasenddatetime, 
      enddatetime 
  } = req.body;

  const result = await db.query(
    'UPDATE room SET roomname = ?, description = ?, lives = ?, clue = ?, clueafter = ?, feedback = ?, random = ?, isopen = ?, isgeneral = ?, lists_id = ?, hasstartdatetime = ?, startdatetime = ?, hasenddatetime = ?, enddatetime = ? WHERE id = ?',
    [
        roomName, 
        roomDescription, 
        lives, 
        clue, 
        clueafter, 
        feedback, 
        random, 
        isOpen, 
        isgeneral, 
        lists_id, 
        hasstartdatetime, 
        startdatetime, 
        hasenddatetime, 
        enddatetime,
        id
    ]
  );
  
  if (result.affectedRows) {
    return res.status(200).json({ 
      success: 1,
      message: 'Sala actualizada exitosamente' 
    });
  } else {
    return res.status(404).json({ 
      success: 0,
      message: 'Sala no encontrada' 
    });
  }
  } catch (error) {
    console.error('Error al actualizar sala:', error);
    return res.status(500).json({ 
      success: 0,
      message: 'Error al actualizar sala',
      error: error.message 
    });
  }
}

exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        success: 0,
        message: 'Se requiere el ID de la sala' 
      });
    }

    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      const [gameroomIds] = await connection.query(
        'SELECT id FROM gameroom WHERE room_id = ?',
        [id]
      );

      if (gameroomIds && gameroomIds.length > 0) {
        for (const row of gameroomIds) {
          await connection.query(
            'DELETE FROM detailgameroom WHERE gameroom_id = ?',
            [row.id]
          );
        }
      }

      await connection.query(
        'DELETE FROM gameroom WHERE room_id = ?',
        [id]
      );
      await connection.query(
        'DELETE FROM room_has_word WHERE room_id = ?',
        [id]
      );

      const [result] = await connection.query(
        'DELETE FROM room WHERE id = ?',
        [id]
      );

      await connection.commit();
      connection.release();

      if (result.affectedRows) {
        return res.status(200).json({ 
          success: 1,
          message: 'Sala y todos sus datos relacionados eliminados exitosamente' 
        });
      } else {
        return res.status(404).json({ 
          success: 0,
          message: 'Sala no encontrada' 
        });
      }
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error al eliminar sala:', error);
    return res.status(500).json({ 
      success: 0,
      message: 'Error al eliminar sala',
      error: error.message 
    });
  }
};

exports.deleteWords = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    
    if (!roomId) {
      return res.status(400).json({ 
        success: false,
        message: 'No se proporcionó el ID de la sala' 
      });
    }

    await db.query('DELETE FROM room_has_word WHERE room_id = ?', [roomId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar palabras de la sala:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al eliminar palabras de la sala',
      error: error.message
    });
  }
};