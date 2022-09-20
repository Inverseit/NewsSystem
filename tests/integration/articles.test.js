const request = require("supertest");
const faker = require("faker");
const httpStatus = require("http-status");
const app = require("../../src/app");
const setupTestDB = require("../utils/setupTestDB");
const { Articles } = require("../../src/models");

const { userOne, userTwo, insertUsers } = require("../fixtures/user.fixture");
const { userOneAccessToken } = require("../fixtures/token.fixture");
const {
  articleOne,
  articleTwo,
  insertArticles,
  articleThree,
} = require("../fixtures/articles.fixture");

setupTestDB();

describe("Articles routes", () => {
  describe("POST /v1/articles", () => {
    let newArticle;

    beforeEach(() => {
      newArticle = {
        name: faker.name.findName(),
        content: faker.lorem.lines(),
      };
    });

    test("should return 201 and successfully create new article if data is ok", async () => {
      await insertUsers([userOne]);
      const res = await request(app)
        .post("/v1/articles")
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send(newArticle)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        name: newArticle.name,
        content: newArticle.content,
        author: {
          name: userOne.name,
          _id: userOne._id.toHexString(),
        },
      });

      const dbArticle = await Articles.findById(res.body.id);
      expect(dbArticle).toBeDefined();
      expect(dbArticle).toMatchObject({
        name: newArticle.name,
        content: newArticle.content,
        author: {
          name: userOne.name,
          _id: userOne._id,
        },
      });
    });

    test("should return 401, if not user is authorized", async () => {
      await request(app)
        .post("/v1/articles")
        .send(newArticle)
        .expect(httpStatus.UNAUTHORIZED);
    });

    test("should return 400 error if the article name is already used", async () => {
      await insertUsers([userOne]);
      await insertArticles([articleOne]);
      newArticle.name = articleOne.name;

      await request(app)
        .post("/v1/users")
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send(newArticle)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe("GET /v1/articles/", () => {
    test("should return [] if no articles", async () => {
      await insertUsers([userOne]);
      const res = await request(app)
        .get(`/v1/articles/`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);
      expect(res.body).toEqual([]);
    });

    test("should return array of articles if data is OK", async () => {
      await insertUsers([userOne, userTwo]);
      await insertArticles([articleOne, articleTwo, articleThree]);
      const res = await request(app)
        .get(`/v1/articles/`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      const expectedArray = [
        {
          id: articleOne._id.toHexString(),
          name: articleOne.name,
          content: articleOne.content,
          author: {
            ...articleOne.author,
            _id: articleOne.author._id.toHexString(),
          },
        },
        {
          id: articleThree._id.toHexString(),
          name: articleThree.name,
          content: articleThree.content,
          author: {
            ...articleThree.author,
            _id: articleThree.author._id.toHexString(),
          },
        },
      ];

      expect(res.body).toEqual(expectedArray);
    });

    test("should return 401 error if access token is missing", async () => {
      await insertUsers([userOne]);
      await request(app)
        .get(`/v1/articles/`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe("GET /v1/articles/:articleId", () => {
    test("should return 200 and the user object if data is ok", async () => {
      await insertUsers([userOne]);
      await insertArticles([articleOne]);

      const res = await request(app)
        .get(`/v1/articles/${articleOne._id}`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: articleOne._id.toHexString(),
        name: articleOne.name,
        content: articleOne.content,
        author: {
          _id: articleOne.author._id.toHexString(),
          name: articleOne.author.name,
        },
      });
    });

    test("should return 401 error if access token is missing", async () => {
      await insertUsers([userOne]);
      await insertArticles([articleOne]);

      await request(app)
        .get(`/v1/articles/${articleOne._id}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test("should return 403 error if user is trying to get another user's article", async () => {
      await insertUsers([userOne, userTwo]);
      await insertArticles([articleTwo]);

      await request(app)
        .get(`/v1/articles/${articleTwo._id}`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test("should return 404 error if user is trying to get not existing article", async () => {
      await insertUsers([userOne]);

      await request(app)
        .get(`/v1/articles/${articleTwo._id}`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });

    test("should return 400 error if articleId is not a valid mongo id", async () => {
      await insertUsers([userOne]);
      await request(app)
        .get("/v1/articles/invalidId")
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe("DELETE /v1/articles/:articleId", () => {
    test("should return 204 if data is ok", async () => {
      await insertUsers([userOne]);
      await insertArticles([articleOne]);

      await request(app)
        .delete(`/v1/articles/${articleOne._id}`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbUser = await Articles.findById(articleOne._id);
      expect(dbUser).toBeNull();
    });

    test("should return 401 error if access token is missing", async () => {
      await insertUsers([userOne]);
      await insertArticles([articleOne]);

      await request(app)
        .delete(`/v1/users/${userOne._id}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test("should return 403 error if user is trying to delete another user", async () => {
      await insertUsers([userOne, userTwo]);
      await insertArticles([articleOne, articleTwo]);

      await request(app)
        .delete(`/v1/users/${articleTwo._id}`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test("should return 400 error if articleId is not a valid mongo id", async () => {
      await request(app)
        .delete("/v1/articles/invalidId")
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe("PATCH /v1/articles/:articleId", () => {
    test("should return 200 and successfully update user if data is ok", async () => {
      await insertUsers([userOne]);
      await insertArticles([articleOne]);

      const updateBody = {
        name: faker.name.findName(),
        content: faker.lorem.lines(),
      };

      const res = await request(app)
        .patch(`/v1/articles/${articleOne._id}`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: articleOne._id.toHexString(),
        name: updateBody.name,
        content: updateBody.content,
        author: {
          name: articleOne.author.name,
          _id: articleOne.author._id.toHexString(),
        },
      });

      const dbArticle = await Articles.findById(articleOne._id);
      expect(dbArticle).toBeDefined();
      expect(dbArticle).toMatchObject({
        name: updateBody.name,
        content: updateBody.content,
        author: {
          name: userOne.name,
          _id: userOne._id,
        },
      });
    });

    test("should return 401 error if access token is missing", async () => {
      await insertUsers([userOne]);
      await insertArticles([articleOne]);
      const updateBody = { name: faker.name.findName() };

      await request(app)
        .patch(`/v1/articles/${articleOne._id}`)
        .send(updateBody)
        .expect(httpStatus.UNAUTHORIZED);
    });

    test("should return 403 if user is updating another user's article", async () => {
      await insertUsers([userOne, userTwo]);
      await insertArticles([articleOne, articleTwo]);
      const updateBody = { name: faker.name.findName() };

      await request(app)
        .patch(`/v1/articles/${articleTwo._id}`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test("should return 400 error if articleId is not a valid mongo id", async () => {
      await insertUsers([userOne]);
      const updateBody = { name: faker.name.findName() };

      await request(app)
        .patch(`/v1/articles/invalidId`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test("should return 400 if name is already taken", async () => {
      await insertUsers([userOne]);
      await insertArticles([articleOne, articleTwo]);

      const updateBody = { name: articleTwo.name };

      await request(app)
        .patch(`/v1/articles/${articleOne._id}`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test("should not return 400 if name is name", async () => {
      await insertUsers([userOne]);
      await insertArticles([articleOne]);
      const updateBody = { name: articleOne.name };

      await request(app)
        .patch(`/v1/articles/${articleOne._id}`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });
  });
});
