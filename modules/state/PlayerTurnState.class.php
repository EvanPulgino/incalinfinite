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
 * Backend functions used by the playerTurn State
 *
 * In this state, a player moves the Meta-ship, passes, or attempts the Transfiguration Ritual
 *
 * @EvanPulgino
 */

class PlayerTurnState {
    private $game;

    public function __construct(IncalInfinite $game) {
        $this->game = $game;
    }

    public function getArgs() {
        return [];
    }

    public function moveMetaship($locationKey) {
        $activePlayer = $this->game->getActivePlayer();

        // Get current ship location
        $currentLocation = $this->game->getGameStateValue(
            GAME_STATE_LABEL_METASHIP_LOCATION
        );

        // Get new Location object
        $location = $this->game->locationController->getLocationFromKey(
            $locationKey
        );

        // Move the ship - aka set new ship location
        $this->game->setGameStateValue(
            GAME_STATE_LABEL_METASHIP_LOCATION,
            $location->getTilePosition()
        );

        // Notify players of the move
        $this->game->notifyAllPlayers(
            "message",
            clienttranslate(
                '${player_name} moves the Meta-ship to ${locationName}'
            ),
            [
                "player_name" => $activePlayer->getName(),
                "locationName" => $location->getName(),
            ]
        );

        // Set up animation to move along path
        $locationPath = [];
        $firstStep = $currentLocation == 10 ? 0 : $currentLocation + 2;
        $locationPath[] = $firstStep;

        $nextStep = $firstStep;
        while ($nextStep != $location->getTilePosition()) {
            $nextStep = $nextStep + 2;
            if ($nextStep > 10) {
                $nextStep = 0;
            }
            $locationPath[] = $nextStep;
        }

        // Animate each step of the path
        foreach ($locationPath as $step) {
            $this->game->notifyAllPlayers("moveMetaship", "", [
                "newLocationPosition" => $step,
                "lastStep" => $step == $location->getTilePosition(),
            ]);
        }
    }

    public function pass() {
        $activePlayer = $this->game->getActivePlayer();

        $this->game->notifyAllPlayers(
            "message",
            clienttranslate('${player_name} passes'),
            [
                "player_name" => $activePlayer->getName(),
            ]
        );

        $this->game->gamestate->nextState(TRANSITION_PASS_TURN);
    }
}
