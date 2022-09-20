const httpStatus = require("http-status");
const { Articles } = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Create a article
 * @param {Object} articleBody
 *  * @param {Object} authorUser
 * @returns {Promise<Articles>}
 */
const createArticle = async (articleBody, authorUser) => {
  if (await Articles.isNameTaken(articleBody.name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Name already taken");
  }
  const mergedArticleBody = {
    ...articleBody,
    author: {
      name: authorUser.name,
      _id: authorUser._id,
    },
  };
  return Articles.create(mergedArticleBody);
};

/**
 * Query for article
 * @param {Object} user - User who is performing the requset
 * @returns {Promise<QueryResult>}
 */
const queryArticles = async (user) => {
  const articles = await Articles.find({
    "author._id": user._id,
  });
  return articles;
};

/**
 * Get article by id
 * @param {ObjectId} id
 * @returns {Promise<Articles>}
 */
const getArticleById = async (id) => {
  return Articles.findById(id);
};

/**
 * Get article by email
 * @param {string} email
 * @returns {Promise<Articles>}
 */
const getArticleByName = async (name) => {
  return Articles.findOne({ name });
};

/**
 * Update article by id
 * @param {ObjectId} articleId
 * @param {Object} updateBody
 * @returns {Promise<Articles>}
 */
const updateArticleById = async (articleId, updateBody, user) => {
  const article = await getArticleById(articleId);
  if (!article) {
    throw new ApiError(httpStatus.NOT_FOUND, "Article not found");
  }
  const articleAuthorId = article.author._id.toHexString();
  if (articleAuthorId !== user._id.toHexString()) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden");
  }
  if (
    updateBody.name &&
    (await Articles.isNameTaken(updateBody.name, articleId))
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Name is already taken");
  }
  Object.assign(article, updateBody);
  await article.save();
  return article;
};

/**
 * Delete article by id
 * @param {ObjectId} articleId
 * @returns {Promise<Articles>}
 */
const deleteArticleById = async (articleId) => {
  const article = await getArticleById(articleId);
  if (!article) {
    throw new ApiError(httpStatus.NOT_FOUND, "Article not found");
  }
  await article.remove();
  return article;
};

module.exports = {
  createArticle,
  queryArticles,
  getArticleById,
  getArticleByName,
  updateArticleById,
  deleteArticleById,
};
