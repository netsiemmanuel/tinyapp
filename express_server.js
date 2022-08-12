const express = require("express");
const cookieParser = require('cookie-parser')
const bcrypt = require("bcryptjs");
const app = express();
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
function findUserByEmail(email) {
  for (let keys in users) {
    if (users[keys].email === email) {
      return users[keys];
    }
  }
  return null;
}
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  let val = req.cookies["user_id"]
  if (!users[val]) {
    return res.redirect("/login");
  } else {
    res.redirect("/urls")
  }
});
/*app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});*/
app.get("/urls", (req, res) => {
  let val = req.cookies["user_id"]
  if (!users[val]) {
    //res.send("<html><body>Please login or register <a href="/login" > here</a> to continue</body></html>")
    res.redirect("/login")
  } else {
    
    const templateVars = {
      user: users[req.cookies["user_id"]],
      urls: urlsForUser(req.cookies["user_id"])
    };
    console.log("templateVars",templateVars);
    res.render("urls_index", templateVars);
  }
});
app.get("/urls/new", (req, res) => {
  let val = req.cookies["user_id"]
  if (!users[val]) {
    res.redirect("/login")
  } else {
    const templateVars = {
      user: users[req.cookies["user_id"]],
    };
    res.render("urls_new", templateVars);
  }
});
app.get("/urls/:id", (req, res) => {
  console.log(req.params.id);
  //console.log(req.body['longURL'])
  let val = req.cookies["user_id"]
  // check if val is a real user
  console.log(urlDatabase);
  if (urlDatabase[req.params.id].longUrl) {
    console.log(urlDatabase[req.params.id].longUrl);
    const templateVars = {
      id: req.params.id, longURL: urlDatabase[req.params.id].longUrl,
      user: users[req.cookies["user_id"]],
    };
    res.render("urls_show", templateVars);
  } else {
    res.send("id not found")
  }
});
app.get("/register", (req, res) => {
  let val = req.cookies["user_id"]
  // check if val is a real user
  if (users[val]) {
    res.redirect("/urls")
  } else {
    const templateVars = {
      user: users[req.cookies["user_id"]],
    };
    res.render("user_registration", templateVars);
  }
})
app.get("/login", (req, res) => {
  let val = req.cookies["user_id"]
  if (users[val]) {
    res.redirect("/urls")
  } else {
    const templateVars = {
      user: users[req.cookies["user_id"]],
    };
    return res.render("user_login", templateVars)
  }
})
//app.get("/urls/:id/edit", (req, res) => {

app.post("/register", (req, res) => {
  let id = generateRandomString(length, chars)
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    return res.status(400)
      .send("Input can not be empty!")
  }
  else if (findUserByEmail(email) === null) {
    const newUser = {
      id: id,
      email: email,
      password: bcrypt.hashSync(password, 10)
    };
    users[id] = newUser;
    res.cookie("user_id", id)
    res.redirect("/urls")
  } else { res.status(400).send("email already registered.") }
  console.log(users);
})
app.post("/urls/new", (req, res) => {
  console.log("created new url")
  console.log(req.body['longURL'])
  let val = req.cookies["user_id"]
  if (!users[val]) {
    return res.send("you have to login to create short urls.")
  } else {
    //console.log(req.body); // Log the POST request body to the console
    let id = generateRandomString(length, chars)
    console.log(id);
    urlDatabase[id]= {longUrl: req.body['longURL'], userID: req.cookies["user_id"]}

    res.redirect("/urls/" + id)
  }
}); 
app.get("/edit", (req, res) => {
 
  /*console.log("created new url")
  console.log(req.body['longURL'])
  let val = req.cookies["user_id"]
  //if (!users[val]) {
  r//es.send("you have to login to create short urls.")
  //} else {
  //console.log(req.body); // Log the POST request body to the console
  console.log(req.params.id)
  urlDatabase[req.params.id] = req.body['longURL']*/
  res.redirect("/urls")
  //res.redirect("urls/:id")
  //}
});


/*app.post("/urls", (req, res) => {
  urlDatabase[req.params.id] = req.body['longURL']
  res.redirect("/urls/"+id)
}); */
app.post("/edit/:id", (req, res) => {
  let myUrl = urlsForUser(req.cookies["user_id"])
  let status = req.cookies["user_id"]
  if (!users[status]) {
    res.send("Please login to continue.")
  }
  for (let val of myUrl) {
    if (val.userId !== req.cookies["user_id"] ) {
      res.send("you can not access urls that you don't own.")
    } else if (val.userId === req.cookies["user_id"] && val.shortUrl=== req.params.id ) {
      urlDatabase[req.params.id].longUrl = req.body['longURL']
    } else {
      res.send ("url not found")
    }
  }
     res.redirect("/urls")
  
});
app.post("/urls/:id/delete", (req, res) => {
  let myUrl = urlsForUser(req.cookies["user_id"])
  let status = req.cookies["user_id"]
  if (!users[status]) {
    res.send("Please login to continue.")
  }
  for (let val of myUrl) {
    if (val.userId !== req.cookies["user_id"] ) {
      res.send("you can not access urls that you don't own.")
    } else if (val.userId === req.cookies["user_id"] && val.shortUrl=== req.params.id ) {
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
  const user = findUserByEmail(email)
  //console.log(users)
  if (!user) {
    res.status(403).send("email not registered")
  }
  else if (bcrypt.compareSync(password, user.password) === false){
    return res.status(403).send("wrong password")
  }
  else if (user) {
    res.cookie("user_id", user.id)  // creates a cookie
    res.redirect("/urls")
  }
})
app.post("/redirect", (req, res) => {
  res.redirect("/login")
})
app.post("/registration", (req, res) => {
  res.redirect("/register")
})
app.post("/logout", (req, res) => {
  // destroys cookie
  res.clearCookie("user_id")
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});