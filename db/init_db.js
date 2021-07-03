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
    const linksId = await insertLink('www.espn.com');
    const tagsId = await insertTag('sports');
    await insertLinkTag(linksId, tagsId);

  } catch (error) {
    throw error;
  }
}

buildTables()
  .then(populateInitialData)
  .catch(console.error)
  .finally(() => client.end());
