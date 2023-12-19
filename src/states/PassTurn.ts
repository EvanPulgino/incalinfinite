/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * IncalInfinite implementation : © Evan Pulgino <evan.pulgino@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * PassTurn.ts
 *
 * Incal Infinite pass turn state
 *
 */

class PassTurn implements State {
  id: number;
  name: string;
  game: any;
  connections: any;

  constructor(game: any) {
    this.id = 12;
    this.name = "passTurn";
    this.game = game;
    this.connections = {};
  }

  onEnteringState(stateArgs: StateArgs): void {
    if (stateArgs.isCurrentPlayerActive) {
      const hand = stateArgs.args["hand"];
      for (const card of hand) {
        if (card.type === "damage") {
          this.disableDamageCard(card);
        } else {
          this.createCardAction(card);
        }
      }
    }
  }
  onLeavingState(): void {
    this.resetUX();
  }
  onUpdateActionButtons(stateArgs: StateArgs): void {
    if (stateArgs.isCurrentPlayerActive) {
      // Create action button for Confirm discard action
      gameui.addActionButton("confirm-discard-button", _("Confirm"), () => {
        this.confirmDiscard();
      });

      const button = dojo.byId("confirm-discard-button");

      dojo.addClass(button, "incal-button");
      dojo.addClass(button, "incal-button-disabled");
    }
  }

  confirmDiscard(): void {
    const selectedCard = dojo.query(".incal-card-selected");
    if (selectedCard.length === 0) {
      return;
    }
    const cardId = selectedCard[0].id.split("-")[1];
    this.resetUX();
    this.game.ajaxcallwrapper("discardCard", {
      cardId: cardId,
    });
  }

  createCardAction(card: Card): void {
    const cardId = card.id;
    const cardDivId = "card-" + cardId;

    dojo.addClass(cardDivId, "incal-clickable");
    this.connections[cardId] = dojo.connect(
      dojo.byId(cardDivId),
      "onclick",
      () => {
        this.selectCard(cardId);
      }
    );
  }

  disableDamageCard(card: Card): void {
    const cardId = card.id;

    dojo.addClass("card-wrapper-" + cardId, "incal-card-disabled");
  }

  selectCard(cardId: number): void {
    const cardDivId = "card-" + cardId;
    const cardDiv = dojo.byId(cardDivId);

    if (dojo.hasClass(cardDiv, "incal-card-selected")) {
      return;
    }

    const previouslySelectedCard = dojo.query(".incal-card-selected");
    if (previouslySelectedCard.length > 0) {
      dojo.removeClass(previouslySelectedCard[0], "incal-card-selected");
    }

    dojo.addClass(cardDiv, "incal-card-selected");
    dojo.removeClass("confirm-discard-button", "incal-button-disabled");
  }

  resetUX(): void {
    for (const cardId in this.connections) {
      dojo.disconnect(this.connections[cardId]);
    }
    this.connections = {};

    const selectedCard = dojo.query(".incal-card-selected");
    if (selectedCard.length > 0) {
      dojo.removeClass(selectedCard[0], "incal-card-selected");
    }

    const confirmButton = dojo.byId("confirm-discard-button");
    if (confirmButton !== null) {
      dojo.addClass("confirm-discard-button", "incal-button-disabled");
    }

    const disableDamageCards = dojo.query(".incal-card-disabled");
    for (const card of disableDamageCards) {
      dojo.removeClass(card, "incal-card-disabled");
    }

    dojo.query(".incal-clickable").forEach((node) => {
      dojo.removeClass(node, "incal-clickable");
    });
  }
}
