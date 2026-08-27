const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.id, t.name, t.created_at,
              COUNT(st.snippet_id)::INTEGER AS snippet_count
       FROM tags t
       LEFT JOIN snippet_tags st ON t.id = st.tag_id
       WHERE t.user_id = $1
       GROUP BY t.id, t.name, t.created_at
       ORDER BY snippet_count DESC, t.name ASC`,
      [req.user.id]
    );

    const tags = result.rows.map(t => ({
      id: t.id,
      name: t.name,
      snippetCount: t.snippet_count,
      createdAt: t.created_at
    }));

    res.json(tags);
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', [
  body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Tag name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name } = req.body;
    const normalizedName = name.trim().toLowerCase();

    const existing = await pool.query(
      'SELECT id FROM tags WHERE user_id = $1 AND name = $2',
      [req.user.id, normalizedName]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Tag already exists' });
    }

    const result = await pool.query(
      `INSERT INTO tags (user_id, name)
       VALUES ($1, $2)
       RETURNING id, name, created_at`,
      [req.user.id, normalizedName]
    );

    const tag = result.rows[0];
    res.status(201).json({
      id: tag.id,
      name: tag.name,
      snippetCount: 0,
      createdAt: tag.created_at
    });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', [
  body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Tag name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { id } = req.params;
    const { name } = req.body;
    const normalizedName = name.trim().toLowerCase();

    const existing = await pool.query(
      'SELECT id FROM tags WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    const duplicate = await pool.query(
      'SELECT id FROM tags WHERE user_id = $1 AND name = $2 AND id != $3',
      [req.user.id, normalizedName, id]
    );

    if (duplicate.rows.length > 0) {
      return res.status(409).json({ error: 'Tag name already exists' });
    }

    const result = await pool.query(
      `UPDATE tags SET name = $1 WHERE id = $2 AND user_id = $3
       RETURNING id, name, created_at`,
      [normalizedName, id, req.user.id]
    );

    const tag = result.rows[0];

    const countResult = await pool.query(
      `SELECT COUNT(snippet_id)::INTEGER AS snippet_count
       FROM snippet_tags WHERE tag_id = $1`,
      [id]
    );

    res.json({
      id: tag.id,
      name: tag.name,
      snippetCount: countResult.rows[0].snippet_count,
      createdAt: tag.created_at
    });
  } catch (error) {
    console.error('Update tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query(
      'SELECT id FROM tags WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    await pool.query(
      'DELETE FROM snippet_tags WHERE tag_id = $1',
      [id]
    );

    await pool.query(
      'DELETE FROM tags WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
