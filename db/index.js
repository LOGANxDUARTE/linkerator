const { 
  addTagsToLink,
  createLink,
  getLinkById,
  getLinkByTagName,
  getAllLinks,
  updateLink,
  deleteLink, 
} = require('./links.js');

const {
  createTags,
  getAllTags,
  getTagById,
  deleteTag
} = require('./tags.js');

const {
  createLinkTag,
  getLinkTagById,
  getAllLinkTags
} = require('./link_tags.js');

module.exports = {
  addTagsToLink,
  createLink,
  getLinkById,
  getLinkByTagName,
  getAllLinks,
  updateLink,
  deleteLink,
  createTags,
  getAllTags,
  getTagById,
  deleteTag,
  createLinkTag,
  getLinkTagById,
  getAllLinkTags
};