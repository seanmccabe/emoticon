// expressions: h: happy, d: drunk, a: angry
// themes: w: white, p: purple, m: monkey
// quantities: 1, 2, 3

var Deck = {
  create: function (gameId) {
    var that = {};

    var cards = [];
    var random = new Nonsense(gameId);

    that.next = function () {
      return cards.splice(random.integerInRange(cards.length), 1)[0];
    };

    that.refill = function (card) {
      cards.push(card);
    };

    var createCard = function (quantity, expression, theme) {
      var that = {};

      that.quantity = quantity;
      that.expression = expression;
      that.theme = theme;
      that.name = quantity + expression + theme;

      return that;
    };

    (function () {
      var quantities = [1, 2, 3];
      var expressions = ["h", "d", "a"];
      var themes = ["m", "p", "w"];
      for (var q = 0; q < quantities.length; q++) {
        for (var e = 0; e < expressions.length; e++) {
          for (var t = 0; t < themes.length; t++) {
            that.refill(createCard(quantities[q], expressions[e], themes[t]));
          }
        }
      }
    })();

    return that;
  }

};

