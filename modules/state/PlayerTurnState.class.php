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

        // Save the current location for explore phase
        $this->game->setGameStateValue(GAME_STATE_LABEL_SELECTED_LOCATION, $location->getTileId());

        // Move the ship - aka set new ship location
        $this->game->setGameStateValue(
            GAME_STATE_LABEL_METASHIP_LOCATION,
            $location->getTilePosition()
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
                '${player_name} moves the Meta-ship to ${locationName}'
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

    private function doesShipPassEnemy($locationPath, $enemyPosition) {
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

        foreach ($locationPath as $step) {
            if ($step == $tileAfterEnemy) {
                return true;
            }
        }

        return false;
    }

    private function activateEnemy() {
        $enemy = $this->game->getEnemy();

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

    private function activateBergs() {
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
            clienttranslate("The Bergs move one step counter-clockwise"),
            [
                "destinationPosition" => $destinationPosition,
            ]
        );

        if ($destinationPosition == 11) {
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
    }

    private function activatePresidentsHunchbacks() {
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
                "The President's Hunchbacks move one step counter-clockwise"
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
    }

    private function activateGorgoTheDirty() {
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
            clienttranslate("Gorgo-the-dirty move one step counter-clockwise"),
            [
                "destinationPosition" => $destinationPosition,
            ]
        );

        $this->game->gamestate->nextState(TRANSITION_GORGO_DISCARD);
    }

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
            clienttranslate("The Necrobot move one step counter-clockwise"),
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
    }

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
            clienttranslate("The Darkness move one step counter-clockwise"),
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
    }
}
