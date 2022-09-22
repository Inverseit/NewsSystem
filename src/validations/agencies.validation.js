const Joi = require("joi");

const createAgency = {
  body: Joi.object().keys({
    name: Joi.string().required(),
  }),
};

const removeAgency = {
  body: Joi.object().keys({
    name: Joi.string().required(),
  }),
};

module.exports = {
  createAgency,
  removeAgency,
};
