const request = require("supertest");
const faker = require("faker");
const httpStatus = require("http-status");
const app = require("../../src/app");
const setupTestDB = require("../utils/setupTestDB");
const { User } = require("../../src/models");
const { userOne, userTwo, insertUsers } = require("../fixtures/user.fixture");
const { userOneAccessToken } = require("../fixtures/token.fixture");

setupTestDB();

describe("User routes", () => {
  describe("POST /v1/users", () => {
    let newUser;

    beforeEach(() => {
      newUser = {
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        password: "password1",
        role: "user",
      };
    });

    test("should return 201 and successfully create new user if data is ok", async () => {
      const res = await request(app)
        .post("/v1/users")
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send(newUser)
        .expect(httpStatus.CREATED);

      expect(res.body).not.toHaveProperty("password");
      expect(res.body).toEqual({
        id: expect.anything(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isEmailVerified: false,
      });

      const dbUser = await User.findById(res.body.id);
      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe(newUser.password);
      expect(dbUser).toMatchObject({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isEmailVerified: false,
      });
    });

    test("should return 400 error if email is invalid", async () => {
      newUser.email = "invalidEmail";

      await request(app)
        .post("/v1/users")
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    test("should return 400 error if email is already used", async () => {
      await insertUsers([userOne]);
      newUser.email = userOne.email;

      await request(app)
        .post("/v1/users")
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    test("should return 400 error if password length is less than 8 characters", async () => {
      newUser.password = "passwo1";

      await request(app)
        .post("/v1/users")
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    test("should return 400 error if password does not contain both letters and numbers", async () => {
      newUser.password = "password";

      await request(app)
        .post("/v1/users")
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);

      newUser.password = "1111111";

      await request(app)
        .post("/v1/users")
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    test("should return 400 error if role is not user", async () => {
      newUser.role = "invalid";

      await request(app)
        .post("/v1/users")
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe("GET /v1/users/:userId", () => {
    test("should return 200 and the user object if data is ok", async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .get(`/v1/users/${userOne._id}`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty("password");
      expect(res.body).toEqual({
        id: userOne._id.toHexString(),
        email: userOne.email,
        name: userOne.name,
        role: userOne.role,
        isEmailVerified: userOne.isEmailVerified,
      });
    });

    test("should return 401 error if access token is missing", async () => {
      await insertUsers([userOne]);

      await request(app)
        .get(`/v1/users/${userOne._id}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test("should return 403 error if user is trying to get another user", async () => {
      await insertUsers([userOne, userTwo]);

      await request(app)
        .get(`/v1/users/${userTwo._id}`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test("should return 400 error if userId is not a valid mongo id", async () => {
      await request(app)
        .get("/v1/users/invalidId")
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe("DELETE /v1/users/:userId", () => {
    test("should return 204 if data is ok", async () => {
      await insertUsers([userOne]);

      await request(app)
        .delete(`/v1/users/${userOne._id}`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbUser = await User.findById(userOne._id);
      expect(dbUser).toBeNull();
    });

    test("should return 401 error if access token is missing", async () => {
      await insertUsers([userOne]);

      await request(app)
        .delete(`/v1/users/${userOne._id}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test("should return 403 error if user is trying to delete another user", async () => {
      await insertUsers([userOne, userTwo]);

      await request(app)
        .delete(`/v1/users/${userTwo._id}`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test("should return 400 error if userId is not a valid mongo id", async () => {
      await request(app)
        .delete("/v1/users/invalidId")
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe("PATCH /v1/users/:userId", () => {
    test("should return 200 and successfully update user if data is ok", async () => {
      await insertUsers([userOne]);
      const updateBody = {
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        password: "newPassword1",
      };

      const res = await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty("password");
      expect(res.body).toEqual({
        id: userOne._id.toHexString(),
        name: updateBody.name,
        email: updateBody.email,
        role: "user",
        isEmailVerified: false,
      });

      const dbUser = await User.findById(userOne._id);
      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe(updateBody.password);
      expect(dbUser).toMatchObject({
        name: updateBody.name,
        email: updateBody.email,
        role: "user",
      });
    });

    test("should return 401 error if access token is missing", async () => {
      await insertUsers([userOne]);
      const updateBody = { name: faker.name.findName() };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .send(updateBody)
        .expect(httpStatus.UNAUTHORIZED);
    });

    test("should return 403 if user is updating another user", async () => {
      await insertUsers([userOne, userTwo]);
      const updateBody = { name: faker.name.findName() };

      await request(app)
        .patch(`/v1/users/${userTwo._id}`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test("should return 400 error if userId is not a valid mongo id", async () => {
      const updateBody = { name: faker.name.findName() };

      await request(app)
        .patch(`/v1/users/invalidId`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test("should return 400 if email is invalid", async () => {
      await insertUsers([userOne]);
      const updateBody = { email: "invalidEmail" };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test("should return 400 if email is already taken", async () => {
      await insertUsers([userOne, userTwo]);
      const updateBody = { email: userTwo.email };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test("should not return 400 if email is my email", async () => {
      await insertUsers([userOne]);
      const updateBody = { email: userOne.email };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    test("should return 400 if password length is less than 8 characters", async () => {
      await insertUsers([userOne]);
      const updateBody = { password: "passwo1" };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test("should return 400 if password does not contain both letters and numbers", async () => {
      await insertUsers([userOne]);
      const updateBody = { password: "password" };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);

      updateBody.password = "11111111";

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
