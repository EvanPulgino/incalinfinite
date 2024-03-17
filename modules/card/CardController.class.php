<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * IncalInfinite implementation : © Evan Pulgino <evan.pulgino@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * Card controller class, handles all card related logic
 *
 * @EvanPulgino
 */

class CardController extends APP_GameClass {
    protected $cards;

    function __construct($deckModule) {
        $this->cards = $deckModule;
        $this->cards->init("card");
    }

    /**
     * Setup the cards for the game
     *
     * 1. Create the damage supply of 18 damage
     * 2. Create the initial deck of cards (without damage cards or John Difool)
     * 3. Deal opening hands to all players
     * 4. Seed each location (except Suicide Alley) with a character card
     * 5. Create John Difool and add him to the deck
     * 6. Add damage cards to the deck based on the selected enemy
     *
     * @param IncalInfinitePlayer[] $players An array of players
     * @param int $enemy The ID of the enemy
     */
    public function setupCards($players, $enemy) {
        $this->createDamageSupply();
        $this->createInitialDeck(count($players));
        $this->dealOpeningHands($players);
        $this->seedLocations();
        $this->createJohnDifool();
        $this->seedInitialDamage($enemy);
        $this->cards->shuffle(CARD_LOCATION_DECK);
    }

    /**
     * Get a card by ID
     *
     * @param int $cardId The ID of the card
     * @return Card|null - A card object or null if not found
     */
    public function getCard($cardId) {
        $card = $this->cards->getCard($cardId);
        if (!$card) {
            return null;
        }
        return new Card($card);
    }

    /**
     * Move a card to the discard pile
     *
     * @param int $cardId The ID of the card
     * @return void
     */
    public function discardCard($cardId) {
        $this->cards->playCard($cardId);
    }

    /**
     * Draw a card from the deck into a player's hand
     * If the deck is empty, shuffle the discard pile into the deck before drawing
     *
     * @param IncalInfinitePlayer $player The player objectof the player drawing the card
     * @param IncalInfinite $game The game object
     * @return void
     */
    public function drawCard($player, $game) {
        // If the deck is empty, shuffle the discard pile into the deck
        if ($this->isDeckEmpty()) {
            if ($this->isDiscardEmpty()) {
                // If the discard pile is empty, the players lose
                $game->notifyAllPlayers(
                    "gameEndCantDraw",
                    clienttranslate(
                        '${player_name} can\'t draw a card. Players lose!'
                    ),
                    [
                        "player_name" => $player->getName(),
                    ]
                );
                $game->gamestate->nextState(TRANSITION_END_GAME);
            } else {
                // Shuffle the discard pile into the deck
                $this->shuffleDiscardIntoDeck($game);
            }
        }

        // Draw a card from the deck
        $drawnCard = new Card(
            $this->cards->pickCard(CARD_LOCATION_DECK, $player->getId())
        );

        // Get the number of damage cards in the player's hand
        $damageInHand = $this->cards->getCardsOfTypeInLocation(
            CARD_DAMAGE,
            0,
            CARD_LOCATION_HAND,
            $player->getId()
        );

        // If the player has 3 or more damage cards in their hand, the players lose
        if (count($damageInHand) > 2) {
            // If the player has 3 or more damage cards in their hand, the players lose
            $game->notifyAllPlayers(
                "gameEndTooMuchDamage",
                clienttranslate(
                    '${player_name} has 3 damage cards. Players lose!'
                ),
                [
                    "player_name" => $player->getName(),
                ]
            );
        }

        // Notify all players that a card was drawn
        $game->notifyAllPlayers(
            "cardDrawn",
            clienttranslate('${player_name} draws a card'),
            [
                "player_name" => $player->getName(),
                "player_id" => $player->getId(),
                "card" => $drawnCard->getUiData(),
            ]
        );

        // Notify the player that a card was drawn - This is because the UX does different things for the player that drew the card
        $game->notifyPlayer(
            $player->getId(),
            "cardDrawnPrivate",
            clienttranslate('${player_name} draws a ${card_name}'),
            [
                "player_name" => $player->getName(),
                "player_id" => $player->getId(),
                "card_name" => $drawnCard->getName(),
                "card" => $drawnCard->getUiData(),
            ]
        );
    }

    /**
     * Get all cards at a location tile
     *
     * @param int $locationTilePosition The position of the location tile
     * @return Card[]|null - An array of cards or null if no cards
     */
    public function getCardsAtLocationTile($locationTilePosition) {
        // Get all cards at the location tile
        $cards = $this->cards->getCardsInLocation(
            CARD_LOCATION_LOCATION_TILE,
            $locationTilePosition
        );

        // If no cards, return null
        if (!$cards) {
            return null;
        }

        // Create card objects for each card
        $cardObjects = [];
        foreach ($cards as $card) {
            $cardObjects[] = new Card($card);
        }
        return $cardObjects;
    }

    /**
     * Get all cards in the deck
     *
     * @return Card[]|null - An array of cards or null if no cards left
     */
    public function getDeck() {
        // Get all cards in the deck
        $deck = $this->cards->getCardsInLocation(CARD_LOCATION_DECK);

        // If no cards, return null
        if (!$deck) {
            return null;
        }

        // Create card objects for each card
        $cardObjects = [];
        foreach ($deck as $card) {
            $cardObjects[] = new Card($card);
        }
        return $cardObjects;
    }

    /**
     * Get all cards in the deck formatted for the UI
     *
     * @return array - An array of cards formatted for the UI
     */
    public function getDeckUiData() {
        // Get all cards in the deck
        $deck = $this->getDeck();

        // If no cards, return an empty array
        if (!$deck) {
            return [];
        }

        // Format each card for the UI
        $deckUiData = [];
        foreach ($deck as $card) {
            $deckUiData[] = $card->getUiData();
        }
        return $deckUiData;
    }

    /**
     * Get all cards in the discard pile
     *
     * @return Card[]|null - An array of cards or null if no cards left
     */
    public function getDiscard() {
        $discard = $this->cards->getCardsInLocation(CARD_LOCATION_DISCARD);
        if (!$discard) {
            return null;
        }
        $cardObjects = [];
        foreach ($discard as $card) {
            $cardObjects[] = new Card($card);
        }
        return $cardObjects;
    }

    /**
     * Get all cards in the discard pile formatted for the UI
     *
     * @return array - An array of cards formatted for the UI
     */
    public function getDiscardUiData() {
        // Get all cards in the discard pile
        $discard = $this->getDiscard();

        // If no cards, return an empty array
        if (!$discard) {
            return [];
        }

        // Format each card for the UI
        $discardUiData = [];
        foreach ($discard as $card) {
            $discardUiData[] = $card->getUiData();
        }
        return $discardUiData;
    }

    /**
     * Get all cards on the location tiles
     *
     * @return Card[]|null - An array of cards or null if no cards left
     */
    public function getLocationTileCards() {
        // Get all cards on the location tiles
        $locationTileCards = $this->cards->getCardsInLocation(
            CARD_LOCATION_LOCATION_TILE
        );

        // If no cards, return null
        if (!$locationTileCards) {
            return null;
        }

        // Create card objects for each card
        $cardObjects = [];
        foreach ($locationTileCards as $card) {
            $cardObjects[] = new Card($card);
        }
        return $cardObjects;
    }

    /**
     * Get all cards on the location tiles formatted for the UI
     *
     * @return array - An array of cards formatted for the UI
     */
    public function getLocationTileCardsUiData() {
        // Get all cards on the location tiles
        $locationTileCards = $this->getLocationTileCards();

        // If no cards, return an empty array
        if (!$locationTileCards) {
            return [];
        }

        // Format each card for the UI
        $locationTileCardsUiData = [];
        foreach ($locationTileCards as $card) {
            $locationTileCardsUiData[] = $card->getUiData();
        }
        return $locationTileCardsUiData;
    }

    /**
     * Get all cards in a player's hand
     *
     * @param int $playerId The ID of the player
     * @return Card[]|null - An array of cards or null if no cards left
     */
    public function getPlayerHand($playerId) {
        // Get all cards in the player's hand
        $hand = $this->cards->getCardsInLocation(CARD_LOCATION_HAND, $playerId);

        // If no cards, return null
        if (!$hand) {
            return null;
        }

        // Create card objects for each card
        $cardObjects = [];
        foreach ($hand as $card) {
            $cardObjects[] = new Card($card);
        }
        return $cardObjects;
    }

    /**
     * Get all cards in a player's hand formatted for the UI
     *
     * @param int $playerId The ID of the player
     * @return array - An array of cards formatted for the UI
     */
    public function getPlayerHandUiData($playerId) {
        // Get all cards in the player's hand
        $hand = $this->getPlayerHand($playerId);

        // If no cards, return an empty array
        if (!$hand) {
            return [];
        }

        // Format each card for the UI
        $handUiData = [];
        foreach ($hand as $card) {
            $handUiData[] = $card->getUiData();
        }
        return $handUiData;
    }

    /**
     * Get all cards in a player's hand that are not damage cards
     *
     * @param int $playerId The ID of the player
     * @return Card[]|null - An array of cards or null if no cards left
     */
    public function getPlayerHandNoDamage($playerId) {
        // Get all cards in the player's hand
        $hand = $this->getPlayerHand($playerId);

        // If no cards, return null
        if (!$hand) {
            return [];
        }

        // Filter out damage cards
        $cards = [];
        foreach ($hand as $card) {
            if ($card->getType() != CARD_DAMAGE) {
                $cards[] = $card;
            }
        }
        return $cards;
    }

    /**
     * Get the number of cards in a player's hand
     *
     * @param int $playerId The ID of the player
     * @return int - The number of cards in the player's hand
     */
    public function getPlayerHandCount($playerId) {
        // Get the number of cards in the player's hand
        return $this->cards->countCardInLocation(CARD_LOCATION_HAND, $playerId);
    }

    /**
     * Get the number of cards in each player's hand
     *
     * @param IncalInfinitePlayer[] $players An array of player objects
     * @return int[] - An array of player IDs mapped to the number of cards in their hand
     */
    public function getPlayerHandsCount($players) {
        // Get the number of cards in each player's hand
        $handCounts = [];
        foreach ($players as $player) {
            $handCounts[$player->getId()] = $this->getPlayerHandCount(
                $player->getId()
            );
        }
        return $handCounts;
    }

    /**
     * Add a damage card to the discard pile
     *
     * @return Card - The card that was added to the discard pile
     */
    public function moveDamageToDiscard() {
        // Get a damage card from the supply
        $damageCard = new Card(
            $this->cards->getCardOnTop(CARD_LOCATION_DAMAGE_SUPPLY)
        );

        // Move the damage card to the discard pile
        $this->cards->moveCard($damageCard->getId(), CARD_LOCATION_DISCARD);

        return new Card($this->cards->getCard($damageCard->getId()));
    }

    /**
     * Add a damage card from supply to a player's hand
     *
     * @param IncalInfinitePlayer $player The player object
     * @return Card - The card that the player gained
     */
    public function playerGainNewDamage($player) {
        // Get a damage card from the supply and add it to the player's hand
        $damageCard = new Card(
            $this->cards->pickCard(
                CARD_LOCATION_DAMAGE_SUPPLY,
                $player->getId()
            )
        );

        return $damageCard;
    }

    /**
     * Create the supply of damage cards
     */
    private function createDamageSupply() {
        // Create 50 damage cards - Probably way more than needed
        $damageCards = ["type" => CARD_DAMAGE, "type_arg" => 0, "nbr" => 50];
        $this->cards->createCards([$damageCards], CARD_LOCATION_DAMAGE_SUPPLY);
    }

    /**
     * Create the initial deck of cards (without damage cards or John Difool)
     * @param int $playerCount The number of players in the game
     */
    private function createInitialDeck($playerCount) {
        $characterPool = [
            CARD_ANIMAH,
            CARD_DEEPO,
            CARD_KILL,
            CARD_METABARON,
            CARD_SOLUNE,
            CARD_TANATAH,
        ];

        // If 2 players, remove 1 random character from the game
        if ($playerCount == 2) {
            shuffle($characterPool);
            $characterPool = array_slice($characterPool, 0, 5);
        }

        $characterCards = [];

        // Create 5 cards for each character with values 1-5
        foreach ($characterPool as $character) {
            for ($value = 1; $value <= 5; $value++) {
                $characterCards[] = [
                    "type" => $character,
                    "type_arg" => $value,
                    "nbr" => 1,
                ];
            }
        }

        // Create and shuffle the deck
        $this->cards->createCards($characterCards, CARD_LOCATION_DECK);
        $this->cards->shuffle(CARD_LOCATION_DECK);

        // If 3 players, remove 4 random cards from the game
        if ($playerCount == 3) {
            $this->cards->pickCardsForLocation(
                4,
                CARD_LOCATION_DECK,
                CARD_LOCATION_UNUSED_CARDS
            );
        }
    }

    /**
     * Create John Difool and add him to the deck
     */
    private function createJohnDifool() {
        // Create John Difool and add him to the deck
        $johnDifool = [
            "type" => CARD_JOHN_DIFOOL,
            "type_arg" => 0,
            "nbr" => 1,
        ];
        $this->cards->createCards([$johnDifool], CARD_LOCATION_DECK);
    }

    /**
     * Deal opening hands to all players
     *
     * @param IncalInfinitePlayer[] $players An array of players
     */
    private function dealOpeningHands($players) {
        // Deal 4 cards to each player
        foreach ($players as $player) {
            $this->cards->pickCards(4, CARD_LOCATION_DECK, $player->getId());
        }
    }

    /**
     * Check if the deck is empty
     *
     * @return bool - True if the deck is empty, false otherwise
     */
    private function isDeckEmpty() {
        return $this->cards->countCardInLocation(CARD_LOCATION_DECK) == 0;
    }

    /**
     * Check if the discard pile is empty
     *
     * @return bool - True if the discard pile is empty, false otherwise
     */
    private function isDiscardEmpty() {
        return $this->cards->countCardInLocation(CARD_LOCATION_DISCARD) == 0;
    }

    /**
     * Seed damage cards to deck based on enemy
     *
     * @param int $enemy The ID of the enemy
     */
    private function seedInitialDamage($enemy) {
        $numberOfDamage = 0;

        // Determine the number of damage cards to add based on the enemy
        switch ($enemy) {
            case ENEMY_BERGS_DEPLETED:
                $numberOfDamage = 2;
                break;
            case ENEMY_BERGS:
                $numberOfDamage = 4;
                break;
            case ENEMY_PRESIDENTS_HUNCHBACKS:
                $numberOfDamage = 3;
                break;
            case ENEMY_GORGO_THE_DIRTY:
                $numberOfDamage = 2;
                break;
            case ENEMY_NECROBOT:
                $numberOfDamage = 1;
                break;
            case ENEMY_DARKNESS:
                $numberOfDamage = 3;
                break;
        }

        // Add the damage cards to the deck
        $this->cards->pickCardsForLocation(
            $numberOfDamage,
            CARD_LOCATION_DAMAGE_SUPPLY,
            CARD_LOCATION_DECK
        );
    }

    /**
     * Seed locations with cards
     */
    private function seedLocations() {
        // Location pool
        $locations = [2, 4, 6, 8, 10];

        // Pick 1 card for each location
        foreach ($locations as $location) {
            $this->cards->pickCardForLocation(
                CARD_LOCATION_DECK,
                CARD_LOCATION_LOCATION_TILE,
                $location
            );
        }
    }

    /**
     * Shuffle the discard pile into the deck - notifies players
     *
     * @param IncalInfinite $game The game object
     * @return void
     */
    private function shuffleDiscardIntoDeck($game) {
        // Move all cards in the discard pile to the deck
        $this->cards->moveAllCardsInLocation(
            CARD_LOCATION_DISCARD,
            CARD_LOCATION_DECK
        );

        // Shuffle the deck
        $this->cards->shuffle(CARD_LOCATION_DECK);

        // Notify all players that the discard pile has been shuffled
        $game->notifyAllPlayers(
            "discardShuffled",
            clienttranslate(
                "The discard pile has been shuffled to make a new deck"
            ),
            [
                "cards" => $this->getDeckUiData(),
            ]
        );
    }
}
