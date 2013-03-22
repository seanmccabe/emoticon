var Talents = {
  surge: {
    label: "Energy Surge",
    img: "images/icebeam.png",
    imgSmall: "images/icebeam_small.png",
    description: "Slows decay of your boost level, making combos much easier",
    boostDecay: 3,
    damage: [10, 20, 50]
  },
  assist: {
    label: "Laser Assist",
    img: "images/option.png",
    imgSmall: "images/option_small.png",
    description: "Adds a consistent amount of additional damage",
    boostDecay: 5,
    damage: [25, 35, 65]
  },
  power: {
    label: "Power Boost",
    img: "images/hammer.png",
    imgSmall: "images/hammer_small.png",
    boostDecay: 5,
    description: "Greatly increases damage at high levels of boost",
    damage: [10, 30, 100]
  }
};
