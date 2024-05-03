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
        });
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
          article_img_url: expect.any(String),
        });
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
        response.body.users.forEach((element) => {
          expect(element).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
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
describe("GET /api/articles (sorting query) ", () => {
  test("response code is 200", () => {
    return request(app).get("/api/articles?sort_by=created_at").expect(200);
  });
  test("returns an array", () => {
    return request(app)
      .get("/api/articles?sort_by=created_at")
      .expect(200)
      .then((response) => {
        const result = response.body;
        expect(Array.isArray(result)).toBe(true);
      });
  });
  test("first index of response body votes should have biggest votes value when sorted by votes", () => {
    return request(app)
      .get("/api/articles?sort_by=votes")
      .expect(200)
      .then((response) => {
        let resultsArr = [];
        response.body.forEach((element) => {
          resultsArr.push(element.votes);
        });
        const expected = Math.max(...resultsArr);
        const result = response.body[0].votes;
        expect(result).toBe(expected);
      });
  });
  test("last index of response body votes should have smallest votes value when sorted by votes", () => {
    return request(app)
      .get("/api/articles?sort_by=votes")
      .expect(200)
      .then((response) => {
        let resultsArr = [];
        response.body.forEach((element) => {
          resultsArr.push(element.votes);
        });
        const expected = Math.min(...resultsArr);
        const result = response.body[response.body.length - 1].votes;
        expect(result).toBe(expected);
      });
  });

  test("first index of response body title should have lowest alphabetical order value when sorted by title is used", () => {
    return request(app)
      .get("/api/articles?sort_by=title")
      .expect(200)
      .then((response) => {
        let resultsArr = [];
        response.body.forEach((element) => {
          resultsArr.push(element.title);
        });
        resultsArr.sort().reverse();
        const expected = resultsArr[0];
        const result = response.body[0].title;
        expect(result).toBe(expected);
      });
  });
  test("last index of response body title should have highest alphabetical order value when sorted by title is used", () => {
    return request(app)
      .get("/api/articles?sort_by=title")
      .expect(200)
      .then((response) => {
        let resultsArr = [];
        response.body.forEach((element) => {
          resultsArr.push(element.title);
        });
        resultsArr.sort();
        const expected = resultsArr[0];
        const result = response.body[response.body.length - 1].title;
        expect(result).toBe(expected);
      });
  });
  test("first index of response body topic should have lowest alphabetical order value when sorted by topic is used", () => {
    return request(app)
      .get("/api/articles?sort_by=topic")
      .expect(200)
      .then((response) => {
        let resultsArr = [];
        response.body.forEach((element) => {
          resultsArr.push(element.topic);
        });
        resultsArr.sort().reverse();
        const expected = resultsArr[0];
        const result = response.body[0].topic;
        expect(result).toBe(expected);
      });
  });
  test("last index of response body topic should have highest alphabetical order value when sorted by topic is used", () => {
    return request(app)
      .get("/api/articles?sort_by=topic")
      .expect(200)
      .then((response) => {
        let resultsArr = [];
        response.body.forEach((element) => {
          resultsArr.push(element.topic);
        });
        resultsArr.sort();
        const expected = resultsArr[0];
        const result = response.body[response.body.length - 1].topic;
        expect(result).toBe(expected);
      });
  });
  test("first index of response body author should have lowest alphabetical order value when sorted by author is used", () => {
    return request(app)
      .get("/api/articles?sort_by=author")
      .expect(200)
      .then((response) => {
        let resultsArr = [];
        response.body.forEach((element) => {
          resultsArr.push(element.author);
        });
        resultsArr.sort().reverse();
        const expected = resultsArr[0];
        const result = response.body[0].author;
        expect(result).toBe(expected);
      });
  });
  test("last index of response body author should have highest alphabetical order value when sorted by author is used", () => {
    return request(app)
      .get("/api/articles?sort_by=author")
      .expect(200)
      .then((response) => {
        let resultsArr = [];
        response.body.forEach((element) => {
          resultsArr.push(element.author);
        });
        resultsArr.sort();
        const expected = resultsArr[0];
        const result = response.body[response.body.length - 1].author;
        expect(result).toBe(expected);
      });
  });
  test("first index of response body comment_count should have biggest number value when sorted by comment_count", () => {
    return request(app)
      .get("/api/articles?sort_by=comment_count")
      .expect(200)
      .then((response) => {
        let resultsArr = [];
        response.body.forEach((element) => {
          resultsArr.push(element.comment_count);
        });
        const expected = Math.max(...resultsArr).toString();
        const result = response.body[0].comment_count;
        expect(result).toBe(expected);
      });
  });
  test("last index of response body comment_count should have smallest number value when sorted by comment_count", () => {
    return request(app)
      .get("/api/articles?sort_by=comment_count")
      .expect(200)
      .then((response) => {
        let resultsArr = [];
        response.body.forEach((element) => {
          resultsArr.push(element.comment_count);
        });
        const expected = Math.min(...resultsArr).toString();
        const result = response.body[response.body.length - 1].comment_count;
        expect(result).toBe(expected);
      });
  });
  test("first index of response body created_at should have latest date value when sorted by created_at", () => {
    return request(app)
      .get("/api/articles?sort_by=created_at")
      .expect(200)
      .then((response) => {
        let resultsArr = [];
        response.body.forEach((element) => {
          resultsArr.push(element.created_at);
        });
        resultsArr.sort().reverse();
        const expected = resultsArr[0];
        const result = response.body[0].created_at;
        expect(result).toBe(expected);
      });
  });
  test("last index of response body created_at should have oldest date value when sorted by created_at", () => {
    return request(app)
      .get("/api/articles?sort_by=created_at")
      .expect(200)
      .then((response) => {
        let resultsArr = [];
        response.body.forEach((element) => {
          resultsArr.push(element.created_at);
        });
        resultsArr.sort();
        const expected = resultsArr[0];
        const result = response.body[response.body.length - 1].created_at;
        expect(result).toBe(expected);
      });
  });

  test("returns error if given an invalid sort_by query", () => {
    return request(app)
      .get("/api/articles?sort_by=helloworld")
      .expect(404)
      .then((response) => {
        const result = response.body.msg;
        expect(result).toBe("not found");
      });
  });
});
describe("GET /api/articles (order query) ", () => {
  test("response code is 200", () => {
    return request(app).get("/api/articles?order=asc").expect(200);
  });
  test("returns an array", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then((response) => {
        const result = response.body;
        expect(Array.isArray(result)).toBe(true);
      });
  });
  test("order by query desc should return body array with newest articles first", () => {
    return request(app)
      .get("/api/articles?order=desc")
      .expect(200)
      .then((response) => {
        let resultsArr = [];
        response.body.forEach((element) => {
          resultsArr.push(element.created_at);
        });

        resultsArr.sort().reverse();
        const expected = resultsArr[0];
        const result = response.body[0].created_at;
        expect(result).toBe(expected);
      });
  });
  test("order by query asc should return body array with oldest articles first", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then((response) => {
        let resultsArr = [];
        response.body.forEach((element) => {
          resultsArr.push(element.created_at);
        });
        resultsArr.sort();
        const expected = resultsArr[0];
        const result = response.body[0].created_at;
        expect(result).toBe(expected);
      });
  });
  test("should return error if given invalid order by query", () => {
    return request(app)
      .get("/api/articles?order=hello")
      .expect(404)
      .then((response) => {
        const result = response.body.msg;
        expect(result).toBe("not found");
      });
  });
});
describe("GET /api/users/:username", () => {
  test("response code is 200", () => {
    return request(app).get("/api/users/butter_bridge").expect(200);
  });
  test("should return an object", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .then((response) => {
        expect(typeof response.body).toBe("object");
        expect(Array.isArray(response.body)).toBe(false);
        expect(response.body).not.toBeNull();
      });
  });
  test("should return correct user object properties", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .then((response) => {
        expect(response.body).toMatchObject({
          username: expect.any(String),
          avatar_url: expect.any(String),
          name: expect.any(String),
        });
      });
  });
  test("should return correct user data for requested user", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .then((response) => {
        expect(response.body).toMatchObject({
          username: "butter_bridge",
          avatar_url:
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
          name: "jonny",
        });
      });
  });
  test("returns an appropriate status and error message when given a non existent username value", () => {
    return request(app)
      .get("/api/users/helloworld")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("not found");
      });
  });
});
describe("PATCH /api/comments/:comment_id", () => {
  test("response code is 200", () => {
    const patch = { inc_votes: 1 };

    return request(app).patch("/api/comments/1").send(patch).expect(200);
  });
  test("Succesfully patched comments database", () => {
    const patch = { inc_votes: 1 };

    return request(app)
      .patch("/api/comments/5")
      .send(patch)
      .expect(200)

      .then((response) => {
        expect(response.body.votes).toBe(1);
      });
  });
  test("returns an appropriate status and error message when given an invalid vote value", () => {
    const patch = { inc_votes: "hello" };

    return request(app)
      .patch("/api/comments/3")
      .send(patch)
      .expect(400)

      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
  test("returns error when passed comment id that doesnt exist", () => {
    const patch = { inc_votes: 1 };

    return request(app)
      .patch("/api/comments/99999")
      .send(patch)
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("not found");
      });
  });
  test("returns error when passed an invalid comment id", () => {
    const patch = { inc_votes: 1 };

    return request(app)
      .patch("/api/comments/acomment")
      .send(patch)
      .expect(400)

      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
  test("Succesfully patched comments database when using negative numbers", () => {
    const patch = { inc_votes: -1 };

    return request(app)
      .patch("/api/comments/6")
      .send(patch)
      .expect(200)

      .then((response) => {
        expect(response.body.votes).toBe(-1);
      });
  });
  test("Succesfully increments votes based on current vote value in comment", () => {
    const patch = { inc_votes: 1 };

    return request(app)
      .patch("/api/comments/5")
      .send(patch)
      .expect(200)

      .then((response) => {
        expect(response.body.votes).toBe(2);
      });
  });
  test("returns a comments object with expected keys and value type", () => {
    const patch = { inc_votes: 0 };

    return request(app)
      .patch("/api/comments/1")
      .send(patch)
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          article_id: expect.any(Number),
          comment_id: expect.any(Number),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
        });
      });
  });
});
describe("POST /api/articles", () => {
  test("response code is 201", () => {
    const post = {
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return request(app).post("/api/articles").send(post).expect(201);
  });

  test("returns an object", () => {
    const post = {
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };

    return request(app)
      .post("/api/articles")
      .send(post)
      .expect(201)
      .then((response) => {
        expect(typeof response.body).toBe("object");
        expect(Array.isArray(response.body)).toBe(false);
        expect(response.body).not.toBeNull();
      });
  });

  test("returns an object with expected keys and values", () => {
    const post = {
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };

    return request(app)
      .post("/api/articles")
      .send(post)
      .expect(201)
      .then((response) => {
        expect(response.body).toMatchObject({
          title: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          topic: expect.any(String),
          article_img_url: expect.any(String),
          article_id: expect.any(Number),
          votes: 0,
          created_at: null,
          comment_count: expect.any(Number),
        });
      });
  });
  test("returns expected object for a given post", () => {
    const post = {
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };

    return request(app)
      .post("/api/articles")
      .send(post)
      .expect(201)
      .then((response) => {
        expect(response.body).toMatchObject({
          title: "Living in the shadow of a great man",
          author: "butter_bridge",
          body: "I find this existence challenging",
          topic: "mitch",
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          article_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: null,
          comment_count: expect.any(Number),
        });
      });
  });
  test("should use a placeholder article image if article image is not provided in the request", () => {
    const post = {
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
    };

    return request(app)
      .post("/api/articles")
      .send(post)
      .expect(201)
      .then((response) => {
        expect(response.body).toMatchObject({
          article_img_url:
            "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
        });
      });
  });

  test("returns an appropriate status and error message when given an non existent topic value", () => {
    const post = {
      title: "Living in the shadow of a great man",
      topic: "anewtopic",
      author: "butter_bridge",
      body: "I find this existence challenging",
    };

    return request(app)
      .post("/api/articles")
      .send(post)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toEqual("Bad request");
      });
  });

  test("returns an appropriate status and error message when given an non existent author value", () => {
    const post = {
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "newauthor",
      body: "I find this existence challenging",
    };

    return request(app)
      .post("/api/articles")
      .send(post)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toEqual("Bad request");
      });
  });

  test("returns an appropriate status and error message when given an non existent topic value", () => {
    const post = {
      title: "Living in the shadow of a great man",
      topic: "newtopic",
      author: "butter_bridge",
      body: "I find this existence challenging",
    };

    return request(app)
      .post("/api/articles")
      .send(post)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toEqual("Bad request");
      });
  });

  test("returns an error if given a post with a missing property", () => {
    const post = {
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
    };

    return request(app)
      .post("/api/articles")
      .send(post)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toEqual("Bad request");
      });
  });
});

describe("GET /api/articles (pagination limit query) ", () => {
  test("response code is 200", () => {
    return request(app).get("/api/articles?limit=5").expect(200);
  });
  test("returns an array", () => {
    return request(app)
      .get("/api/articles?limit=5")
      .expect(200)
      .then((response) => {
        const result = response.body;
        expect(Array.isArray(result)).toBe(true);
      });
  });
  test("returns array containing both a total count and an articles object", () => {
    return request(app)
      .get("/api/articles?limit=5")
      .expect(200)
      .then((response) => {
        const result = response.body;
        expect(result.length).toBe(2);
        expect(result[0].hasOwnProperty("articles")).toBe(true);
        expect(result[1].hasOwnProperty("total_count")).toBe(true);
      });
  });
  test("returns articles array of correct length given by limit query", () => {
    return request(app)
      .get("/api/articles?limit=5")
      .expect(200)
      .then((response) => {
        const result = response.body[0].articles;
        expect(result.length).toBe(5);
      });
  });
  test("returns an appropriate status and error message when given an invalid limit query", () => {
    return request(app)
      .get("/api/articles?limit=ARTICLE")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
  test("should retrieve all articles when using limit all", () => {
    return request(app)
      .get("/api/articles?limit=ALL")
      .expect(200)
      .then((response) => {
        const result = response.body[0].articles;
        expect(result.length).toBe(18);
      });
  });
  test("returns default limit of 10 when articles not given a limit query", () => {
    return request(app)
      .get("/api/articles?p=1")
      .expect(200)
      .then((response) => {
        const result = response.body[0].articles;
        expect(result.length).toBe(10);
      });
  });
  test("should return correct article count in response, unaffected by limit", () => {
    return request(app)
      .get("/api/articles?p=1")
      .expect(200)
      .then((response) => {
        const result = response.body[1].total_count;
        expect(result).toBe(18);
      });
  });
  test("should return correct article count with filter applied, when limiting articles ", () => {
    return request(app)
      .get("/api/articles?limit=3&topic=mitch")
      .expect(200)
      .then((response) => {
        const result = response.body[1].total_count;
        expect(result).toBe(17);
      });
  });
});
describe("GET /api/articles (pagination page query) ", () => {
  test("response code is 200", () => {
    return request(app).get("/api/articles?p=1").expect(200);
  });
  test("returns an array", () => {
    return request(app)
      .get("/api/articles?limit=20&p=1")
      .expect(200)
      .then((response) => {
        const result = response.body[0].articles;
        expect(Array.isArray(result)).toBe(true);
      });
  });
  test("returns correct number of articles for first page", () => {
    return request(app)
      .get("/api/articles?limit=5&p=1")
      .expect(200)
      .then((response) => {
        const result = response.body[0].articles;
        expect(result.length).toBe(5);
      });
  });
  test("returns correct number of articles for last page", () => {
    return request(app)
      .get("/api/articles?limit=5&p=4")
      .expect(200)
      .then((response) => {
        const result = response.body[0].articles;
        expect(result.length).toBe(3);
      });
  });
  test("returns correct first article", () => {
    return request(app)
      .get("/api/articles")
      .then((response) => {
        const articles = response.body;
        return request(app)
          .get("/api/articles?limit=1&p=1")
          .expect(200)
          .then((response) => {
            const result = response.body[0].articles;
            expect(result[0]).toEqual(articles[0]);
          });
      });
  });
  test("returns correct first article for second page", () => {
    return request(app)
      .get("/api/articles")
      .then((response) => {
        const articles = response.body;
        return request(app)
          .get("/api/articles?limit=5&p=2")
          .expect(200)
          .then((response) => {
            const result = response.body[0].articles;
            expect(result[0]).toEqual(articles[5]);
          });
      });
  });
  test("returns correct article when using default limit", () => {
    return request(app)
      .get("/api/articles?p=2")
      .expect(200)
      .then((response) => {
        const result = response.body[0].articles;
        expect(result[0]).toMatchObject({
          comment_count: "2",
          article_id: 5,
          title: "UNCOVERED: catspiracy to bring down democracy",
          topic: "cats",
          author: "rogersop",
          created_at: "2020-08-03T13:14:00.000Z",
          votes: -1,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("returns an appropriate status and error message for an invalid page request", () => {
    return request(app)
      .get("/api/articles?p=pagefive")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
  test("should return correct article count with filter applied, when offset to another page", () => {
    return request(app)
      .get("/api/articles?p=2&topic=cats")
      .expect(200)
      .then((response) => {
        const result = response.body[1].total_count;
        expect(result).toBe(1);
      });
  });
});

describe("GET /api/articles/:article_id/comments (pagination limit query) ", () => {
  test("response code is 200", () => {
    return request(app).get("/api/articles/1/comments?limit=5").expect(200);
  });

  test("returns a comments array", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5")
      .expect(200)
      .then((response) => {
        const result = response.body;
        expect(Array.isArray(result)).toBe(true);
      });
  });

  test("returns comments array of correct length given by limit query", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5")
      .expect(200)
      .then((response) => {
        const result = response.body;
        expect(result.length).toBe(5);
      });
  });
  test("returns an appropriate status and error message when given an invalid limit query", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=fiveComments")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
  test("should retrieve all comments when using limit all", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=ALL")
      .expect(200)
      .then((response) => {
        const result = response.body;
        expect(result.length).toBe(11);
      });
  });
  test("returns default limit of 10 when not given a limit query", () => {
    return request(app)
      .get("/api/articles/1/comments?p=1")
      .expect(200)
      .then((response) => {
        const result = response.body;
        expect(result.length).toBe(10);
      });
  });
});

describe("GET /api/articles/:article_id/comments (pagination page query)", () => {
  test("response code is 200", () => {
    return request(app).get("/api/articles/1/comments?p=1").expect(200);
  });
  test("returns an array", () => {
    return request(app)
      .get("/api/articles/1/comments?p=1")
      .expect(200)
      .then((response) => {
        const result = response.body;
        expect(Array.isArray(result)).toBe(true);
      });
  });
  test("returns correct number of comments for a first page", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5&p=1")
      .expect(200)
      .then((response) => {
        const result = response.body;
        expect(result.length).toBe(5);
      });
  });
  test("returns correct number of comments for a last page", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5&p=3")
      .expect(200)
      .then((response) => {
        const result = response.body;
        expect(result.length).toBe(1);
      });
  });

  test("returns correct comment when using limit query", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5&p=1")
      .expect(200)
      .then((response) => {
        const result = response.body;
        expect(result[0]).toMatchObject({
          comment_id: 5,
          body: "I hate streaming noses",
          article_id: 1,
          author: "icellusedkars",
          votes: 2,
          created_at: "2020-11-03T21:00:00.000Z",
        });
      });
  });
  test("returns correct comment when using default limit", () => {
    return request(app)
      .get("/api/articles/1/comments?p=2")
      .expect(200)
      .then((response) => {
        const result = response.body;
        expect(result[0]).toMatchObject({
          article_id: 1,
          author: "icellusedkars",
          body: "Superficially charming",
          comment_id: 9,
          created_at: "2020-01-01T03:08:00.000Z",
          votes: 0,
        });
      });
  });
  test("returns an appropriate status and error message for an invalid page request", () => {
    return request(app)
      .get("/api/articles/1/comments?p=pagetwo")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
});

describe("POST /api/topics", () => {
  test("response code is 201", () => {
    const topic = {
      slug: "a new topic",
      description: "a new topics description",
    };

    return request(app).post("/api/topics").send(topic).expect(201);
  });
  test("returns a topic object", () => {
    const topic = {
      slug: "a new topic 2",
      description: "a new topics description",
    };

    return request(app)
      .post("/api/topics")
      .send(topic)
      .expect(201)
      .then((response) => {
        expect(typeof response.body).toBe("object");
        expect(Array.isArray(response.body)).toBe(false);
        expect(response.body).not.toBeNull();
      });
  });
  test("returns an object with expected keys and values", () => {
    const topic = {
      slug: "a new topic 3",
      description: "a new topics description",
    };

    return request(app)
      .post("/api/topics")
      .send(topic)
      .expect(201)
      .then((response) => {
        expect(response.body).toMatchObject({
          slug: expect.any(String),
          description: expect.any(String),
        });
      });
  });
  test("returns an object with expected keys and values", () => {
    const topic = {
      slug: "a new topic 4",
      description: "a new topics description",
    };

    return request(app)
      .post("/api/topics")
      .send(topic)
      .expect(201)
      .then((response) => {
        expect(response.body).toMatchObject({
          slug: "a new topic 4",
          description: "a new topics description",
        });
      });
  });
  test("returns an appropriate status code and error message when topic slug already exists for another topic", () => {
    const topic = {
      slug: "a new topic 4",
      description: "a new topics description",
    };
    return request(app)
      .post("/api/topics")
      .send(topic)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toEqual("Bad request");
      });
  });
  test("returns an error if given a topic request body with a missing slug", () => {
    const topic = {
      description: "a new topics description",
    };
    return request(app)
      .post("/api/topics")
      .send(topic)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toEqual("Bad request");
      });
  });
});
