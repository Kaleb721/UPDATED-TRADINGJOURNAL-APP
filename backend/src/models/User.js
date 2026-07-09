const db = require('../config/database');
const logger = require('../config/logger');

class User {
    static async create({ username, email, passwordHash, fullName }) {
        const query = `
            INSERT INTO users (username, email, password_hash, full_name)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, email, full_name, created_at
        `;
        const values = [username, email, passwordHash, fullName || username];
        
        try {
            const result = await db.query(query, values);
            logger.info(`User created: ${username} (${email})`);
            return result.rows[0];
        } catch (error) {
            logger.error('Error creating user:', error);
            throw error;
        }
    }

    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        try {
            const result = await db.query(query, [email]);
            return result.rows[0] || null;
        } catch (error) {
            logger.error('Error finding user by email:', error);
            throw error;
        }
    }

    static async findByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = $1';
        try {
            const result = await db.query(query, [username]);
            return result.rows[0] || null;
        } catch (error) {
            logger.error('Error finding user by username:', error);
            throw error;
        }
    }

    static async findById(id) {
        const query = 'SELECT id, username, email, full_name, created_at FROM users WHERE id = $1';
        try {
            const result = await db.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            logger.error('Error finding user by ID:', error);
            throw error;
        }
    }
}

module.exports = User;