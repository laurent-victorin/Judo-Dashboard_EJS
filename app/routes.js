const express = require("express");
const passport = require("passport"); // Assurez-vous que Passport est configuré si utilisé ici
const router = express.Router();
const tablesState = require("./tablesState.js"); // Importez le module

// Middleware pour vérifier l'authentification
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

// Page d'accueil - Redirige en fonction de l'état d'authentification
router.get("/", function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/cd33");
  } else {
    res.render("home");
  }
});

// Route de login - Affiche la page de login
router.get("/login", (req, res) => {
  res.render("login");
});

// Gestion de la soumission du formulaire de login
router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/cd33");
  }
);

// ... Ajoutez ici vos autres routes ...

// Déconnexion
router.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

router.get("/cd33", ensureAuthenticated, function (req, res) {
  res.render("cd33", { tablesInUse: tablesState.getTablesInUse() });
});

// Route pour chaque table spécifique - Affiche la page de la table
router.get("/cd33/table:tableNum", ensureAuthenticated, function (req, res) {
  const tableNum = req.params.tableNum; // Capture le numéro de la table à partir de l'URL
  // Vous pouvez ajouter des validations ou des logiques supplémentaires ici si nécessaire

  // Rendre la vue pour la table spécifique avec le numéro de table
  res.render("table", { tableNum: tableNum });
});

// Route pour le control de chaque table
router.get(
  "/cd33/table:tableNum/control",
  ensureAuthenticated,
  function (req, res) {
    // Logique pour afficher la page de contrôle spécifique à la table
    res.render("control", { tableNum: req.params.tableNum });
  }
);

// Route pour l'affichage de chaque table
router.get(
  "/cd33/table:tableNum/display",
  ensureAuthenticated,
  function (req, res) {
    // Logique pour afficher la page d'affichage spécifique à la table
    res.render("display", { tableNum: req.params.tableNum });
  }
);

module.exports = router;
