const faker = require("faker");
const mongoose = require("mongoose");
const { Article } = require("../../../src/models");

describe("Article model", () => {
  describe("Article validation", () => {
    let newArticle;
    beforeEach(() => {
      newArticle = {
        name: faker.name.findName(),
        content: faker.lorem.lines(),
        author: {
          name: faker.name.findName(),
          _id: new mongoose.Types.ObjectId(),
        },
      };
    });

    test("should correctly validate a valid article", async () => {
      await expect(new Article(newArticle).validate()).resolves.toBeUndefined();
    });
  });
});
