angular.module("ngView", ["ngCookies"], function ($routeProvider) {
  $routeProvider.when("/games/:gameId", {
    templateUrl: "ready.html",
    controller: readyController
  });
  $routeProvider.when("/games/:gameId/play", {
    templateUrl: "play.html",
    controller: playController
  });
  $routeProvider.when("/games/:gameId/done", {
    templateUrl: "done.html",
    controller: playController
  });
});
