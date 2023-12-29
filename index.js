// server.js
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

io.on("connection", function (socket) {
  socket.on("update names", function (data) {
    // Envoie les noms mis à jour à tous les clients, y compris display.ejs
    io.emit("update names", data);
    socket.setMaxListeners(50);
  });
  socket.on("disconnect", () => {});
});

io.on("connection", function (socket) {
  socket.on("update clubs", function (data) {
    // Retransmettre l'information à tous les clients
    io.emit("update clubs", data);
    socket.setMaxListeners(50);
  });
  socket.on("disconnect", () => {});
});

io.on("connection", function (socket) {
  socket.on("timer update", function (timeRemaining) {
    io.emit("timer update", timeRemaining);
    socket.setMaxListeners(50);
  });
  socket.on("disconnect", () => {});
});

io.on("connection", function (socket) {
  socket.on("score update", function (data) {
    // Retransmettre les scores mis à jour à tous les clients
    io.emit("score update", data);
    socket.setMaxListeners(50);
  });
  socket.on("disconnect", () => {});
});

io.on("connection", function (socket) {
  socket.on("shido update", function (data) {
    io.emit("shido update", data);
    socket.setMaxListeners(50);
  });
  socket.on("disconnect", () => {});
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
