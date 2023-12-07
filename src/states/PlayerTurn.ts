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
    this.id = 2;
    this.name = "PlayerTurn";
    this.game = game;
  }

  onEnteringState(stateArgs: StateArgs): void {}
  onLeavingState(): void {}
  onUpdateActionButtons(stateArgs: StateArgs): void {}
}
