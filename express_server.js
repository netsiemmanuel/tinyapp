const express = require("express");
const cookieSession = require('cookie-session')
const bcrypt = require("bcryptjs");
const { findUserByEmail } = require('./helpers')
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["random"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};
const urlDatabase = {
  b6UTxQ: {
    longUrl: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longUrl: "https://www.google.ca",
    userID: "aJ48lW",
  },
}; 
// function that selects urls that belong to a user using the user's ID
function urlsForUser(ID,) {
  let urlsToShow = []
  for (let key in urlDatabase) {
    if (ID === urlDatabase[key].userID) {
      let urlObj = {
        shortUrl: key,
        longUrl: urlDatabase[key].longUrl,
        userId: urlDatabase[key].userID
      }
      urlsToShow.push(urlObj)
    }
  }
  return urlsToShow;
}
// function that generates a random string
const length = 6;
const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
function generateRandomString(length, chars) {
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}


app.get("/", (req, res) => {
  if (!users[req.session.user_id]) {
    return res.redirect("/login");
  } else {
    res.redirect("/urls")
  }
});


app.get("/urls", (req, res) => {
  const val = req.session.user_id
  if (!users[val]) {
    res.redirect("/login")
  } else {

    const templateVars = {
      user: users[val],
      urls: urlsForUser(val)
    };
    res.render("urls_index", templateVars);
  }
});


app.get("/urls/new", (req, res) => {
  const val = req.session.user_id
  if (!users[val]) {
    res.redirect("/login")
  } else {
    const templateVars = {
      user: users[val],
    };
    res.render("urls_new", templateVars);
  }
});


app.get("/urls/:id", (req, res) => {
  const val = req.session.user_id
  const myUrl = urlsForUser(val)

  // check if val is a real user 
  if (users[val]) {
    for (let i of myUrl) {
      if (i.userId !== val) {
        res.send("you can not access urls that you don't own.")
      } else if (i.userId === val) {
        if (urlDatabase.hasOwnProperty(req.params.id)) {
          const templateVars = {
            id: req.params.id, longURL: urlDatabase[req.params.id].longUrl,
            user: users[val],
          };
          res.render("urls_show", templateVars);
        } else {
          res.send("id not found")
        }
      }
    }
  }
  res.send("Please login to access urls!")
});


app.get("/u/:id", (req, res) => {
  if (urlDatabase.hasOwnProperty(req.params.id)) {
    const templateVars = {
      id: req.params.id, longURL: urlDatabase[req.params.id].longUrl
    };
    res.render("longUrl_show", templateVars)
  } 
  else {
    res.send("url not found!")
  }
})


app.get("/register", (req, res) => {
  const val = req.session.user_id
  // check if val is a real user
  if (users[val]) {
    res.redirect("/urls")
  } else {
    const templateVars = {
      user: users[val],
    };
    res.render("user_registration", templateVars);
  }
});


app.get("/login", (req, res) => {
  const val = req.session.user_id
  if (users[val]) {
    res.redirect("/urls")
  } else {
    const templateVars = {
      user: users[val],
    };
    return res.render("user_login", templateVars)
  }
});


app.post("/register", (req, res) => {
  let id = generateRandomString(length, chars)
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    return res.status(400)
      .send("Input can not be empty!")
  }
  if (findUserByEmail(email, users) === null) {
    const newUser = {
      id: id,
      email: email,
      password: bcrypt.hashSync(password, 10)
    };
    users[id] = newUser;
    req.session.user_id = id

    return res.redirect("/urls")
  }
  return res.status(400).send("email already registered.")
});


app.post("/urls/new", (req, res) => {
  const val = req.session.user_id
  if (!users[val]) {
    return res.send("you have to login to create short urls.")
  } else {
    let id = generateRandomString(length, chars)
    urlDatabase[id] = { longUrl: req.body['longURL'], userID: val}
    res.redirect("/urls/" + id)
  }
});


app.post("/urls/:id", (req, res) => {
  const val = req.session.user_id
  const myUrl = urlsForUser(val)
  if (!users[val]) {
    res.send("Please login to continue.")
  }
  for (let i of myUrl) {
    if (i.userId !== val) {
      res.send("you can not access urls that you don't own.")
    } else if (i.userId === val && i.shortUrl === req.params.id) {
      urlDatabase[req.params.id].longUrl = req.body['longURL']
    } else {
      res.send("url not found")
    }
  }
  res.redirect("/urls")
});


app.post("/urls/:id/delete", (req, res) => {
  const val = req.session.user_id
  const myUrl = urlsForUser(val)
  if (!users[val]) {
    res.send("Please login to continue.")
  }
  for (let i of myUrl) {
    if (i.userId !== val) {
      res.send("you can not access urls that you don't own.")
    } else if (i.userId === val && val.shortUrl === req.params.id) {
      delete urlDatabase[req.params.id]
    } else {
      res.send("url not found")
    }
  }
  res.redirect("/urls")
});


app.post("/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const user = findUserByEmail(email, users)
  if (!user) {
    return res.status(403).send("email not registered")
  }
  const pass = user.password
  if (!bcrypt.compareSync(req.body.password, pass)) {
    return res.status(403).send("wrong password")
  }

  req.session.user_id = user.id  // creates a cookie
  res.redirect("/urls")

});


app.post("/redirect", (req, res) => {
  res.redirect("/login")
});


app.post("/registration", (req, res) => {
  res.redirect("/register")
});


app.post("/logout", (req, res) => {
  // destroys cookie
  req.session = null
  res.redirect("/urls")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});