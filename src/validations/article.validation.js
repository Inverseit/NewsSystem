const Joi = require("joi");
const { objectId } = require("./custom.validation");

const createArticle = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    content: Joi.string().required(),
    author: {
      name: Joi.string().required(),
      _id: Joi.string().custom(objectId),
    },
  }),
};

const getArticle = {
  params: Joi.object().keys({
    articleId: Joi.string().custom(objectId),
  }),
};

const updateArticle = {
  params: Joi.object().keys({
    articleId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      content: Joi.string(),
    })
    .min(1),
};

const deleteArticle = {
  params: Joi.object().keys({
    articleId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createArticle,
  getArticle,
  updateArticle,
  deleteArticle,
};
