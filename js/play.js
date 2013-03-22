var playController = function ($scope, $timeout, $routeParams, $cookieStore) {
  var gameId = $routeParams.gameId;
  $scope.playerId = $cookieStore.get("playerId");

  var firebaseUrl = "https://emoticon.firebaseio.com";
  $scope.firebaseRef = new Firebase(firebaseUrl);
  $scope.gameRef = $scope.firebaseRef.child("games").child(gameId);
  $scope.playerRef = $scope.firebaseRef.child("players").child($scope.playerId);

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
    $timeout(decayBoost, 2000);
  };
  $timeout(decayBoost);

  // initialize board with 10 cards
  for (var i = 0; i < 10; i++) {
    $scope.board.push(deck.next());
  }

  $scope.totalDamage = 0;
  // TEMPORARY TEMPORARY TEMPORARY
  $scope.enemy = {
    name: "Mysterious Guard",
    health: 1000,
    img: "images/darknut.png"
  };
  $scope.enemyHealthStyle = function () {
    return {
      width: ($scope.enemyHealth() * 100.0 / $scope.enemy.health) + "%"
    };
  };
  $scope.enemyHealth = function () {
    var currentHealth = $scope.enemy.health - $scope.totalDamage;
    return currentHealth < 0 ? 0 : currentHealth;
  };


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
          boost = boost > 110 ? 110 : boost;  // buffer over 100%
          if (boost === 110) {
            settestSound.play();
            damageEnemy(100);
          } else if (boost > 60) {
            setterSound.play();
            damageEnemy(30);
          } else {
            setSound.play();
            damageEnemy(10);
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

  var damageEnemy = function (damage) {
    $scope.totalDamage += damage;
    if ($scope.totalDamage >= $scope.enemy.health) {
      // TEMPORARY TEMPORARY TEMPORARY
      alert("you win");
    }
  };

  // firebase callbacks

};
