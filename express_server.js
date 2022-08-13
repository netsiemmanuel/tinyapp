const express = require("express");
const cookieSession = require('cookie-session')
const bcrypt = require("bcryptjs");
const {findUserByEmail} = require('./helpers')
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
function urlsForUser(ID,){
  let urlsToShow = []
  for (let key in urlDatabase) {
    if(ID === urlDatabase[key].userID) {
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
const length = 6;
const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
function generateRandomString(length, chars) {
  var result = '';
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}


app.get("/", (req, res) => {
  let val = req.session.user_id
  if (!users[val]) {
    return res.redirect("/login");
  } else {
    res.redirect("/urls")
  }
});
app.get("/urls", (req, res) => {
  let val = req.session.user_id
  if (!users[val]) {
    res.redirect("/login")
  } else {
    
    const templateVars = {
      user: users[req.session.user_id],
      urls: urlsForUser(req.session.user_id)
    };
    console.log("templateVars",templateVars);
    res.render("urls_index", templateVars);
  }
});
app.get("/urls/new", (req, res) => {
  let val = req.session.user_id
  if (!users[val]) {
    res.redirect("/login")
  } else {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_new", templateVars);
  }
});
app.get("/u/:id", (req, res) => {
  console.log(req.params.id);
  let val = req.session.user_id
  // check if val is a real user
  console.log(urlDatabase);
  if (urlDatabase.hasOwnProperty(req.params.id)) {
    console.log(urlDatabase[req.params.id].longUrl);
    const templateVars = {
      id: req.params.id, longURL: urlDatabase[req.params.id].longUrl,
      user: users[req.session.user_id],
    };
    res.render("urls_show", templateVars);
  } else {
    res.send("id not found")
  }
});
app.get("/register", (req, res) => {
  let val = req.session.user_id 
  // check if val is a real user
  if (users[val]) {
    res.redirect("/urls")
  } else {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render("user_registration", templateVars);
  }
});
app.get("/login", (req, res) => {
  let val = req.session.user_id
  if (users[val]) {
    res.redirect("/urls")
  } else {
    const templateVars = {
      user: users[req.session.user_id],
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
  console.log(users);
   return res.status(400).send("email already registered.") 
});
app.post("/urls/new", (req, res) => {
  console.log("created new url")
  console.log(req.body['longURL'])
  let val = req.session.user_id
  if (!users[val]) {
    return res.send("you have to login to create short urls.")
  } else {
    let id = generateRandomString(length, chars)
    console.log(id);
    urlDatabase[id]= {longUrl: req.body['longURL'], userID: req.session.user_id}

    res.redirect("/u/" + id)
  }
}); 
app.post("/edit/:id", (req, res) => {
  let myUrl = urlsForUser(req.session.user_id)
  let status = req.session.user_id
  if (!users[status]) {
    res.send("Please login to continue.")
  }
  for (let val of myUrl) {
    if (val.userId !== req.session.user_id ) {
      res.send("you can not access urls that you don't own.")
    } else if (val.userId === req.session.user_id && val.shortUrl=== req.params.id ) {
      urlDatabase[req.params.id].longUrl = req.body['longURL']
    } else {
      res.send ("url not found")
    }
  }
     res.redirect("/urls")
  
});
app.post("/urls/:id/delete", (req, res) => {
  let myUrl = urlsForUser(req.session.user_id)
  let status = req.session.user_id
  if (!users[status]) {
    res.send("Please login to continue.")
  }
  for (let val of myUrl) {
    if (val.userId !== req.session.user_id ) {
      res.send("you can not access urls that you don't own.")
    } else if (val.userId === req.session.user_id && val.shortUrl=== req.params.id ) {
      delete urlDatabase[req.params.id]
    } else {
      res.send ("url not found")
    }
  }
     res.redirect("/urls")
});
app.post("/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  //console.log(username);
  const user = findUserByEmail(email, users)
  //console.log(users)
  if (!user) {
    return res.status(403).send("email not registered")
  }
  let pass = user.password
  if (!bcrypt.compareSync(req.body.password, pass)) {
    return res.status(403).send("wrong password")
  }
  
    req.session.user_id = user.id  // creates a cookie
    res.redirect("/urls")
  
});
app.post("/redirect", (req, res) => {
  res.redirect("/login")
})
app.post("/registration", (req, res) => {
  res.redirect("/register")
})
app.post("/logout", (req, res) => {
  // destroys cookie
   req.session = null
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});