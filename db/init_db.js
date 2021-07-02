// code to build and initialize DB goes here
const {
  client,
  insertLink,
  insertTag,
  insertLinkTag,
} = require('./index');

async function buildTables() {
  try {
    await client.connect();

    // drop tables in correct order
    await client.query(`
      DROP TABLE IF EXISTS links_tags;
      DROP TABLE IF EXISTS tags;
      DROP TABLE IF EXISTS links; 
    `)

    // build tables in correct order
    await client.query(`
      CREATE TABLE links (
        id SERIAL PRIMARY KEY,
        link_name VARCHAR(255) NOT NULL,
        click_count BIGINT,
        comment VARCHAR(255),
        date DATE NOT NULL DEFAULT CURRENT_DATE
      );
    
      CREATE TABLE tags (
        id SERIAL PRIMARY KEY,
        tag_name VARCHAR(255) NOT NULL
      );
      CREATE TABLE links_tags (
        id SERIAL PRIMARY KEY,
        "linksId" INT REFERENCES links("id") ON DELETE CASCADE NOT NULL,
        "tagsId" INT REFERENCES tags("id") ON DELETE CASCADE NOT NULL
      );
    `);

  } catch (error) {
    throw error;
  }
}

async function populateInitialData() {
  try {
    // create useful starting data
    await client.query(`
      INSERT INTO links (link_name) VALUES ('www.google.com');
      INSERT INTO tags (tag_name) VALUES ('search');
      INSERT INTO links_tags ("linksId", "tagsId")
      VALUES (
        (SELECT id FROM links WHERE link_name = 'www.google.com' LIMIT 1),
        (SELECT id FROM tags WHERE tag_name = 'search' LIMIT 1)
      )
    `)
  } catch (error) {
    throw error;
  }
}

buildTables()
  .then(populateInitialData)
  .catch(console.error)
  .finally(() => client.end());
