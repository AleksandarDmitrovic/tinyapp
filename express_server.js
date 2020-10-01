const express = require("express");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const datefns = require("date-fns");
const { parseFromTimeZone, formatToTimeZone } = require('date-fns-timezone')
const { listTimeZones } = require('timezone-support')

//--My Imports--//
//Helper Functions
const { getUserByEmail, urlsForUser, generateRandomString } = require("./helpers");

//---Server Setup---//
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.set('trust proxy', 1);

//---Middleware---//
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['super-long-secret-keys', 'typically-not-embedded-in-code']
}));
app.use(methodOverride('_method'));

//---Databases My Global Variables---//
let urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID", visits: 0, uniqueVisits: 0, visitList: [] },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID", visits: 0, uniqueVisits: 0, visitList: [] },
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2b$10$dHaDELTlnfrlMplszy7P1eZibQ4IHD1Dss3eI.dneqPX1SeEKhSu2" //password 123
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2b$10$cowaKSEEXvCh8Hq7M0piWuYMYi2Yz29bBY8NLlPGRwrg7x2s6b.J6" //dishwasher-funk
  }
};

//---Routes---//

//READ ROUTES

//Root redirects to /urls
app.get("/", (req, res) => {
  if (req.session['user_id']) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

//Renders All My URLs Page
app.get("/urls", (req, res) => {
  const id = req.session['user_id'];
  const usersURLs = urlsForUser(id, urlDatabase);
  const templateVars = { user_id: users[req.session['user_id']], urls: usersURLs };
  res.render("urls_index", templateVars);
});

//Renders Create New TinyURL Page
app.get("/urls/new", (req, res) => {
  const templateVars = { user_id: users[req.session['user_id']] };
  if (req.session['user_id']) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

//Renders Edit Page for each Short URL
app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send("URL does not exist");
  }
  const shortURL = req.params.shortURL;
  const usersURLs = urlsForUser(req.session['user_id'], urlDatabase);

  if (!(shortURL in usersURLs)) {
    return res.status(404).send("Authentication Required");
  } else {

    const longURLValue = urlDatabase[shortURL].longURL;
    const visits = urlDatabase[shortURL].visits;
    const uniqueVisits = urlDatabase[shortURL].uniqueVisits;
    const visitList = urlDatabase[shortURL].visitList;

    const templateVars = { user_id: users[req.session['user_id']], longURL: longURLValue, shortURL, visits, uniqueVisits, visitList };
    res.render("urls_show", templateVars);
  }
});

//Redirects to Long URL Link
app.get("/u/:shortURL", (req, res, next) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send("URL does not exist");
  } else {

    const shortURLObj = urlDatabase[req.params.shortURL];

    //Track Total Visits to each Short URL
    const totalVisits = shortURLObj['visits'];
    shortURLObj['visits'] = totalVisits + 1;

    // const timeZones = listTimeZones()
    // console.log('timeZones :', timeZones);

    //Date and Time stamp + Unique visitor ID
    const date = new Date()
    const format = 'D.M.YYYY HH:mm:ss (z)'
    const output = formatToTimeZone(date, format, { timeZone: 'America/Edmonton' })
    const datetime = output;
    const visitorID = generateRandomString(8);

    // shortURLObj.visitList += { [visitorID]: datetime };
    shortURLObj.visitList.push({ visitorID, datetime });

    //Track Total Unique Visits to Short URL
    const uniqueVisits = shortURLObj['uniqueVisits'];
    if (!req.session.uniqueVisitor) {
      req.session.uniqueVisitor = generateRandomString(6);
      shortURLObj['uniqueVisits'] = uniqueVisits + 1;
    }

    const longURL = shortURLObj['longURL'];
    res.redirect(longURL);
  }
});

//Renders Registration Form
app.get("/register", (req, res) => {
  if (req.session['user_id']) {
    res.redirect(`/urls/`);
  } else {
    const templateVars = { user_id: users[req.session['user_id']] };
    res.render("register", templateVars);
  }
});

//Renders Login Page
app.get("/login", (req, res) => {
  if (req.session['user_id']) {
    res.redirect(`/urls/`);
  } else {
    const templateVars = { user_id: users[req.session['user_id']] };
    res.render("login", templateVars);
  }
});

//ACTION ROUTES

//ADD ROUTES

//Add- Generates Random Short URL and Adds Key:Value to URL Database
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  const longURL = req.body.longURL;
  const id = req.session['user_id'];
  urlDatabase[shortURL] = { longURL, userID: id, visits: 0, uniqueVisits: 0, visitList: [] };
  res.redirect(`/urls/${shortURL}`);
});

//Add- Creates Login Cookie with User ID & Hashed Password
app.post("/login", (req, res) => {
  const { email, password } = req.body; // Short hand for creating email password constants
  let foundUser = null;
  if (getUserByEmail(email, users) !== undefined) {
    foundUser = getUserByEmail(email, users);
  }
  if (foundUser === null) {
    return res.status(404).send("Incorrect Email or Password");
  }
  if (!bcrypt.compareSync(password, foundUser.password)) {
    return res.status(404).send("Incorrect Email or Password");
  }

  req.session.user_id = foundUser.id;

  res.redirect('/urls/');
});

//Add- Registration Handler for New User Creation
app.post('/register', (req, res) => {
  const id = generateRandomString(6);
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === '' || password === '') {
    return res.status(404).send("Invalid email or password");
  }

  if (getUserByEmail(email, users) !== undefined) {
    return res.status(404).send("User Email Already Exists");
  }
  const newUser = {
    id,
    email,
    password: hashedPassword
  };
  users[id] = newUser;

  req.session.user_id = id;
  res.redirect('/urls/');
});

//EDIT ROUTES

//Edit- Transforms Long URLs of Corresponding Short URLs EJS: urls_show
app.put("/urls/:id", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.id;
  const usersURLs = urlsForUser(req.session['user_id'], urlDatabase);
  if (!(shortURL in usersURLs)) {
    return res.status(404).send("Authentication Required");
  }
  urlDatabase[shortURL].longURL = longURL;
  res.redirect(`/urls/`);
});

//DELETE ROUTES

//Delete- Logout and Cookie Clearing
app.delete("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls/');
});

//Delete- Removes URLs from database
app.delete("/urls/:shortURL/delete", (req, res) => {
  if (!req.session['user_id']) {
    return res.status(404).send("Authentication Required");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls/`);
});

//-------------------------------------------------------//

//Catchall to send user to error page if url isn't valid
app.get('*', (req, res) => {
  res.status(404).send('page not found');
});

//---Server Listener---//
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});