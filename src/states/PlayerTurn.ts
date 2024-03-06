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
  connections: any;

  constructor(game: any) {
    this.id = 10;
    this.name = "playerTurn";
    this.game = game;
    this.connections = {};
  }

  onEnteringState(stateArgs: StateArgs): void {
    if (stateArgs.isCurrentPlayerActive) {
      // Get all location tiles
      const locationTiles = dojo.query(".locationtile");

      for (var key in locationTiles) {
        var locationTile = locationTiles[key];
        var locationStatus = this.getMatchingLocationStatus(
          locationTile.id,
          stateArgs.args["locationsStatus"]
        );

        if (
          locationTile.id &&
          !this.enemyOnLocation(locationTile.id) &&
          !this.enemyWillMoveToShipLocation(locationTile.id) &&
          this.playerCanExploreLocation(
            locationTile.id,
            locationStatus,
            stateArgs.args["playerHand"]
          )
        ) {
          // Make tile clickable
          dojo.addClass(locationTile, "incal-clickable");
          // Add event listener for tile click
          this.connections[locationTile.id] = dojo.connect(
            locationTile,
            "onclick",
            dojo.hitch(this, "selectLocation", locationTile.id)
          );
        }
      }
    }
  }

  onLeavingState(): void {
    this.resetUX();
  }

  onUpdateActionButtons(stateArgs: StateArgs): void {
    if (stateArgs.isCurrentPlayerActive) {
      // Create action button for Pass action
      gameui.addActionButton("pass-button", _("Pass"), () => {
        this.pass();
      });
      dojo.addClass("pass-button", "incal-button");

      // Create action button for Transfiguration Ritual action
      gameui.addActionButton(
        "transfiguration-ritual-button",
        _("Attempt Transfiguration Ritual"),
        () => {
          this.transfigurationRitual();
        }
      );
      dojo.addClass("transfiguration-ritual-button", "incal-button");
    }
  }

  enemyOnLocation(locationId: string): boolean {
    // Check if enemy silhouette is on location
    const enemyDiv = dojo.query(`#${locationId} #enemy`);
    return enemyDiv.length > 0;
  }

  enemyWillMoveToShipLocation(locationId: string): boolean {
    const metaShip = dojo.query("#metaship");
    const metaShipLocation = metaShip[0].parentNode.parentNode.id;

    if (metaShipLocation === locationId) {
      const metaShipPosition = parseInt(
        metaShip[0].parentNode.id.split("-")[2]
      );
      const enemyPosition = parseInt(
        dojo.query("#enemy")[0].parentNode.id.split("-")[2]
      );
      if (enemyPosition === 0 || metaShipPosition === 10) {
        return true;
      }
      if (enemyPosition - 2 === metaShipPosition) {
        return true;
      }
    }

    return false;
  }

  getMatchingLocationStatus(
    locationTileId: string,
    locationsStatus: LocationStatus[]
  ): LocationStatus {
    for (var key in locationsStatus) {
      if (locationsStatus[key].location.key === locationTileId) {
        return locationsStatus[key];
      }
    }
  }

  isLocationClosed(
    locationTileId: string,
    locationStatus: LocationStatus,
    hand: Card[]
  ): boolean {
    // Check if location is closed
    if (locationTileId === "suicidealley") {
      if (this.playerHasJohnDiFool(hand)) {
        return false;
      }
      return locationStatus.isClosed;
    }
  }

  pass(): void {
    this.resetUX();
    // Pass turn
    this.game.ajaxcallwrapper("pass", {});
  }

  playerCanExploreLocation(
    locationTileId: string,
    locationStatus: LocationStatus,
    hand: Card[]
  ): boolean {
    if (this.isLocationClosed(locationTileId, locationStatus, hand)) {
      return false;
    }

    // If location isn't closed, John Difool is always playable
    if (this.playerHasJohnDiFool(hand)) {
      return true;
    }

    switch (locationTileId) {
      case "centralcalculator":
        return this.playerCanExploreCentralCalculator(locationStatus, hand);
      case "technocity":
        return this.playerCanExploreTechnoCity(locationStatus, hand);
      default:
        return true;
    }
  }

  playerCanExploreCentralCalculator(
    locationStatus: LocationStatus,
    hand: Card[]
  ): boolean {
    // Get character on central calculator
    const character = locationStatus.cards[0].type;

    // Check if player has a card that can be used to explore central calculator
    for (var key in hand) {
      if (hand[key].type === character) {
        return true;
      }
    }

    return false;
  }

  playerCanExplorePsychoratsDump(
    locationStatus: LocationStatus,
    hand: Card[]
  ): boolean {
    // Get the characters on Psychorats Dump
    var characters = [];
    for (var key in locationStatus.cards) {
      characters.push(locationStatus.cards[key].type);
    }

    // Check if player has a character not present on Psychorats Dump
    for (var key in hand) {
      if (!characters.includes(hand[key].type)) {
        return true;
      }
    }

    return false;
  }

  playerCanExploreTechnoCity(
    locationStatus: LocationStatus,
    hand: Card[]
  ): boolean {
    // Get the characters on Techno City
    var characters = [];
    for (var key in locationStatus.cards) {
      characters.push(locationStatus.cards[key].type);
    }

    // Both character types are not set yet, so player can explore
    if (characters.length < 2) {
      return true;
    }

    // Check if player has a card that can be used to explore Techno City
    for (var key in hand) {
      if (characters.includes(hand[key].type)) {
        return true;
      }
    }

    return false;
  }

  playerHasJohnDiFool(hand: Card[]): boolean {
    for (var key in hand) {
      if (hand[key].type === "johndifool") {
        return true;
      }
    }
    return false;
  }
  resetUX(): void {
    // Remove clickable style from tiles
    dojo.query(".locationtile").removeClass("incal-clickable");

    // Remove event listeners
    for (var key in this.connections) {
      dojo.disconnect(this.connections[key]);
    }

    // Clear connections object
    this.connections = {};
  }

  /**
   * When a player selects a location tile trigger the action to move the ship to that location
   * @param locationId - The id of the location tile that was clicked
   */
  selectLocation(locationId: string): void {
    this.resetUX();
    // Select location
    this.game.ajaxcallwrapper("moveMetaship", {
      location: locationId,
    });
  }

  transfigurationRitual(): void {
    this.resetUX();
    // Perform transfiguration ritual
    console.log("Performing transfiguration ritual");
  }
}
