/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * IncalInfinite implementation : © Evan Pulgino <evan.pulgino@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * MetashipController.ts
 *
 * Handles all front end interactions with the Meta-ship silhouette
 *
 */

class MetashipController {
  ui: GameBody;

  constructor(ui: GameBody) {
    this.ui = ui;
  }

  setupMetaship(metashipLocation: number): void {
    const metashipDiv = '<div id="metaship" class="silhouette metaship"></div>';
    this.ui.createHtml(metashipDiv, "metaship-container-" + metashipLocation);
  }
}
