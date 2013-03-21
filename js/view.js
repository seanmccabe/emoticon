angular.module("ngView", ["ngCookies"], function ($routeProvider) {
  $routeProvider.when("/games/:gameId", {
    templateUrl: "play.html",
    controller: playController
  });
});
