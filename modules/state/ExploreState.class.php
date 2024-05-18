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
 * Backend functions used by the explore State
 *
 * In this state, the game handles exploring a location
 *
 * @EvanPulgino
 */

class ExploreState {
    private $game;

    public function __construct(IncalInfinite $game) {
        $this->game = $game;
    }

    public function getArgs() {
        // Get active player
        $activePlayer = $this->game->getActivePlayer();

        // Get current ship location
        $currentLocation = $this->game->getGameStateValue(
            GAME_STATE_LABEL_METASHIP_LOCATION
        );

        // Get location object
        $location = $this->game->locationController->getLocationFromPosition(
            $currentLocation
        );

        // Get location status
        $locationStatus = $this->game->getLocationStatus($location->getKey());

        return [
            "crystalForestCurrentValue" => $this->game->getGameStateValue(
                GAME_STATE_LABEL_CRYSTAL_FOREST_CURRENT_VALUE
            ),
            "locationMessage" => $this->getLocationMessage($location),
            "locationStatus" => $locationStatus->getUiData(),
            "playerHand" => $this->game->cardController->getPlayerHandUiData(
                $activePlayer->getId()
            ),
        ];
    }

    private function getLocationMessage(Location $location) {
        if ($location->getKey() === LOCATION_KEYS[LOCATION_PSYCHORATS_DUMP]) {
            return clienttranslate("must play exactly 1 character card at") .
                " " .
                $location->getName();
        }

        return clienttranslate(
            "must play 1 or more cards of a single character type at"
        ) .
            " " .
            $location->getName();
    }
}
