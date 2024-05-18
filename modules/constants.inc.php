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

/** Actions */
define("ACTION_BEGIN_TRANSFIGURATION_RITUAL", "beginTransfigurationRitual");
define("ACTION_DISCARD_CARD", "discardCard");
define("ACTION_EXPLORE_LOCATION", "exploreLocation");
define("ACTION_MOVE_METASHIP", "moveMetaship");
define("ACTION_PASS", "pass");
define("ACTION_SELECT_PLAYER", "selectPlayer");

/** Card Types */
define("CARD_ANIMAH", "animah");
define("CARD_DAMAGE", "damage");
define("CARD_DEEPO", "deepo");
define("CARD_JOHN_DIFOOL", "johndifool");
define("CARD_KILL", "kill");
define("CARD_METABARON", "metabaron");
define("CARD_SOLUNE", "solune");
define("CARD_TANATAH", "tanatah");

/** Card Names */
define("CARD_NAME_ANIMAH", clienttranslate("Animah"));
define("CARD_NAME_DAMAGE", clienttranslate("Damage"));
define("CARD_NAME_DEEPO", clienttranslate("Deepo"));
define("CARD_NAME_JOHN_DIFOOL", clienttranslate("John Difool"));
define("CARD_NAME_KILL", clienttranslate("Kill"));
define("CARD_NAME_METABARON", clienttranslate("Metabaron"));
define("CARD_NAME_SOLUNE", clienttranslate("Solune"));
define("CARD_NAME_TANATAH", clienttranslate("Tanatah"));

/** Card Map */
define("CARDS", [
    CARD_ANIMAH => CARD_NAME_ANIMAH,
    CARD_DAMAGE => CARD_NAME_DAMAGE,
    CARD_DEEPO => CARD_NAME_DEEPO,
    CARD_JOHN_DIFOOL => CARD_NAME_JOHN_DIFOOL,
    CARD_KILL => CARD_NAME_KILL,
    CARD_METABARON => CARD_NAME_METABARON,
    CARD_SOLUNE => CARD_NAME_SOLUNE,
    CARD_TANATAH => CARD_NAME_TANATAH,
]);

/** Card Locations */
define("CARD_LOCATION_DECK", "deck");
define("CARD_LOCATION_DISCARD", "discard");
define("CARD_LOCATION_DAMAGE_SUPPLY", "damageSupply");
define("CARD_LOCATION_HAND", "hand");
define("CARD_LOCATION_LOCATION_TILE", "locationTile");
define("CARD_LOCATION_UNUSED_CARDS", "unusedCards");

/** Enemy IDs */
define("ENEMY_BERGS_DEPLETED", 1);
define("ENEMY_BERGS", 2);
define("ENEMY_PRESIDENTS_HUNCHBACKS", 3);
define("ENEMY_GORGO_THE_DIRTY", 4);
define("ENEMY_NECROBOT", 5);
define("ENEMY_DARKNESS", 6);
define("ENEMY_RANDOM", 7);

/** Enemy Names */
define("ENEMY_NAME_BERGS", clienttranslate("The Bergs"));
define(
    "ENEMY_NAME_PRESIDENTS_HUNCHBACKS",
    clienttranslate("The Prezident's Hunchbacks")
);
define("ENEMY_NAME_GORGO_THE_DIRTY", clienttranslate("Gorgo the Fool"));
define("ENEMY_NAME_NECROBOT", clienttranslate("The Necrodroid"));
define("ENEMY_NAME_DARKNESS", clienttranslate("The Great Darkness"));

/** Enemy Map */
define("ENEMIES", [
    ENEMY_BERGS_DEPLETED => ENEMY_NAME_BERGS,
    ENEMY_BERGS => ENEMY_NAME_BERGS,
    ENEMY_PRESIDENTS_HUNCHBACKS => ENEMY_NAME_PRESIDENTS_HUNCHBACKS,
    ENEMY_GORGO_THE_DIRTY => ENEMY_NAME_GORGO_THE_DIRTY,
    ENEMY_NECROBOT => ENEMY_NAME_NECROBOT,
    ENEMY_DARKNESS => ENEMY_NAME_DARKNESS,
]);

define("ENEMY_KEYS", [
    ENEMY_BERGS_DEPLETED => "bergs",
    ENEMY_BERGS => "bergs",
    ENEMY_PRESIDENTS_HUNCHBACKS => "presidentshunchbacks",
    ENEMY_GORGO_THE_DIRTY => "gorgothedirty",
    ENEMY_NECROBOT => "necrobot",
    ENEMY_DARKNESS => "darkness",
]);

/** Game State Labels */
define("GAME_STATE_LABEL_CRYSTAL_FOREST_CURRENT_VALUE", "crystalForestCurrentValue");
define("GAME_STATE_LABEL_ENEMY", "enemy");
define("GAME_STATE_LABEL_ENEMY_ASYNC", "enemyAsync");
define("GAME_STATE_LABEL_ENEMY_LOCATION", "enemyLocation");
define("GAME_STATE_LABEL_ENEMY_REALTIME", "enemyRealtime");
define("GAME_STATE_LABEL_METASHIP_LOCATION", "metashipLocation");
define("GAME_STATE_LABEL_PLAYER_COUNT", "playerCount");
define("GAME_STATE_LABEL_POWER_DESTROY_AVAILABLE", "powerDestroyAvailable");
define("GAME_STATE_LABEL_POWER_DISCARD_AVAILABLE", "powerDiscardAvailable");
define("GAME_STATE_LABEL_POWER_MOVE_AVAILABLE", "powerMoveAvailable");
define("GAME_STATE_LABEL_POWER_TALK_AVAILABLE", "powerTalkAvailable");
define("GAME_STATE_LABEL_SELECTED_LOCATION", "selectedLocation");

/** Game State Label IDs */
define("GAME_STATE_LABEL_ID_ENEMY", 10);
define("GAME_STATE_LABEL_ID_ENEMY_LOCATION", 11);
define("GAME_STATE_LABEL_ID_METASHIP_LOCATION", 12);
define("GAME_STATE_LABEL_ID_PLAYER_COUNT", 13);
define("GAME_STATE_LABEL_ID_POWER_DESTROY_AVAILABLE", 14);
define("GAME_STATE_LABEL_ID_POWER_DISCARD_AVAILABLE", 15);
define("GAME_STATE_LABEL_ID_POWER_MOVE_AVAILABLE", 16);
define("GAME_STATE_LABEL_ID_POWER_TALK_AVAILABLE", 17);
define("GAME_STATE_LABEL_ID_SELECTED_LOCATION", 18);
define("GAME_STATE_LABEL_ID_CRYSTAL_FOREST_CURRENT_VALUE", 19);
define("GAME_STATE_LABEL_ID_ENEMY_REALTIME", 100);
define("GAME_STATE_LABEL_ID_ENEMY_ASYNC", 101);

/** Location IDs */
define("LOCATION_ACID_LAKE", 1);
define("LOCATION_AQUAEND", 2);
define("LOCATION_CENTRAL_CALCULATOR", 3);
define("LOCATION_CRYSTAL_FOREST", 4);
define("LOCATION_OURGAR_GAN", 5);
define("LOCATION_PSYCHORATS_DUMP", 6);
define("LOCATION_TECHNO_CITY", 7);
define("LOCATION_UNDERGROUND_RIVER", 8);
define("LOCATION_SUICIDE_ALLEY", 9);

/** Location Names */
define("LOCATION_NAME_ACID_LAKE", clienttranslate("The Acid Lake"));
define("LOCATION_NAME_AQUAEND", clienttranslate("Aquaend"));
define(
    "LOCATION_NAME_CENTRAL_CALCULATOR",
    clienttranslate("The Central Computer")
);
define("LOCATION_NAME_CRYSTAL_FOREST", clienttranslate("The Crystal Forest"));
define("LOCATION_NAME_OURGAR_GAN", clienttranslate("Orgargan"));
define(
    "LOCATION_NAME_PSYCHORATS_DUMP",
    clienttranslate("The Psychorats' Dump")
);
define("LOCATION_NAME_SUICIDE_ALLEY", clienttranslate("Suicide Alley"));
define("LOCATION_NAME_TECHNO_CITY", clienttranslate("TechnoCity"));
define(
    "LOCATION_NAME_UNDERGROUND_RIVER",
    clienttranslate("The Underground River")
);

/** Location Map */
define("LOCATIONS", [
    LOCATION_ACID_LAKE => LOCATION_NAME_ACID_LAKE,
    LOCATION_AQUAEND => LOCATION_NAME_AQUAEND,
    LOCATION_CENTRAL_CALCULATOR => LOCATION_NAME_CENTRAL_CALCULATOR,
    LOCATION_CRYSTAL_FOREST => LOCATION_NAME_CRYSTAL_FOREST,
    LOCATION_OURGAR_GAN => LOCATION_NAME_OURGAR_GAN,
    LOCATION_PSYCHORATS_DUMP => LOCATION_NAME_PSYCHORATS_DUMP,
    LOCATION_SUICIDE_ALLEY => LOCATION_NAME_SUICIDE_ALLEY,
    LOCATION_TECHNO_CITY => LOCATION_NAME_TECHNO_CITY,
    LOCATION_UNDERGROUND_RIVER => LOCATION_NAME_UNDERGROUND_RIVER,
]);

define("LOCATION_KEYS", [
    LOCATION_ACID_LAKE => "acidlake",
    LOCATION_AQUAEND => "aquaend",
    LOCATION_CENTRAL_CALCULATOR => "centralcalculator",
    LOCATION_CRYSTAL_FOREST => "crystalforest",
    LOCATION_OURGAR_GAN => "ourgargan",
    LOCATION_PSYCHORATS_DUMP => "psychoratsdump",
    LOCATION_SUICIDE_ALLEY => "suicidealley",
    LOCATION_TECHNO_CITY => "technocity",
    LOCATION_UNDERGROUND_RIVER => "undergroundriver",
]);

define("METASHIP_NAME", clienttranslate("Meta-ship"));

/** Power IDs */
define("POWER_DESTROY", 1);
define("POWER_DISCARD", 2);
define("POWER_MOVE", 3);
define("POWER_TALK", 4);

/** Power Names */
define("POWER_NAME_DESTROY", clienttranslate("Destroy"));
define("POWER_NAME_DISCARD", clienttranslate("Discard"));
define("POWER_NAME_MOVE", clienttranslate("Move"));
define("POWER_NAME_TALK", clienttranslate("Talk"));

/** Power Map */
define("POWERS", [
    POWER_DESTROY => POWER_NAME_DESTROY,
    POWER_DISCARD => POWER_NAME_DISCARD,
    POWER_MOVE => POWER_NAME_MOVE,
    POWER_TALK => POWER_NAME_TALK,
]);

define("POWER_KEYS", [
    POWER_DESTROY => "destroy",
    POWER_DISCARD => "discard",
    POWER_MOVE => "move",
    POWER_TALK => "talk",
]);

define("POWER_GAME_STATE_KEYS", [
    POWER_DESTROY => GAME_STATE_LABEL_POWER_DESTROY_AVAILABLE,
    POWER_DISCARD => GAME_STATE_LABEL_POWER_DISCARD_AVAILABLE,
    POWER_MOVE => GAME_STATE_LABEL_POWER_MOVE_AVAILABLE,
    POWER_TALK => GAME_STATE_LABEL_POWER_TALK_AVAILABLE,
]);

/** State Actions */
define("STATE_ACTION_GAME_END", "stGameEnd");
define("STATE_ACTION_GAME_SETUP", "stGameSetup");
define("STATE_ACTION_NEXT_PLAYER", "stNextPlayer");

/** State Arguments */
define("STATE_ARGUMENTS_EXPLORE", "argExplore");
define("STATE_ARGUMENTS_GAME_END", "argGameEnd");
define("STATE_ARGUMENTS_GORGO_DISCARD", "argGorgoDiscard");
define("STATE_ARGUMENTS_PASS_TURN", "argPassTurn");
define("STATE_ARGUMENTS_PLAYER_TURN", "argPlayerTurn");

/** State IDs */
define("STATE_GAME_SETUP", 1);
define("STATE_PLAYER_TURN", 10);
define("STATE_GORGO_DISCARD", 11);
define("STATE_EXPLORE", 12);
define("STATE_PASS_TURN", 13);
define("STATE_NEXT_PLAYER", 20);
define("STATE_TRANSFIGURATION_RITUAL", 30);
define("STATE_TRANSFIGURATION_RITUAL_DARKNESS", 40);
define("STATE_GAME_END", 99);

/** State Names */
define("STATE_NAME_EXPLORE", "explore");
define("STATE_NAME_GAME_END", "gameEnd");
define("STATE_NAME_GAME_SETUP", "gameSetup");
define("STATE_NAME_GORGO_DISCARD", "gorgoDiscard");
define("STATE_NAME_NEXT_PLAYER", "nextPlayer");
define("STATE_NAME_PASS_TURN", "passTurn");
define("STATE_NAME_PLAYER_TURN", "playerTurn");
define("STATE_NAME_TRANSFIGURATION_RITUAL", "transfigurationRitual");
define(
    "STATE_NAME_TRANSFIGURATION_RITUAL_DARKNESS",
    "transfigurationRitualDarkness"
);

/** State Types */
define("STATE_TYPE_ACTIVE_PLAYER", "activeplayer");
define("STATE_TYPE_GAME", "game");
define("STATE_TYPE_MANAGER", "manager");
define("STATE_TYPE_MULTIPLE_ACTIVE_PLAYER", "multipleactiveplayer");

/** Transitions */
define("TRANSITION_BEGIN_TRANSFIGURATION_RITUAL", "beginTransfigurationRitual");
define(
    "TRANSITION_BEGIN_TRANSFIGURATION_RITUAL_DARKNESS",
    "beginTransfigurationRitualDarkness"
);
define("TRANSITION_END_GAME", "endGame");
define("TRANSITION_END_TURN", "endTurn");
define("TRANSITION_EXPLORE_LOCATION", "exploreLocation");
define("TRANSITION_GORGO_DISCARD", "gorgoDiscard");
define("TRANSITION_NEXT_PLAYER", "nextPlayer");
define("TRANSITION_PASS_TURN", "passTurn");
