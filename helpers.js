//Helper Functions

//Searchs users Database Returns User Object if Email Found
const getUserByEmail = (email, database) => {

  for (const id in database) {
    if (database[id].email === email) {
      return database[id];
    }
  }

  return false;

};

module.exports = { getUserByEmail };