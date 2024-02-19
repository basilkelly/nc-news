const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data/index.js");
const db = require("../db/connection.js");
const request = require("supertest");
const app = require("../app/app.js");

beforeAll(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("GET ./api/topics", () => {
  test("response code is 200", () => {
    return request(app).get("/api/topics").expect(200);
  });
  test("topics table exists in database", () => {
    return db
      .query(
        `SELECT EXISTS (
                          SELECT FROM 
                          information_schema.tables 
                          WHERE 
                          table_name = 'topics'
                          );`
      )
      .then(({ rows: [{ exists }] }) => {
        expect(exists).toBe(true);
      });
  });
  test("returns array", () => {
    return request(app)
      .get("/api/topics")
      .then((res) => {
        expect(Array.isArray(res.body.topics)).toBe(true);
      });
  });
  test("Returned array contains correct number of objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        const result = response.body.topics;
        expect(result.length).toBe(3);
      });
  });
  test("Returns array of topic objects contains description and slug keys", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        const result = response.body.topics;
        result.forEach((topic) => {
          const topicObjKeys = Object.keys(topic);
          expect(topicObjKeys).toEqual(["slug", "description"]);
        });
      });
  });
});
