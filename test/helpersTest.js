const { assert } = require("chai");

const { getUserByEmail, urlsForUser } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', () => {
  it("should return a user with valid email", () => {
    const user = getUserByEmail('user@example.com', testUsers);
    const expectedOutput = testUsers['userRandomID'];

    assert.deepEqual(user, expectedOutput);
  });
  it("should return undefined with an invalid email", () => {
    const user = getUserByEmail('invalid@example.com', testUsers);
    const expectedOutput = undefined;

    assert.deepEqual(user, expectedOutput);
  });
});

let urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" },
};

describe('urlsForUser', () => {
  it("should return a object with urls associated to the userID", () => {
    const user = urlsForUser('userRandomID', urlDatabase);
    const expectedOutput = { 'b2xVn2': urlDatabase['b2xVn2'] };

    assert.deepEqual(user, expectedOutput);
  });
  it("should return an empty object with an invalid userID", () => {
    const user = urlsForUser('invalid@example.com', urlDatabase);
    const expectedOutput = {};

    assert.deepEqual(user, expectedOutput);
  });
});