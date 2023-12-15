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

  setupDeck(cards: Card[]): void {
    cards.sort(this.byPileOrder);
    for (const card of cards) {
      const cardDiv = '<div id="card-' + card.id + '" class="card"></div>';
      this.createCardElement(card, cardDiv, "incal-deck");
    }
  }

  setupDiscard(cards: Card[]): void {
    cards.sort(this.byPileOrder);
    for (const card of cards) {
      const cardDiv =
        '<div id="card-' +
        card.id +
        '" class="card ' +
        this.getCardCssClass(card) +
        '"></div>';
      this.createCardElement(card, cardDiv, "incal-discard");
    }
  }

  setupLocationCards(cards: Card[]): void {
    for (const card of cards) {
      const cardDiv =
        '<div id="card-' +
        card.id +
        '" class="card ' +
        this.getCardCssClass(card) +
        '"></div>';
      this.createCardElement(
        card,
        cardDiv,
        "card-container-" + card.locationArg
      );
    }
  }

  setupPlayerHand(cards: Card[]): void {
    for (const card of cards) {
      const cardDiv =
        '<div id="card-' +
        card.id +
        '" class="card ' +
        this.getCardCssClass(card) +
        '"></div>';
      this.createCardElement(card, cardDiv, "player-hand");
    }
  }

  getCardCssClass(card: Card): string {
    let cssClass = card.type;
    if (card.type !== "damage" && card.type !== "johndifool") {
      cssClass += "-" + card.value;
    }
    return cssClass;
  }

  createCardElement(card: Card, cardDiv: string, parentDiv: string): void {
    this.ui.createHtml(cardDiv, parentDiv);

    if (card.location !== "deck" && card.location !== "discard") {
      this.ui.addTooltipHtml("card-" + card.id, card.tooltip);
    }
  }

  byPileOrder(a: Card, b: Card): number {
    return b.locationArg - a.locationArg;
  }
}
