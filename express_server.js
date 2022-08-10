const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
let length = 6;
let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
function generateRandomString(length, chars){
  var result = '';
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
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
 });
 app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],

    urls: urlDatabase
  };
  res.render("urls_index", templateVars);

});
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new",templateVars);
});
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id],
  username: req.cookies["username"],};
  res.render("urls_show", templateVars);
});
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let id = generateRandomString(length,chars)
  urlDatabase[id] = req.body['longURL']
  res.redirect("/urls/"+id)
 
});

app.post("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id],
    username: req.cookies["username"],};
  res.render("urls_show", templateVars);
  
});
app.post("/urls", (req, res) => {
   urlDatabase[req.params.id] = req.body['longURL']
   res.redirect("/urls/"+id)
}); 
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls")
});
app.post("/login", (req, res) => {
  const username = req.body.username
  console.log(username);
  res.cookie("username", username) // creates a cookie
  res.redirect("/urls")
  /*let ID = req.params.id
  res.cookie("ID",ID)
  console.log("test")
  res.redirect("/urls")*/
})
app.post("/logout", (req, res) =>{
  // destroys cookie
  res.clearCookie("username")
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});