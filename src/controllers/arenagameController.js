// Controlador para la tabla arenagame
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

// Crear un nuevo juego (solo con el nombre del jugador)
exports.nuevoJuego = async (req, res) => {
  try {
    const { nombre } = req.body;
    
    // Insertar el nuevo jugador
    await db.query("INSERT INTO arenagame(player) VALUES(?)", [nombre]);
    
    // Obtener el juego recién creado
    const juego = await db.query("SELECT * FROM arenagame WHERE id = (SELECT MAX(id) FROM arenagame)");
    
    return res.status(200).json(juego);
  } catch (error) {
    console.error('Error al crear nuevo juego:', error);
    return res.status(500).json({ 
      success: 0, 
      message: 'Error al crear nuevo juego' 
    });
  }
},

// Finalizar un juego
exports.finalizarJuego = async (req, res) => {
  try {
    const { id, puntos, rindio } = req.body;
    
    // Actualizar el registro con los datos finales
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

// Obtener la tabla general
exports.obtenerTablaGeneral = async (req, res) => {
  try {
    // Obtener todos los registros ordenados por puntuación y tiempo
    const tabla = await db.query(
      "SELECT * FROM arenagame ORDER by score DESC, totaltime ASC"
    );
    
    if (tabla.length > 0) {
      return res.status(200).json(tabla);
    } else {
      return res.status(404).json([{ success: 0 }]);
    }
  } catch (error) {
    console.error('Error al obtener tabla general:', error);
    return res.status(500).json({ 
      success: 0, 
      message: 'Error al obtener tabla general' 
    });
  }
}

