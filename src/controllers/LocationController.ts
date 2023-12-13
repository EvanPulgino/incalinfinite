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

  /**
   * Creates the location tiles
   *
   * @param locations
   * @param powers
   */
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
    // Create container
    this.createLocationContainer(location);

    // Create the location tile div
    this.createLocationDiv(location);

    // Create location chits
    this.createLocationChits(location, powers);

    // Create metaship container div
    this.createMetashipContainer(location);

    // Create enemy container div
    this.createEnemyContainer(location);

    // Create card container div
    this.createCardContainer(location);
  }

  /**
   * Creates the card container for a location
   *
   * @param location - The location to create the container on
   */
  createCardContainer(location: LocationTile): void {

    if (location.key !== "suicidealley") {
      const cardContainerDiv =
        '<div id="card-container-' +
        location.tilePosition +
        '" class="location-card-container"></div>';

      this.ui.createHtml(
        cardContainerDiv,
        "incal-location-container-" + location.key
      );
    }
  }

  /**
   * Creates the enemy container
   *
   * @param location - The location to create the container on
   */
  createEnemyContainer(location: LocationTile) {
    const enemyContainerDiv =
      '<div id="enemy-container-' +
      location.tilePosition +
      '" class="silhouette-container"></div>';

    this.ui.createHtml(enemyContainerDiv, location.key);
  }

  /**
   * Creates the incal chit on the location
   *
   * @param location - The location to create the chit on
   */
  createIncalChit(location: LocationTile): void {
    // Create the incal chit div
    const chitDiv =
      '<div id="incal-chit-' + location.key + '" class="incalchit"></div>';

    this.ui.createHtml(chitDiv, "incal-location-container-" + location.key);
  }

  /**
   * Creates the metaship container
   *
   * @param location - The location to create the container on
   */
  createMetashipContainer(location: LocationTile): void {
    const mirror = location.tilePosition > 3 && location.tilePosition < 9;
    const cssClass = "silhouette-container" + (mirror ? " mirror" : "");

    const metashipContainerDiv =
      '<div id="metaship-container-' +
      location.tilePosition +
      '" class="' +
      cssClass +
      '"></div>';

    this.ui.createHtml(metashipContainerDiv, location.key);
  }

  /**
   * Creates the location chits
   *
   * @param location - The location to create the chits on
   * @param powers - The power chits to create on Suicide Alley
   */
  createLocationChits(location: LocationTile, powers: PowerChit[]) {
    if (location.key === "suicidealley") {
      this.createSuicideAlleyPowers(powers);
    } else {
      this.createIncalChit(location);
    }
  }

  /**
   * Create location container
   *
   * @param location - The location to create a container for
   */
  createLocationContainer(location: LocationTile): void {
    const spaceDivId = "incal-space-" + location.tilePosition;

    const locationContainer =
      '<div id="incal-location-container-' +
      location.key +
      '" class="incal-location-container"></div>';

    this.ui.createHtml(locationContainer, spaceDivId);
  }

  /**
   * Creates a location tile div
   *
   * @param location - The location to create
   */
  createLocationDiv(location: LocationTile): void {
    const locationDiv =
      '<div id="' +
      location.key +
      '" class="locationtile ' +
      location.key +
      '"></div>';

    this.ui.createHtml(locationDiv, "incal-location-container-" + location.key);
  }

  /**
   * Create the power chits on Suicide Alley
   *
   * @param powers - Power chits to create
   */
  createSuicideAlleyPowers(powers: PowerChit[]): void {
    const powerChitContainerDiv = "<div id='power-chit-container'></div>";
    this.ui.createHtml(
      powerChitContainerDiv,
      "incal-location-container-suicidealley"
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
  }
}
