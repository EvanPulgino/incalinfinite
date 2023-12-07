<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * AgeOfComics implementation : © Evan Pulgino <evan.pulgino@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * constants.inc.php
 *
 * @EvanPulgino
 */

/** State Actions */
define("STATE_ACTION_GAME_END", "stGameEnd");
define("STATE_ACTION_GAME_SETUP", "stGameSetup");

/** State Arguments */
define("STATE_ARGUMENTS_GAME_END", "argGameEnd");

/** State IDs */
define("STATE_GAME_SETUP", 1);
define("STATE_PLAYER_TURN", 2);
define("STATE_GAME_END", 99);

/** State Names */
define("STATE_NAME_GAME_END", "gameEnd");
define("STATE_NAME_GAME_SETUP", "gameSetup");
define("STATE_NAME_PLAYER_TURN", "playerTurn");

/** State Types */
define("STATE_TYPE_ACTIVE_PLAYER", "activeplayer");
define("STATE_TYPE_GAME", "game");
define("STATE_TYPE_MANAGER", "manager");
define("STATE_TYPE_MULTIPLE_ACTIVE_PLAYER", "multipleactiveplayer");
