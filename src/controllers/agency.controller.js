const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { agencyService } = require("../services");

const createAgency = catchAsync(async (req, res) => {
  const articleManager = req.app.get("articleManager");
  await agencyService.createAgency(articleManager, req.body);
  res.status(httpStatus.CREATED).send(req.body);
});

const removeAgency = catchAsync(async (req, res) => {
  const articleManager = req.app.get("articleManager");
  await agencyService.removeAgency(articleManager, req.body);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createAgency,
  removeAgency,
};
