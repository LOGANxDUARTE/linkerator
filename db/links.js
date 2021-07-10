const { client } = require('./client');
const { createTags } = require('./tags');
const { createLinkTag } = require('./link_tags');

// database methods
// CREATE
  
const addTagsToLink = async (linkId, tagList) => {  //must come before createLink()
  try {
      const createLinkTagPromises = tagList.map(
          tag => {
              return createLinkTag(linkId, tag.id);
          }
      )

      await Promise.all(createLinkTagPromises);
      
      return await getLinkById(linkId);
  } catch (error) {
      console.error(error.message);
      throw error;
  }
}
  

const createLink = async data => {
    const {linkName, clickCount, comment, tags = []} = data;

    try {
      const { rows: [ link ] } = await client.query(`
        INSERT INTO links (link_name, click_count, comment)
        VALUES ($1, $2, $3)
        ON CONFLICT (link_name) DO NOTHING
        RETURNING *;
      `, [linkName, clickCount, comment]);


      const tagList = await createTags(tags);
      
      return await addTagsToLink(link.id, tagList );
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

// READ

const getLinkById = async linkId => {
    try {
      const { rows: [ link ] } = await client.query(`
        SELECT *
        FROM links
        WHERE id=$1;
      `, [linkId]);

  
      if (!link) {
        throw {
          name: "No Link!",
          message: "Could not find link with that linkId"
        };
      }
  
      const { rows: tags } = await client.query(`
        SELECT tags.*
        FROM tags
        JOIN link_tags ON tags.id=link_tags."tagsId"
        WHERE link_tags."linksId"=$1;
      `, [linkId]);
  
      link.tags = tags;
  
      return link;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
  
const getLinkByTagName = async tagName => {
  try {
    const { rows: linkIds } = await client.query(`
      SELECT links.id
      FROM links
      JOIN link_tags ON links.id=link_tags."linkId"
      JOIN tags ON tags.id=link_tags."tagsId"
      WHERE tags.name=$1;
    `, [tagName]);

    return await Promise.all(linkIds.map(
      link => getLinkById(link.id)
    ));
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}            
  
const getAllLinks = async () => {
  try {
    const { rows: linkIds } = await client.query(`
      SELECT id
      FROM links
    `);

    const links = await Promise.all(linkIds.map(
      link => getLinkById(link.id)
    ));

    return links;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// UPDATE
const updateLink = async (linkId, fields = {}) => {
  const { tags } = fields; 
  delete fields.tags;

  // build the set string
  const setString = Object.keys(fields).map(
      (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  try {
      if (setString.length > 0) {
          await client.query(`
          UPDATE links
          SET ${ setString }
          WHERE id=${ linkId }
          RETURNING *;
          `, Object.values(fields));
      }
      
      // return early if there's no tags to update
      if (tags === undefined) {
          return await getLinkById(linkId);
      }

      // make any new tags that need to be made
      const tagList = await createTags(tags);
      const tagListIdString = tagList.map(
          tag => `${ tag.id }`
      ).join(', ');

      // delete any link_tags from the database which aren't in that tagList
      await client.query(`
          DELETE FROM link_tags
          WHERE "tagId"
          NOT IN (${ tagListIdString })
          AND "linkId"=$1;
      `, [linkId]);

      // and create link_tags as necessary
      await addTagsToLink(linkId, tagList);

      return await getLinkById(linkId);
  } catch(error) {
      console.error(error.message);
      throw error;
  }
}

// DELETE
const deleteLink = async id => {
  try {
    const { rows: [ link ] } = await client.query(`
      DELETE FROM links
      WHERE id=$1
      RETURNING *;
    `, [id]);

    return link;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}


module.exports = {
  createLink,
  getAllLinks,
  getLinkByTagName,
  getLinkById,
  updateLink,
  deleteLink,
  addTagsToLink
}