const { client } = require('./client');

// CREATE \\

const createLinkTag = async (linkId, tagId) => {
    try {
        await client.query(`
            INSERT INTO link_tags("linksId", "tagsId")
            VALUES ($1, $2)
            ON CONFLICT ("linksId", "tagsId") DO NOTHING;
        `, [linkId, tagId]);
    } catch (error) {
        console.error(error.message);
        throw error;
    }
}

// READ \\

const getLinkTagById = async id => {
    try {
        const { rows: [ link_tag ] } = await client.query(`
            SELECT *
            FROM link_tags
            WHERE id=$1;
        `, [ id ]);

        return link_tag;
    } catch (error) {
        console.error(error.message);
        throw error;
    }
} 

const getAllLinkTags = async linkId => {
    try {
        const { rows } = await client.query(`
            SELECT t.tag_name AS "tagName"
            FROM link_tags AS lt
            JOIN links AS l ON lt."linksId" = (
                SELECT id FROM link_tags WHERE "linksId" = $1 LIMIT 1
            )
            JOIN tags AS t ON t.id = lt."tagsId";
        `, [linkId]);
        
        console.log('linkId', linkId);
        console.log('rows',  rows );

        return rows; 
    } catch (error) {
        console.error(error.message);
        throw error;
    }
};

module.exports = {
    createLinkTag,
    getLinkTagById,
    getAllLinkTags
};