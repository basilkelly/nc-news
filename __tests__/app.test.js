const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data/index.js");
const db = require("../db/connection.js");
const request = require("supertest");
const app = require("../app/app.js");
const endpointsJson = require("../endpoints.json");

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
      .then((response) => {
        expect(Array.isArray(response.body.topics)).toBe(true);
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
        expect(typeof response.body.api).toEqual("object");
      });
  });
  test("returns value of endponts.json file", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        expect(response.body.api).toEqual(endpointsJson);
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
  test("returns correct keys and properties from first article", () => {
    return request(app)
      .get("/api/articles/1")
      .then((response) => {
        expect(response.body.article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("returns correct keys and properties of the article number requested", () => {
    return request(app)
      .get("/api/articles/3")
      .then((response) => {
        expect(response.body.article).toMatchObject({
          article_id: 3,
          title: "Eight pug gifs that remind me of mitch",
          topic: "mitch",
          author: "icellusedkars",
          body: "some gifs",
          created_at: "2020-11-03T09:12:00.000Z",
          votes: 0,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
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
      .then((response) => {
        expect(Array.isArray(response.body)).toBe(true);
      });
  });
  test("first article does not return a body property", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const actual = response.body[0].body;
        expect(actual).toBe(undefined);
      });
  });
  test("All articles do not return a body property", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        let actual = true;
        response.body.forEach((element) => {
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
      .then((response) => {
        const actual = response.body;
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
      .then((response) => {
        response.body.forEach((element) => {
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
describe("GET /api/articles/:article_id/comments", () => {
  test("response code is 200", () => {
    return request(app).get("/api/articles/1/comments").expect(200);
  });
  test("returns an array", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((result) => {
        expect(Array.isArray(result.body)).toEqual(true);
      });
  });
  test("returns an array containing correct number of comment objects for the given article", () => {
    return request(app)
      .get("/api/articles/3/comments")
      .expect(200)
      .then((result) => {
        expect(result.body.length).toEqual(2);
      });
  });
  test("comment object contains correct keys", () => {
    return request(app)
      .get("/api/articles/3/comments")
      .expect(200)
      .then((result) => {
        const wantedProperties = [
          "comment_id",
          "votes",
          "created_at",
          "author",
          "body",
          "article_id",
        ];

        const actual = wantedProperties.every((key) =>
          Object.keys(result.body[0]).includes(key)
        );

        expect(actual).toEqual(true);
      });
  });
  test("returns an appropriate status and error message when given a valid but non-existent article id", () => {
    return request(app)
      .get("/api/articles/30000/comments")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("not found");
      });
  });
  test("returns an appropriate status and error message when given an invalid article id", () => {
    return request(app)
      .get("/api/articles/helloworld/comments")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
});
describe("POST /api/articles/:article_id/comments", () => {
  test("response code is 201", () => {
    const post = { username: "butter_bridge", body: "hello" };

    return request(app).post("/api/articles/3/comments").send(post).expect(201);
  });
  test("returns an object", () => {
    const post = { username: "butter_bridge", body: "hello" };

    return request(app)
      .post("/api/articles/3/comments")
      .send(post)
      .expect(201)
      .then((response) => {
        expect(typeof response.body).toEqual("object");
      });
  });
  test("returns an object with expected keys and values", () => {
    const post = { username: "butter_bridge", body: "hello" };

    return request(app)
      .post("/api/articles/3/comments")
      .send(post)
      .expect(201)
      .then((response) => {
        expect(response.body).toMatchObject({
          comment_id: expect.any(Number),
          body: expect.any(String),
          article_id: expect.any(Number),
          author: expect.any(String),
          votes: expect.any(Number),
        })
      });
  });
  test("returns expected object for a given post", () => {
    const post = { username: "butter_bridge", body: "hello" };

    return request(app)
      .post("/api/articles/3/comments")
      .send(post)
      .expect(201)
      .then((response) => {
        expect(response.body).toEqual({
          article_id: 3,
          author: "butter_bridge",
          body: "hello",
          comment_id: 22,
          created_at: null,
          votes: 0,
        });
      });
  });
  test("returns an appropriate status and error message when given an invalid username", () => {
    const post = { username: "not_butter_bridge", body: "hello" };

    return request(app)
      .post("/api/articles/3/comments")
      .send(post)
      .expect(400)

      .then((response) => {
        expect(response.body.msg).toEqual("Bad request");
      });
  });
  test("returns an error if given an article that does not exist in database", () => {
    const post = { username: "butter_bridge", body: "hello" };
    return request(app)
      .post("/api/articles/333333/comments")
      .send(post)
      .expect(400)

      .then((response) => {
        expect(response.body.msg).toEqual("Bad request");
      });
  });
  test("returns an error if given a post with a missing property", () => {
    const post = { username: "butter_bridge" };
    return request(app)
      .post("/api/articles/3/comments")
      .send(post)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toEqual("Bad request");
      });
  });
});
describe("PATCH /api/articles/:article_id", () => {
  test("response code is 200", () => {
    const patch = { inc_votes: 1 };

    return request(app).patch("/api/articles/3").send(patch).expect(200);
  });
  test("Succesfully patched articles database", () => {
    const patch = { inc_votes: 1 };

    return request(app)
      .patch("/api/articles/4")
      .send(patch)
      .expect(200)

      .then((response) => {
        expect(response.body.votes).toBe(1);
      });
  });
  test("returns an appropriate status and error message when given an invalid vote value", () => {
    const patch = { inc_votes: "hello" };

    return request(app)
      .patch("/api/articles/3")
      .send(patch)
      .expect(400)

      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
  test("returns error when passed article id that doesnt exist", () => {
    const patch = { inc_votes: 1 };

    return request(app)
      .patch("/api/articles/99999")
      .send(patch)
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("not found");
      });
  });
  test("returns error when passed an invalid article id", () => {
    const patch = { inc_votes: 1 };

    return request(app)
      .patch("/api/articles/thearticle")
      .send(patch)
      .expect(400)

      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
  test("Succesfully patched articles database when using negative numbers", () => {
    const patch = { inc_votes: -1 };

    return request(app)
      .patch("/api/articles/5")
      .send(patch)
      .expect(200)

      .then((response) => {
        expect(response.body.votes).toBe(-1);
      });
  });
  test("Succesfully increments votes based on current vote value in article", () => {
    const patch = { inc_votes: 1 };

    return request(app)
      .patch("/api/articles/1")
      .send(patch)
      .expect(200)

      .then((response) => {
        expect(response.body.votes).toBe(101);
      });
  });
  test("returns an article object with expected keys and value type", () => {
    const patch = { inc_votes: 0 };

    return request(app)
      .patch("/api/articles/1")
      .send(patch)
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          article_id: expect.any(Number),
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String)

        }
        )
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("response code is 204", () => {
    return request(app).delete("/api/comments/22").expect(204);
  });
  test("Deletes a row", () => {
    return request(app)
      .delete("/api/comments/21")
      .expect(204)
      .then(() => {
        return db.query(
          `SELECT * FROM comments WHERE comments.comment_id = $1`,
          [21]
        );
      })
      .then(({ rows }) => {
        expect(rows).toEqual([]);
      });
  });
  test("returns an appropriate status and error message when given an article that does not exist", () => {
    return request(app)
      .delete("/api/comments/50")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("not found");
      });
  });
  test("returns an appropriate status and error message when given an invalid comment id", () => {
    return request(app)
      .delete("/api/comments/deletethecomment")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
});

describe("GET /api/users", () => {
  test("response code is 200", () => {
    return request(app).get("/api/users").expect(200);
  });
  test("returns an array", () => {
    return request(app)
      .get("/api/users")
      .then((response) => {
        expect(Array.isArray(response.body.users)).toBe(true);
      });
  });
  test("Returned array contains correct number of objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((response) => {
        const result = response.body.users;
        expect(result.length).toBe(4);
      });
  });
  test("returned user object has correct keys and value type", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((response) => {
        response.body.users.forEach(element => {
          expect(element).toMatchObject({
          username: expect.any(String),
          name:expect.any(String),
          avatar_url: expect.any(String)
        });
        });
      });
  });
});

describe("GET /api/articles (topic query)", () => {
  test("response code is 200", () => {
    return request(app).get("/api/articles?topic=cats").expect(200);
  });
  test("returns an array of correct length", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then((response) => {
        const result = response.body;
        expect(result.length).toBe(1);
      });
  });
  test("returns error if given an invalid topic query", () => {
    return request(app)
      .get("/api/articles?topic=dogs")
      .expect(404)
      .then((response) => {
        const result = response.body.msg;
        expect(result).toBe("not found");
      });
  });
  test("returned article has a topic matching the requested topic", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then((response) => {
        const result = response.body[0].topic;
        expect(result).toBe("cats");
      });
  });
  test("returns 200 if given an valid topic that has no articles", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then((response) => {
        const result = response.body;
        expect(result).toEqual([]);
      });
  });
});
describe("GET /api/articles/:article_id (comment_count)", () => {
  test("response code is 200", () => {
    return request(app).get("/api/articles/1").expect(200);
  });
  test("returns an article object", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        expect(response.body.article.title).toEqual(
          "Living in the shadow of a great man"
        );
      });
  });
  test("returns an article object with comment_count property", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        expect(response.body.article.hasOwnProperty("comment_count")).toEqual(
          true
        );
      });
  });
  test("returns an article object with comment_count property", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        expect(response.body.article.comment_count).toEqual(11);
      });
  });
});
