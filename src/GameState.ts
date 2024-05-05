/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * IncalInfinite implementation : © Evan Pulgino <evan.pulgino@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * GameState.ts
 *
 * Class that holds all game states
 *
 */

class GameState {
  explore: Explore;
  gameEnd: GameEnd;
  gameSetup: GameSetup;
  gorgoDiscard: GorgoDiscard;
  nextPlayer: NextPlayer;
  passTurn: PassTurn;
  playerTurn: PlayerTurn;
  constructor(game: any) {
    this.explore = new Explore(game);
    this.gameEnd = new GameEnd(game);
    this.gameSetup = new GameSetup(game);
    this.gorgoDiscard = new GorgoDiscard(game);
    this.nextPlayer = new NextPlayer(game);
    this.passTurn = new PassTurn(game);
    this.playerTurn = new PlayerTurn(game);
  }
}
