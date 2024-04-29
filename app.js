/**
 * Christopher Roy
 * 05/06/2020
 * Section AK: Austin Jenchi
 *
 * The blackjack API. This apps.JS both hosts a server for blackjack to be played on and also
 * deals with managing a deck of cards and returning either one of two of them depending on
 * endpoint being called. Also records statistics in a separate file as one of the endpoints.
 */

"use strict";
const express = require('express');
const app = express();
const fs = require("fs").promises;
const multer = require("multer");
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());
let deck;
const INTERNAL_ERROR = 500;
const EXTERNAL_ERROR = 400;
const PORT_NUM = 8000;

app.use(express.static('public'));
setDeck();

/**
 * This function creates a new deck of cards based on image names  in the public/Images folder
 * which are then used to play blackjack.
 */
async function setDeck() {
  const dirNames = await fs.readdir("public/Images/png");
  deck = new Map();
  for (let i = 0; i < dirNames.length; i++) {
    deck.set(i, dirNames[i]);
  }
}

/**
 * This function is used to make it so there is no random index inside of the map (deck) that
 * is null by moving all cards over in the deck as much as possible.
 */
function appendDeck() {
  let remainingCards = deck.values();
  let newDeck = new Map();
  for (let i = 0; i < deck.size; i++) {
    newDeck.set(i, remainingCards.next().value);
  }
  deck = newDeck;
}

/**
 * This post request returns either true or false depending on whether an inputted name
 * exists in blackjack file storage or not. This is used to see whether /getData would work
 * correctly.
 * @return {String} -Either a true or false string.
 * @return {Error} -A internal server error message.
 */
app.post("/nameCheck", async function(req, res) {
  try {
    let name = req.body.playerName;
    let data = await fs.readFile("blackjack_records.txt", "utf8");
    let dataArg = data.split("\n");
    let answer = true;

    for (let i = 0; i < dataArg.length; i++) {
      let finalArg = dataArg[i].split(":");
      if (finalArg[0] === name) {
        answer = false;
        res.type("text").send("true");
      }
    }
    if (answer) {
      res.type("text").send("false");
    }
  } catch (err) {
    res.status(INTERNAL_ERROR).type("text")
      .send("Server failed in process");
  }

});

/**
 * This post request stores an inputted players name and funds in blackjack file storage
 * in the form of "PLAYER_NAME:PLAYER_FUNDS." This is used to save all funds of a specific player.
 * @param {Integer} currentFunds - A players funds.
 * @param {String} playerName - A players name.
 * @return {Error} -A internal server error message.
 */
app.post("/storeGame", async function(req, res) {
  let currentFunds = req.body.currentFunds;
  let playerName = req.body.playerName;
  try {
    let data = await fs.readFile("blackjack_records.txt", "utf8");
    await fs.writeFile("blackjack_records.txt", playerName + ":" + currentFunds + "\n");
    await setDeck();
    let dataArg = data.split("\n");
    for (let i = 0; i < dataArg.length; i++) {
      let finalArg = dataArg[i].split(":");
      if (finalArg[0] !== playerName && finalArg[1] && finalArg[0]) {
        fs.appendFile("blackJack_records.txt", finalArg[0] + ":" + finalArg[1] + "\n");
      }
    }
    res.end();
  } catch (err) {
    res.status(INTERNAL_ERROR).end();
  }
});

/**
 * This post request takes a player name and then returns that players attached funds in
 * the file storage for BlackJack. This is used to update current-funds in client
 * side code.
 * @param {String} - A players Name.
 * @return {String} -A players attached funds.
 * @return {Error} -A internal server error message.
 * @return {Error} -A external server error message.
 */
app.post("/getData", async function(req, res) {
  let name = req.body.playerName;
  let data = await fs.readFile("blackjack_records.txt", "utf8");
  try {
    let dataArg = data.split("\n");
    let answer = true;
    for (let i = 0; i < dataArg.length; i++) {
      let finalArg = dataArg[i].split(":");
      if (finalArg[0] === name && answer) {
        answer = false;
        res.type("text").send(finalArg[1]);
      }
    }
    if (answer) {
      res.status(EXTERNAL_ERROR).type("text")
        .send("No name of this type exists");
    }
  } catch (err) {
    res.status(INTERNAL_ERROR).type("text")
      .send("Server failed in process");
  }
});

/**
 * A get request that returns two randomly selected cards taken from a map (the deck of cards).
 * This is used too initilize the game for the dealer.
 * @return {JSON} -Two card image paths.
 * @return {Error} -An Internal Server Error
 */
app.get("/set", function(req, res) {
  try {
    let randNum = Math.floor(Math.random() * deck.size);
    let card1 = deck.get(randNum);
    deck.delete(randNum);
    appendDeck();

    randNum = Math.floor(Math.random() * deck.size);
    let card2 = deck.get(randNum);
    deck.delete(randNum);
    appendDeck();

    res.json({
      "Card1": card1,
      "Card2": card2
    });
  } catch (err) {
    res.status(INTERNAL_ERROR).type("text")
      .send("Server failed in process");
  }
});

/**
 * A get request that returns a single randomly card taken from a map (the deck of cards).
 * This is used to draw cards for the player.
 * @return {JSON} -A single card image path
 */
app.get("/getCard", function(req, res) {
  try {
    let randNum = Math.floor(Math.random() * deck.size);
    let card = deck.get(randNum);
    deck.delete(randNum);
    appendDeck();
    res.json({
      "Card": card
    });
  } catch (err) {
    res.status(INTERNAL_ERROR).type("text")
      .send("Server failed in process");
  }
});

const PORT = process.env.PORT || PORT_NUM;
app.listen(PORT);