require("dotenv").config();
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

const socket_io = require("socket.io")(server);
const socketsConnected = new Set();

socket_io.on("connection", onConnected);

function onConnected(socket) {
  console.log(socket.id);
  socketsConnected.add(socket.id);

  socket_io.emit('clients-total', socketsConnected.size);

  socket.on('disconnected', () => {
    console.log("Socket disconnected: " + socket.id);
    socketsConnected.delete(socket.id);
    socket_io.emit('clients-total', socketsConnected.size);
  });

  socket.on("message", (data) => {
    socket.broadcast.emit("chat-message", data);
  });

  socket.on("feedback", (data) => {
    socket.broadcast.emit("feedback", data);
  });
}

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", "views");
