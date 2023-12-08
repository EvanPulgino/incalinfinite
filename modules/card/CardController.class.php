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
     * Create the supply of damage cards
     */
    private function createDamageSupply() {
        $damageCards = ["type" => CARD_DAMAGE, "type_arg" => 0, "nbr" => 18];
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
            CARD_TANATA,
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
     * @param Player[] $players An array of players
     */
    private function dealOpeningHands($players) {
        foreach ($players as $player) {
            $this->cards->pickCards(4, CARD_LOCATION_DECK, $player->getId());
        }
    }

    /**
     * Seed damage cards to deck based on enemy
     *
     * @param int $enemy The ID of the enemy
     */
    private function seedInitialDamage($enemy) {
        $numberOfDamage = 0;

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
            $this->cards->pickCardForLocation(CARD_LOCATION_DECK, CARD_LOCATION_LOCATION_TILE, $location);
        }
    }
}
