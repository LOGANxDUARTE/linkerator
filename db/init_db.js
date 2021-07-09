// code to build and initialize DB goes here
const { client } = require('./client');
const { createLink } = require('/links');
const { createTags } = require('./tags');
const { createLinkTag } = require('./link_tags');

async function buildTables() {
  try {
    await client.connect();

    // drop tables in correct order
    await client.query(`
      DROP TABLE IF EXISTS link_tags;
      DROP TABLE IF EXISTS tags;
      DROP TABLE IF EXISTS links; 
    `)

    // build tables in correct order
    await client.query(`
      CREATE TABLE links (
        id SERIAL PRIMARY KEY,
        link_name VARCHAR(255) NOT NULL UNIQUE,
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
        "linksId" INT REFERENCES links(id) ON DELETE CASCADE NOT NULL,
        "tagsId" INT REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
        UNIQUE ("linksId", "tagsId")
      );
    `);

  } catch (error) {
    throw error;
  }
}

async function populateInitialData() {
  try {
    await createLink({
      linkName: 'www.outschool.com',
      clickCount: 0,
      comment: 'Keep kids ages 3-18 engaged with thousands of classes and camps on the topics they are most passionate about!',
      tags: ['online', 'learning', 'school']
    });

    await createLink({
      linkName: 'www.noredink.com',
      clickCount: 0,
      comment: 'Build better writers in person or remotely.',
      tags: ['grammar', 'english', 'writing']
    });

    await createLink({
      linkName: 'www.edx.com',
      clickCount: 0,
      comment: 'Free Online Courses by Harvard, MIT, and More.',
      tags: ['online', 'education', 'learning']
    });

    await createTags(['high school', 'K-12']);
    await createLinkTag(1, 4);

  } catch (error) {
    throw error;
  }
}

buildTables()
  .then(populateInitialData)
  .catch(console.error)
  .finally(() => client.end());
