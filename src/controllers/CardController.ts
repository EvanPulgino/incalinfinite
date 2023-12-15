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
  counters: any[];

  constructor(ui: GameBody) {
    this.ui = ui;
    this.counters = [];
  }

  setupDeck(cards: Card[]): void {
    cards.sort(this.byPileOrder);
    for (const card of cards) {
      const cardDiv = '<div id="card-' + card.id + '" class="card"></div>';
      this.createCardElement(card, cardDiv, "incal-deck");
    }
    this.createDeckCounter(cards.length);
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
    this.createDiscardCounter(cards.length);
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
    return a.locationArg - b.locationArg;
  }

  createDeckCounter(deckSize: number): void {
    this.counters["deck"] = new ebg.counter();
    this.counters["deck"].create("incal-deck-count");
    this.counters["deck"].setValue(deckSize);
    if (deckSize === 0) {
      dojo.style("incal-deck-count", "display", "none");
    }
  }

  createDiscardCounter(discardSize: number): void {
    this.counters["discard"] = new ebg.counter();
    this.counters["discard"].create("incal-discard-count");
    this.counters["discard"].setValue(discardSize);
    if (discardSize === 0) {
      dojo.style("incal-discard-count", "display", "none");
    }
  }
}
