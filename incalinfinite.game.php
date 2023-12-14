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
 * incalinfinite.game.php
 *
 * This is the main file for your game logic.
 *
 * In this PHP file, you are going to defines the rules of the game.
 *
 */

include "modules/autoload.php";
require_once "modules/constants.inc.php";
require_once APP_GAMEMODULE_PATH . "module/table/table.game.php";

class IncalInfinite extends Table {
    public $cardController;
    public $locationController;
    public $playerController;
    public $states;

    function __construct() {
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();

        self::initGameStateLabels([
            GAME_STATE_LABEL_ENEMY_LOCATION => GAME_STATE_LABEL_ID_ENEMY_LOCATION,
            GAME_STATE_LABEL_METASHIP_LOCATION => GAME_STATE_LABEL_ID_METASHIP_LOCATION,
            GAME_STATE_LABEL_PLAYER_COUNT => GAME_STATE_LABEL_ID_PLAYER_COUNT,
            GAME_STATE_LABEL_POWER_DESTROY_AVAILABLE => GAME_STATE_LABEL_ID_POWER_DESTROY_AVAILABLE,
            GAME_STATE_LABEL_POWER_DISCARD_AVAILABLE => GAME_STATE_LABEL_ID_POWER_DISCARD_AVAILABLE,
            GAME_STATE_LABEL_POWER_MOVE_AVAILABLE => GAME_STATE_LABEL_ID_POWER_MOVE_AVAILABLE,
            GAME_STATE_LABEL_POWER_TALK_AVAILABLE => GAME_STATE_LABEL_ID_POWER_TALK_AVAILABLE,
            GAME_STATE_LABEL_ENEMY => GAME_STATE_LABEL_ID_ENEMY,
        ]);

        $this->cardController = new CardController(
            self::getNew("module.common.deck")
        );
        $this->locationController = new LocationController();
        $this->playerController = new PlayerController();

        $this->states[STATE_NEXT_PLAYER] = new NextPlayerState($this);
        $this->states[STATE_PASS_TURN] = new PassTurnState($this);
        $this->states[STATE_PLAYER_TURN] = new PlayerTurnState($this);
    }

    protected function getGameName() {
        // Used for translations and stuff. Please do not modify.
        return "incalinfinite";
    }

    /*
        setupNewGame:
        
        This method is called only once, when a new game is launched.
        In this method, you must setup the game according to the game rules, so that
        the game is ready to be played.
    */
    protected function setupNewGame($players, $options = []) {
        $gameInfo = self::getGameinfos();
        $this->playerController->setupPlayers($players, $gameInfo);

        self::reattributeColorsBasedOnPreferences(
            $players,
            $gameInfo["player_colors"]
        );
        self::reloadPlayersBasicInfos();

        // If random enemy option was chose, randomize enemy
        if ($this->getEnemy() == ENEMY_RANDOM) {
            $this->randomizeEnemy();
        }

        self::setGameStateInitialValue(
            GAME_STATE_LABEL_ENEMY_LOCATION,
            $this->getEnemyStartLocation()
        );
        self::setGameStateInitialValue(GAME_STATE_LABEL_METASHIP_LOCATION, 0);
        self::setGameStateInitialValue(
            GAME_STATE_LABEL_PLAYER_COUNT,
            count($players)
        );
        self::setGameStateInitialValue(
            GAME_STATE_LABEL_POWER_DESTROY_AVAILABLE,
            1
        );
        self::setGameStateInitialValue(
            GAME_STATE_LABEL_POWER_DISCARD_AVAILABLE,
            1
        );
        self::setGameStateInitialValue(
            GAME_STATE_LABEL_POWER_MOVE_AVAILABLE,
            1
        );
        self::setGameStateInitialValue(
            GAME_STATE_LABEL_POWER_TALK_AVAILABLE,
            1
        );

        // Init game statistics
        // (note: statistics used in this file must be defined in your stats.inc.php file)
        //self::initStat( 'table', 'table_teststat1', 0 );    // Init a table statistics
        //self::initStat( 'player', 'player_teststat1', 0 );  // Init a player statistics (for all players)

        // Setup locations
        $this->locationController->setupLocations($this->getEnemy());

        // Setup cards
        $this->cardController->setupCards(
            $this->playerController->getPlayers(),
            $this->getEnemy()
        );

        // Activate first player (which is in general a good idea :) )
        $this->activeNextPlayer();

        /************ End of the game initialization *****/
    }

    /*
        getAllDatas: 
        
        Gather all informations about current game situation (visible by the current player).
        
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
    */
    protected function getAllDatas() {
        $result = [];

        $current_player_id = self::getCurrentPlayerId(); // !! We must only return informations visible by this player !!

        $result["currentPlayer"] = $this->playerController
            ->getPlayer($current_player_id)
            ->getUiData();
        $result[
            "currentPlayerHand"
        ] = $this->cardController->getPlayerHandUiData($current_player_id);
        $result["deck"] = $this->cardController->getDeckUiData();
        $result["discard"] = $this->cardController->getDiscardUiData();
        $result["enemy"] = $this->buildEnemyObject();
        $result["incalInfinitePlayers"] = $this->getAllPlayers();
        $result[
            "locations"
        ] = $this->locationController->getAllLocationsUiData();
        $result[
            "locationCards"
        ] = $this->cardController->getLocationTileCardsUiData();
        $result["metashipLocation"] = $this->getMetashipLocation();
        $result["metashipName"] = METASHIP_NAME;
        $result[
            "playerHandCounts"
        ] = $this->cardController->getPlayerHandsCount(
            $this->playerController->getPlayers()
        );
        $result["powers"] = $this->getPowers();

        return $result;
    }

    /*
        getGameProgression:
        
        Compute and return the current game progression.
        The number returned must be an integer beween 0 (=the game just started) and
        100 (= the game is finished or almost finished).
    
        This method is called each time we are in a game state with the "updateGameProgression" property set to true 
        (see states.inc.php)
    */
    function getGameProgression() {
        // TODO: compute and return the game progression

        return 0;
    }

    /**
     * This method is called everytime the system tries to call an undefined method.
     * It will look for functions that are defined in the states and call them if they exist:
     *
     * @param string $name The name of the function being called
     * @param array $args The arguments passed to the function
     * @return void
     */
    function __call($name, $args) {
        foreach ($this->states as $state) {
            if (in_array($name, get_class_methods($state))) {
                call_user_func([$state, $name], $args);
            }
        }
    }

    //////////////////////////////////////////////////////////////////////////////
    //////////// Utility functions
    ////////////

    /**
     * Get the active player object
     *
     * @return IncalInfinitePlayer - The active player object
     */
    public function getActivePlayer() {
        return $this->playerController->getPlayer(self::getActivePlayerId());
    }

    /**
     * Get player ui objects for all players (includes hand counts)
     */
    public function getAllPlayers() {
        $players = $this->playerController->getPlayersUiData();

        foreach ($players as $playerKey => $player) {
            $players[$playerKey][
                "handCount"
            ] = $this->cardController->getPlayerHandCount($player["id"]);
        }

        return $players;
    }

    /**
     * Get the enemy being used in this game
     *
     * @return int - The enemy ID
     */
    public function getEnemy() {
        return self::getGameStateValue("enemy");
    }

    /**
     * Get the name of the enemy being used in this game
     *
     * @return string - The enemy name
     */
    public function getEnemyName() {
        return ENEMIES[$this->getEnemy()];
    }

    public function getEnemyLocation() {
        return self::getGameStateValue(GAME_STATE_LABEL_ENEMY_LOCATION);
    }

    public function getEnemyStartLocation() {
        // The President's Hunchbacks start at location tile counter-clockwise from Suicide Alley
        if ($this->getEnemy() == ENEMY_PRESIDENTS_HUNCHBACKS) {
            return 10;
        }

        // All other enemies start between Suicide Alley and counter-clockwise location
        return 11;
    }

    public function getMetashipLocation() {
        return self::getGameStateValue(GAME_STATE_LABEL_METASHIP_LOCATION);
    }

    public function getPlayerCount() {
        return self::getGameStateValue(GAME_STATE_LABEL_PLAYER_COUNT);
    }

    public function getPowers() {
        $powers = [];
        $powers[] = $this->buildPowerObject(POWER_DESTROY);
        $powers[] = $this->buildPowerObject(POWER_DISCARD);
        $powers[] = $this->buildPowerObject(POWER_MOVE);
        $powers[] = $this->buildPowerObject(POWER_TALK);
        return $powers;
    }

    private function buildEnemyObject() {
        $enemyId = $this->getEnemy();
        return [
            "id" => $enemyId,
            "name" => $this->getEnemyName(),
            "key" => ENEMY_KEYS[$enemyId],
            "location" => $this->getEnemyLocation(),
        ];
    }

    private function buildPowerObject($powerId) {
        $powerAvailable = self::getGameStateValue(
            POWER_GAME_STATE_KEYS[$powerId]
        );
        return [
            "id" => $powerId,
            "name" => POWERS[$powerId],
            "key" => POWER_KEYS[$powerId],
            "cssClass" =>
                $powerAvailable == 1
                    ? POWER_KEYS[$powerId]
                    : "used-" . POWER_KEYS[$powerId],
            "available" => $powerAvailable,
        ];
    }

    private function randomizeEnemy() {
        self::setGameStateValue(
            GAME_STATE_LABEL_ENEMY,
            rand(ENEMY_BERGS, ENEMY_DARKNESS)
        );
    }

    public function argPlayerTurn() {
        return $this->states[STATE_PLAYER_TURN]->getArgs();
    }

    //////////////////////////////////////////////////////////////////////////////
    //////////// Zombie
    ////////////

    /*
        zombieTurn:
        
        This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
        You can do whatever you want in order to make sure the turn of this player ends appropriately
        (ex: pass).
        
        Important: your zombie code will be called when the player leaves the game. This action is triggered
        from the main site and propagated to the gameserver from a server, not from a browser.
        As a consequence, there is no current player associated to this action. In your zombieTurn function,
        you must _never_ use getCurrentPlayerId() or getCurrentPlayerName(), otherwise it will fail with a "Not logged" error message. 
    */

    function zombieTurn($state, $active_player) {
        $statename = $state["name"];

        if ($state["type"] === "activeplayer") {
            switch ($statename) {
                default:
                    $this->gamestate->nextState("zombiePass");
                    break;
            }

            return;
        }

        if ($state["type"] === "multipleactiveplayer") {
            // Make sure player is in a non blocking status for role turn
            $this->gamestate->setPlayerNonMultiactive($active_player, "");

            return;
        }

        throw new feException(
            "Zombie mode not supported at this game state: " . $statename
        );
    }

    ///////////////////////////////////////////////////////////////////////////////////:
    ////////// DB upgrade
    //////////

    /*
        upgradeTableDb:
        
        You don't have to care about this until your game has been published on BGA.
        Once your game is on BGA, this method is called everytime the system detects a game running with your old
        Database scheme.
        In this case, if you change your Database scheme, you just have to apply the needed changes in order to
        update the game database and allow the game to continue to run with your new version.
    
    */

    function upgradeTableDb($from_version) {
        // $from_version is the current version of this game database, in numerical form.
        // For example, if the game was running with a release of your game named "140430-1345",
        // $from_version is equal to 1404301345

        // Example:
        //        if( $from_version <= 1404301345 )
        //        {
        //            // ! important ! Use DBPREFIX_<table_name> for all tables
        //
        //            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
        //            self::applyDbUpgradeToAllDB( $sql );
        //        }
        //        if( $from_version <= 1405061421 )
        //        {
        //            // ! important ! Use DBPREFIX_<table_name> for all tables
        //
        //            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
        //            self::applyDbUpgradeToAllDB( $sql );
        //        }
        //        // Please add your future database scheme changes here
        //
        //
    }
}
