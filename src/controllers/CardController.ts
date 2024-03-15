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
    cards.sort(this.byPileOrderDesc);
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
    cards.sort(this.byValue);
    cards.sort(this.byType);
    for (const card of cards) {
      const cardDiv =
        '<div id="card-wrapper-' +
        card.id +
        '">' +
        '<div id="card-' +
        card.id +
        '" class="card ' +
        this.getCardCssClass(card) +
        '"></div></div>';
      this.createCardElement(card, cardDiv, "player-hand");
    }
  }

  sortCrystalForest(position: number, firstValue: number): void {
    if (position) {
      const cards = dojo.query(".card", "card-container-" + position);

      var order = 1;
      var nextValue = firstValue;
      var nextCard = this.getCardWithValue(cards, firstValue);

      while (nextCard !== null) {
        nextCard.style.order = order.toString();
        order++;
        nextValue = nextValue == 5 ? 1 : nextValue + 1;
        nextCard = this.getCardWithValue(cards, nextValue);
      }
    }
  }

  getCardCssClass(card: Card): string {
    let cssClass = card.type;
    if (card.type !== "damage" && card.type !== "johndifool") {
      cssClass += "-" + card.value;
    }
    return cssClass;
  }

  getCardValue(cardElement: HTMLElement): number {
    var value = 0;
    cardElement.classList.forEach((className) => {
      if (className !== "card" && className !== "johndifool") {
        value = parseInt(className.split("-")[1]);
      }
    });
    return value;
  }

  getCardWithValue(cards: HTMLElement[], value: number): HTMLElement {
    for (const card of cards) {
      var cardValue = this.getCardValue(card);
      if (cardValue !== 0 && cardValue == value) {
        return card;
      }
    }
    return null;
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

  byPileOrderDesc(a: Card, b: Card): number {
    return b.locationArg - a.locationArg;
  }

  byType(a: Card, b: Card): number {
    return a.type.localeCompare(b.type);
  }

  byValue(a: Card, b: Card): number {
    return a.value - b.value;
  }

  addDamageToDiscard(card: Card, playerId: number): void {
    const cardDiv = '<div id="card-' + card.id + '" class="card damage"></div>';
    this.ui.createHtml(cardDiv, "incal-player-panel-" + playerId);
    const animation = this.ui.slideToObject(
      "card-" + card.id,
      "incal-discard",
      1000
    );
    dojo.connect(animation, "onEnd", () => {
      dojo.removeAttr("card-" + card.id, "style");
      dojo.place("card-" + card.id, "incal-discard");
      this.incrementDiscardCounter();
    });

    animation.play();
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

  discardCard(card: Card, playerId: number): void {
    const cardDivId = "card-" + card.id;
    let cardElement = dojo.byId(cardDivId);
    if (cardElement === null) {
      const cardDiv =
        '<div id="' +
        cardDivId +
        '" class="card ' +
        this.getCardCssClass(card) +
        '"></div>';
      this.ui.createHtml(cardDiv, "incal-player-panel-" + playerId);
    } else {
      dojo.place(cardDivId, "incal-player-panel-" + playerId);
    }

    const animation = this.ui.slideToObject(cardDivId, "incal-discard", 1000);
    dojo.connect(animation, "onEnd", () => {
      dojo.removeAttr(cardDivId, "style");
      dojo.place(cardDivId, "incal-discard");
      this.incrementDiscardCounter();
    });

    animation.play();

    const cardWrapper = dojo.byId("card-wrapper-" + card.id);
    dojo.destroy(cardWrapper);
  }

  discardExistingCard(cardId: any, playerId: number) {
    const card = dojo.byId("card-" + cardId);
    dojo.place(card, "incal-player-panel-" + playerId);
    const animation = this.ui.slideToObject(card, "incal-discard", 1000);
    dojo.connect(animation, "onEnd", () => {
      dojo.removeAttr(card, "style");
      dojo.place(card, "incal-discard");
      this.incrementDiscardCounter();
    });

    animation.play();

    const cardWrapper = dojo.byId("card-wrapper-" + cardId);
    dojo.destroy(cardWrapper);
  }

  drawCard(card: Card, playerId: number): void {
    const cardElement = dojo.byId("card-" + card.id);
    this.ui.slideToObjectAndDestroy(
      cardElement,
      "incal-player-panel-" + playerId,
      1000
    );
    this.decrementDeckCounter();
  }

  drawCardActivePlayer(card: Card): void {
    const cardElement = dojo.byId("card-" + card.id);
    dojo.addClass(cardElement, this.getCardCssClass(card));
    this.ui.addTooltipHtml("card-" + card.id, card.tooltip);
    const wrapperDiv = "<div id='card-wrapper-" + card.id + "'></div>";
    this.ui.createHtml(wrapperDiv, "player-hand");
    const animation = this.ui.slideToObject(
      cardElement,
      "card-wrapper-" + card.id,
      1000
    );
    dojo.connect(animation, "onEnd", () => {
      dojo.removeAttr(cardElement, "style");
      dojo.place(cardElement, "card-wrapper-" + card.id);
      this.decrementDeckCounter();
    });

    animation.play();
  }

  decrementDeckCounter(): void {
    this.counters["deck"].incValue(-1);
    if (this.counters["deck"].getValue() === 0) {
      dojo.style("incal-deck-count", "display", "none");
    }
  }

  gainDamageFromEnemy(card: Card, playerId: number): void {
    const cardDiv = '<div id="card-' + card.id + '" class="card damage"></div>';
    this.ui.createHtml(cardDiv, "oversurface");

    const cardElement = dojo.byId("card-" + card.id);
    this.ui.slideToObjectAndDestroy(
      cardElement,
      "incal-player-panel-" + playerId,
      1000
    );
  }

  gainDamageFromEnemyActivePlayer(card: Card, playerId: number): void {
    const cardDiv = '<div id="card-' + card.id + '" class="card damage"></div>';
    this.ui.createHtml(cardDiv, "oversurface");

    const cardElement = dojo.byId("card-" + card.id);
    dojo.addClass(cardElement, this.getCardCssClass(card));
    this.ui.addTooltipHtml("card-" + card.id, card.tooltip);

    const wrapperDiv = "<div id='card-wrapper-" + card.id + "'></div>";
    this.ui.createHtml(wrapperDiv, "player-hand");

    const animation = this.ui.slideToObject(
      cardElement,
      "card-wrapper-" + card.id,
      1000
    );
    dojo.connect(animation, "onEnd", () => {
      dojo.removeAttr(cardElement, "style");
      dojo.place(cardElement, "card-wrapper-" + card.id);
      this.decrementDeckCounter();
    });

    animation.play();
  }

  incrementDiscardCounter(): void {
    if (this.counters["discard"].getValue() === 0) {
      dojo.removeAttr("incal-discard-count", "style");
    }
    this.counters["discard"].incValue(1);
  }

  shuffleDiscardIntoDeck(cards: Card[]): void {
    const discards = dojo.query(".card", "incal-discard");
    for (const card of discards) {
      dojo.destroy(card);
    }
    this.counters["discard"].setValue(0);
    dojo.style("incal-discard-count", "display", "none");

    this.setupDeck(cards);
  }
}
