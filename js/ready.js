var readyController = function ($scope, $timeout, $routeParams, $cookieStore) {
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
  $scope.talents = Talents;


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

  $scope.damagePerSet = function (damage, sets) {
    if (sets === 0) {
      return 0;
    }
    return Math.round(damage / sets);
  };

  // Reset nukes the game
  $scope.gameRef = $scope.firebaseRef.child("games").child(gameId);
  $scope.reset = function () {
    $scope.gameRef.set(null);
    return false;
  };

  $scope.enemyRef = $scope.gameRef.child("enemy");
  $scope.enemyRef.on("value", function (snap) {
    var enemy = snap.val();
    var random = new Nonsense(new Date().getTime());
    if (enemy === null) {
      var enemy = random.pick(enemies);
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
