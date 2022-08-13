const { assert } = require('chai');
const { findUserByEmail }= require('../helpers')
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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID"
   assert.deepStrictEqual(user, expectedUserID)
  });
  it('should return undefined if user enters an email that does not exist in the database', function() {
    const user = findUserByEmail("user@4example.com", testUsers)
   assert.deepStrictEqual(user, null)
  } )
});