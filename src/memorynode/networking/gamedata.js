class GameData {

constructor(io, socket, roomID, users, x, y) {
  this.inGameUsers = [];
  this.socket = socket;
  this.roomID = roomID;
  this.currentUserIndex = 0;
  this.io = io;
  this.foundPairs = 0;
  this.totalPairs = (x*y)/2;
  this.gameCompleted = false;

  for(var i = 0; i < users.length; i++) {
    this.inGameUsers[i] = users[i];
  }

  // Reset users points
  for(var i = 0; i < users.length; i++) {
    users[i].points = 0;
  }
  this.createGameBoard(x, y);
  this.io.in(this.roomID).emit('userTurnChange', {userID: this.inGameUsers[this.currentUserIndex].userID});

}

chooseCard(user_id, xpos, ypos) {
  if(this.inGameUsers[this.currentUserIndex].userID != user_id) {
    return;
  }
  if(!this.hasCardBeenTaken(xpos, ypos)) {
    if(this.firstCard == null) {
      this.gameboardTaken[xpos][ypos] = true;
      this.firstCard = {card: this.gameboard[xpos][ypos], x: xpos, y:ypos}
      this.io.in(this.roomID).emit('flipOverCard', {card: this.firstCard.card, x: this.firstCard.x, y: this.firstCard.y});

    } else if(this.secondCard == null) {
      this.gameboardTaken[xpos][ypos] = true;
      this.secondCard = {card: this.gameboard[xpos][ypos], x: xpos, y:ypos}
      this.io.in(this.roomID).emit('flipOverCard', {card: this.secondCard.card, x: this.secondCard.x, y: this.secondCard.y});
      this.validateAnswer();
    }
  }
}

hasCardBeenTaken(x, y) {
  return this.gameboardTaken[x][y];
}

validateAnswer() {
  setTimeout(() => {
    if(this.firstCard.card == this.secondCard.card) {
      this.inGameUsers[this.currentUserIndex].points++;
      this.io.in(this.roomID).emit('updateScore', {userID: this.inGameUsers[this.currentUserIndex].userID, points: this.inGameUsers[this.currentUserIndex].points});
      this.foundPairs += 1;
      if(this.foundPairs == this.totalPairs) {
        this.endGame();
      }
    } else {
      this.gameboardTaken[this.firstCard.x][this.firstCard.y] = false;
      this.gameboardTaken[this.secondCard.x][this.secondCard.y] = false;
      this.io.in(this.roomID).emit('flipOverCard', {card: -1, x: this.firstCard.x, y: this.firstCard.y});
      this.io.in(this.roomID).emit('flipOverCard', {card: -1, x: this.secondCard.x, y: this.secondCard.y});
      this.nextPerson();
    }
    this.firstCard = null;
    this.secondCard = null;
  }, 1000);
}

nextPerson() {
  this.currentUserIndex++
  if(this.currentUserIndex > this.inGameUsers.length-1) {
    this.currentUserIndex = 0;
  }
  this.io.in(this.roomID).emit('userTurnChange', {userID: this.inGameUsers[this.currentUserIndex].userID});
}

endGame() {
  var winners = [];
  var highestPoint = 0
  for(var i = 0; i < this.inGameUsers.length; i++) {
    if(highestPoint < this.inGameUsers[i].points) {
      winners = [];
      winners.push(this.inGameUsers[i].userID);
      highestPoint = this.inGameUsers[i].points;
    }
    else if(highestPoint == this.inGameUsers[i].points) {
      winners.push(this.inGameUsers[i].userID);
    }
  }
  this.io.in(this.roomID).emit('announceWinner', {winnersID: winners});
  this.io.in(this.roomID).emit('adminMenu', this.inGameUsers[0].userID);
  this.gameCompleted = true;
}

createGameBoard(xlength, ylength) {
  this.gameboard = [];
  this.gameboardTaken = [];
  var random_array = this.createRandomArray(xlength, ylength);
  var randomArrayIndex = 0;
  for(var x = 0; x < xlength; x++) {
    this.gameboard[x] = [];
    this.gameboardTaken[x] = []
    for(var y = 0; y < ylength; y++) {
      this.gameboard[x][y] = random_array[randomArrayIndex];
      this.gameboardTaken[x][y] = false;
      randomArrayIndex++;
    }
  }
}

createRandomArray(xlength, ylength) {
  var array1 = [];
  var array2 = [];
  for(var i = 0; i < (xlength*ylength)/2; i++) {
    array1[i] = i;
  }
  for(var i = 0; i < (xlength*ylength)/2; i++) {
    array2[i] = i;
  }
  var final_array = array1.concat(array2);

  for (var i = final_array.length - 1; i > 0; i--) {
       var j = Math.floor(Math.random() * (i + 1));
       var temp = final_array[i];
       final_array[i] = final_array[j];
       final_array[j] = temp;
   }
  return final_array;
}

userLeave(user) {
  var i = this.inGameUsers.indexOf(user);
  if(this.currentUserIndex == i) {
    this.nextPerson();
  }
  this.inGameUsers.splice(i, 1);

}

}
module.exports = GameData;
