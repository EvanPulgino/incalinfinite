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

/** Card Types */
define("CARD_ANIMAH", "animah");
define("CARD_DAMAGE", "damage");
define("CARD_DEEPO", "deepo");
define("CARD_JOHN_DIFOOL", "john_difool");
define("CARD_KILL", "kill");
define("CARD_METABARON", "metabaron");
define("CARD_SOLUNE", "solune");
define("CARD_TANATA", "tanata");

/** Card Names */
define("CARD_NAME_ANIMAH", clienttranslate("Animah"));
define("CARD_NAME_DAMAGE", clienttranslate("Damage"));
define("CARD_NAME_DEEPO", clienttranslate("Deepo"));
define("CARD_NAME_JOHN_DIFOOL", clienttranslate("John Difool"));
define("CARD_NAME_KILL", clienttranslate("Kill"));
define("CARD_NAME_METABARON", clienttranslate("Metabaron"));
define("CARD_NAME_SOLUNE", clienttranslate("Solune"));
define("CARD_NAME_TANATA", clienttranslate("Tanata"));

/** Card Map */
define("CARDS", [
    CARD_ANIMAH => CARD_NAME_ANIMAH,
    CARD_DAMAGE => CARD_NAME_DAMAGE,
    CARD_DEEPO => CARD_NAME_DEEPO,
    CARD_JOHN_DIFOOL => CARD_NAME_JOHN_DIFOOL,
    CARD_KILL => CARD_NAME_KILL,
    CARD_METABARON => CARD_NAME_METABARON,
    CARD_SOLUNE => CARD_NAME_SOLUNE,
    CARD_TANATA => CARD_NAME_TANATA,
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

/** Enemy Names */
define("ENEMY_NAME_BERGS", clienttranslate("The Bergs"));
define(
    "ENEMY_NAME_PRESIDENTS_HUNCHBACKS",
    clienttranslate("The President's Hunchbacks")
);
define("ENEMY_NAME_GORGO_THE_DIRTY", clienttranslate("Gorgo-the-dirty"));
define("ENEMY_NAME_NECROBOT", clienttranslate("The Necrobot"));
define("ENEMY_NAME_DARKNESS", clienttranslate("The Darkness"));

/** Enemy Map */
define("ENEMIES", [
    ENEMY_BERGS_DEPLETED => ENEMY_NAME_BERGS,
    ENEMY_BERGS => ENEMY_NAME_BERGS,
    ENEMY_PRESIDENTS_HUNCHBACKS => ENEMY_NAME_PRESIDENTS_HUNCHBACKS,
    ENEMY_GORGO_THE_DIRTY => ENEMY_NAME_GORGO_THE_DIRTY,
    ENEMY_NECROBOT => ENEMY_NAME_NECROBOT,
    ENEMY_DARKNESS => ENEMY_NAME_DARKNESS,
]);

/** Game State Labels */
define("GAME_STATE_LABEL_ENEMY", "enemy");
define("GAME_STATE_LABEL_ENEMY_LOCATION", "enemyLocation");
define("GAME_STATE_LABEL_METANAVE_LOCATION", "metanaveLocation");
define("GAME_STATE_LABEL_PLAYER_COUNT", "playerCount");
define("GAME_STATE_LABEL_POWER_DESTROY_AVAILABLE", "powerDestroyAvailable");
define("GAME_STATE_LABEL_POWER_DISCARD_AVAILABLE", "powerDiscardAvailable");
define("GAME_STATE_LABEL_POWER_MOVE_AVAILABLE", "powerMoveAvailable");
define("GAME_STATE_LABEL_POWER_TALK_AVAILABLE", "powerTalkAvailable");

/** Game State Label IDs */
define("GAME_STATE_LABEL_ID_ENEMY_LOCATION", 1);
define("GAME_STATE_LABEL_ID_METANAVE_LOCATION", 2);
define("GAME_STATE_LABEL_ID_PLAYER_COUNT", 3);
define("GAME_STATE_LABEL_ID_POWER_DESTROY_AVAILABLE", 4);
define("GAME_STATE_LABEL_ID_POWER_DISCARD_AVAILABLE", 5);
define("GAME_STATE_LABEL_ID_POWER_MOVE_AVAILABLE", 6);
define("GAME_STATE_LABEL_ID_POWER_TALK_AVAILABLE", 7);
define("GAME_STATE_LABEL_ID_ENEMY", 100);

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
define("LOCATION_NAME_ACID_LAKE", clienttranslate("Acid Lake"));
define("LOCATION_NAME_AQUAEND", clienttranslate("Aquaend"));
define(
    "LOCATION_NAME_CENTRAL_CALCULATOR",
    clienttranslate("The Central Calculator")
);
define("LOCATION_NAME_CRYSTAL_FOREST", clienttranslate("The Crystal Forest"));
define("LOCATION_NAME_OURGAR_GAN", clienttranslate("Ourgar-gan"));
define(
    "LOCATION_NAME_PSYCHORATS_DUMP",
    clienttranslate("The Psychorats' Dump")
);
define("LOCATION_NAME_SUICIDE_ALLEY", clienttranslate("Suicide Alley"));
define("LOCATION_NAME_TECHNO_CITY", clienttranslate("Techno City"));
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