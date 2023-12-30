const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/control", (req, res) => {
  res.render("control");
});

app.get("/display", (req, res) => {
  res.render("display");
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

  // Handle disconnect
  socket.on("disconnect", () => {});
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
