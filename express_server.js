const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

//Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//My variables
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let result = '';
  const charcters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += charcters.charAt(Math.floor(Math.random() * charcters.length));
  }
  return result;
}

//Root Page
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body><html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Renders All My URLs Page
app.get("/urls", (req, res) => {
  const templateVars = { username: req.cookies['username'], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Renders Create New TinyURL Page
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies['username'] }
  res.render("urls_new", templateVars);
});

//Renders Edit Page for each Short URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { username: req.cookies['username'], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

//Redirects to Long URL Link
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
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
  res.render("register");
});


//Edit Generates Random Short URL and Adds Key:Value to URL Database
app.post("/urls", (req, res) => {
  console.log(req.body); //log the POST request body to the console
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

//Edit Long URLs of Corresponding Short URLs EJS: urls_show
app.post("/urls/:id", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = req.params.id;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/`);
});

// Edit Creates Login Cookie with Username
app.post("/login", (req, res) => {
  let username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls/');
});

//Edit Logout and Cookie clearing
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls/');
});

//Deletes URLs
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls/`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});