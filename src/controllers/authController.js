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
    req.session.userRole = user.role;
    req.session.email = user.email;

    // Configurar cookie de sesión
    res.cookie('hangman.sid', req.sessionID, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

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
  console.log('=== LOGOUT DETALLADO ===');
  console.log('Session ID:', req.sessionID);
  console.log('Cookie header:', req.get('cookie'));
  console.log('User ID actual:', req.session?.userId);
  console.log('Session completa:', JSON.stringify(req.session, null, 2));
  console.log('========================');

  // Verificar que hay una sesión válida
  if (!req.session || !req.session.userId) {
    console.log('⚠️ No hay sesión activa para cerrar');

    // Limpiar cualquier cookie que pueda existir
    res.clearCookie('connect.sid', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    return res.status(401).json({
      success: false,
      message: 'No hay sesión activa para cerrar',
      debug: {
        sessionExists: !!req.session,
        userId: req.session?.userId,
        sessionId: req.sessionID,
        cookieReceived: !!req.get('cookie')
      }
    });
  }

  const userIdToLogout = req.session.userId;
  console.log(`🔓 Cerrando sesión para usuario: ${userIdToLogout}`);

  // Destruir sesión
  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Error al destruir sesión:', err);
      return res.status(500).json({
        success: false,
        message: 'Error interno al cerrar sesión',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    // Limpiar cookie
    const cookieOptions = {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    };

    if (process.env.NODE_ENV === 'production' && process.env.COOKIE_DOMAIN) {
      cookieOptions.domain = process.env.COOKIE_DOMAIN;
    }

    res.clearCookie('connect.sid', cookieOptions);

    console.log(`✅ Sesión cerrada exitosamente para usuario: ${userIdToLogout}`);

    res.json({
      success: true,
      message: 'Sesión cerrada correctamente',
      loggedOutUserId: userIdToLogout,
      timestamp: new Date().toISOString()
    });
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