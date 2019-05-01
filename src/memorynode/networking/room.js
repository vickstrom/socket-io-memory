var GameData = require('./gamedata');

class Room {

  constructor() {
    this.roomID = this.createRoomID(5);
    this.users = [];
  }

  addUser(user) {
    this.users.push(user);
  }

  removeUser(user) {
    var i = this.users.indexOf(user);
    this.users.splice(i, 1);
  }

  createRoomID(characters) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < characters; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  startGame(io, socket, x, y) {
    this.gameData = new GameData(io, socket, this.roomID, this.users, x, y);
  }

}
module.exports = Room;
