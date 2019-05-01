class User {

  constructor(username) {
    this.username = username;
    this.userID = this.createUserID(10);
    this.gamePoints = 0;
    this.active = true;
  }

  createUserID(characters) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < characters; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

}
module.exports = User;
