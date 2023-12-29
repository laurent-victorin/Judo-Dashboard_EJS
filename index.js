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
  console.log("New client connected");

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
  // You'll need to implement the start, stop, and reset logic based on your application's needs
  socket.on("start osaekomi", function (data) {
    // Start the osaekomi timer logic here
    // and regularly emit 'update osaekomi' events with the time and player
  });

  socket.on("stop osaekomi", function (data) {
    // Stop the osaekomi timer logic here
  });

  socket.on("reset osaekomi", function (data) {
    // Reset the osaekomi timer logic here
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
