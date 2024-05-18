/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * IncalInfinite implementation : © Evan Pulgino <evan.pulgino@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * Explore.ts
 *
 * Incal Infinite explore state
 *
 */

class Explore implements State {
  id: number;
  name: string;
  game: any;
  connections: any;
  characterPool: string[];
  locationStatus: LocationStatus;
  playerHand: Card[];
  selectedCharacter: string;
  playableCardCounts: any[];
  crystalForestInitialValue: number;
  crystalForestCurrentValue: number;

  constructor(game: any) {
    this.id = 12;
    this.name = "explore";
    this.game = game;
    this.connections = {};
    this.characterPool = [
      "animah",
      "deepo",
      "kill",
      "metabaron",
      "solune",
      "tanatah",
    ];
    this.locationStatus = null;
    this.playerHand = [];
    this.selectedCharacter = "";
    this.playableCardCounts = [];
    this.crystalForestCurrentValue = 0;
  }

  onEnteringState(stateArgs: StateArgs): void {
    if (stateArgs.isCurrentPlayerActive) {
      this.playerHand = stateArgs.args["playerHand"];
      this.locationStatus = stateArgs.args["locationStatus"];
      this.crystalForestInitialValue = parseInt(
        stateArgs.args["crystalForestCurrentValue"]
      );
      this.crystalForestCurrentValue = parseInt(
        stateArgs.args["crystalForestCurrentValue"]
      );
      for (const card of this.playerHand) {
        if (card.type === "damage") {
          this.disableCard(card);
        }
      }

      this.enablePlayableCards(this.locationStatus, this.playerHand);
    }
  }
  onLeavingState(): void {}
  onUpdateActionButtons(stateArgs: StateArgs): void {
    if (stateArgs.isCurrentPlayerActive) {
      // Create action button for Confirm play cards action
      gameui.addActionButton("confirm-play-cards-button", _("Confirm"), () => {
        this.confirmPlayCards();
      });

      const button = dojo.byId("confirm-play-cards-button");

      dojo.addClass(button, "incal-button");
      dojo.addClass(button, "incal-button-disabled");
    }
  }

  confirmPlayCards(): void {
    console.log("Confirm play cards");
  }

  /**
   * Create an action and highlight a card that can be played
   *
   * @param card
   */
  createCardAction(card: Card): void {
    const cardId = card.id;
    const cardDivId = "card-" + cardId;

    // If the card is already clickable, don't do anything
    if (dojo.hasClass(cardDivId, "incal-clickable")) {
      return;
    }

    dojo.addClass(cardDivId, "incal-clickable");
    if (this.connections[cardId] === undefined) {
      this.connections[cardId] = dojo.connect(
        dojo.byId(cardDivId),
        "onclick",
        () => {
          this.selectCard(card);
        }
      );
    }
  }

  /**
   * Disable a card so it cannot be played
   *
   * @param {Card} card
   */
  disableCard(card: Card): void {
    const cardId = card.id;

    dojo.removeClass(card, "incal-clickable");
    dojo.disconnect(this.connections[cardId]);
    delete this.connections[cardId];
  }

  /**
   * Handle selecting a card to play.
   *
   * If the card is already selected, deselect it.
   * If the card is not selected, select it.
   * If there are no selected cards, disable the confirm button
   * If there are selected cards, enable the confirm button
   *
   * @param {Card} card - The id of the card that was clicked
   */
  selectCard(card: Card): void {
    if (this.locationStatus.location.key === "crystalforest") {
      this.selectAtCrystalForest(card);
      return;
    }

    const cardDivId = "card-" + card.id;
    const cardDiv = dojo.byId(cardDivId);

    if (dojo.hasClass(cardDiv, "incal-card-selected")) {
      dojo.query(".incal-clickable").forEach((card) => {
        dojo.removeClass(card, "incal-card-selected");
        this.disableCard(card);
      });
      this.playableCardCounts = [];
      this.enablePlayableCards(this.locationStatus, this.playerHand);
      dojo.addClass("confirm-play-cards-button", "incal-button-disabled");
    } else {
      dojo.addClass(cardDiv, "incal-card-selected");
      if (card.type !== "johndifool") {
        // If the card is not John Difool, set the selected character to the card type and remove one from the playable count
        this.selectedCharacter = card.type;
        this.playableCardCounts[card.type] -= 1;
      } else {
        // If John Difool is selected, don't set the selected character and remove one from the playable count of each character
        for (var characterKey in this.characterPool) {
          this.playableCardCounts[this.characterPool[characterKey]] -= 1;
        }
      }
      this.disableCharacters();
    }

    if (this.playableCardCounts.length > 0) {
      const selectedCards = dojo.query(".incal-card-selected");
      if (selectedCards.length > 0) {
        dojo.removeClass("confirm-play-cards-button", "incal-button-disabled");
      } else {
        if (card.type === "johndifool") {
          for (var characterKey in this.characterPool) {
            this.playableCardCounts[this.characterPool[characterKey]] += 1;
          }
        } else {
          this.playableCardCounts[card.type] += 1;
          this.selectedCharacter = "";
        }
        dojo.addClass("confirm-play-cards-button", "incal-button-disabled");
      }
    }
  }

  selectAtCrystalForest(card: Card): void {
    const cardDivId = "card-" + card.id;
    const cardDiv = dojo.byId(cardDivId);

    if (dojo.hasClass(cardDiv, "incal-card-selected")) {
      dojo.query(".incal-clickable").forEach((card) => {
        dojo.removeClass(card, "incal-card-selected");
        this.disableCard(card);
      });
      this.crystalForestCurrentValue = this.crystalForestInitialValue;
      this.enablePlayableCards(this.locationStatus, this.playerHand);
      dojo.addClass("confirm-play-cards-button", "incal-button-disabled");
    } else {
      dojo.addClass(cardDiv, "incal-card-selected");

      // Bump the current value of the Crystal Forest
      if (this.crystalForestCurrentValue === 5) {
        this.crystalForestCurrentValue = 1;
      } else {
        this.crystalForestCurrentValue += 1;
      }
      if (card.type !== "johndifool") {
        // If the card is not John Difool, set the selected character to the card type
        this.selectedCharacter = card.type;
      }

      // Rerun enablePlaybleCards to check for cards next in the sequence
      this.enablePlayableCards(this.locationStatus, this.playerHand);
    }

    const selectedCards = dojo.query(".incal-card-selected");
    if (selectedCards.length > 0) {
      dojo.removeClass("confirm-play-cards-button", "incal-button-disabled");
    }
  }

  /**
   * Disable clickable cards that aren't playable anymore
   */
  disableCharacters(): void {
    const clickableCards = dojo.query(".incal-clickable");
    const selectedCards = dojo.query(".incal-card-selected");
    var selectedCardClasses = [];
    for (const card of selectedCards) {
      const cardClasses = card.className.split(" ");
      for (const cardClass of cardClasses) {
        if (
          cardClass !== "incal-card-selected" ||
          cardClass !== "card" ||
          cardClass !== "incal-clickable" ||
          cardClass !== "incal-card-disabled"
        ) {
          selectedCardClasses.push(cardClass);
        }
      }
    }
    var validCardClasses = [];
    validCardClasses.push("johndifool");

    // If no selected character, John Difool was clicked, a card is valid if there is room for it to be played
    if (this.selectedCharacter === "") {
      for (var characterKey in this.characterPool) {
        const character = this.characterPool[characterKey];
        for (var i = 1; i < 6; i++) {
          const cardClass = character + "-" + i;
          if (this.playableCardCounts[character] > 0) {
            validCardClasses.push(cardClass);
          }
        }
      }
    } else {
      for (var i = 1; i < 6; i++) {
        const cardClass = this.selectedCharacter + "-" + i;
        if (selectedCardClasses.includes(cardClass)) {
          validCardClasses.push(cardClass);
        } else if (this.playableCardCounts[this.selectedCharacter] > 0) {
          validCardClasses.push(cardClass);
        }
      }
    }

    for (const card of clickableCards) {
      const cardClasses = card.className.split(" ");
      const intersection = cardClasses.filter((value) =>
        validCardClasses.includes(value)
      );
      if (intersection.length === 0) {
        const cardId = card.id.split("-")[1];
        dojo.removeClass(card, "incal-clickable");
        dojo.disconnect(this.connections[cardId]);
        delete this.connections[cardId];
      }
    }
  }

  /**
   * Get all the cards which are playable at a loction and enable them
   *
   * @param {LocationStatus} locationStatus - The status of the location tile
   * @param {Card[]} hand - The current player's hand with damage cards removed
   */
  enablePlayableCards(locationStatus: LocationStatus, playerHand: Card[]) {
    const locationKey = locationStatus.location.key;
    const hand = this.removeDamageFromHand(playerHand);

    console.log(locationKey);

    switch (locationKey) {
      case "acidlake":
        this.enablePlayableCardsForAcidLake(locationStatus, hand);
        break;
      case "aquaend":
        this.getPlayableCardsForAquaend(locationStatus, hand);
        break;
      case "centralcalculator":
        this.getPlayableCardsForCentralCalculator(locationStatus, hand);
        break;
      case "crystalforest":
        this.getPlayableCardsForCrystalForest(locationStatus, hand);
        break;
      case "ourgargan":
        this.getPlayableCardsForOurgargan(locationStatus, hand);
        break;
      case "psychoratsdump":
        this.getPlayableCardsForPsychoratsDump(locationStatus, hand);
        break;
      case "suicidealley":
        this.getPlayableCardsForSuicideAlley(locationStatus, hand);
        break;
      case "technocity":
        this.getPlayableCardsForTechnoCity(locationStatus, hand);
        break;
      case "undergroundriver":
        this.getPlayableCardsForUndergroundRiver(locationStatus, hand);
        break;
    }
  }

  /**
   * Get all the cards which are playable at Acid Lake and enable them
   *
   * Acid Lake can contain 2 sets of different characters, each set can contain 3 characters
   * A player cannot explore Acid Lake if:
   *  - Both character types are set and the player does not have a character that is not present on Acid Lake
   *  - One character set is at max count and the player does not have a different character in their hand
   *
   * @param {LocationStatus} locationStatus - The status of the location tile
   * @param {Card[]} hand - The current player's hand with damage cards removed
   */
  enablePlayableCardsForAcidLake(locationStatus: LocationStatus, hand: Card[]) {
    if (this.playableCardCounts.length === 0) {
      // Get the characters on Acid Lake
      var characterCards = [];
      for (var key in locationStatus.cards) {
        characterCards.push(locationStatus.cards[key].type);
      }
      const characters = characterCards.filter(this.game.onlyUnique);

      var playableCharacterCounts = [];

      // For each character already on Acid Lake, get the number of cards that can still be played
      for (var characterKey in characters) {
        var character = characters[characterKey];
        var count = characterCards.filter((card) => card === character).length;
        playableCharacterCounts[character] = 3 - count;
      }

      // Both character types are not set, so add max of all other characters
      if (playableCharacterCounts.length < 2) {
        for (var characterKey in this.characterPool) {
          var characterFromPool = this.characterPool[characterKey];
          if (characters.indexOf(characterFromPool) === -1) {
            playableCharacterCounts[characterFromPool] = 3;
          }
        }
      }

      // John Difool is always playable
      playableCharacterCounts["johndifool"] = 1;

      // Set the playable card counts so we handle unenabling/reenabling them later
      this.playableCardCounts = playableCharacterCounts;
    }

    // Enable the cards that can be played
    for (var handKey in hand) {
      var cardInHand = hand[handKey];
      if (this.playableCardCounts[cardInHand.type] > 0) {
        this.createCardAction(cardInHand);
      }
    }
  }

  /**
   * Get all the cards which are playable at Aquaend.
   *
   * Aquaend can contain 2 sets of different characters, each set can contain 2 characters
   * A player cannot explore Aquaend if:
   *  - Both character types are set and the player does not have a character that is not present on Aquaend
   *  - One character set is at max count and the player does not have a different character in their hand
   *
   * @param {LocationStatus} locationStatus - The status of the location tile
   * @param {Card[]} hand - The current player's hand with damage cards removed
   */
  getPlayableCardsForAquaend(locationStatus: LocationStatus, hand: Card[]) {
    if (this.playableCardCounts.length === 0) {
      // Get the characters on Aquaend
      var characterCards = [];
      for (var key in locationStatus.cards) {
        characterCards.push(locationStatus.cards[key].type);
      }
      const characters = characterCards.filter(this.game.onlyUnique);

      var playableCharacterCounts = [];

      // For each character already on Aquaend, get the number of cards that can still be played
      for (var characterKey in characters) {
        var character = characters[characterKey];
        var count = characterCards.filter((card) => card === character).length;
        playableCharacterCounts[character] = 2 - count;
      }

      // Both character types are not set, so add max of all other characters
      if (playableCharacterCounts.length < 2) {
        for (var characterKey in this.characterPool) {
          var characterFromPool = this.characterPool[characterKey];
          if (characters.indexOf(characterFromPool) === -1) {
            playableCharacterCounts[characterFromPool] = 2;
          }
        }
      }

      // John Difool is always playable
      playableCharacterCounts["johndifool"] = 1;

      // Set the playable card counts so we handle unenabling/reenabling them later
      this.playableCardCounts = playableCharacterCounts;
    }

    // Enable the cards that can be played
    for (var handKey in hand) {
      var cardInHand = hand[handKey];
      if (this.playableCardCounts[cardInHand.type] > 0) {
        this.createCardAction(cardInHand);
      }
    }
  }

  /**
   * Get all the cards which are playable at The Central Computer.
   *
   * The Central Computer can contain 1 set of characters with a max of 4 cards
   * A player cannot explore The Central Computer if:
   *  - They do not have a character that is not present on The Central Computer
   *
   * @param {LocationStatus} locationStatus - The status of the location tile
   * @param {Card[]} hand - The current player's hand with damage cards removed
   */
  getPlayableCardsForCentralCalculator(
    locationStatus: LocationStatus,
    hand: Card[]
  ) {
    if (this.playableCardCounts.length === 0) {
      // Get the characters on The Central Computer
      var characterCards = [];
      for (var key in locationStatus.cards) {
        characterCards.push(locationStatus.cards[key].type);
      }
      const characters = characterCards.filter(this.game.onlyUnique);

      var playableCharacterCounts = [];

      // For each character already on The Central Computer, get the number of cards that can still be played
      for (var characterKey in characters) {
        var character = characters[characterKey];
        var count = characterCards.filter((card) => card === character).length;
        playableCharacterCounts[character] = 4 - count;
      }

      // If no characters are set, add max of all characters
      // This shouldn't happen, but just in case
      if (characters.length === 0) {
        for (var characterKey in this.characterPool) {
          var characterFromPool = this.characterPool[characterKey];
          playableCharacterCounts[characterFromPool] = 4;
        }
      }

      // John Difool is always playable
      playableCharacterCounts["johndifool"] = 1;

      // Set the playable card counts so we handle unenabling/reenabling them later
      this.playableCardCounts = playableCharacterCounts;
    }

    // Enable the cards that can be played
    for (var handKey in hand) {
      var cardInHand = hand[handKey];
      if (this.playableCardCounts[cardInHand.type] > 0) {
        this.createCardAction(cardInHand);
      }
    }
  }

  /**
   * Get the cards which are playable at Crystal Forest.
   *
   * Crystal Forest contains an ascending sequence of cards from 1 to 5. 5 wraps back to 1.
   * A player cannot explore Crystal Forest if:
   *  - They do not have a character with a value that is next in the sequence from the current value
   *
   * @param {LocationStatus} locationStatus - The status of the location tile
   * @param {Card[]} hand - The current player's hand with damage cards removed
   */
  getPlayableCardsForCrystalForest(
    locationStatus: LocationStatus,
    hand: Card[]
  ) {
    const nextValue =
      this.crystalForestCurrentValue === 5
        ? 1
        : this.crystalForestCurrentValue + 1;

    var playableCharacterCounts = [];

    // Add one of all characters for the time being
    for (var characterKey in this.characterPool) {
      var characterFromPool = this.characterPool[characterKey];
      playableCharacterCounts[characterFromPool] = 1;
    }

    // John Difool is always playable
    playableCharacterCounts["johndifool"] = 1;

    // Set the playable card counts so we handle unenabling/reenabling them later
    this.playableCardCounts = playableCharacterCounts;

    // Enable the cards that can be played
    for (var handKey in hand) {
      var cardInHand = hand[handKey];
      if (this.selectedCharacter !== "") {
        if (
          this.selectedCharacter === cardInHand.type &&
          cardInHand.value === nextValue
        ) {
          this.createCardAction(cardInHand);
        }
      } else {
        if (
          playableCharacterCounts[cardInHand.type] > 0 &&
          (cardInHand.value === nextValue || cardInHand.type === "johndifool")
        ) {
          this.createCardAction(cardInHand);
        }
      }
    }
  }

  /**
   * Get all the cards which are playable at Orgargan
   *
   * Cards at Orgargan is always playable as long as total valie is less than 11
   * A player cannot explore Psychorats Dump if:
   *  - The total value of cards on Orgargan is 11 or more (if we get to this point, we know the total value is less than 11)
   *
   * @param {LocationStatus} locationStatus - The status of the location tile
   * @param {Card[]} hand - The current player's hand with damage cards removed
   */
  getPlayableCardsForOurgargan(locationStatus: LocationStatus, hand: Card[]) {
    if (this.playableCardCounts.length === 0) {
      var playableCharacterCounts = [];

      // Add max of all characters (using handsize as max value)
      for (var characterKey in this.characterPool) {
        var characterFromPool = this.characterPool[characterKey];
        playableCharacterCounts[characterFromPool] = 4;
      }

      // John Difool is always playable
      playableCharacterCounts["johndifool"] = 1;

      // Set the playable card counts so we handle unenabling/reenabling them later
      this.playableCardCounts = playableCharacterCounts;
    }

    // Enable the cards that can be played
    for (var handKey in hand) {
      var cardInHand = hand[handKey];
      if (this.playableCardCounts[cardInHand.type] > 0) {
        this.createCardAction(cardInHand);
      }
    }
  }

  /**
   * Get all the cards which are playable at Psychorats Dump.
   *
   * Psychorats can contain 1 max card of each character type
   * A player cannot explore Psychorats Dump if:
   *  - All cards in the player's hand are already on Psychorats Dump
   *
   * @param {LocationStatus} locationStatus - The status of the location tile
   * @param {Card[]} hand - The current player's hand with damage cards removed
   */
  getPlayableCardsForPsychoratsDump(
    locationStatus: LocationStatus,
    hand: Card[]
  ) {
    if (this.playableCardCounts.length === 0) {
      // Get the characters on Psychorats Dump
      var characterCards = [];
      for (var key in locationStatus.cards) {
        characterCards.push(locationStatus.cards[key].type);
      }
      const characters = characterCards.filter(this.game.onlyUnique);

      var playableCharacterCounts = [];

      // For each character not on Psychorats Dump, get the number of cards that can still be played
      for (var characterKey in this.characterPool) {
        if (characters.indexOf(this.characterPool[characterKey]) === -1) {
          playableCharacterCounts[this.characterPool[characterKey]] = 1;
        }
      }

      // John Difool is always playable
      playableCharacterCounts["johndifool"] = 1;

      // Set the playable card counts so we handle unenabling/reenabling them later
      this.playableCardCounts = playableCharacterCounts;
    }

    // Enable the cards that can be played
    for (var handKey in hand) {
      var cardInHand = hand[handKey];
      if (this.playableCardCounts[cardInHand.type] > 0) {
        this.createCardAction(cardInHand);
      }
    }
  }

  /**
   * Get all the cards which are playable at TechnoCity and enable them
   *
   * Suicide Alley can accept any characters and is always possible to playcards
   *
   * @param {LocationStatus} locationStatus - The status of the location tile
   * @param {Card[]} hand - The current player's hand with damage cards removed
   */
  getPlayableCardsForSuicideAlley(
    locationStatus: LocationStatus,
    hand: Card[]
  ) {
    var playableCharacterCounts = [];

    // Add max of all characters (using handsize as max value)
    for (var characterKey in this.characterPool) {
      var characterFromPool = this.characterPool[characterKey];
      playableCharacterCounts[characterFromPool] = 4;
    }

    // John Difool is always playable
    playableCharacterCounts["johndifool"] = 1;

    // Set the playable card counts so we handle unenabling/reenabling them later
    this.playableCardCounts = playableCharacterCounts;

    // Enable the cards that can be played
    for (var handKey in hand) {
      var cardInHand = hand[handKey];
      if (playableCharacterCounts[cardInHand.type] > 0) {
        this.createCardAction(cardInHand);
      }
    }
  }

  /**
   * Get all the cards which are playable at TechnoCity and enable them
   *
   * TechnoCity can contain 2 sets of different characters, one set can have 3 cards and the other 2 cards
   * A player cannot explore TechnoCity if:
   *  - Both character types are set and the player does not have a character that is not present on Acid Lake
   *  - One character set is at max count and the player does not have a different playable character in their hand
   *
   * @param {LocationStatus} locationStatus - The status of the location tile
   * @param {Card[]} hand - The current player's hand with damage cards removed
   */
  getPlayableCardsForTechnoCity(locationStatus: LocationStatus, hand: Card[]) {
    if (this.playableCardCounts.length === 0) {
      // Get the characters on TechnoCity
      var characterCards = [];
      for (var key in locationStatus.cards) {
        characterCards.push(locationStatus.cards[key].type);
      }
      const characters = characterCards.filter(this.game.onlyUnique);

      var playableCharacterCounts = [];

      var setOfThreeExists = false;

      // Check if a set of 3 characters already exists
      for (var characterKey in characters) {
        var character = characters[characterKey];
        var count = characterCards.filter((card) => card === character).length;
        if (count === 3) {
          setOfThreeExists = true;
        }
      }
      // For each character already on TechnoCity, get the number of cards that can still be played
      for (var characterKey in characters) {
        var character = characters[characterKey];
        var count = characterCards.filter((card) => card === character).length;
        if (setOfThreeExists) {
          playableCharacterCounts[character] = 2 - count;
        } else {
          playableCharacterCounts[character] = 3 - count;
        }
      }

      // Both character types are not set, so add max of all other characters
      if (playableCharacterCounts.length < 2) {
        for (var characterKey in this.characterPool) {
          var characterFromPool = this.characterPool[characterKey];
          if (characters.indexOf(characterFromPool) === -1) {
            if (setOfThreeExists) {
              playableCharacterCounts[characterFromPool] = 2;
            } else {
              playableCharacterCounts[characterFromPool] = 3;
            }
          }
        }
      }

      // John Difool is always playable
      playableCharacterCounts["johndifool"] = 1;

      // Set the playable card counts so we handle unenabling/reenabling them later
      this.playableCardCounts = playableCharacterCounts;
    }

    // Enable the cards that can be played
    for (var handKey in hand) {
      var cardInHand = hand[handKey];
      if (this.playableCardCounts[cardInHand.type] > 0) {
        this.createCardAction(cardInHand);
      }
    }
  }

  /**
   * Get all the cards which are playable at Underground River and enable them
   *
   * Underground River can contain any cards whose total adds up 8, 9, or 10
   * A player cannot explore TechnoCity if:
   *  - The total value of cards on Underground River is 8, 9, or 10 (if we get to this point, we know the total value is less than 8)
   *
   * Players are only allowed to play one card at Underground River so all cards are enabled
   *
   * @param {LocationStatus} locationStatus - The status of the location tile
   * @param {Card[]} hand - The current player's hand with damage cards removed
   */
  getPlayableCardsForUndergroundRiver(
    locationStatus: LocationStatus,
    hand: Card[]
  ) {
    if (this.playableCardCounts.length === 0) {
      var playableCharacterCounts = [];

      // Allow 1 of all characters
      for (var characterKey in this.characterPool) {
        var characterFromPool = this.characterPool[characterKey];
        playableCharacterCounts[characterFromPool] = 1;
      }

      // John Difool is always playable
      playableCharacterCounts["johndifool"] = 1;

      // Set the playable card counts so we handle unenabling/reenabling them later
      this.playableCardCounts = playableCharacterCounts;
    }

    // Enable the cards that can be played
    for (var handKey in hand) {
      var cardInHand = hand[handKey];
      if (this.playableCardCounts[cardInHand.type] > 0) {
        this.createCardAction(cardInHand);
      }
    }
  }

  removeDamageFromHand(hand: Card[]): Card[] {
    return hand.filter((card) => card.type !== "damage");
  }
}
