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
  $scope.cardStyle = function (card) {
    var style = {};
    style["background-image"] = "url(images/" + card.name + ".png)"
    return style;
  };

  var boost = 0;
  $scope.boostStyle = function () {
    return {
      width: (boost > 100 ? 100 : boost) + "%"
    };
  };

  var decayBoost = function () {
    if (boost >= 5) {
      boost -= 5;
    } else {
      boost = 0;
    }
    $timeout(decayBoost, 1500);
  };
  $timeout(decayBoost);

  // initialize board with 10 cards
  for (var i = 0; i < 10; i++) {
    $scope.board.push(deck.next());
  }


  // angularjs event handlers
  var clickSound = new buzz.sound("audio/ECS FX 19.wav").setVolume(60);
  var setSound = new buzz.sound("audio/ECS FX 20.wav").setVolume(70);
  var setterSound = new buzz.sound("audio/ECS FX 29.wav").setVolume(80);
  var settestSound = new buzz.sound("audio/ECS FX 03.wav").setVolume(100);

  $scope.clickCard = function (card) {
    $timeout(function () {
      clickSound.play();
    });

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

    // timeout so ui can update
    $timeout(processSet(selectedCards));
  };

  var processSet = function (selectedCards) {
    return function () {
      if (Deck.isSet(selectedCards)) {
        $timeout(function () {
          boost = boost + 25;
          boost = boost > 125 ? 125 : boost;  // buffer over 100%
          if (boost >= 100) {
            settestSound.play();
          } else if (boost > 50) {
            setterSound.play();
          } else {
            setSound.play();
          }
        });

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
