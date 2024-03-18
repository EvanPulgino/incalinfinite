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
 * Object class for LocationStatus that contains all information about the state of the location.
 * Contains:

 *
 * @EvanPulgino
 */

class LocationStatus {
    /**
     * @var Location $location The location tile
     */
    protected $location;

    /**
     * @var int maxCards The maximum number of cards that can be in the location
     */
    protected $maxCards;

    /**
     * $var array{Card} $cards The cards in the location
     */
    protected $cards;

    /**
     * @var bool $closed Whether the location is closed or open
     */
    protected $closed;

    /**
     * Constructor for LocationStatus
     *
     * @param Location $location The location tile
     * @param array{Card} $cards The cards in the location
     * @param int $powerCount The number of unused Suicide Alley powers
     */
    public function __construct($location, $cards, $powerCount = 0) {
        $this->location = $location;
        $this->maxCards = $this->determineMaxCards($location->getTileId());
        $this->cards = $cards;
        $this->closed = $this->determineIfClosed(
            $location->getTileId(),
            $cards,
            $powerCount
        );
    }

    /**
     * Get the location tile
     *
     * @return Location
     */
    public function getLocation() {
        return $this->location;
    }

    /**
     * Get the max amount of cards that can be on the location
     *
     * @return int
     */
    public function getMaxCards() {
        return $this->maxCards;
    }

    /**
     * Get the cards at the location
     *
     * @return Card[]
     */
    public function getCards() {
        if ($this->cards == null) {
            return [];
        }

        return $this->cards;
    }

    /**
     * Check if the location is closed
     *
     * @return bool
     */
    public function isClosed() {
        return $this->closed;
    }

    /**
     * Get the UI data for the location Status
     *
     * @return array
     */
    public function getUiData() {
        return [
            "location" => $this->location->getUiData(),
            "maxCards" => intval($this->maxCards),
            "cards" => array_map(function ($card) {
                return $card->getUiData();
            }, $this->getCards()),
            "isClosed" => $this->isClosed(),
        ];
    }

    /**
     * Determine the maximum number of cards that can be in the location
     *
     * @param int $locationId The id of the location
     * @return int
     */
    private function determineMaxCards($locationId) {
        switch ($locationId) {
            case LOCATION_ACID_LAKE:
                return 6;
            case LOCATION_AQUAEND:
                return 4;
            case LOCATION_CENTRAL_CALCULATOR:
                return 4;
            case LOCATION_CRYSTAL_FOREST:
                return 5;
            case LOCATION_OURGAR_GAN:
                return -1;
            case LOCATION_PSYCHORATS_DUMP:
                return 5;
            case LOCATION_TECHNO_CITY:
                return 5;
            case LOCATION_UNDERGROUND_RIVER:
                return -1;
            case LOCATION_SUICIDE_ALLEY:
                return -1;
        }

        return 0;
    }

    /**
     * Determine if the location tile is closed or not
     *
     * @return bool
     */
    private function determineIfClosed($locationId, $cards, $powerCount) {
        // If location is Suicide Alley and there are still active powers, the tile is open
        if ($locationId == LOCATION_SUICIDE_ALLEY) {
            if ($powerCount == 0) {
                return true;
            }
            return false;
        }

        // Determine if Ourgar-gan is closed
        if ($locationId == LOCATION_OURGAR_GAN) {
            return $this->isOurgarganClosed($cards);
        }

        // Determine if Underground River is closed
        if ($locationId == LOCATION_UNDERGROUND_RIVER) {
            return $this->isUndergroundRiverClosed($cards);
        }

        // Else if location has max cards it is closed
        if (count($cards) == $this->maxCards) {
            return true;
        }

        return false;
    }

    /**
     * Determine if Ourgar-gan
     *
     * @return bool
     */
    private function isOurgarganClosed($cards) {
        $sum = 0;

        // Get sum of cards on Ourgan-gan
        foreach ($cards as $cardKey => $card) {
            $sum = $sum + $card->getValue();
        }

        // If sum is 11 or higher Ourgar-gan is closed
        if ($sum >= 11) {
            return true;
        }

        return false;
    }

    /**
     * Determine if Underground River is closed
     *
     * @return bool
     */
    private function isUndergroundRiverClosed($cards) {
        $sum = 0;

        // Get sum of cards on Underground River
        foreach ($cards as $cardKey => $card) {
            $sum = $sum + $card->getValue();
        }

        // If sum is 8 or higher Underground River is closed
        if ($sum > 7) {
            return true;
        }

        return false;
    }
}
