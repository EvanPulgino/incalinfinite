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
 * Backend functions used by the passTurn State
 *
 * In this state, the game handles the effects of a player passing the turn
 *
 * @EvanPulgino
 */

 class PassTurnState {
     private $game;

     public function __construct(IncalInfinite $game) {
         $this->game = $game;
     }

     public function getArgs() {
         return [];
     }
 }