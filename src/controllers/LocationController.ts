/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * IncalInfinite implementation : © Evan Pulgino <evan.pulgino@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * LocationController.ts
 *
 * Handles all front end interactions with the location tiles
 *
 */

class LocationController {
  ui: GameBody;

  constructor(ui: GameBody) {
    this.ui = ui;
  }

  setupLocations(locations: LocationTile[]): void {
    for (const location of locations) {
      this.createLocation(location);
    }
  }

  /**
   * Creates a location tile
   *
   * @param location
   */
  createLocation(location: LocationTile): void {
    // Create the div
    const locationDiv =
      '<div id="' +
      location.key +
      '" class="locationtile ' +
      location.key +
      '"></div>';

    const spaceDivId = "incal-space-" + location.tilePosition;

    this.ui.createHtml(locationDiv, spaceDivId);
  }
}
