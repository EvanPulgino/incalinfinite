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
      const charactersInHand = this.removeDamageFromHand(
        stateArgs.args["playerHand"]
      );

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
            charactersInHand
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

  /**
   * Checks if a location is closed
   *
   * @param {string} locationTileId - The id of the location tile that was clicked
   * @param {LocationStatus} locationStatus - The status of the location tile
   * @param hand - The current player's hand with damage cards removed
   * @returns {boolean} - Whether the location is closed
   */
  isLocationClosed(
    locationTileId: string,
    locationStatus: LocationStatus,
    hand: Card[]
  ): boolean {
    // Check if location is closed
    if (locationTileId === "suicidealley") {
      // If player has John DiFool they can always explore Suicide Alley
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

  /**
   * Checks if a player has at least one card that can be used to explore a location
   *
   * @param {string} locationTileId - The id of the location tile that was clicked
   * @param {LocationStatus} locationStatus - The status of the location tile
   * @param {Card[]} hand - The current player's hand with damage cards removed
   * @returns
   */
  playerCanExploreLocation(
    locationTileId: string,
    locationStatus: LocationStatus,
    hand: Card[]
  ): boolean {
    // Check if location is closed
    if (this.isLocationClosed(locationTileId, locationStatus, hand)) {
      return false;
    }

    // If location isn't closed, John Difool is always playable
    if (this.playerHasJohnDiFool(hand)) {
      return true;
    }

    // Check if player can explore location based on location tile id
    switch (locationTileId) {
      case "acidlake":
        return this.playerCanExploreAcidLake(locationStatus, hand);
      case "aquaend":
        return this.playerCanExploreAquaend(locationStatus, hand);
      case "centralcalculator":
        return this.playerCanExploreCentralCalculator(locationStatus, hand);
      case "crystalforest":
        return this.playerCanExploreCrystalForest(locationStatus, hand);
      case "psychoratsdump":
        return this.playerCanExplorePsychoratsDump(locationStatus, hand);
      case "technocity":
        return this.playerCanExploreTechnoCity(locationStatus, hand);
      default:
        return true;
    }
  }

  /**
   * Checks if a player has at least one card that can be used to explore Acid Lake
   * Acid Lake can contain 2 sets of different characters, each set can contain 3 characters
   * A player cannot explore Acid Lake if:
   *  - Both character types are set and the player does not have a character that is not present on Acid Lake
   *  - One character set is at max count and the player does not have a different character in their hand
   *
   * @param {LocationStatus} locationStatus - The status of the location tile
   * @param {Card[]} hand - The current player's hand with damage cards removed
   * @returns {boolean} - Whether the player can explore Acid Lake
   */
  playerCanExploreAcidLake(
    locationStatus: LocationStatus,
    hand: Card[]
  ): boolean {
    // Get the characters on Acid Lake
    var characters = [];
    for (var key in locationStatus.cards) {
      characters.push(locationStatus.cards[key].type);
    }

    // Both character types are not set yet, so player can start a new set
    if (characters.length < 2) {
      //If only one character is present...
      if (characters.length === 1) {
        // Get the count of the character
        var countOfCharacter = locationStatus.cards.filter(
          (card) => card.type === characters[0]
        ).length;
        // If character is at max count...
        if (countOfCharacter === 3) {
          // Check if a player has a different character in their hand
          for (var key in hand) {
            if (hand[key].type !== characters[0]) {
              return true;
            }
          }
          // If no different character is found, player cannot explore
          return false;
        }
      }

      // Any character can be played
      return true;
    }

    // Get characters that are under the max of 3
    var charactersUnderMax = [];
    for (var characterKey in characters) {
      var character = characters[characterKey];
      var countOfCharacter = locationStatus.cards.filter(
        (card) => card.type === character
      ).length;
      // If character is under max count it is playable
      if (countOfCharacter < 3) {
        charactersUnderMax.push(character);
      }
    }

    // Check if player has a card that can be used to explore Acid Lake
    for (var key in hand) {
      if (charactersUnderMax.includes(hand[key].type)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Checks if a player has at least one card that can be used to explore Aquaend
   * Aquaend can contain 2 sets of different characters, each set can contain 2 characters
   * A player cannot explore Aquaend if:
   *  - Both character types are set and the player does not have a character that is not present on Aquaend
   *  - One character set is at max count and the player does not have a different character in their hand
   *
   * @param {LocationStatus} locationStatus - The status of the location tile
   * @param {Card[]} hand - The current player's hand with damage cards removed
   * @returns {boolean} - Whether the player can explore Aquaend
   */
  playerCanExploreAquaend(
    locationStatus: LocationStatus,
    hand: Card[]
  ): boolean {
    // Get the characters on Aquaend
    var characters = [];
    for (var key in locationStatus.cards) {
      characters.push(locationStatus.cards[key].type);
    }

    // Both character types are not set yet, so player can start a new set
    if (characters.length < 2) {
      //If only one character is present...
      if (characters.length === 1) {
        // Get the count of the character
        var countOfCharacter = locationStatus.cards.filter(
          (card) => card.type === characters[0]
        ).length;
        // If character is at max count...
        if (countOfCharacter === 2) {
          // Check if a player has a different character in their hand
          for (var key in hand) {
            if (hand[key].type !== characters[0]) {
              return true;
            }
          }
          // If no different character is found, player cannot explore
          return false;
        }
      }

      // Any character can be played
      return true;
    }

    // Get characters that are under the max of 3
    var charactersUnderMax = [];
    for (var characterKey in characters) {
      var character = characters[characterKey];
      var countOfCharacter = locationStatus.cards.filter(
        (card) => card.type === character
      ).length;
      // If character is under max count it is playable
      if (countOfCharacter < 2) {
        charactersUnderMax.push(character);
      }
    }

    // Check if player has a card that can be used to explore Acid Lake
    for (var key in hand) {
      if (charactersUnderMax.includes(hand[key].type)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Checks if a player has at least one card that can be used to explore Central Calculator
   * Central Calculator can contain 1 character set with a max of 4 characters
   * A player cannot explore Central Calculator if:
   *  - The player does not have a character that is present on Central Calculator
   *
   * @param {LocationStatus} locationStatus - The status of the location tile
   * @param {Card[]} hand - The current player's hand with damage cards removed
   * @returns {boolean} - Whether the player can explore Central Calculator
   */
  playerCanExploreCentralCalculator(
    locationStatus: LocationStatus,
    hand: Card[]
  ): boolean {
    // Get character on central calculator
    const character = locationStatus.cards[0].type;

    // If no character is set, player can start a new set
    if (!character) {
      return true;
    }

    // Check if player has a card that can be used to explore central calculator
    for (var key in hand) {
      if (hand[key].type === character) {
        return true;
      }
    }

    return false;
  }

  /**
   * Checks if a player has at least one card that can be used to explore Crystal Forest
   * In Crystal Forest cards must be player in ascending order of their value and 5 wraps around to 1
   * A player cannot explore Crystal Forest if:
   *  - The player does not have a character card of the next value in the sequence
   *
   * @param {LocationStatus} locationStatus - The status of the location tile
   * @param {Card[]} hand - The current player's hand with damage cards removed
   * @returns {boolean} - Whether the player can explore Crystal Forest
   */
  playerCanExploreCrystalForest(
    locationStatus: LocationStatus,
    hand: Card[]
  ): boolean {
    // If no cards are set, player can start a new set
    if (locationStatus.cards.length === 0) {
      return true;
    }

    // Get the highest value on Crystal Forest
    var highestValue: number = 0;
    for (var key in locationStatus.cards) {
      if (locationStatus.cards[key].value > highestValue) {
        highestValue = locationStatus.cards[key].value;
      }
    }

    // Get the next value in the sequence
    var nextValue: number = 0;
    if (highestValue == 5) {
      nextValue = 1;
    } else {
      nextValue = highestValue + 1;
    }

    // Check if player has a card that can be used to explore Crystal Forest
    for (var key in hand) {
      if (hand[key].value === nextValue) {
        return true;
      }
    }

    return false;
  }

  /**
   * Checks if a player has at least one card that can be used to explore Psychorats Dump
   * Psychorats Dump can contain 5 unique characters
   * A player cannot explore Psychorats Dump if:
   *  - The player only has characters that are present on Psychorats Dump
   *
   * @param {LocationStatus} locationStatus - The status of the location tile
   * @param {Card[]} hand - The current player's hand with damage cards removed
   * @returns {boolean} - Whether the player can explore Psychorats Dump
   */
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

  /**
   * Checks if a player has at least one card that can be used to explore Techno City
   * Techno City can contain 2 sets of different characters, one set can contain 3 characters and the other can contain 2 characters
   * A player cannot explore Techno City if:
   *  - Both character types are set and the player does not have a character that is not present on Acid Lake
   *  - One character set at max count and the player does not have a different character in their hand
   *
   * @param {LocationStatus} locationStatus - The status of the location tile
   * @param {Card[]} hand - The current player's hand with damage cards removed
   * @returns {boolean} - Whether the player can explore Techno City
   */
  playerCanExploreTechnoCity(
    locationStatus: LocationStatus,
    hand: Card[]
  ): boolean {
    // Get the characters on Techno City
    var characters = [];
    for (var key in locationStatus.cards) {
      characters.push(locationStatus.cards[key].type);
    }

    // Both character types are not set yet, so player can start a new set
    if (characters.length < 2) {
      //If only one character is present...
      if (characters.length === 1) {
        // Get the count of the character
        var countOfCharacter = locationStatus.cards.filter(
          (card) => card.type === characters[0]
        ).length;
        // If character is at max count...
        if (countOfCharacter === 3) {
          // Check if a player has a different character in their hand
          for (var key in hand) {
            if (hand[key].type !== characters[0]) {
              return true;
            }
          }
          // If no different character is found, player cannot explore
          return false;
        }
      }

      // Any character can be played
      return true;
    }

    // Get characters that are under the max of 3
    var charactersUnderMax = [];
    for (var characterKey in characters) {
      var character = characters[characterKey];
      var countOfCharacter = locationStatus.cards.filter(
        (card) => card.type === character
      ).length;
      // If character is under max count it is playable
      if (countOfCharacter < 3) {
        charactersUnderMax.push(character);
      }
    }

    // Check if player has a card that can be used to explore Acid Lake
    for (var key in hand) {
      if (charactersUnderMax.includes(hand[key].type)) {
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

  removeDamageFromHand(hand: Card[]): Card[] {
    return hand.filter((card) => card.type !== "damage");
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
