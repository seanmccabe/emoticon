var playController = function ($scope, $timeout, $routeParams, $cookieStore) {
  var gameId = $routeParams.gameId;
  $scope.playerId = $cookieStore.get("playerId");

  var firebaseUrl = "https://emoticon.firebaseio.com";
  $scope.firebaseRef = new Firebase(firebaseUrl);
  $scope.gameRef = $scope.firebaseRef.child("games").child(gameId);
  $scope.playerRef = $scope.firebaseRef.child("players").child($scope.playerId);
  $scope.enemyRef = $scope.gameRef.child("enemy");
  $scope.gamePlayerRef = $scope.gameRef.child("players").child($scope.playerId);
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

  $scope.talents = {
    surge: {
      label: "Energy Surge",
      img: "images/icebeam.png",
      imgSmall: "images/icebeam_small.png",
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
      imgSmall: "images/option_small.png",
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
      imgSmall: "images/hammer_small.png",
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
    return {
      width: ($scope.enemyHealth() * 100.0 / $scope.enemy.health) + "%"
    };
  };
  $scope.enemyHealth = function () {
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

  var processSet = function (selectedCards) {
    return function () {
      if (Deck.isSet(selectedCards)) {
        $timeout(function () {
          $scope.boost = $scope.boost + 25;
          $scope.boost = $scope.boost > 110 ? 110 : $scope.boost;  // buffer over 100%
          var damage = $scope.talents[$scope.player.talent].damage($scope.boost);
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

    alert("win");
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

};
