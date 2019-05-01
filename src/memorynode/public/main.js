//    $(".card").toggleClass("card_hovered");
// $('[card_id="0_0"]').flip(false);
// $('[card_id="0_0"]').toggleClass("card_hovered");
// PRELOAD IMAGES

var currentAmountCards = 5;

for(var i = 0; i < 16; i++) {
  var img = new Image();
  img.src = "./img/cards/card_" + i + ".png";
}

var website_url = window.location.href;

function parse_query_string(query) {
  var vars = query.split("&");
  var query_string = {};
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    var key = decodeURIComponent(pair[0]);
    var value = decodeURIComponent(pair[1]);
    // If first entry with this name
    if (typeof query_string[key] === "undefined") {
      query_string[key] = decodeURIComponent(value);
      // If second entry with this name
    } else if (typeof query_string[key] === "string") {
      var arr = [query_string[key], decodeURIComponent(value)];
      query_string[key] = arr;
      // If third or later entry with this name
    } else {
      query_string[key].push(decodeURIComponent(value));
    }
  }
  return query_string;
}

var query = window.location.search.substring(1);
var qs = parse_query_string(query);



var newUser = function newUser(username, userID) {
  $("#users_panel").append('<div user_id="' + userID + '" class="user_bar animated bounceIn"><p>' + username + ' | <span>0</span>p</p></div>');
};

var updateUser = function updateUser(user_id, points) {
  $("[user_id=" + user_id + "] p span").text(points);
}

var removeUser = function removeUser(user_id) {
//  $("[user_id=" + user_id + "]").addClass("user_bar animated bounceOut");
  $("[user_id=" + user_id + "]").attr('class', 'user_bar animated bounceOut');
  setTimeout(function(){$("[user_id=" + user_id + "]").remove()}, 800);
}

var displayUserTurn = function displayUserTurn(user_id) {
  $(".user_bar").css("background", "white");
  $(".user_bar").css("color", "black");
  $(".user_bar").css("border-color", "#e5e5e5");

  $("[user_id=" + user_id + "]").css("background", "#7FBDCC");
  $("[user_id=" + user_id + "]").css("color", "white");
  $("[user_id=" + user_id + "]").css("border-color", "#7FBDCC");
}

var displayUserWin = function displayUserWin(winnersID) {
  $(".user_bar").css("background", "white");
  $(".user_bar").css("color", "black");
  $(".user_bar").css("border-color", "#e5e5e5");

  for(var i = 0; i < winnersID.length; i++) {
    $("[user_id=" + winnersID[i] + "]").css("background", "#bed29f");
    $("[user_id=" + winnersID[i] + "]").css("color", "white");
    $("[user_id=" + winnersID[i] + "]").css("border-color", "#bed29f");
  }
}

function generateCards(x_c, y_c){
  var x_cards = x_c;
  var y_cards = y_c;
  for(var x = 0; x < x_cards; x++) {
    for(var y = 0; y < y_cards; y++) {
      console.log("i run");
      //$("#gameboard").append($("#card_template").html());
      $("#gameboard").append('<div class="card" card_id="' + y +  '_' + x +'"><div class="front"></div><div class="back"></div></div>');
    }
    $("#gameboard").append('<div style="clear:both;" class="split">');
  }
  FlipCards();
}
function FlipCards(){
  $(".card").flip({
    trigger: 'manual'
  });
  $(".card").click(function() {
    var pos = $(this).attr("card_id").split("_");
    socket.emit('pickCard', {x: pos[0], y: pos[1]});
  });
//    $('.card').addClass('animated fadeIn');
}

var socket = io();

socket.on('userConnectToRoom', function(user){
      newUser(user.username, user.userID);
});

socket.on('getRoomID', function(roomID){
  $('#popup_i').val(website_url + "?g=" + roomID);
});

socket.on('getAllUsersInRoom', function(data){
  for(var i = 0; i < data.users.length; i++) {
    newUser(data.users[i].username, data.users[i].userID);
  }
});

socket.on('announceWinner', function(data){
  displayUserWin(data.winnersID);
});

socket.on('serverConnectionError', function(serverConnectionError){
  if(serverConnectionError) {
    console.log("can't find the server.");
  }
});

socket.on('adminMenu', function(userID){
  if(this.userID = userID) {
    $('#popup').fadeIn('slow');
  }
});

socket.on('userID', function(userID){
  this.userID = userID;
  console.log(userID);
});

socket.on('generateGameboard', function(numCards){
  if(currentAmountCards != numCards) {
    buildMap(numCards, numCards);
  }
});

socket.on('playerDisconnected', function(userID){
  removeUser(userID);
});



function buildMap(x_c, y_c) {
  $('#gameboard').fadeOut('slow', function() {
    $('#gameboard').empty()
    generateCards(x_c, y_c);
    $('#gameboard').fadeIn('slow');
  });
}


socket.on('flipOverCard', function(data){
  if(data.card == -1) {
    $('[card_id="' + data.x + '_' + data.y + '"]').flip("toggle", function() {
      $('[card_id="' + data.x + '_' + data.y + '"]').find(".back").css("background-image", "url(./img/cards/front.png)");
    });
  }
  else {
    $('[card_id="' + data.x + '_' + data.y + '"]').find(".back").css("background-image", "url(./img/cards/card_" + data.card + ".png)");
    $('[card_id="' + data.x + '_' + data.y + '"]').flip("toggle");
    /*
    $('[card_id="' + data.x + '_' + data.y + '"]').find(".back").css("background-image", "url(./img/cards/card_" + data.card + ".png)").load(function() {
      $('[card_id="' + data.x + '_' + data.y + '"]').flip("toggle");
    });
    */
  }
});

socket.on('userTurnChange', function(data){
  displayUserTurn(data.userID);
});

socket.on('updateScore', function(data){
  updateUser(data.userID, data.points);
});

$(document).ready(function() {
  $('#popup_i').val("link");
  $('#wrapper_center').fadeIn('slow');

  $('.user_bar').addClass('animated flipInX');

  generateCards(currentAmountCards, currentAmountCards);
  $('#create_room').click(function() {
    var username =  $('#username').val();
    socket.emit('createUser', { username: username});
    socket.emit('createRoom', '');
    socket.emit('requestUserID', '');
    $('#wrapper_center').fadeOut('slow', function() {
        $('#wrapper_game').fadeIn('slow');
        $('#popup').fadeIn('slow');
    });

  });

  if (qs.g != null){
    $("#room_id").show();
    $("#queue").hide();
    $("#create_room").hide();
    $("#play").show();
  }

  $('#clipboard').click(function() {
    var copyText = document.getElementById("popup_i");
    copyText.select();
    document.execCommand("copy");
  });

  $('#play').click(function() {
    var username =  $('#username').val();
    socket.emit('createUser', { username: username});
    socket.emit('signIntoRoom', qs.g);
    socket.emit('requestUserID', '');
    $('#wrapper_center').fadeOut('slow', function() {
        $('#wrapper_game').fadeIn('slow');
    });
  });

  $('#done').click(function() {
    $('#popup').fadeOut('slow');
    socket.emit('startGameRoom', currentAmountCards);
  });

  $('#boardsize div').click(function() {
    $('#boardsize div').css("background", "white");
    $('#boardsize div').css("border", "2px solid #e5e5e5");
    $('#boardsize div').css("color", "black");

    $(this).css("border", "2px solid #afdce7");
    $(this).css("background", "#afdce7");
    $(this).css("color", "white");

    var size = $(this).attr("b_size");
    buildMap($(this).attr("b_size"), $(this).attr("b_size"));
    currentAmountCards = size;
  });


});
