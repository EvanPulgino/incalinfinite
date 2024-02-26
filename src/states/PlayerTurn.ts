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
        if (locationTile.id && !this.enemyOnLocation(locationTile.id)) {
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

  pass(): void {
    this.resetUX();
    // Pass turn
    this.game.ajaxcallwrapper("pass", {});
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
