const express = require('express');
const pool = require('../db');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { q = '' } = req.query;

    if (!q.trim()) {
      return res.json({ snippets: [], tags: [] });
    }

    const searchTerm = `%${q.trim()}%`;
    let snippets = [];
    let tags = [];

    if (req.user) {
      const snippetsResult = await pool.query(
        `SELECT s.*, array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) AS tags
         FROM snippets s
         LEFT JOIN snippet_tags st ON s.id = st.snippet_id
         LEFT JOIN tags t ON st.tag_id = t.id
         WHERE s.user_id = $1 AND (
           s.title ILIKE $2 OR
           s.description ILIKE $2 OR
           s.code ILIKE $2 OR
           s.language ILIKE $2
         )
         GROUP BY s.id
         ORDER BY s.created_at DESC
         LIMIT 50`,
        [req.user.id, searchTerm]
      );

      snippets = snippetsResult.rows.map(s => ({
        id: s.id,
        title: s.title,
        code: s.code,
        language: s.language,
        description: s.description,
        source: s.source,
        isFavorite: s.is_favorite,
        visibility: s.visibility,
        copyCount: s.copy_count,
        tags: s.tags || [],
        createdAt: s.created_at,
        updatedAt: s.updated_at
      }));

      const tagsResult = await pool.query(
        `SELECT t.id, t.name, COUNT(st.snippet_id)::INTEGER AS snippet_count
         FROM tags t
         LEFT JOIN snippet_tags st ON t.id = st.tag_id
         WHERE t.user_id = $1 AND t.name ILIKE $2
         GROUP BY t.id, t.name
         ORDER BY snippet_count DESC
         LIMIT 20`,
        [req.user.id, searchTerm]
      );

      tags = tagsResult.rows.map(t => ({
        id: t.id,
        name: t.name,
        snippetCount: t.snippet_count
      }));
    } else {
      const snippetsResult = await pool.query(
        `SELECT s.*, array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) AS tags
         FROM snippets s
         LEFT JOIN snippet_tags st ON s.id = st.snippet_id
         LEFT JOIN tags t ON st.tag_id = t.id
         WHERE s.visibility = 'public' AND (
           s.title ILIKE $1 OR
           s.description ILIKE $1 OR
           s.code ILIKE $1 OR
           s.language ILIKE $1
         )
         GROUP BY s.id
         ORDER BY s.created_at DESC
         LIMIT 50`,
        [searchTerm]
      );

      snippets = snippetsResult.rows.map(s => ({
        id: s.id,
        title: s.title,
        code: s.code,
        language: s.language,
        description: s.description,
        tags: s.tags || [],
        createdAt: s.created_at
      }));

      const tagsResult = await pool.query(
        `SELECT t.id, t.name, COUNT(st.snippet_id)::INTEGER AS snippet_count
         FROM tags t
         JOIN snippet_tags st ON t.id = st.tag_id
         JOIN snippets s ON st.snippet_id = s.id
         WHERE s.visibility = 'public' AND t.name ILIKE $1
         GROUP BY t.id, t.name
         ORDER BY snippet_count DESC
         LIMIT 20`,
        [searchTerm]
      );

      tags = tagsResult.rows.map(t => ({
        id: t.id,
        name: t.name,
        snippetCount: t.snippet_count
      }));
    }

    res.json({ snippets, tags });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
