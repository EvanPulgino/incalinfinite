/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * IncalInfinite implementation : © Evan Pulgino <evan.pulgino@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * PlayerTurn.ts
 *
 * Incal Infinite player turn state
 *
 */

class PlayerTurn implements State {
  id: number;
  name: string;
  game: any;

  constructor(game: any) {
    this.id = 10;
    this.name = "playerTurn";
    this.game = game;
  }

  onEnteringState(stateArgs: StateArgs): void {}
  onLeavingState(): void {}
  onUpdateActionButtons(stateArgs: StateArgs): void {
    if (stateArgs.isCurrentPlayerActive) {
      // Create action button for Pass action
      gameui.addActionButton("pass-button", _("Pass"), () => {
        this.pass();
      });

      // Create action button for Transfiguration Ritual action
      gameui.addActionButton(
        "transfiguration-ritual-button",
        _("Attempt Transfiguration Ritual"),
        () => {
          this.transfigurationRitual();
        }
      );
    }
  }

  pass(): void {
    // Pass turn
    console.log("Passing turn");
    this.game.ajaxcallwrapper("pass", {});
  }

  transfigurationRitual(): void {
    // Perform transfiguration ritual
    console.log("Performing transfiguration ritual");
  }
}
