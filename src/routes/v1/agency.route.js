const express = require("express");
const { agencyController } = require("../../controllers");
const validate = require("../../middlewares/validate");
const { agenciesValidation } = require("../../validations");

const router = express.Router();

router
  .route("/")
  .post(
    validate(agenciesValidation.createAgency),
    agencyController.createAgency
  )
  .delete(
    validate(agenciesValidation.removeAgency),
    agencyController.removeAgency
  );

module.exports = router;
