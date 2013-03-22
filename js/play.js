var playController = function ($scope, $timeout, $routeParams, $cookieStore, $location) {
  var gameId = $routeParams.gameId;
  $scope.playerId = $cookieStore.get("playerId");

  var firebaseUrl = "https://emoticon.firebaseio.com";
  $scope.firebaseRef = new Firebase(firebaseUrl);
  $scope.gameRef = $scope.firebaseRef.child("games").child(gameId);
  $scope.playerRef = $scope.firebaseRef.child("players").child($scope.playerId);
  $scope.enemyRef = $scope.gameRef.child("enemy");
  $scope.gameEventsRef = $scope.gameRef.child("events");

  $scope.playerRef.on("value", function (snap) {
    $timeout(function () {
      $scope.player = snap.val();
    });
  });

  $scope.enemyRef.on("value", function (snap) {
    $timeout(function () {
      $scope.enemy = snap.val();
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

  $scope.talents = Talents;


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

  $scope.totalDamage = 0; // team damage
  $scope.playerDamage = 0; // personal damage
  $scope.playerSets = 0;
  $scope.damagePerSet = function (damage, sets) {
    if (sets === 0) {
      return 0;
    }
    return Math.round(damage / sets);
  };


  $scope.enemyHealthStyle = function () {
    if (!$scope.enemy) {
      return {width: "100%"};
    }
    return {
      width: ($scope.enemyHealth() * 100.0 / $scope.enemy.health) + "%"
    };
  };
  $scope.enemyHealth = function () {
    if (!$scope.enemy) {
      return 0;
    }
    var currentHealth = $scope.enemy.health - $scope.totalDamage;
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

  var boostDependent = function (things) {
    if ($scope.boost == 110) {
      return things[2];
    } else if ($scope.boost >= 60) {
      return things[1];
    } else {
      return things[0];
    }
  };

  var processSet = function (selectedCards) {
    return function () {
      if (Deck.isSet(selectedCards)) {
        $timeout(function () {
          $scope.boost = $scope.boost + 25;
          $scope.boost = $scope.boost > 110 ? 110 : $scope.boost;  // buffer over 100%
          boostDependent([setSound, setterSound, settestSound]).play();
          var damage = boostDependent($scope.talents[$scope.player.talent].damage);
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
    $scope.gameEventsRef.push({
      player: $scope.playerId,
      name: $scope.player.name,
      talent: $scope.player.talent,
      damage: damage, // damage done right now
      playerSets: $scope.playerSets + 1,
      playerDamage: $scope.playerDamage + damage, // cumulative player damage
      totalDamage: $scope.totalDamage + damage // cumulative team damage
    });
  };

  var finishGame = function () {
    $scope.player.totalDamage += $scope.playerDamage;
    $scope.player.totalSets += $scope.playerSets;
    $scope.player.kills += 1;
    $scope.playerRef.set($scope.player);

    $location.path("/games/" + gameId + "/done");
  };

  $scope.leaderboard = [];
  var addToLeaderboard = function (event) {
    var onLeaderboard = false;
    for (var i = 0; i < $scope.leaderboard.length; i++) {
      if ($scope.leaderboard[i].player === event.player) {
        if (event.playerDamage > $scope.leaderboard[i].playerDamage) {
          $scope.leaderboard[i] = event;
        }
        onLeaderboard = true;
      }
    }
    if (!onLeaderboard) {
      $scope.leaderboard.push(event);
    }
    $scope.leaderboard.sort(function (a, b) {
      return b.playerDamage - a.playerDamage;
    });
    if ($scope.leaderboard.length > 10) {
      $scope.leaderboard.length = 10;
    }
  };

  $scope.gameEventsRef.on("child_added", function (snap) {
    var event = snap.val();
    var totalDamage = Math.max(event.totalDamage, $scope.totalDamage + event.damage);
    $timeout(function () {
      $scope.totalDamage = totalDamage;
      addToLeaderboard(event);
      if ($scope.totalDamage >= $scope.enemy.health) {
        finishGame();
      }
    });
    if (event.player === $scope.playerId) {
      $timeout(function () {
        $scope.playerDamage = event.playerDamage;
        $scope.playerSets = event.playerSets;
      });
    }
  });

  $scope.nextHref = function () {
    var random = new Nonsense(gameId);
    return "#/games/" + random.integer();
  }
};
