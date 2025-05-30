const db = require('../config/db');

exports.getTimestamp = async (req, res) => {
  try {
    await db.query("INSERT INTO timestamps (observ) VALUES('test')");
    const [timestamps] = await db.query("SELECT * FROM timestamps");
    
    if (timestamps.length > 0) {
      await db.query("TRUNCATE TABLE timestamps");
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