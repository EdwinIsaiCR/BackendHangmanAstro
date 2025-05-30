const db = require('../config/db');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;


    console.log(email);
    console.log(password);

    // Verificar credenciales en la base de datos
    const users = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);

    if (users === undefined || users.length === 0) {
      return res.status(401).json({ success: false, message: 'Email o contraseña incorrectos' });
    }

    const user = users[0];

    console.log(user);

    // Guardar información del usuario en la sesión
    // Crear sesión
    req.session.userId = user.id;
    req.session.email = user.email;

    // 4. Configurar cookie manualmente ANTES de enviar la respuesta
    res.cookie('hangman.sid', req.sessionID, {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain: process.env.NODE_ENV === 'production' ? '.up.railway.app' : 'localhost'
    });


    console.log(req.session);

    // Datos básicos que enviaremos al frontend
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      hrsPlayed: user.hrsPlayed || '0 hrs'
    };

    res.json({
      success: true,
      message: 'Login exitoso',
      user: userData
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, name, lastname, school, password, rol } = req.body;

    // 1. Verificar si el email ya existe
    const existingUsers = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    // Comprobar si hay resultados (manejar diferentes formatos de respuesta)
    const hasExistingUser = Array.isArray(existingUsers[0])
      ? existingUsers[0].length > 0
      : existingUsers.length > 0;

    if (hasExistingUser) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // 2. Insertar nuevo usuario
    const result = await db.query(
      'INSERT INTO users (email, password, name, lastname, school, roles_id) VALUES (?, ?, ?, ?, ?, ?)',
      [email, password, name, lastname, school, rol]
    );

    // Intentar obtener el ID del usuario recién insertado
    let userId;

    // Verificar la estructura del resultado (varía según la biblioteca MySQL)
    if (Array.isArray(result) && result[0] && result[0].insertId) {
      userId = result[0].insertId;
    } else if (result && result.insertId) {
      userId = result.insertId;
    } else {
      // Si no se puede obtener el ID de insertId, buscar por email
      const newUser = await db.query(
        'SELECT id FROM users WHERE email = ? LIMIT 1',
        [email]
      );

      if (Array.isArray(newUser[0]) && newUser[0].length > 0) {
        userId = newUser[0][0].id;
      } else if (Array.isArray(newUser) && newUser.length > 0) {
        userId = newUser[0].id;
      } else {
        throw new Error('Usuario registrado pero no se pudo obtener su ID');
      }
    }

    // Guardar ID en la sesión y responder éxito
    if (userId) {
      req.session.userId = userId;
      return res.status(201).json({
        success: true,
        userId: userId,
        message: 'Registro exitoso'
      });
    } else {
      throw new Error('No se pudo obtener el ID del nuevo usuario');
    }
  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor: ' + error.message
    });
  }
};

exports.logout = (req, res) => {
  // Opción 1: Verificar por cookie (si existe)
  // Opción 2: Verificar por header de autorización
  const sessionId = req.sessionID || req.headers['x-session-id'];
  
  if (!sessionId) {
    return res.status(401).json({ 
      success: false, 
      message: 'No hay sesión activa para cerrar'
    });
  }

  // Destruir sesión usando el sessionId
  req.sessionStore.destroy(sessionId, (err) => {
    if (err) {
      console.error('Error al destruir sesión:', err);
      return res.status(500).json({ success: false, message: 'Error al cerrar sesión' });
    }
    
    // Limpiar cookie si existe
    res.clearCookie('hangman.sid', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: '.up.railway.app'
    });
    
    res.json({ success: true, message: 'Sesión cerrada correctamente' });
  });
};

exports.forgot = async (req, res) => {
  try {
    const { email } = req.body;
    const users = await db.query('SELECT email, password, name FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    } else {
      return res.status(200).json({
        success: true,
        message: 'Usuario encontrado',
        user: users[0]
      });
    }

  } catch (error) {
    console.error('Error en forgot:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor: ' + error.message
    });
  }
}