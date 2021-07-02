// Connect to DB
const { Client } = require('pg');
const DB_NAME = 'linkerator'
const DB_URL = process.env.DATABASE_URL || `postgres://localhost:5432/${ DB_NAME }`;
const client = new Client(DB_URL);

// database methods
const insertLink = (link_name) => {
  const { rows } = await client.query(`
    INSERT INTO links (link_name) VALUES ($1) RETURNING id;
  `, [link_name]);

  return rows[0].id;
};

const insertTag = (tag_name) => {
  const { rows } = await client.query(`
  INSERT INTO tags (tag_name) VALUES ($1) RETURNING id;
  `, [tag_name]);

return rows[0].id;
};

const insertLinkTag = (linksId, tagsId) => {
  const { rows } = await client.query(`
  INSERT INTO links_tags ("linksId", "tagsId")
  VALUES ($1, $2)
  RETURNING id;
  `, [linksId, tagsId]);

  return rows[0].id;
};

// export
module.exports = {
  client,
  insertLink,
  insertTag,
  insertLinkTag,
};