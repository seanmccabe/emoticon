var playController = function ($scope, $timeout, $routeParams, $cookieStore) {
  var gameId = $routeParams.gameId;
  $scope.playerId = $cookieStore.get("playerId");

  var firebaseUrl = "https://emoticon.firebaseio.com";
  $scope.firebaseRef = new Firebase(firebaseUrl);
  $scope.gameRef = $scope.firebaseRef.child("games").child(gameId);
  $scope.playerRef = $scope.firebaseRef.child("players").child($scope.playerId);

  $scope.playerRef.on("value", function (snap) {
    $timeout(function () {
      $scope.player = snap.val();
    });
  });

  $scope.board = [];
  var deck = Deck.create(gameId);

  // this lets us put the card image in a
  // css background-image, so you can't drag it
  $scope.cardStyle = function (card) {
    var style = {};
    style["background-image"] = "url(images/" + card.name + ".png)"
    return style;
  };

  $scope.talents = {
    surge: {
      label: "Energy Surge",
      img: "images/icebeam.png",
      description: "Slows decay of your boost level, making combos much easier",
      boostDecay: 3,
      damage: function (boost) {
        if (boost == 110) {
          settestSound.play();
          return 50;
        } else if (boost > 60) {
          setterSound.play();
          return 20;
        } else {
          setSound.play();
          return 10;
        }
      }
    },
    assist: {
      label: "Laser Assist",
      img: "images/option.png",
      description: "Adds a consistent amount of additional damage",
      boostDecay: 5,
      damage: function (boost) {
        if (boost == 110) {
          settestSound.play();
          return 65;
        } else if (boost > 60) {
          setterSound.play();
          return 35;
        } else {
          setSound.play();
          return 25;
        }
      }
    },
    power: {
      label: "Power Boost",
      img: "images/hammer.png",
      boostDecay: 5,
      description: "Greatly increases damage at high levels of boost",
      damage: function (boost) {
        if (boost == 110) {
          settestSound.play();
          return 100;
        } else if (boost > 60) {
          setterSound.play();
          return 30;
        } else {
          setSound.play();
          return 10;
        }
      }
    }
  };

  $scope.boost = 0;
  $scope.boostStyle = function () {
    return {
      width: ($scope.boost > 100 ? 100 : $scope.boost) + "%"
    };
  };
  $scope.boostClass = function () {
    if ($scope.boost >= 75) {
      return {"bar-danger": true};
    } else if ($scope.boost >= 35) {
      return {"bar-warning": true};
    } else {
      return {"bar-success": true};
    }
  };
  var decayBoost = function () {
    if ($scope.player) {
      var decay = $scope.talents[$scope.player.talent].boostDecay;
      if ($scope.boost >= decay) {
        $scope.boost -= decay;
      } else {
        $scope.boost = 0;
      }
    }
    $timeout(decayBoost, 2000);
  };
  $timeout(decayBoost);

  // initialize board with 10 cards
  for (var i = 0; i < 10; i++) {
    $scope.board.push(deck.next());
  }

  $scope.damage = 0;
  $scope.sets = 0;
  $scope.damagePerSet = function () {
    if ($scope.sets === 0) {
      return 0;
    }
    return Math.round($scope.damage / $scope.sets);
  }
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
    var currentHealth = $scope.enemy.health - $scope.damage;
    return currentHealth < 0 ? 0 : currentHealth;
  };


  // angularjs event handlers
  var clickSound = new buzz.sound("audio/ECS FX 19.wav").setVolume(80);
  var setSound = new buzz.sound("audio/ECS FX 20.wav").setVolume(60);
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
          $scope.boost = $scope.boost + 25;
          $scope.boost = $scope.boost > 110 ? 110 : $scope.boost;  // buffer over 100%
          var damage = $scope.talents[$scope.player.talent].damage($scope.boost);
          $scope.sets++;
          damageEnemy(damage);
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
    $scope.damage += damage;
    if ($scope.damage >= $scope.enemy.health) {
      // TEMPORARY TEMPORARY TEMPORARY
      alert("you win");
    }
  };

  // firebase callbacks

};
