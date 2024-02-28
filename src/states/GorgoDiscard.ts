/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * IncalInfinite implementation : © Evan Pulgino <evan.pulgino@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * GorgoDiscard.ts
 *
 * Incal Infinite gorgo discard state
 *
 */

class GorgoDiscard implements State {
  id: number;
  name: string;
  game: any;

  constructor(game: any) {
    this.id = 11;
    this.name = "GorgoDiscard";
    this.game = game;
  }

  onEnteringState(stateArgs: StateArgs): void {}
  onLeavingState(): void {}
  onUpdateActionButtons(stateArgs: StateArgs): void {
    if (stateArgs.isCurrentPlayerActive) {
      const otherPlayers = stateArgs.args["otherPlayers"];

      // Add action button for each player
      for (var key in otherPlayers) {
        var player = otherPlayers[key];

        gameui.addActionButton(
          "discard-button-" + player.id,
          _(player.name),
          (event) => {
            this.discard(event);
          }
        );
        dojo.addClass("discard-button-" + player.id, "incal-button");
        dojo.addClass(
          "discard-button-" + player.id,
          "incal-button-" + player.color
        );
      }
    }
  }

  discard(event): void {
    const target = event.target;
    const playerId = target.id.split("-")[2];
    
    this.game.ajaxcallwrapper("selectPlayer", {
      playerId: playerId,
    });
  }
}
