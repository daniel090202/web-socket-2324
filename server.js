require("dotenv").config();
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const Message = require("./src/models/MessageModel");

const app = express();
const port = process.env.PORT || 8080;

mongoose
  .connect("mongodb://localhost/messenger", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    const server = app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });

    const socket_io = require("socket.io")(server);
    const socketsConnected = new Set();

    socket_io.on("connection", onConnected);

    function onConnected(socket) {
      socketsConnected.add(socket.id);

      socket_io.emit("clients-total", socketsConnected.size);

      Message.find().then((messages) => {
        socket.emit("messages", messages);
      });

      socket.on("disconnected", () => {
        socketsConnected.delete(socket.id);
        socket_io.emit("clients-total", socketsConnected.size);
      });

      socket.on("message", (data) => {
        const message = new Message(data);
        message.save();

        socket.broadcast.emit("chat-message", data);
      });

      socket.on("feedback", (data) => {
        socket.broadcast.emit("feedback", data);
      });
    }
  })
  .catch((error) => {
    console.log("Database connection failed: " + error.message);
  });

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", "views");
