var playController = function ($scope, $timeout, $routeParams, $cookieStore) {
  var gameId = $routeParams.gameId;

  var firebaseUrl = "https://emoticon.firebaseio.com/games/" + gameId;
  $scope.firebaseRef = new Firebase(firebaseUrl);

  // read player id from cookie or generate a new one
  $scope.playerId = (function (playerId) {
    if (playerId) {
      return playerId;
    }
    playerId = "";
    for (var i = 0; i < 16; i++) {
      var digit = Math.floor(Math.random() * 256).toString(16);
      playerId += digit.length === 1 ? "0" + digit : digit;
    }
    $cookieStore.put("playerId", playerId);
    return playerId;
  })($cookieStore.get("playerId"));

  $scope.board = [];
  var deck = Deck.create(gameId);

  // this lets us put the card image in a
  // css background-image, so you can't drag it
  $scope.classesForCard = function (card) {
    var classes = {};
    classes.active = card.selected;
    classes["card" + card.name] = true;
    return classes;
  };

  // initialize board with 10 cards
  for (var i = 0; i < 10; i++) {
    $scope.board.push(deck.next());
  }


  // angularjs event handlers

  $scope.clickCard = function (card) {
    if (card.selected) {
      card.selected = false;
      return;
    }

    var selectedCards = [];
    for (var i = 0; i < $scope.board.length; i++) {
      if ($scope.board[i].selected) {
        selectedCards.push($scope.board[i]);
      }
    }

    if (selectedCards.length < 3) {
      card.selected = true;
      selectedCards.push(card);
    }

    if (selectedCards.length != 3) {
      return;
    }

    // timeout in case angular wants to update the ui
    $timeout(processSet(selectedCards));

  };

  var processSet = function (selectedCards) {
    return function () {
      if (Deck.isSet(selectedCards)) {
        for (var i = 0; i < $scope.board.length; i++) {
          if ($scope.board[i].selected) {
            $scope.board[i] = deck.next();
          }
        }
        for (var j = 0; j < selectedCards.length; j++) {
          selectedCards[j].selected = false;
          deck.refill(selectedCards[j]);
        }
      }
    };
  };

  // firebase callbacks

};
