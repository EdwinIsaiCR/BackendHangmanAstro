const db = require('../config/db');

exports.getRoomByCode = async(req, res) => {
    try {
        const roomcode = req.query.roomcode;
        
        if (!roomcode) {
            return res.status(400).json({
                success: false,
                message: "Room code is required"
            });
        }

        const query = "SELECT * FROM room WHERE roomcode = ?";
        const values = [roomcode];
        const rows = await db.query(query, values);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        // Devolver solo el primer resultado, no un array
        res.json({
            success: true,
            data: rows[0] // Devuelve directamente el objeto
        });
    } catch(error) {
        console.error("Error getting room by code:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

exports.newGame = async(req, res) => {
    try {
        const { userid, roomid } = req.body;
        
        if (!userid || !roomid) {
            return res.status(400).json({
                success: false,
                message: "User ID and Room ID are required"
            });
        }

        // Insert new game room entry
        const insertQuery = "INSERT INTO gameroom (user_id, room_id) VALUES (?, ?)";
        const insertValues = [userid, roomid];
        await db.query(insertQuery, insertValues);

        // Get the created game room entry
        const selectQuery = "SELECT * FROM gameroom WHERE room_id = ? AND user_id = ? ORDER BY id DESC";
        const selectValues = [roomid, userid];
        const rows = await db.query(selectQuery, selectValues);
        
        if (rows.length > 0) {
            res.json({
                success: true,
                data: rows
            });
        } else {
            res.json({
                success: false,
                message: "Failed to create game room entry"
            });
        }
    } catch (error) {
        console.error("Error creating new game:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// Add game detail (word attempt)
exports.addGameDetail = async(req, res) => {
    try {
        const { 
            gameroomid, 
            wordid, 
            roomid, 
            verbAdivinado, 
            tipo, 
            pasado, 
            timeperword, 
            puntos 
        } = req.body;
        
        if (!gameroomid || !wordid || !roomid) {
            return res.status(400).json({
                success: false,
                message: "Game room ID, word ID, and room ID are required"
            });
        }

        // Insert game detail
        const insertDetailQuery = `INSERT INTO detailgameroom 
            (gameroom_id, word_id, guessed, typecorrect, pastcorrect, timeperword, pointsperword) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const insertDetailValues = [gameroomid, wordid, verbAdivinado, tipo, pasado, timeperword, puntos];
        await db.query(insertDetailQuery, insertDetailValues);

        // Get current word statistics
        const selectWordQuery = "SELECT * FROM room_has_word WHERE word_id = ? AND room_id = ?";
        const selectWordValues = [wordid, roomid];
        const wordRows = await db.query(selectWordQuery, selectWordValues);
        
        if (wordRows.length > 0) {
            const wordData = wordRows[0];
            const usada = wordData.used + 1;
            const adivinado = wordData.guessed + verbAdivinado;
            const tipoFail = wordData.typefails + (tipo == 1 ? 0 : 1);
            const pasadoFail = wordData.pastfails + (pasado == 1 ? 0 : 1);

            // Update word statistics
            const updateWordQuery = `UPDATE room_has_word 
                SET used = ?, guessed = ?, typefails = ?, pastfails = ? 
                WHERE word_id = ? AND room_id = ?`;
            const updateWordValues = [usada, adivinado, tipoFail, pasadoFail, wordid, roomid];
            await db.query(updateWordQuery, updateWordValues);
        }

        res.json({
            success: true,
            message: "Game detail added successfully"
        });
    } catch (error) {
        console.error("Error adding game detail:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// Finish game
exports.finishGame = async(req, res) => {
    try {
        const { userid, idgr, puntos, rindio, status } = req.body;
        
        if (!userid || !idgr) {
            return res.status(400).json({
                success: false,
                message: "User ID and game room ID are required"
            });
        }

        // Update game room with final data
        const updateGameQuery = `UPDATE gameroom 
            SET score = ?, timestampend = CURRENT_TIMESTAMP, 
                totaltime = TIMEDIFF(timestampend, timestampstart), status = ? 
            WHERE id = ?`;
        const updateGameValues = [puntos, status, idgr];
        await db.query(updateGameQuery, updateGameValues);

        // Get user's current total time played
        const getUserTimeQuery = "SELECT SEC_TO_TIME(SUM(TIME_TO_SEC(hrsjugadas))) AS totaltime FROM users WHERE id = ?";
        const getUserTimeValues = [userid];
        const userTimeRows = await db.query(getUserTimeQuery, getUserTimeValues);
        
        let hrsgrd = '00:00:00';
        if (userTimeRows.length > 0) {
            hrsgrd = userTimeRows[0].totaltime || '00:00:00';
        }

        // Get game time for this session
        const getGameTimeQuery = "SELECT SEC_TO_TIME(SUM(TIME_TO_SEC(totaltime))) AS gameTime FROM gameroom WHERE id = ?";
        const getGameTimeValues = [idgr];
        const gameTimeRows = await db.query(getGameTimeQuery, getGameTimeValues);
        
        let hrsjged = '00:00:00';
        if (gameTimeRows.length > 0) {
            hrsjged = gameTimeRows[0].gameTime || '00:00:00';
        }

        // Update user's total time played
        const updateUserTimeQuery = "UPDATE users SET hrsjugadas = ADDTIME(?, ?) WHERE id = ?";
        const updateUserTimeValues = [hrsgrd, hrsjged, userid];
        await db.query(updateUserTimeQuery, updateUserTimeValues);

        res.json({
            success: true,
            message: "Game finished successfully"
        });
    } catch (error) {
        console.error("Error finishing game:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// Get room leaderboard
exports.getRoomLeaderboard = async(req, res) => {
    try {
        const { idrm } = req.body;
        
        if (!idrm) {
            return res.status(400).json({
                success: false,
                message: "Room ID is required"
            });
        }

        const query = `SELECT gameroom.*, users.name 
            FROM gameroom 
            JOIN users ON gameroom.user_id = users.id 
            WHERE gameroom.room_id = ? 
            ORDER BY gameroom.score DESC`;
        const values = [idrm];
        const rows = await db.query(query, values);
        
        if (rows.length > 0) {
            res.json({
                success: true,
                data: rows[0]
            });
        } else {
            res.json({
                success: false,
                message: "No games found for this room"
            });
        }
    } catch (error) {
        console.error("Error getting room leaderboard:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}