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
 * Backend functions used by the nextPlayer State
 *
 * In this state, the game handles the transition to the next player
 *
 * @EvanPulgino
 */

class NextPlayerState {
    private $game;

    public function __construct(IncalInfinite $game) {
        $this->game = $game;
    }

    public function getArgs() {
        return [];
    }

    public function stNextPlayer() {
        // Activate the next player
        $this->game->activateNextPlayer();
        $this->game->gamestate->nextState(TRANSITION_NEXT_PLAYER);
    }
}
