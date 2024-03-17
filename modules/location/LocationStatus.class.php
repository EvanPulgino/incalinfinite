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

    public function getLocation() {
        return $this->location;
    }

    public function getMaxCards() {
        return $this->maxCards;
    }

    public function getCards() {
        if ($this->cards == null) {
            return [];
        }

        return $this->cards;
    }

    public function isClosed() {
        return $this->closed;
    }

    public function getUiData() {
        return [
            "location" => $this->location->getUiData(),
            "maxCards" => $this->maxCards,
            "cards" => array_map(function ($card) {
                return $card->getUiData();
            }, $this->getCards()),
            "isClosed" => $this->isClosed(),
        ];
    }

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

    private function determineIfClosed($locationId, $cards, $powerCount) {
        if ($locationId == LOCATION_SUICIDE_ALLEY) {
            if ($powerCount == 0) {
                return true;
            }
            return false;
        }

        if ($locationId == LOCATION_OURGAR_GAN) {
            return $this->isOurgarganClosed($cards);
        }

        if ($locationId == LOCATION_UNDERGROUND_RIVER) {
            return $this->isUndergroundRiverClosed($cards);
        }

        if (count($cards) == $this->maxCards) {
            return true;
        }

        return false;
    }

    private function isOurgarganClosed($cards) {
        $sum = 0;

        foreach ($cards as $cardKey => $card) {
            $sum = $sum + $card->getValue();
        }

        if ($sum >= 11) {
            return true;
        }

        return false;
    }

    private function isUndergroundRiverClosed($cards) {
        $sum = 0;

        foreach ($cards as $cardKey => $card) {
            $sum = $sum + $card->getValue();
        }

        if ($sum > 7) {
            return true;
        }

        return false;
    }
}
