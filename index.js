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
  // Quand un client rejoint une table spécifique
  socket.on("joinTable", (tableId) => {
    socket.join(tableId); // Rejoindre la room pour la table spécifique
  });

  // Écouter les événements pour une table spécifique
  socket.on("someEvent", (data) => {
    // Supposons que data contienne { tableId: 'table01', ... }
    // Réagir seulement dans la room spécifique
    io.to(data.tableId).emit("update", {
      /* Données spécifiques à la table */
    });
  });

  // Handle socket connections
  io.on("connection", function (socket) {
    // Handle animation name & logo
    socket.on("update animation", function (data) {
      // Broadcasting the update to all connected clients
      io.emit("update animation", data);
    });

    // Handle updating names
    socket.on("update names", function (data) {
      io.emit("update names", data);
    });

    // Handle updating clubs
    socket.on("update clubs", function (data) {
      io.emit("update clubs", data);
    });

    // Handle timer updates
    socket.on("timer update", function (timeRemaining) {
      io.emit("timer update", timeRemaining);
    });

    // Handle score updates
    socket.on("score update", function (data) {
      io.emit("score update", data);
    });

    // Handle shido updates
    socket.on("shido update", function (data) {
      io.emit("shido update", data);
    });

    // Handle osaekomi timer updates
    socket.on("update osaekomi", function (data) {
      io.emit("update osaekomi", data);
    });

    // Écouter l'événement 'reset all' pour réinitialiser l'affichage
    socket.on("reset all", function () {
      // Réinitialiser l'état du serveur si nécessaire

      // Envoyer un événement pour réinitialiser l'affichage sur tous les clients
      io.emit("reset display");
    });

    socket.on("designate winner", function (data) {
      // Broadcast the winner to all clients
      io.emit("update winner", data);
    });

    socket.on("toggle winner modal", () => {
      // Transmettre l'information pour afficher/masquer la modale
      io.emit("toggle winner modal display");
    });

    socket.on("update upcoming fighters", function (data) {
      // Retransmettre les informations des prochains combattants à tous les clients
      io.emit("update upcoming fighters", data);
    });

    socket.on("reset upcoming fighters", function () {
      // Retransmettre l'ordre de réinitialisation à tous les clients
      io.emit("reset upcoming fighters");
    });

    // Handle disconnect
    socket.on("disconnect", () => {});
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
