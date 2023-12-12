/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * IncalInfinite implementation : © Evan Pulgino <evan.pulgino@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * CardController.ts
 *
 * Handles all front end interactions with cards
 *
 */

class CardController {
  ui: GameBody;

  constructor(ui: GameBody) {
    this.ui = ui;
  }

  setupPlayerHand(cards: Card[]): void {
    for (const card of cards) {
      let cssClass = card.type;
      if (card.type !== "damage" && card.type !== "johndifool") {
        cssClass += "-" + card.value;
      }
      const cardDiv =
        '<div id="card-' + card.id + '" class="card ' + cssClass + '"></div>';
      this.ui.createHtml(cardDiv, "player-hand");
    }
  }
}
