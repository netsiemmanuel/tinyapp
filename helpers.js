function findUserByEmail(email,users) {
  let user = null
  for (let keys in users) {
    if (users[keys].email === email) {
      user = users[keys];
      break;
    }
  }
  console.log("user", user)
  return user;
}
module.exports = { findUserByEmail }