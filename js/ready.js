var readyController = function ($scope, $timeout, $routeParams, $cookieStore, $location) {
  var gameId = $routeParams.gameId;

  var firebaseUrl = "https://emoticon.firebaseio.com";
  $scope.firebaseRef = new Firebase(firebaseUrl);

  $scope.playHref = function () {
    return "#/games/" + gameId + "/play";
  };

  $scope.resetHref = function () {
    return "#/games/" + gameId;
  };

  $scope.talentNames = ["surge", "assist", "power"];
  $scope.talents = {
    surge: {
      label: "Energy Surge",
      img: "images/icebeam.png",
      description: "Slows decay of your boost level, making combos much easier"
    },
    assist: {
      label: "Laser Assist",
      img: "images/option.png",
      description: "Adds a consistent amount of additional damage"
    },
    power: {
      label: "Power Boost",
      img: "images/hammer.png",
      description: "Greatly increases damage at high levels of boost"
    }
  };


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
  $scope.playerRef = $scope.firebaseRef.child("players").child($scope.playerId);

  $scope.playerRef.on("value", function (snap) {
    var player = snap.val();
    if (player === null) {
      $timeout(function () {
        $scope.player = {};
        $scope.player.name = "New Player";
        $scope.player.talent = "surge";
        $scope.player.totalDamage = 0;
        $scope.player.kills = 0;
        $scope.player.totalSets = 0;
        $scope.player.createdOn = new Date().format("fullDate");
        $scope.playerRef.set($scope.player);
      });
    } else {
      $timeout(function () {
        $scope.player = player;
      });
    }
  });

  $scope.savePlayer = function () {
    $scope.playerRef.set($scope.player);
  };

  $scope.selectTalent = function (talentName) {
    $scope.player.talent = talentName;
    this.savePlayer();
    return false;
  };

  $scope.playerDamagePerSet = function () {
    if ($scope.player.totalSets === 0) {
      return 0;
    }
    return Math.round($scope.player.totalDamage / $scope.player.totalSets);
  };

  // Reset nukes the game
  $scope.gameRef = $scope.firebaseRef.child("games").child(gameId);
  $scope.reset = function () {
    $scope.gameRef.set(null);
    return false;
  };

  var enemyRandom = new Nonsense();
  $scope.enemyRef = $scope.gameRef.child("enemy");
  $scope.enemyRef.on("value", function (snap) {
    var enemy = snap.val();
    if (enemy === null) {
      var e = enemyRandom.integerInRange(enemies.length);
      var enemy = enemies[e];
      $timeout(function () {
        $scope.enemyRef.set(enemy);
      });
    }
  });

  var enemies = [
    {
      name: "Mysterious Guard",
      img: "images/darknut.png",
      health: 500
    },
    {
      name: "Eight Kappas",
      img: "images/eightkappas.png",
      health: 500
    }
  ];
};
