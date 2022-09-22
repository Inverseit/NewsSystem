const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { articleService } = require("../services");

const createArticle = catchAsync(async (req, res) => {
  const article = await articleService.createArticle(req.body, req.user);
  const articleManager = req.app.get("articleManager");
  articleManager.created(article._id, article.name);
  res.status(httpStatus.CREATED).send(article);
});

const getArticles = catchAsync(async (req, res) => {
  const result = await articleService.queryArticles(req.user);
  res.send(result);
});

const getArticle = catchAsync(async (req, res) => {
  const article = await articleService.getArticleById(req.params.articleId);
  if (!article) {
    throw new ApiError(httpStatus.NOT_FOUND, "Article not found");
  }
  if (article.author._id.toHexString() !== req.user._id.toHexString()) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden");
  }
  res.send(article);
});

const updateArticle = catchAsync(async (req, res) => {
  const updatedArticle = await articleService.updateArticleById(
    req.params.articleId,
    req.body,
    req.user
  );
  const articleManager = req.app.get("articleManager");
  articleManager.updated(req.params.articleId, req.body);
  res.send(updatedArticle);
});

const deleteArticle = catchAsync(async (req, res) => {
  await articleService.deleteArticleById(req.params.articleId, req.user);
  const articleManager = req.app.get("articleManager");
  articleManager.deleted(req.params.articleId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createArticle,
  getArticles,
  getArticle,
  updateArticle,
  deleteArticle,
};
