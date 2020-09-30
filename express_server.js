const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");

//---Server Setup---//
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

//---Middleware---//
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//---Databases & My Global Variables---//
let urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" },
};

const generateRandomString = () => {
  let result = '';
  const charcters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += charcters.charAt(Math.floor(Math.random() * charcters.length));
  }
  return result;
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "123"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//Helper Functions
//Searchs users Database Returns User Object if Email Found
const emailLookup = (email) => {

  for (const id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }

  return false;

};

//Returns URLs associated with a specific user ID
const urlsForUser = (id) => {
  let result = {};

  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      result[url] = urlDatabase[url];
    }
  }

  return result;

};

//---Routes---//

//VIEW ROUTES

app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body><html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Renders All My URLs Page
app.get("/urls", (req, res) => {
  const id = req.cookies['user_id'];
  const usersURLs = urlsForUser(id);
  const templateVars = { user_id: users[req.cookies['user_id']], urls: usersURLs };
  res.render("urls_index", templateVars);
});

//Renders Create New TinyURL Page
app.get("/urls/new", (req, res) => {
  const templateVars = { user_id: users[req.cookies['user_id']] };
  if (req.cookies['user_id']) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

//Renders Edit Page for each Short URL
app.get("/urls/:shortURL", (req, res) => {
  const longURLValue = urlDatabase[req.params.shortURL]['longURL'];
  const templateVars = { user_id: users[req.cookies['user_id']], shortURL: req.params.shortURL, longURL: longURLValue };
  res.render("urls_show", templateVars);
});

//Redirects to Long URL Link
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  if (!longURL) {
    console.log('error');
    res.redirect('/');
  } else {
    res.redirect(longURL);
  }
  // console.log('longURL :', longURL);
});

//Renders Registration Form
app.get("/register", (req, res) => {
  const templateVars = { user_id: users[req.cookies['user_id']] };
  res.render("register", templateVars);
});

//Renders Login Page
app.get("/login", (req, res) => {
  const templateVars = { user_id: users[req.cookies['user_id']] };
  res.render("login", templateVars);
});

//ACTION ROUTES

//Add- Generates Random Short URL and Adds Key:Value to URL Database
app.post("/urls", (req, res) => {
  console.log(req.body); //log the POST request body to the console
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const id = req.cookies['user_id'];
  urlDatabase[shortURL] = { longURL, userID: id };
  res.redirect(`/urls/${shortURL}`);
});

//Edit- Transforms Long URLs of Corresponding Short URLs EJS: urls_show
app.post("/urls/:id", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.id;
  const usersURLs = urlsForUser(req.cookies['user_id']);
  if (!(shortURL in usersURLs)) {
    return res.status(404).send("Authentication Required");
  }
  urlDatabase[shortURL].longURL = longURL;
  res.redirect(`/urls/`);
});

//Add- Creates Login Cookie with User ID
app.post("/login", (req, res) => {
  const { email, password } = req.body; // Short hand for creating email password constants
  let foundUser = null;
  if (emailLookup(email) !== false) {
    foundUser = emailLookup(email);
  }
  if (foundUser === null) {
    return res.status(404).send("No user with that email found");
  }
  if (foundUser.password !== password) {
    return res.status(404).send(`Incorrect Password For ${email}`);
  }

  res.cookie('user_id', foundUser.id);

  res.redirect('/urls/');
});

//Edit- Logout and Cookie Clearing
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls/');
});

//Add- Registration Handler for New User Creation
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === '' || password === '') {
    return res.status(404).send("Invalid email or password");
  }

  if (emailLookup(email) !== false) {
    return res.status(404).send("User Email Already Exists");
  }
  const newUser = {
    id,
    email,
    password: hashedPassword
  };
  users[id] = newUser;
  console.log('users :', users);

  res.cookie('user_id', id);
  res.redirect('/urls/');
});

//Delete- Removes URLs from database
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.cookies['user_id']) {
    return res.status(404).send("Authentication Required");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls/`);
});

//Catchall to send user to error page if url isn't valid
app.get('*', (req, res) => {
  res.status(404).send('page not found');
});

//---Server Listener---//
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});