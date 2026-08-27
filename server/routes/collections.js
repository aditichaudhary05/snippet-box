const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.description, c.created_at,
              COUNT(sc.snippet_id)::INTEGER AS snippet_count
       FROM collections c
       LEFT JOIN snippet_collections sc ON c.id = sc.collection_id
       WHERE c.user_id = $1
       GROUP BY c.id, c.name, c.description, c.created_at
       ORDER BY c.name ASC`,
      [req.user.id]
    );

    const collections = result.rows.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      snippetCount: c.snippet_count,
      createdAt: c.created_at
    }));

    res.json(collections);
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT c.id, c.name, c.description, c.created_at
       FROM collections c
       WHERE c.id = $1 AND c.user_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    const collection = result.rows[0];

    const snippetsResult = await pool.query(
      `SELECT s.*, array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) AS tags
       FROM snippets s
       JOIN snippet_collections sc ON s.id = sc.snippet_id
       LEFT JOIN snippet_tags st ON s.id = st.snippet_id
       LEFT JOIN tags t ON st.tag_id = t.id
       WHERE sc.collection_id = $1 AND s.user_id = $2
       GROUP BY s.id
       ORDER BY s.title ASC`,
      [id, req.user.id]
    );

    const snippets = snippetsResult.rows.map(s => ({
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

    res.json({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      createdAt: collection.created_at,
      snippets
    });
  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', [
  body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Collection name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, description = '' } = req.body;

    const existing = await pool.query(
      'SELECT id FROM collections WHERE user_id = $1 AND name = $2',
      [req.user.id, name]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Collection with this name already exists' });
    }

    const result = await pool.query(
      `INSERT INTO collections (user_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, created_at`,
      [req.user.id, name, description]
    );

    const collection = result.rows[0];
    res.status(201).json({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      snippetCount: 0,
      createdAt: collection.created_at
    });
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', [
  body('name').optional().trim().isLength({ min: 1, max: 255 }),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { id } = req.params;
    const { name, description } = req.body;

    const existing = await pool.query(
      'SELECT id FROM collections WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    if (name) {
      const duplicate = await pool.query(
        'SELECT id FROM collections WHERE user_id = $1 AND name = $2 AND id != $3',
        [req.user.id, name, id]
      );

      if (duplicate.rows.length > 0) {
        return res.status(409).json({ error: 'Collection with this name already exists' });
      }
    }

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) { updates.push(`name = $${paramIndex++}`); values.push(name); }
    if (description !== undefined) { updates.push(`description = $${paramIndex++}`); values.push(description); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id, req.user.id);

    const result = await pool.query(
      `UPDATE collections SET ${updates.join(', ')}
       WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
       RETURNING id, name, description, created_at`,
      values
    );

    const collection = result.rows[0];

    const countResult = await pool.query(
      `SELECT COUNT(snippet_id)::INTEGER AS snippet_count
       FROM snippet_collections WHERE collection_id = $1`,
      [id]
    );

    res.json({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      snippetCount: countResult.rows[0].snippet_count,
      createdAt: collection.created_at
    });
  } catch (error) {
    console.error('Update collection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query(
      'SELECT id FROM collections WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    await pool.query('DELETE FROM snippet_collections WHERE collection_id = $1', [id]);
    await pool.query('DELETE FROM collections WHERE id = $1 AND user_id = $2', [id, req.user.id]);

    res.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('Delete collection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/snippets', [
  body('snippetIds').isArray({ min: 1, max: 100 }).withMessage('snippetIds must be a non-empty array (max 100)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { id } = req.params;
    const { snippetIds } = req.body;

    const collection = await pool.query(
      'SELECT id FROM collections WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (collection.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    for (const snippetId of snippetIds) {
      const snippet = await pool.query(
        'SELECT id FROM snippets WHERE id = $1 AND user_id = $2',
        [snippetId, req.user.id]
      );

      if (snippet.rows.length > 0) {
        await pool.query(
          `INSERT INTO snippet_collections (snippet_id, collection_id)
           VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [snippetId, id]
        );
      }
    }

    const countResult = await pool.query(
      `SELECT COUNT(snippet_id)::INTEGER AS snippet_count
       FROM snippet_collections WHERE collection_id = $1`,
      [id]
    );

    res.json({
      message: 'Snippets added to collection',
      snippetCount: countResult.rows[0].snippet_count
    });
  } catch (error) {
    console.error('Add snippets to collection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id/snippets/:snippetId', async (req, res) => {
  try {
    const { id, snippetId } = req.params;

    const collection = await pool.query(
      'SELECT id FROM collections WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (collection.rows.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    const result = await pool.query(
      `DELETE FROM snippet_collections
       WHERE collection_id = $1 AND snippet_id = $2`,
      [id, snippetId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Snippet not found in collection' });
    }

    res.json({ message: 'Snippet removed from collection' });
  } catch (error) {
    console.error('Remove snippet from collection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
