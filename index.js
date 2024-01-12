const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs");
const path = require("path");
const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Middleware pour le parsing des corps de requête
app.use(bodyParser.urlencoded({ extended: false }));

// Configurer la session
app.use(
  session({
    secret: "change_this_secret", // Vous devriez changer cela par une chaîne de caractères sécurisée
    resave: false,
    saveUninitialized: true,
  })
);

// Initialiser Passport et la session de Passport
app.use(passport.initialize());
app.use(passport.session());

// Stratégie d'authentification Passport
passport.use(
  new LocalStrategy(function (username, password, done) {
    if (username === "cd33" && password === "cd33") {
      // Remplacer par votre logique de base de données
      return done(null, { id: "cd33", name: "User CD33" });
    } else {
      return done(null, false);
    }
  })
);
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
  // Ici, trouver l'utilisateur par id dans votre base de données
  done(null, { id: "cd33", name: "User CD33" });
});

// Middleware pour vérifier l'authentification
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

// Routes
app.get("/", function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/cd33"); // Rediriger vers la page spécifique après connexion
  } else {
    res.render("home"); // Afficher la page d'accueil avec le formulaire de connexion
  }
});

app.get("/login", (req, res) => {
  res.render("login"); // Afficher le formulaire de login
});

app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/cd33"); // Rediriger vers la page spécifique après une connexion réussie
  }
);

app.get("/cd33", ensureAuthenticated, function (req, res) {
  res.render("cd33"); // La page après connexion, avec les boutons vers les tables
});

// Vous pouvez ajouter des routes pour chaque table ici

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

// Route pour chaque table spécifique
app.get("/cd33/table:tableNum", ensureAuthenticated, function (req, res) {
  const tableNum = req.params.tableNum; // Capture le numéro de la table de la route
  res.render("table", { tableNum: tableNum }); // Passe le numéro de la table à la vue
});

// Route pour le control de chaque table
app.get(
  "/cd33/table:tableNum/control",
  ensureAuthenticated,
  function (req, res) {
    // Logique pour afficher la page de contrôle spécifique à la table
    res.render("control", { tableNum: req.params.tableNum });
  }
);

// Route pour l'affichage de chaque table
app.get(
  "/cd33/table:tableNum/display",
  ensureAuthenticated,
  function (req, res) {
    // Logique pour afficher la page d'affichage spécifique à la table
    res.render("display", { tableNum: req.params.tableNum });
  }
);

io.on("connection", (socket) => {
  socket.on("joinTable", (tableId) => {
    socket.join(tableId); // Rejoindre la room pour la table spécifique
  });

  socket.on("someEvent", (data) => {
    io.to(data.tableId).emit("update", {});
  });

  socket.on("update animation", function (data) {
    io.emit("update animation", data);
  });

  socket.on("update names", function (data) {
    io.emit("update names", data);
  });

  socket.on("update clubs", function (data) {
    io.emit("update clubs", data);
  });

  socket.on("timer update", function (timeRemaining) {
    io.emit("timer update", timeRemaining);
  });

  socket.on("score update", function (data) {
    io.emit("score update", data);
  });

  socket.on("shido update", function (data) {
    io.emit("shido update", data);
  });

  socket.on("update osaekomi", function (data) {
    io.emit("update osaekomi", data);
  });

  socket.on("reset all", function () {
    io.emit("reset display");
  });

  socket.on("reset display", () => {
    io.emit("reset display");
  });

  socket.on("designate winner", function (data) {
    io.emit("update winner", data);
  });

  socket.on("update fighters info", (data) => {
    io.emit("update fighters info", data);
  });

  socket.on("winner data", function (winnerData) {
    io.emit("winner data", winnerData);
  });

  socket.on("update upcoming fighters", function (data) {
    io.emit("update upcoming fighters", data);
  });

  socket.on("reset upcoming fighters", function () {
    io.emit("reset upcoming fighters");
  });

  socket.on("disconnect", () => {});
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
