const db = require('../config/db');

exports.insertarJuego = async (req, res) => {
  try {
    const { nombre, tsI, tsF, puntos, totaltime } = req.body;
    
    // Insertar registro completo
    await db.query(
      "INSERT INTO arenagame (player, score, totaltime, timestampstart, timestampend) VALUES(?,?,?,?,?)",
      [nombre, puntos, totaltime, tsI, tsF]
    );
    
    return res.status(200).json({ success: 1 });
  } catch (error) {
    console.error('Error al insertar juego:', error);
    return res.status(500).json({ 
      success: 0, 
      message: 'Error al insertar registro de juego' 
    });
  }
},

exports.nuevoJuego = async (req, res) => {
  try {
    const { nombre } = req.body;
    
    await db.query(
      `INSERT INTO arenagame(
        player, 
        score, 
        giveup, 
        timestampstart,
        totaltime
      ) VALUES(?, 0, 0, CURRENT_TIMESTAMP, 0)`, 
      [nombre]
    );
    
    // Obtener el juego recién creado de manera más eficiente
    const juego = await db.query(
      "SELECT * FROM arenagame ORDER BY id DESC LIMIT 1"
    );
    
    return res.status(200).json(juego);
  } catch (error) {
    console.error('Error al crear nuevo juego:', error);
    return res.status(500).json({ 
      success: 0,
      message: 'Error al crear nuevo juego',
      error: error.message,
      sql: error.sql  
    });
  }
},
exports.finalizarJuego = async (req, res) => {
  try {
    const { id, puntos, rindio } = req.body;
    
    await db.query(
      `UPDATE arenagame SET 
        score = ?, 
        giveup = ?,
        timestampend = CURRENT_TIMESTAMP,
        totaltime = TIMEDIFF(timestampend, timestampstart)
      WHERE id = ?`,
      [puntos, rindio, id]
    );
    
    return res.status(200).json({ success: 1 });
  } catch (error) {
    console.error('Error al finalizar juego:', error);
    return res.status(500).json({ 
      success: 0, 
      message: 'Error al finalizar juego' 
    });
  }
},

exports.obtenerTablaGeneral = async (req, res) => {
  try {
    const tabla = await db.query(
      "SELECT * FROM arenagame ORDER by score DESC, totaltime ASC"
    );

    if (tabla.length > 0) {
      return res.status(200).json(tabla);
    } else {
      return res.status(404).json([{ success: 0 }]);
    }
  } catch (error) {
    console.error('Error en tablaGeneral:', error.message);
    console.error(error.stack);
    return res.status(500).json({ 
      success: 0, 
      message: 'Error al obtener tabla general' 
    });
  }
}

