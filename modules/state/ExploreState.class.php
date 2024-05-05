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
        // Get current ship location
        $currentLocation = $this->game->getGameStateValue(
            GAME_STATE_LABEL_METASHIP_LOCATION
        );

        // Get location object
        $location = $this->game->locationController->getLocationFromPosition(
            $currentLocation
        );

        return [
            "locationName" => $location->getName(),
        ];
    }
}
