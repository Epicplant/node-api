/**
 * Christopher Roy
 * 05/06/2020
 * Section AK: Austin Jenchi
 *
 * Javascript code the html file "index.html." This code deals with the keeping track of
 * various values (such as bet and funds) while also being responsible for calling the apps.js
 * API and retrieving cards from a deck and processing them.
 */
"use strict";
(function() {
  window.addEventListener("load", init);
  let tableCards;
  let yourCards = 0;
  let yourBet;
  let yourFunds;
  let yourName;
  let hiddenCard;
  let globalBool;
  const INITIAL_FUNDS = 500;
  const MAX_VALUE = 21;
  const WAIT_TIME = 1500;
  const HIGH_VALUE = 10;

  /**
   * The init function. Ensures all code in index.js doesn't run before DOM is loaded.
   * On top of this, it initilizes various eventListeners and acts as a login by
   * accepting a players name and giving them their funds from their previous game.
   */
  function init() {
    id("start-game").addEventListener("click", startTheGame);
    id("name").addEventListener("click", function() {
      id("name").value = "";
    });
    id("begin-dealing").addEventListener("click", function() {
      if (id("bet").value <= yourFunds && id("bet").value !== "") {
        id("bet-menu").classList.add("hidden");
        id("game-menu").classList.remove("hidden");
        initilizeGame();
        id("draw").addEventListener("click", getCard);
      }
    });
    id("end").addEventListener("click", function() {
      if (yourCards >= tableCards) {
        gameOver("won");
      } else {
        gameOver("lost");
      }
    });
  }

  /**
   * A function that essentially logs a player into their account
   * by retrieving the players inputted name and seeing that persons
   * associated fund value.
   */
  async function startTheGame() {
    if (id("name").value !== "") {
      yourName = id("name").value;
      yourFunds = INITIAL_FUNDS;
      await doesNameExist();
      if (globalBool) {
        await changeState();
      } else {
        id("current-funds").textContent = INITIAL_FUNDS;
      }
      id("start-menu").classList.add("hidden");
      id("bet-menu").classList.remove("hidden");
    }
  }

  /**
   * This function makes a fetch request and returns from the server app.js a "true" or a "false"
   * string depending on whether a specific name exists in the storage for game data.
   * @return {Promise} -Returns a promise consisting of the answer "true" or "false."
   */
  function doesNameExist() {
    let formData = new FormData();
    formData.append("playerName", yourName);
    return fetch("/nameCheck", {
      method: "POST",
      body: formData
    })
      .then(checkStatus)
      .then(resp => resp.text())
      .then(function(bool) {
        if (bool === "true") {
          globalBool = true;
        } else {
          globalBool = false;
        }
      })
      .catch(handleError);
  }

  /**
   * This function sets current funds of the game to the number associted with an inputted
   * name already in the file storage. (i.e. Charles as $550 and so $550 will be returned
   * for this request).
   * @returns {Promise} - Returns a promise containing a specific players current funds.
   */
  function changeState() {
    let formData = new FormData();
    formData.append("playerName", yourName);
    return fetch("/getData", {
      method: "POST",
      body: formData
    })
      .then(checkStatus)
      .then(resp => resp.text())
      .then(function(playerFunds) {
        id("current-funds").textContent = parseInt(playerFunds);
        yourFunds = parseInt(playerFunds);
      })
      .catch(handleError);
  }

  /**
   * This function acts as a get fetch which simply grabs two starting cards with the /set
   * endpoint. The two cards will be put in the dealers hand.
   */
  function initilizeGame() {
    fetch("/set")
      .then(checkStatus)
      .then(resp => resp.json())
      .then(setCards)
      .catch(handleError);
  }

  /**
   * This function builds the cards used by the dealer and also calls for the player to draw a card.
   * One of the dealers cards will be displayed as the back of a card to hide its value.
   * @param {JSON} starterCards -Two randomly returned card image value paths.
   */
  function setCards(starterCards) {
    yourBet = parseInt(id("bet").value);
    let card1 = gen("img");
    card1.src = "Images/card_back.png.jpg";
    card1.alt = "The card: " + starterCards.Card1;
    hiddenCard = starterCards.Card1;
    let card2 = gen("img");
    card2.src = "Images/png/" + starterCards.Card2;
    card1.alt = "The card: " + starterCards.Card2;
    id("dealer").appendChild(card1);
    id("dealer").appendChild(card2);
    tableCards = parseInt(getValue(starterCards.Card1)) + parseInt(getValue(starterCards.Card2));
    getCard();
  }

  /**
   * This function makes a call to the app.js endpoint /getCard which returns a
   * single card image path and is used to give the player a card.
   */
  function getCard() {
    fetch("/getCard")
      .then(checkStatus)
      .then(resp => resp.json())
      .then(retrieve)
      .catch(handleError);
  }

  /**
   * This function is used too generate a card for the player on their side of the board
   * and also ends teh game if your overall card value is over 21.
   * @param {JSON} cardInfo - Returns the image path for a single card
   */
  function retrieve(cardInfo) {
    let card = gen("img");
    let cardVal = cardInfo.Card;
    card.src = "Images/png/" + cardVal;
    id("cards").appendChild(card);
    yourCards += parseInt(getValue(cardVal));
    if (yourCards > MAX_VALUE) {
      gameOver("lost");
    }
  }

  /**
   * This function is called when the game ends and begins the games endstate by subracting/adding
   * total funds and displaying whether the game is won or lost.
   * @param {String} gameState - states whether game is won or lost by stating "won" or "lost"
   */
  function gameOver(gameState) {
    let wonOrLost = gen("p");
    id("end-game").appendChild(wonOrLost);
    wonOrLost.id = "game-decision";
    let newFunds;

    if (gameState === "lost") {
      wonOrLost.textContent = "You Lost";
      newFunds = parseInt(yourFunds) - parseInt(yourBet);
    } else {
      wonOrLost.textContent = "You Won";
      newFunds = parseInt(yourFunds) + parseInt(yourBet);
    }
    yourFunds = newFunds;
    id("current-funds").textContent = newFunds;
    id("dealer").children[0].src = "Images/png/" + hiddenCard;
    setTimeout(function() {
      id("game-menu").classList.add("hidden");
      id("end-game").classList.remove("hidden");
      id("return").addEventListener("click", reset);
    }, WAIT_TIME);
  }

  /**
   * This function resets the board/game when the "return" button is pressed. Furthermore,
   * it stores new game data into game records file.
   */
  function reset() {
    id("return").removeEventListener("click", reset);
    id("cards").innerHTML = "";
    id("dealer").innerHTML = "";
    id("game-decision").remove();
    yourCards = 0;
    tableCards = 0;
    id("end-game").classList.add("hidden");
    id("start-menu").classList.remove("hidden");
    storeGame();
  }

  /**
   * This function stores current game data to blackjack records in the file BlackJack_Records.txt
   * after taking in the players name and there current funds.
   */
  function storeGame() {
    let formData = new FormData();
    formData.append("currentFunds", yourFunds);
    formData.append("playerName", yourName);

    fetch("/storeGame", {
      method: "POST",
      body: formData
    })
      .then(checkStatus)
      .catch(handleError);
  }

  /**
   * Returns the value of a card path in order to add up total card values.
   * @param {String} card - A card string such as 2C.png or KD.png.
   * @return {Integer} -The numerical value of a card.
   */
  function getValue(card) {
    if (card.match(/10/) || card.match(/^[b-z]/)) {
      return HIGH_VALUE;
    } else if (card.match(/[\d]/)) {
      return card[0];
    } else if (card[0] === "a") {
      return 1;
    }
  }

  /**
   * This function displays an error when an error is caught during a fetch request in every single
   * section.
   * @param {Error} error -An error caught during a fetch request.
   */
  function handleError(error) {
    id("game-menu").appendChild(gen("p")).textContent =
    "There was an Error: [" + error + "]";
    id("bet-menu").appendChild(gen("p")).textContent =
    "There was an Error: [" + error + "]";
    id("start-menu").appendChild(gen("p")).textContent =
    "There was an Error: [" + error + "]";
    id("end-game").appendChild(gen("p")).textContent =
    "There was an Error: [" + error + "]";
  }

  /**
   * This function accepts an id name and gets said elemeny from the html page index.html.
   * @param {String} idName - A name of an elements id in index.html.
   * @return {Element} - Returns an element with a specific ID.
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * This function accepts the name of an element type and then creates it.
   * @param {String} elName - The name of an element that is to be created.
   * @return {Element} gen - Returns a newly created element.
   */
  function gen(elName) {
    return document.createElement(elName);
  }

  /**
   * This function checks a promises status and depending on whether there is a resolved or
   * rejected state it will accordingly return the response or throw an error.
   * @param {Promise} response - A promise from a fetch which, in thise case, contains
   * data from the last.fm API.
   * @return {Promise} response - Returns the inputted parameter if there was no error
   * @throw {Error} error - A thrown error in string format
   */
  function checkStatus(response) {
    if (response.ok) {
      return response;
    }
    throw Error("Error in request: " + response.statusText);
  }

})();