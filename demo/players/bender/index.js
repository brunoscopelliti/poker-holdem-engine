"use strict";

const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.status(200).send("200 OK");
});

const player = require("./player");

app.get("/version", (req, res) => {
  res.status(200).send(player.VERSION);
});

app.post("/bet", (req, res) => {
  res.status(200).send(player.bet(req.body).toString());
});

const server = http.Server(app);

server.listen(Number.parseInt(process.env.PORT), () => {
  console.log("Server listening on port", server.address().port);
});
