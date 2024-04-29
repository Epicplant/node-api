# Blackjack/Card_Draw API Documentation
The purpose of the API is to simulate the drawing of playing cards from a deck. Inside of it,
there are calls for either drawing to randomly selected cards or one
among other useful endpoints when making a card game. Requires a deck of images
to already exist in a folder path consisting of /public/Images/PNG as well as a file by the name
of blackjack_records.txt.
## *storeGame endpoint which stores player funds and their name*
**Request Format:** "/storeGame".

**Request Type:** POST.

**Returned Data Format**: Returns nothing.

**Description:** Takes a players funds and currency and stores the data in a file called
BlackJack_Records in the form of PLAYER_NAME:PLAYER_FUNDS.

**Example Request:** /storeGame
(Params sent through body)

**Example Response:**
RETURNS NOTHING

**Error Handling:**
Type 500 Error Server failed in process

## *getCard endpoint which takes a card image path and returns it*
**Request Format:** "/getCard"

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** This GET request returns a single card from a predefined deck.

**Example Request:** /getCard
(Params sent through body)

**Example Response:**
```json
{
  "Card": card
}
```

**Error Handling:**
Type 500 Error Server failed in process

## *set endpoint which takes two card image paths and returns them*
**Request Format:** /set

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** This GET request returns a two cards from a predefined deck.

**Example Request:**
/set
(Params sent through body)

**Example Response:**

```json
{
  "Card1": card1,
  "Card2": card2
}
```

**Error Handling:**
Type 500 Error Server failed in process

## *getData endpoint which returns a specified players funds from storage*
**Request Format:** /getData

**Request Type:** POST

**Returned Data Format**: Text

**Description:** This post request takes a player name and then returns that players attached funds in
 the file storage for BlackJack.

**Example Request:**
/getData
(Params sent through body)

**Example Response:**
"11"

**Error Handling:**
Type 400 Error No name of this type exists.
Type 500 Error Server failed in process

## *nameCheck endpoint which returns text stating whether the name exists in storage or not*
**Request Format:** /nameCheck

**Request Type:** POST

**Returned Data Format**: Text

**Description:**  This post request returns either true or false depending on whether an inputted name
 exists in blackjack file storage or not.

**Example Request:**
/nameCheck
(Params sent through body)

**Example Response:**
"True"

**Error Handling:**
Type 500 Error Server failed in process
