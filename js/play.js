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

  for (var i = 0; i < 10; i++) {
    $scope.board.push(deck.next());
  }

  // this lets us put the card image in a
  // css background-image, so you can't drag it
  $scope.classesForCard = function (card) {
    var classes = {};
    classes["card" + card.name] = true;
    return classes;
  };

  // angularjs event handlers

  $scope.clickCard = function () {
    
  };

  // firebase callbacks

};
