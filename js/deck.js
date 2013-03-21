// expressions: h: happy, d: drunk, a: angry
// themes: w: white, p: purple, m: monkey
// quantities: 1, 2, 3

var Deck = {
  create: function (gameId) {
    var deck = {};

    var cards = [];
    var random = new Nonsense(gameId);

    deck.next = function () {
      return cards.splice(random.integerInRange(cards.length), 1)[0];
    };

    deck.refill = function (card) {
      cards.push(card);
    };

    var createCard = function (quantity, expression, theme) {
      var card = {};

      card.quantity = quantity;
      card.expression = expression;
      card.theme = theme;
      card.name = quantity + expression + theme;
      card.selected = false;

      return card;
    };

    (function () {
      var quantities = [1, 2, 3];
      var expressions = ["h", "d", "a"];
      var themes = ["m", "p", "w"];
      for (var q = 0; q < quantities.length; q++) {
        for (var e = 0; e < expressions.length; e++) {
          for (var t = 0; t < themes.length; t++) {
            deck.refill(createCard(quantities[q], expressions[e], themes[t]));
          }
        }
      }
    })();

    return deck;
  },

  isSet: function (selectedCards) {
    if (selectedCards.length != 3) {
      return false;
    }

    var quantities = [];
    var expressions = [];
    var themes = [];
    for (var i = 0; i < 3; i++) {
      var card = selectedCards[i];
      if ($.inArray(card.quantity, quantities) == -1) {
        quantities.push(card.quantity);
      }
      if ($.inArray(card.expression, expressions) == -1) {
        expressions.push(card.expression);
      }
      if ($.inArray(card.theme, themes) == -1) {
        themes.push(card.theme);
      }
    }
    return quantities.length != 2 && expressions.length != 2 && themes.length != 2;
  }

};
