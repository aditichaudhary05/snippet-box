const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/languages', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT language FROM snippets WHERE user_id = $1 AND language IS NOT NULL ORDER BY language`,
      [req.user.id]
    );
    res.json(result.rows.map(r => r.language));
  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/recent', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) AS tags
       FROM snippets s
       LEFT JOIN snippet_tags st ON s.id = st.snippet_id
       LEFT JOIN tags t ON st.tag_id = t.id
       WHERE s.user_id = $1
       GROUP BY s.id
       ORDER BY s.updated_at DESC
       LIMIT 10`,
      [req.user.id]
    );

    const snippets = result.rows.map(s => ({
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

    res.json(snippets);
  } catch (error) {
    console.error('Get recent snippets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const {
      search = '',
      language = '',
      tag = '',
      favorite = '',
      sort = 'created_at_desc',
      page = 1,
      limit = 50
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
    const offset = (pageNum - 1) * limitNum;

    let whereConditions = ['s.user_id = $1'];
    let params = [req.user.id];
    let paramIndex = 2;

    if (search) {
      whereConditions.push(`(
        s.title ILIKE $${paramIndex} OR
        s.description ILIKE $${paramIndex} OR
        s.code ILIKE $${paramIndex} OR
        s.language ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (language) {
      whereConditions.push(`s.language = $${paramIndex}`);
      params.push(language);
      paramIndex++;
    }

    if (favorite === 'true') {
      whereConditions.push('s.is_favorite = true');
    }

    let tagJoin = '';
    if (tag) {
      tagJoin = `JOIN snippet_tags st ON s.id = st.snippet_id JOIN tags t ON st.tag_id = t.id`;
      whereConditions.push(`t.name = $${paramIndex}`);
      params.push(tag);
      paramIndex++;
    }

    const sortOptions = {
      'created_at_desc': 's.created_at DESC',
      'created_at_asc': 's.created_at ASC',
      'title_asc': 's.title ASC',
      'title_desc': 's.title DESC',
      'language_asc': 's.language ASC',
      'language_desc': 's.language DESC',
      'updated_at_desc': 's.updated_at DESC',
      'favorites_first': 's.is_favorite DESC, s.created_at DESC'
    };

    const orderBy = sortOptions[sort] || 's.created_at DESC';

    const whereClause = whereConditions.join(' AND ');

    const countQuery = `
      SELECT COUNT(DISTINCT s.id) as total
      FROM snippets s
      ${tagJoin}
      WHERE ${whereClause}
    `;

    const countResult = await pool.query(countQuery, params);
    const totalCount = parseInt(countResult.rows[0].total);

    params.push(limitNum);
    params.push(offset);

    const query = `
      SELECT s.*, array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) AS tags
      FROM snippets s
      ${tagJoin}
      LEFT JOIN snippet_tags st ON s.id = st.snippet_id
      LEFT JOIN tags t ON st.tag_id = t.id
      WHERE ${whereClause}
      GROUP BY s.id
      ORDER BY ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const result = await pool.query(query, params);

    const snippets = result.rows.map(s => ({
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
      snippets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('Get snippets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT s.*, array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) AS tags
       FROM snippets s
       LEFT JOIN snippet_tags st ON s.id = st.snippet_id
       LEFT JOIN tags t ON st.tag_id = t.id
       WHERE s.id = $1 AND s.user_id = $2
       GROUP BY s.id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    const s = result.rows[0];
    res.json({
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
    });
  } catch (error) {
    console.error('Get snippet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', [
  body('title').trim().isLength({ min: 1, max: 500 }).withMessage('Title is required (max 500 characters)'),
  body('code').trim().isLength({ min: 1 }).withMessage('Code is required'),
  body('language').trim().isLength({ min: 1, max: 100 }).withMessage('Language is required'),
  body('visibility').optional().isIn(['private', 'public']).withMessage('Visibility must be private or public'),
  body('tags').optional().isArray({ max: 20 }).withMessage('Maximum 20 tags allowed'),
  body('source').optional().trim().isLength({ max: 500 }).withMessage('Source URL too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { title, code, language, description = '', source = '', tags = [], visibility = 'private' } = req.body;

    const result = await pool.query(
      `INSERT INTO snippets (user_id, title, code, language, description, source, visibility)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.id, title, code, language, description, source, visibility]
    );

    const snippet = result.rows[0];

    if (tags.length > 0) {
      const limitedTags = tags.slice(0, 20);
      for (const tagName of limitedTags) {
        const normalizedTag = tagName.trim().toLowerCase();
        if (!normalizedTag || normalizedTag.length > 50) continue;

        let tagResult = await pool.query(
          'SELECT id FROM tags WHERE user_id = $1 AND name = $2',
          [req.user.id, normalizedTag]
        );

        let tagId;
        if (tagResult.rows.length === 0) {
          tagResult = await pool.query(
            'INSERT INTO tags (user_id, name) VALUES ($1, $2) RETURNING id',
            [req.user.id, normalizedTag]
          );
          tagId = tagResult.rows[0].id;
        } else {
          tagId = tagResult.rows[0].id;
        }

        await pool.query(
          'INSERT INTO snippet_tags (snippet_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [snippet.id, tagId]
        );
      }
    }

    const fullResult = await pool.query(
      `SELECT s.*, array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) AS tags
       FROM snippets s
       LEFT JOIN snippet_tags st ON s.id = st.snippet_id
       LEFT JOIN tags t ON st.tag_id = t.id
       WHERE s.id = $1
       GROUP BY s.id`,
      [snippet.id]
    );

    const full = fullResult.rows[0];
    res.status(201).json({
      id: full.id,
      title: full.title,
      code: full.code,
      language: full.language,
      description: full.description,
      source: full.source,
      isFavorite: full.is_favorite,
      visibility: full.visibility,
      copyCount: full.copy_count,
      tags: full.tags || [],
      createdAt: full.created_at,
      updatedAt: full.updated_at
    });
  } catch (error) {
    console.error('Create snippet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', [
  body('title').optional().trim().isLength({ min: 1, max: 500 }),
  body('code').optional().trim().isLength({ min: 1 }),
  body('language').optional().trim().isLength({ min: 1, max: 100 }),
  body('visibility').optional().isIn(['private', 'public']).withMessage('Visibility must be private or public'),
  body('tags').optional().isArray({ max: 20 }).withMessage('Maximum 20 tags allowed')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { id } = req.params;
    const { title, code, language, description, source, tags, visibility } = req.body;

    const existing = await pool.query(
      'SELECT * FROM snippets WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) { updates.push(`title = $${paramIndex++}`); values.push(title); }
    if (code !== undefined) { updates.push(`code = $${paramIndex++}`); values.push(code); }
    if (language !== undefined) { updates.push(`language = $${paramIndex++}`); values.push(language); }
    if (description !== undefined) { updates.push(`description = $${paramIndex++}`); values.push(description); }
    if (source !== undefined) { updates.push(`source = $${paramIndex++}`); values.push(source); }
    if (visibility !== undefined) { updates.push(`visibility = $${paramIndex++}`); values.push(visibility); }

    updates.push(`updated_at = NOW()`);

    if (updates.length > 1) {
      values.push(id, req.user.id);
      await pool.query(
        `UPDATE snippets SET ${updates.join(', ')} WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}`,
        values
      );
    }

    if (Array.isArray(tags)) {
      await pool.query('DELETE FROM snippet_tags WHERE snippet_id = $1', [id]);

      const limitedTags = tags.slice(0, 20);
      for (const tagName of limitedTags) {
        const normalizedTag = tagName.trim().toLowerCase();
        if (!normalizedTag || normalizedTag.length > 50) continue;

        let tagResult = await pool.query(
          'SELECT id FROM tags WHERE user_id = $1 AND name = $2',
          [req.user.id, normalizedTag]
        );

        let tagId;
        if (tagResult.rows.length === 0) {
          tagResult = await pool.query(
            'INSERT INTO tags (user_id, name) VALUES ($1, $2) RETURNING id',
            [req.user.id, normalizedTag]
          );
          tagId = tagResult.rows[0].id;
        } else {
          tagId = tagResult.rows[0].id;
        }

        await pool.query(
          'INSERT INTO snippet_tags (snippet_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [id, tagId]
        );
      }
    }

    const fullResult = await pool.query(
      `SELECT s.*, array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) AS tags
       FROM snippets s
       LEFT JOIN snippet_tags st ON s.id = st.snippet_id
       LEFT JOIN tags t ON st.tag_id = t.id
       WHERE s.id = $1
       GROUP BY s.id`,
      [id]
    );

    const full = fullResult.rows[0];
    res.json({
      id: full.id,
      title: full.title,
      code: full.code,
      language: full.language,
      description: full.description,
      source: full.source,
      isFavorite: full.is_favorite,
      visibility: full.visibility,
      copyCount: full.copy_count,
      tags: full.tags || [],
      createdAt: full.created_at,
      updatedAt: full.updated_at
    });
  } catch (error) {
    console.error('Update snippet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM snippets WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    res.json({ message: 'Snippet deleted successfully' });
  } catch (error) {
    console.error('Delete snippet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/favorite', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE snippets SET is_favorite = NOT is_favorite, updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id, is_favorite`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    res.json({
      isFavorite: result.rows[0].is_favorite
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;

    const original = await pool.query(
      'SELECT * FROM snippets WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (original.rows.length === 0) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    const src = original.rows[0];
    const result = await pool.query(
      `INSERT INTO snippets (user_id, title, code, language, description, source, visibility)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.user.id,
        `${src.title} (Copy)`,
        src.code,
        src.language,
        src.description,
        src.source,
        src.visibility
      ]
    );

    const newSnippet = result.rows[0];

    const originalTags = await pool.query(
      `SELECT t.name FROM tags t
       JOIN snippet_tags st ON t.id = st.tag_id
       WHERE st.snippet_id = $1`,
      [id]
    );

    for (const row of originalTags.rows) {
      let tagResult = await pool.query(
        'SELECT id FROM tags WHERE user_id = $1 AND name = $2',
        [req.user.id, row.name]
      );

      let tagId;
      if (tagResult.rows.length === 0) {
        tagResult = await pool.query(
          'INSERT INTO tags (user_id, name) VALUES ($1, $2) RETURNING id',
          [req.user.id, row.name]
        );
        tagId = tagResult.rows[0].id;
      } else {
        tagId = tagResult.rows[0].id;
      }

      await pool.query(
        'INSERT INTO snippet_tags (snippet_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [newSnippet.id, tagId]
      );
    }

    const fullResult = await pool.query(
      `SELECT s.*, array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) AS tags
       FROM snippets s
       LEFT JOIN snippet_tags st ON s.id = st.snippet_id
       LEFT JOIN tags t ON st.tag_id = t.id
       WHERE s.id = $1
       GROUP BY s.id`,
      [newSnippet.id]
    );

    const full = fullResult.rows[0];
    res.status(201).json({
      id: full.id,
      title: full.title,
      code: full.code,
      language: full.language,
      description: full.description,
      source: full.source,
      isFavorite: full.is_favorite,
      visibility: full.visibility,
      copyCount: full.copy_count,
      tags: full.tags || [],
      createdAt: full.created_at,
      updatedAt: full.updated_at
    });
  } catch (error) {
    console.error('Duplicate snippet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/copy', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE snippets SET copy_count = copy_count + 1
       WHERE id = $1 AND user_id = $2
       RETURNING id, copy_count`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    res.json({
      copyCount: result.rows[0].copy_count
    });
  } catch (error) {
    console.error('Increment copy count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
