const mongoose = require("mongoose");
const faker = require("faker");
const Articles = require("../../src/models/article.model");
const { userOne, userTwo } = require("./user.fixture");

const articleOne = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.findName(),
  content: faker.lorem.lines(),
  author: {
    _id: userOne._id,
    name: userOne.name,
  },
};

const articleTwo = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.findName(),
  content: faker.lorem.lines(),
  author: {
    _id: userTwo._id,
    name: userTwo.name,
  },
};

const articleThree = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.findName(),
  content: faker.lorem.lines(),
  author: {
    _id: userOne._id,
    name: userOne.name,
  },
};

const insertArticles = async (articles) => {
  await Articles.insertMany(articles);
};

module.exports = {
  articleOne,
  articleTwo,
  articleThree,
  insertArticles,
};
