const httpStatus = require("http-status");
const NewsAgency = require("../listeners/newsAgency.listener");
const ApiError = require("../utils/ApiError");

const createAgency = (articleManager, { name }) => {
  if (articleManager.listenersMap.has(name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Name already taken");
  }
  const listener = new NewsAgency(name);
  articleManager.addNewsAgency(listener);
  return listener;
};

const removeAgency = (articleManager, { name }) => {
  if (!articleManager.listenersMap.has(name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No such agency");
  }
  const listener = articleManager.listenersMap.get(name);
  articleManager.removeNewsAgency(listener);
};

module.exports = {
  createAgency,
  removeAgency,
};
