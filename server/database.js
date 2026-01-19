const { createClient } = require('@libsql/client');
require('dotenv').config();

const url = process.env.TURSO_DATABASE_URL || "file:server/reactor.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({
  url: url,
  authToken: authToken,
});

/**
 * Initialize the database and create tables if they don't exist
 */
async function initDatabase() {
  // Create comments table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      text TEXT NOT NULL,
      date TEXT NOT NULL,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Database initialized' + (authToken ? ' (Turso Remote)' : ' (Local SQLite)'));
}

/**
 * Get all comments (most recent first)
 */
async function getComments(limit = 100) {
  const rs = await db.execute({
    sql: `
      SELECT id, name, text, date
      FROM comments
      ORDER BY created_at DESC
      LIMIT ?
    `,
    args: [limit]
  });
  
  return rs.rows.map(row => ({
    id: row.id,
    name: row.name,
    text: row.text,
    date: row.date
  }));
}

/**
 * Add a new comment
 */
async function addComment(name, text, ipAddress) {
  // Sanitize inputs
  const sanitizedName = name.trim().substring(0, 50);
  const sanitizedText = text.trim().substring(0, 1000);
  const date = new Date().toISOString();

  const rs = await db.execute({
    sql: `
      INSERT INTO comments (name, text, date, ip_address)
      VALUES (?, ?, ?, ?)
    `,
    args: [sanitizedName, sanitizedText, date, ipAddress]
  });

  return {
    id: Number(rs.lastInsertRowid),
    name: sanitizedName,
    text: sanitizedText,
    date
  };
}

/**
 * Get comment count
 */
async function getCommentCount() {
  const rs = await db.execute('SELECT COUNT(*) as count FROM comments');
  return Number(rs.rows[0].count);
}

/**
 * Delete a comment by id (for moderation)
 */
async function deleteComment(id) {
  return await db.execute({
    sql: 'DELETE FROM comments WHERE id = ?',
    args: [id]
  });
}

module.exports = {
  initDatabase,
  getComments,
  addComment,
  getCommentCount,
  deleteComment
};
