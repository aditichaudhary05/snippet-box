const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    const snippetCountResult = await pool.query(
      'SELECT COUNT(*)::INTEGER AS count FROM snippets WHERE user_id = $1',
      [userId]
    );

    const tagCountResult = await pool.query(
      'SELECT COUNT(*)::INTEGER AS count FROM tags WHERE user_id = $1',
      [userId]
    );

    const favoritesCountResult = await pool.query(
      'SELECT COUNT(*)::INTEGER AS count FROM snippets WHERE user_id = $1 AND is_favorite = true',
      [userId]
    );

    const languagesResult = await pool.query(
      `SELECT language, COUNT(*)::INTEGER AS count
       FROM snippets
       WHERE user_id = $1
       GROUP BY language
       ORDER BY count DESC`,
      [userId]
    );

    const publicCountResult = await pool.query(
      'SELECT COUNT(*)::INTEGER AS count FROM snippets WHERE user_id = $1 AND visibility = $2',
      [userId, 'public']
    );

    const collectionsCountResult = await pool.query(
      'SELECT COUNT(*)::INTEGER AS count FROM collections WHERE user_id = $1',
      [userId]
    );

    const totalCopiesResult = await pool.query(
      'SELECT COALESCE(SUM(copy_count), 0)::INTEGER AS total FROM snippets WHERE user_id = $1',
      [userId]
    );

    const topSnippetsResult = await pool.query(
      `SELECT id, title, language, copy_count
       FROM snippets
       WHERE user_id = $1
       ORDER BY copy_count DESC
       LIMIT 5`,
      [userId]
    );

    res.json({
      snippetCount: snippetCountResult.rows[0].count,
      tagCount: tagCountResult.rows[0].count,
      favoritesCount: favoritesCountResult.rows[0].count,
      publicCount: publicCountResult.rows[0].count,
      collectionsCount: collectionsCountResult.rows[0].count,
      totalCopies: totalCopiesResult.rows[0].total,
      languages: languagesResult.rows.map(l => ({
        name: l.language,
        count: l.count
      })),
      topSnippets: topSnippetsResult.rows.map(s => ({
        id: s.id,
        title: s.title,
        language: s.language,
        copyCount: s.copy_count
      }))
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
