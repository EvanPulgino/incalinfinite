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

  setupLocations(locations: LocationTile[], powers: PowerChit[]): void {
    for (const location of locations) {
      this.createLocation(location, powers);
    }
  }

  /**
   * Creates a location tile
   *
   * @param location
   */
  createLocation(location: LocationTile, powers: PowerChit[]): void {
    // Create the space div
    const spaceDivId = "incal-space-" + location.tilePosition;

    // Create container
    const locationContainer =
      '<div id="incal-location-container-' +
      location.key +
      '" class="incal-location-container"></div>';

    this.ui.createHtml(locationContainer, spaceDivId);

    // Create the location tile div
    const locationDiv =
      '<div id="' +
      location.key +
      '" class="locationtile ' +
      location.key +
      '"></div>';

    this.ui.createHtml(locationDiv, "incal-location-container-" + location.key);

    if (location.key === "suicidealley") {
      const powerChitContainerDiv = "<div id='power-chit-container'></div>";
      this.ui.createHtml(
        powerChitContainerDiv,
        "incal-location-container-" + location.key
      );

      for (const power of powers) {
        const powerChitDiv =
          '<div id="power-chit-' +
          power.key +
          '" class="power ' +
          power.cssClass +
          '"></div>';

        this.ui.createHtml(powerChitDiv, "power-chit-container");
      }
    } else {
      // Create the incal chit div
      const chitDiv =
        '<div id="incal-chit-' + location.key + '" class="incalchit"></div>';

      this.ui.createHtml(chitDiv, "incal-location-container-" + location.key);
    }
  }
}
