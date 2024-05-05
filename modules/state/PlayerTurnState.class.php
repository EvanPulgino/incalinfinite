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

    /**
     * Get the arguments for the playerTurn state
     *
     * @return array
     */
    public function getArgs() {
        $activePlayer = $this->game->getActivePlayer();

        return [
            "locationsStatus" => $this->game->getLocationsStatusUiData(),
            "playerHand" => $this->game->cardController->getPlayerHandUiData(
                $activePlayer->getId()
            ),
        ];
    }

    /**
     * Move the Meta-ship to a new location
     *
     * @param string $locationKey - The key of the location to move to
     */
    public function moveMetaship($locationKey) {
        // Get active player
        $activePlayer = $this->game->getActivePlayer();

        // Get current ship location
        $currentLocation = $this->game->getGameStateValue(
            GAME_STATE_LABEL_METASHIP_LOCATION
        );

        // Get new Location object
        $location = $this->game->locationController->getLocationFromKey(
            $locationKey
        );

        // Save the current location for explore phase
        $this->game->setGameStateValue(
            GAME_STATE_LABEL_SELECTED_LOCATION,
            $location->getTileId()
        );

        // Move the ship - aka set new ship location
        $this->game->setGameStateValue(
            GAME_STATE_LABEL_METASHIP_LOCATION,
            $location->getTilePosition()
        );

        // Set up animation to move along path
        $locationPath = [];
        $firstStep = $currentLocation == 10 ? 0 : $currentLocation + 2;
        $locationPath[] = $firstStep;

        // Get the path to the new location
        $nextStep = $firstStep;
        while ($nextStep != $location->getTilePosition()) {
            $nextStep = $nextStep + 2;
            if ($nextStep > 10) {
                $nextStep = 0;
            }
            $locationPath[] = $nextStep;
        }

        // Get enemy position
        $enemyPosition = $this->game->getGameStateValue(
            GAME_STATE_LABEL_ENEMY_LOCATION
        );

        // Check if the ship passes the enemy
        $doesShipPassEnemy = $this->doesShipPassEnemy(
            $locationPath,
            $enemyPosition
        );

        // Notify players of the move
        $this->game->notifyAllPlayers(
            "message",
            clienttranslate(
                '${player_name} moves the Metacraft to ${locationName}'
            ),
            [
                "player_name" => $activePlayer->getName(),
                "locationName" => $location->getName(),
            ]
        );

        // Animate each step of the path
        foreach ($locationPath as $step) {
            $this->game->notifyAllPlayers("moveMetaship", "", [
                "newLocationPosition" => $step,
                "lastStep" => $step == $location->getTilePosition(),
            ]);
        }

        // If the ship passes the enemy, activate them
        if ($doesShipPassEnemy) {
            $this->activateEnemy();
        } else {
            // Transition to the next state
            $this->game->gamestate->nextState(TRANSITION_EXPLORE_LOCATION);
        }
    }

    /**
     * Pass the turn
     */
    public function pass() {
        $activePlayer = $this->game->getActivePlayer();

        // Notify players of the pass
        $this->game->notifyAllPlayers(
            "message",
            clienttranslate('${player_name} passes'),
            [
                "player_name" => $activePlayer->getName(),
            ]
        );

        // Transition to the next state
        $this->game->gamestate->nextState(TRANSITION_PASS_TURN);
    }

    /**
     * Determine if the ship passes the enemy
     */
    private function doesShipPassEnemy($locationPath, $enemyPosition) {
        // Determine which tile is after the enemy
        $tileAfterEnemy = 0;

        if ($enemyPosition % 2 == 0) {
            if ($enemyPosition == 10) {
                $tileAfterEnemy = 0;
            } else {
                $tileAfterEnemy = $enemyPosition + 2;
            }
        } else {
            if ($enemyPosition == 11) {
                $tileAfterEnemy = 0;
            } else {
                $tileAfterEnemy = $enemyPosition + 1;
            }
        }

        // Check if the ship passes the enemy
        foreach ($locationPath as $step) {
            if ($step == $tileAfterEnemy) {
                return true;
            }
        }

        return false;
    }

    /**
     * Activate the enemy
     */
    private function activateEnemy() {
        // Get the enemy used in the game
        $enemy = $this->game->getEnemy();

        // Activate the enemy
        switch ($enemy) {
            case ENEMY_BERGS:
                $this->activateBergs();
                break;
            case ENEMY_BERGS_DEPLETED:
                $this->activateBergs();
                break;
            case ENEMY_PRESIDENTS_HUNCHBACKS:
                $this->activatePresidentsHunchbacks();
                break;
            case ENEMY_GORGO_THE_DIRTY:
                $this->activateGorgoTheDirty();
                break;
            case ENEMY_NECROBOT:
                $this->activateNecrobot();
                break;
            case ENEMY_DARKNESS:
                $this->activateDarkness();
                break;
        }
    }

    /**
     * Activate the Bergs
     *
     * The Bergs move one step counter-clockwise. If they return to their start position, the players lose.
     * Otherwise, a Damage card is added to the discard pile.
     */
    private function activateBergs() {
        // Get active player
        $activePlayer = $this->game->getActivePlayer();

        // Get enemy position
        $enemyPosition = $this->game->getGameStateValue(
            GAME_STATE_LABEL_ENEMY_LOCATION
        );

        // Determine destination position for the enemy
        if ($enemyPosition == 1) {
            $destinationPosition = 11;
        } else {
            $destinationPosition = $enemyPosition - 2;
        }

        // Move the enemy
        $this->game->setGameStateValue(
            GAME_STATE_LABEL_ENEMY_LOCATION,
            $destinationPosition
        );

        // Notify players of enemy move
        $this->game->notifyAllPlayers(
            "moveEnemy",
            clienttranslate("The Bergs move one step counter-clockwise"),
            [
                "destinationPosition" => $destinationPosition,
            ]
        );

        if ($destinationPosition == 11) {
            // If the Bergs return to their start position, the players lose
            $this->game->notifyAllPlayers(
                "message",
                clienttranslate(
                    "The Bergs have returned to their start position. The players lose."
                ),
                []
            );
            $this->game->gamestate->nextState(TRANSITION_END_GAME);
        } else {
            // Add damge card to the discard pile
            $damageCard = $this->game->cardController->moveDamageToDiscard();

            // Notify players
            $this->game->notifyAllPlayers(
                "addDamageToDiscard",
                clienttranslate("A Damage card is added to the discard pile"),
                [
                    "card" => $damageCard->getUiData(),
                    "player_id" => $activePlayer->getId(),
                ]
            );
        }

        // Transition to the next state
        $this->game->gamestate->nextState(TRANSITION_EXPLORE_LOCATION);
    }

    /**
     * Activate the President's Hunchbacks
     *
     * The President's Hunchbacks move one step counter-clockwise. A Damage card is added to the discard pile.
     */
    private function activatePresidentsHunchbacks() {
        // Get active player
        $activePlayer = $this->game->getActivePlayer();

        // Get enemy position
        $enemyPosition = $this->game->getGameStateValue(
            GAME_STATE_LABEL_ENEMY_LOCATION
        );

        // Determine destination position
        if ($enemyPosition == 0) {
            $destinationPosition = 10;
        } else {
            $destinationPosition = $enemyPosition - 2;
        }

        // Move the enemy
        $this->game->setGameStateValue(
            GAME_STATE_LABEL_ENEMY_LOCATION,
            $destinationPosition
        );

        // Notify players of enemy move
        $this->game->notifyAllPlayers(
            "moveEnemy",
            clienttranslate(
                "The Prezident's Hunchbacks move one step counter-clockwise"
            ),
            [
                "destinationPosition" => $destinationPosition,
            ]
        );

        // Add damge card to the discard pile
        $damageCard = $this->game->cardController->moveDamageToDiscard();

        // Notify players
        $this->game->notifyAllPlayers(
            "addDamageToDiscard",
            clienttranslate("A Damage card is added to the discard pile"),
            [
                "card" => $damageCard->getUiData(),
                "player_id" => $activePlayer->getId(),
            ]
        );

        // Transition to the next state
        $this->game->gamestate->nextState(TRANSITION_EXPLORE_LOCATION);
    }

    /**
     * Activate Gorgo-the-dirty
     *
     * Gorgo-the-dirty moves one step counter-clockwise. If they return to their start position, the players lose.
     * Otherwise the player chooses a player to discard a non-damage card at random.
     */
    private function activateGorgoTheDirty() {
        // Get enemy position
        $enemyPosition = $this->game->getGameStateValue(
            GAME_STATE_LABEL_ENEMY_LOCATION
        );

        // Determine destination position
        if ($enemyPosition == 1) {
            $destinationPosition = 11;
        } else {
            $destinationPosition = $enemyPosition - 2;
        }

        // Move the enemy
        $this->game->setGameStateValue(
            GAME_STATE_LABEL_ENEMY_LOCATION,
            $destinationPosition
        );

        // Notify players of enemy move
        $this->game->notifyAllPlayers(
            "moveEnemy",
            clienttranslate("Gorgo the Fool move one step counter-clockwise"),
            [
                "destinationPosition" => $destinationPosition,
            ]
        );

        // Transition to the next state
        $this->game->gamestate->nextState(TRANSITION_GORGO_DISCARD);
    }

    /**
     * Activate the Necrobot
     *
     * The Necrobot moves one step counter-clockwise. The player gains a damage card from the supply.
     */
    private function activateNecrobot() {
        $activePlayer = $this->game->getActivePlayer();

        // Get enemy position
        $enemyPosition = $this->game->getGameStateValue(
            GAME_STATE_LABEL_ENEMY_LOCATION
        );

        // Determine destination position
        if ($enemyPosition == 1) {
            $destinationPosition = 11;
        } else {
            $destinationPosition = $enemyPosition - 2;
        }

        // Move the enemy
        $this->game->setGameStateValue(
            GAME_STATE_LABEL_ENEMY_LOCATION,
            $destinationPosition
        );

        // Notify players of enemy move
        $this->game->notifyAllPlayers(
            "moveEnemy",
            clienttranslate("The Necrodroid move one step counter-clockwise"),
            [
                "destinationPosition" => $destinationPosition,
            ]
        );

        // Player gains a damage card from the supply
        $damageCard = $this->game->cardController->playerGainNewDamage(
            $activePlayer
        );

        // Notify players
        $this->game->notifyAllPlayers(
            "gainDamageFromEnemy",
            clienttranslate(
                '${player_name} gains a Damage card from the supply'
            ),
            [
                "player_name" => $activePlayer->getName(),
                "player_id" => $activePlayer->getId(),
                "card" => $damageCard->getUiData(),
            ]
        );

        $this->game->notifyPlayer(
            $activePlayer->getId(),
            "gainDamageFromEnemyPrivate",
            clienttranslate(
                '${player_name} gains a Damage card from the supply'
            ),
            [
                "player_name" => $activePlayer->getName(),
                "player_id" => $activePlayer->getId(),
                "card" => $damageCard->getUiData(),
            ]
        );

        // Transition to the next state
        $this->game->gamestate->nextState(TRANSITION_EXPLORE_LOCATION);
    }

    /**
     * Activate the Darkness
     *
     * The Darkness moves one step counter-clockwise. A Damage card is added to the discard pile.
     */
    private function activateDarkness() {
        $activePlayer = $this->game->getActivePlayer();

        // Get enemy position
        $enemyPosition = $this->game->getGameStateValue(
            GAME_STATE_LABEL_ENEMY_LOCATION
        );

        // Determine destination position
        if ($enemyPosition == 1) {
            $destinationPosition = 11;
        } else {
            $destinationPosition = $enemyPosition - 2;
        }

        // Move the enemy
        $this->game->setGameStateValue(
            GAME_STATE_LABEL_ENEMY_LOCATION,
            $destinationPosition
        );

        // Notify players of enemy move
        $this->game->notifyAllPlayers(
            "moveEnemy",
            clienttranslate("The Great Darkness move one step counter-clockwise"),
            [
                "destinationPosition" => $destinationPosition,
            ]
        );

        // Add damge card to the discard pile
        $damageCard = $this->game->cardController->moveDamageToDiscard();

        // Notify players
        $this->game->notifyAllPlayers(
            "addDamageToDiscard",
            clienttranslate("A Damage card is added to the discard pile"),
            [
                "card" => $damageCard->getUiData(),
                "player_id" => $activePlayer->getId(),
            ]
        );

        $this->game->gamestate->nextState(TRANSITION_EXPLORE_LOCATION);
    }
}
