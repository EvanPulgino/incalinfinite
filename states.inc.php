<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * IncalInfinite implementation : © Evan Pulgino <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * states.inc.php
 *
 * IncalInfinite game states description
 *
 */

/*
   Game state machine is a tool used to facilitate game developpement by doing common stuff that can be set up
   in a very easy way from this configuration file.

   Please check the BGA Studio presentation about game state to understand this, and associated documentation.

   Summary:

   States types:
   _ activeplayer: in this type of state, we expect some action from the active player.
   _ multipleactiveplayer: in this type of state, we expect some action from multiple players (the active players)
   _ game: this is an intermediary state where we don't expect any actions from players. Your game logic must decide what is the next game state.
   _ manager: special type for initial and final state

   Arguments of game states:
   _ name: the name of the GameState, in order you can recognize it on your own code.
   _ description: the description of the current game state is always displayed in the action status bar on
                  the top of the game. Most of the time this is useless for game state with "game" type.
   _ descriptionmyturn: the description of the current game state when it's your turn.
   _ type: defines the type of game states (activeplayer / multipleactiveplayer / game / manager)
   _ action: name of the method to call when this game state become the current game state. Usually, the
             action method is prefixed by "st" (ex: "stMyGameStateName").
   _ possibleactions: array that specify possible player actions on this step. It allows you to use "checkAction"
                      method on both client side (Javacript: this.checkAction) and server side (PHP: self::checkAction).
   _ transitions: the transitions are the possible paths to go from a game state to another. You must name
                  transitions in order to use transition names in "nextState" PHP method, and use IDs to
                  specify the next game state for each transition.
   _ args: name of the method to call to retrieve arguments for this gamestate. Arguments are sent to the
           client side to be used on "onEnteringState" or to set arguments in the gamestate description.
   _ updateGameProgression: when specified, the game progression is updated (=> call to your getGameProgression
                            method).
*/

//    !! It is not a good idea to modify this file when a game is running !!

$machinestates = [
    // The initial state. Please do not modify.
    STATE_GAME_SETUP => [
        "name" => STATE_NAME_GAME_SETUP,
        "description" => "",
        "type" => STATE_TYPE_MANAGER,
        "action" => STATE_ACTION_GAME_SETUP,
        "transitions" => ["" => STATE_PLAYER_TURN],
    ],

    STATE_PLAYER_TURN => [
        "name" => STATE_NAME_PLAYER_TURN,
        "description" => clienttranslate(
            '${actplayer} must move the Meta-ship, pass, or attempt the Transfiguration Ritual'
        ),
        "descriptionmyturn" => clienttranslate(
            '${you} must move the Meta-ship, pass, or attempt the Transfiguration Ritual'
        ),
        "type" => STATE_TYPE_ACTIVE_PLAYER,
        "args" => STATE_ARGUMENTS_PLAYER_TURN,
        "possibleactions" => [
            ACTION_BEGIN_TRANSFIGURATION_RITUAL,
            ACTION_MOVE_METASHIP,
            ACTION_PASS,
        ],
        "transitions" => [
            TRANSITION_BEGIN_TRANSFIGURATION_RITUAL => STATE_GAME_END,
            TRANSITION_BEGIN_TRANSFIGURATION_RITUAL_DARKNESS => STATE_GAME_END,
            TRANSITION_END_GAME => STATE_GAME_END,
            TRANSITION_PASS_TURN => STATE_PASS_TURN,
            TRANSITION_EXPLORE_LOCATION => STATE_EXPLORE,
        ],
    ],

    STATE_EXPLORE => [
        "name" => STATE_NAME_EXPLORE,
        "description" => clienttranslate(
            '${actplayer} must explore the ${location}'
        ),
        "descriptionmyturn" => clienttranslate(
            '${you} must explore the ${location}'
        ),
        "type" => STATE_TYPE_ACTIVE_PLAYER,
        "args" => STATE_ARGUMENTS_EXPLORE,
        "possibleactions" => [ACTION_EXPLORE_LOCATION],
        "transitions" => [
            TRANSITION_END_TURN => STATE_NEXT_PLAYER,
        ],
    ],

    STATE_PASS_TURN => [
        "name" => STATE_NAME_PASS_TURN,
        "description" => clienttranslate(
            '${actplayer} must discard 1 non-damaged card from their hand'
        ),
        "descriptionmyturn" => clienttranslate(
            '${you} must discard 1 non-damage card from your hand'
        ),
        "type" => STATE_TYPE_ACTIVE_PLAYER,
        "args" => STATE_ARGUMENTS_PASS_TURN,
        "possibleactions" => [ACTION_DISCARD_CARD],
        "transitions" => [
            TRANSITION_END_GAME => STATE_GAME_END,
            TRANSITION_END_TURN => STATE_NEXT_PLAYER,
        ],
    ],

    STATE_NEXT_PLAYER => [
        "name" => STATE_NAME_NEXT_PLAYER,
        "description" => "",
        "type" => STATE_TYPE_GAME,
        "action" => "stNextPlayer",
        "updateGameProgression" => true,
        "transitions" => [
            TRANSITION_NEXT_PLAYER => STATE_PLAYER_TURN,
        ],
    ],

    // Final state.
    // Please do not modify (and do not overload action/args methods).
    STATE_GAME_END => [
        "name" => STATE_NAME_GAME_END,
        "description" => clienttranslate("End of game"),
        "type" => STATE_TYPE_MANAGER,
        "action" => STATE_ACTION_GAME_END,
        "args" => STATE_ARGUMENTS_GAME_END,
    ],
];
