/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * IncalInfinite implementation : © Evan Pulgino <evan.pulgino@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * PlayerController.ts
 *
 * Handles all front end interactions with players
 *
 */

class PlayerController {
  ui: GameBody;

  constructor(ui: GameBody) {
    this.ui = ui;
  }

  setupPlayerPanels(players: IncalInfinitePlayer[]): void {
    for (const player of players) {
      this.createPlayerPanelContainer(player.id);
      this.createHandCountDiv(player.id);
      this.createHandCountCounter(player);
    }
  }

  createPlayerPanelContainer(playerId: string): void {
    const playerPanelContainer =
      '<div id="incal-player-panel-' +
      playerId +
      '" class="player-panel-container"></div>';
    this.ui.createHtml(playerPanelContainer, "player_board_" + playerId);
  }

  createHandCountDiv(playerId: string): void {
    const handCountDiv =
      '<div id="incal-player-hand-count-' +
      playerId +
      '" class="player-hand-count"></div>';
    this.ui.createHtml(handCountDiv, "incal-player-panel-" + playerId);
  }

  createHandCountCounter(player: IncalInfinitePlayer): void {
    const handCountCounter =
      '<div id="incal-player-hand-count-counter-' +
      player.id +
      '" class="card-icon">' +
      player.handCount +
      "</div>";
    this.ui.createHtml(
      handCountCounter,
      "incal-player-hand-count-" + player.id
    );

    const textShadowStyle = `3px 3px 2px #${player.color}, -3px 3px 2px #${player.color}, -3px -3px 0 #${player.color}, 3px -3px 0 #${player.color}`;
    dojo.style(
      "incal-player-hand-count-counter-" + player.id,
      "textShadow",
      textShadowStyle
    );
  }
}
