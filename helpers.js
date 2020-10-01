//Helper Functions

//Searchs users Database Returns User Object if Email Found
const getUserByEmail = (email, database) => {

  for (const id in database) {
    if (database[id].email === email) {
      return database[id];
    }
  }

};

//Returns URLs associated with a specific user ID
const urlsForUser = (id, database) => {
  let result = {};

  for (const url in database) {
    if (database[url].userID === id) {
      result[url] = database[url];
    }
  }

  return result;

};

//Generates Alphanumeric string of choosen length
const generateRandomString = (charNum) => {
  let result = '';
  const charcters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < charNum; i++) {
    result += charcters.charAt(Math.floor(Math.random() * charcters.length));
  }
  return result;
};

module.exports = { getUserByEmail, urlsForUser, generateRandomString };