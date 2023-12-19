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
