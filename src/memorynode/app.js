var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var User = require('./networking/user');
var Room = require('./networking/room');

app.use(express.static(__dirname + '/public'));

var rooms = [];
//var connectedUsers = [];

app.get('/', function(req, res) {
   res.sendfile('index.html');
});



//Whenever someone connects this gets executed
io.on('connection', function(socket) {
  console.log('Client has entered the website.');

  var session_user = null;
  var session_room = null;

  socket.on('createUser', function(user) {
    if(session_user == null) {
      if(user.username.length == 0) {
        user.username = "dummy#" + Math.floor(Math.random()*(1000-0+1)+0);
      }
      session_user = new User(user.username);
      console.log('User ' + user.username + ' has been created.');
    }
  });

  socket.on('createRoom', function(data) {
    if(session_room == null) {
      var room = new Room()
      room.addUser(session_user);
      rooms.push(room)
      session_room = room;
      console.log(session_user.username + " has joined and created the room " + session_room.roomID);
      socket.join(session_room.roomID);
      socket.emit('getRoomID', session_room.roomID);
      socket.emit('getAllUsersInRoom', { users: session_room.users});
    }
 });

 socket.on('signIntoRoom', function(roomID) {
   serverExist = false;
   for(var i = 0; i < rooms.length; i++) {
     if(rooms[i].roomID == roomID) {
       serverExist = true;
       break;
     }
   }
   if(serverExist) {
     session_room = rooms[i];
     session_room.addUser(session_user);
     socket.join(session_room.roomID);
     console.log(session_user.username + " has joined " + session_room.roomID);
     socket.broadcast.to(session_room.roomID).emit('userConnectToRoom', { username: session_user.username, userID: session_user.userID});
     socket.emit('getAllUsersInRoom', { users: session_room.users});
   } else {
     socket.emit('serverConnectionError', true);
   }
 });

 socket.on('startGameRoom', function (currentAmountCards) {
   if(session_room.users[0].userID == session_user.userID) {
     session_room.startGame(io, socket, currentAmountCards, currentAmountCards);
   }
   io.in(session_room.roomID).emit('generateGameboard', currentAmountCards);
 });

 socket.on('pickCard', function (position) {
   if(session_room.gameData != null) {
    session_room.gameData.chooseCard(session_user.userID, position.x, position.y);
   }
 });

 socket.on('requestUserID', function () {
   if(session_user != null) {
     socket.emit('userID', session_user.userID);
   }
 });
 socket.on('disconnect', function () {
   if(session_room != null &&  session_user != null) {
     if(session_room.gameData != null) {
       session_room.gameData.userLeave(session_user);
     }
     io.in(session_room.roomID).emit('playerDisconnected', session_user.userID);
     session_room.removeUser(session_user);
     if(session_room.users == 0) {
       var i = rooms.indexOf(session_room);
       rooms.splice(i, 1);
     }
        session_user = null;
        session_room = null;
      }
   });
});

http.listen(3000, function() {
   console.log('Running:');
});
