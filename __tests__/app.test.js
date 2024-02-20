const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data/index.js");
const db = require("../db/connection.js");
const request = require("supertest");
const app = require("../app/app.js");
const endpointsJson = require("../endpoints.json");
const { filter } = require("../db/data/test-data/articles.js");

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

describe("GET /api", () => {
  test("response code is 200", () => {
    return request(app).get("/api").expect(200);
  });

  test("returns an object", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        expect(typeof response.body).toEqual("object");
      });
  });
  test("returns value of endponts.json file", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(endpointsJson);
      });
  });
});
describe("GET /api/articles/:article_id", () => {
  test("response code is 200", () => {
    return request(app).get("/api/articles/1").expect(200);
  });
  test("returns an object", () => {
    return request(app)
      .get("/api/articles/1")
      .then((response) => {
        expect(typeof response.body.article).toBe("object");
        expect(Array.isArray(response.body.article)).toBe(false);
        expect(response.body.article).not.toBeNull();
      });
  });
  test("returns correct article first object", () => {
    const expected = {
      article_id: 1,
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
      created_at: "2020-07-09T20:11:00.000Z",
      votes: 100,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return request(app)
      .get("/api/articles/1")
      .then((response) => {
        expect(response.body.article).toEqual(expected);
      });
  });
  test("returns article for number requested", () => {
    const expected = {
      article_id: 3,
      title: "Eight pug gifs that remind me of mitch",
      topic: "mitch",
      author: "icellusedkars",
      body: "some gifs",
      created_at: "2020-11-03T09:12:00.000Z",
      votes: 0,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return request(app)
      .get("/api/articles/3")
      .then((response) => {
        expect(response.body.article).toEqual(expected);
      });
  });

  test("returns an appropriate status and error message when given a valid but non-existent article id", () => {
    return request(app)
      .get("/api/articles/30000")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("not found");
      });
  });
  test("returns an appropriate status and error message when given an invalid article id", () => {
    return request(app)
      .get("/api/articles/hello")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
});
describe("GET /api/articles", () => {
  test("response code is 200", () => {
    return request(app).get("/api/articles").expect(200);
  });
  test("returns array", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
  test("first article does not return a body property", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((res) => {
        const actual = res.body[0].body;
        expect(actual).toBe(undefined);
      });
  });
  test("All articles do not return a body property", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((res) => {
        let actual = true;
        res.body.forEach((element) => {
          if (element.body) {
            actual = true;
          } else {
            actual = false;
          }
        });
        expect(actual).toBe(false);
      });
  });
  test("articles returns a comment property with correct count of appearances of article id in comments database", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((res) => {
        //console.log(res.body[0]);
        const actual = res.body;
        const firstArticle = actual.filter(
          (article) => article.article_id === 1
        );
        expect(Number(firstArticle[0].comment_count)).toEqual(11);
      });
  });
  test("all articles return a comment property", () => {
    let IsCommentCountPresent;
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((res) => {
        const actual = res.body;

        res.body.forEach((element) => {
          if (element.comment_count.length === 0) {
            IsCommentCountPresent = false;
          } else {
            IsCommentCountPresent = true;
          }
        });
        expect(IsCommentCountPresent).toEqual(true);
      });
  });
});
