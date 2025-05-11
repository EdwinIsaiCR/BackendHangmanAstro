// Controlador para la tabla timestamps
const db = require('../config/db');

// Función para obtener un timestamp del servidor
exports.getTimestamp = async (req, res) => {
  try {
    // Insertar un registro de prueba
    await db.query("INSERT INTO timestamps (observ) VALUES('test')");
    
    // Seleccionar todos los registros
    const [timestamps] = await db.query("SELECT * FROM timestamps");
    
    // Verificar si hay registros
    if (timestamps.length > 0) {
      // Truncar la tabla después de obtener los datos
      await db.query("TRUNCATE TABLE timestamps");
      
      // Enviar los datos como respuesta
      return res.status(200).json(timestamps);
    } else {
      return res.status(404).json({ success: 0 });
    }
  } catch (error) {
    console.error('Error al obtener timestamp:', error);
    return res.status(500).json({ 
      success: 0, 
      message: 'Error al procesar la solicitud del timestamp' 
    });
  }
}