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
            GAME_STATE_LABEL_SELECTED_LOCATION => GAME_STATE_LABEL_ID_SELECTED_LOCATION,
        ]);

        $this->cardController = new CardController(
            self::getNew("module.common.deck")
        );
        $this->locationController = new LocationController();
        $this->playerController = new PlayerController();

        $this->states[STATE_EXPLORE] = new ExploreState($this);
        $this->states[STATE_GORGO_DISCARD] = new GorgoDiscardState($this);
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
        self::setGameStateInitialValue(GAME_STATE_LABEL_SELECTED_LOCATION, "");

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
        $result["locationsStatus"] = $this->getLocationsStatusUiData();
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

    public function activateNextPlayer() {
        self::activeNextPlayer();
    }

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
        return self::getGameStateValue(GAME_STATE_LABEL_ENEMY);
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

    public function getLocationsStatus() {
        $locations = $this->locationController->getAllLocations();
        $locationsStatus = [];

        foreach ($locations as $locationKey => $location) {
            $cards = $this->cardController->getCardsAtLocationTile(
                $location->getTilePosition()
            );
            $locationsStatus[] = new LocationStatus(
                $location,
                $cards,
                $this->countPowersAvailable()
            );
        }

        return $locationsStatus;
    }

    public function getLocationsStatusUiData() {
        $locationsStatus = $this->getLocationsStatus();
        $locationsStatusUiData = [];

        foreach ($locationsStatus as $key => $locationsStatus) {
            $locationsStatusUiData[] = $locationsStatus->getUiData();
        }

        return $locationsStatusUiData;
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
            "tooltip" => $this->buildEnemyTooltip($enemyId),
        ];
    }

    private function buildEnemyTooltip($enemyId) {
        $tooltip = '<div class="incal-tooltip">';
        $tooltip .=
            '<div class="tooltip-title title-' . ENEMY_KEYS[$enemyId] . '">';
        $tooltip .= $this->getEnemyName();
        $tooltip .=
            '<div class="enemy-icon ' . ENEMY_KEYS[$enemyId] . '-icon"></div>';
        $tooltip .= "</div>";
        $tooltip .=
            '<div class="silhouette-transparent ' .
            ENEMY_KEYS[$enemyId] .
            '"></div>';
        $tooltip .= '<div class="tooltip-text tooltip-text-location">';
        $tooltip .= $this->buildEnemyTooltipText($enemyId);
        $tooltip .= "</div>";
        $tooltip .= "</div>";
        return $tooltip;
    }

    private function buildEnemyTooltipText($enemyId) {
        switch ($enemyId) {
            case ENEMY_BERGS_DEPLETED:
                return $this->getEnemyTooltipTextBergsDepleted();
            case ENEMY_BERGS:
                return $this->getEnemyTooltipTextBergs();
            case ENEMY_PRESIDENTS_HUNCHBACKS:
                return $this->getEnemyTooltipTextPresidentsHunchbacks();
            case ENEMY_GORGO_THE_DIRTY:
                return $this->getEnemyTooltipTextGorgo();
            case ENEMY_NECROBOT:
                return $this->getEnemyTooltipTextNecrobot();
            case ENEMY_DARKNESS:
                return $this->getEnemyTooltipTextDarkness();
            default:
                return "";
        }
    }

    private function getEnemyTooltipTextBergsDepleted() {
        $text =
            '<span class="text-bold">' .
            clienttranslate("Initial Placement: ") .
            "</span>";
        $text .= clienttranslate(
            "The Bergs are placed in the gap just before Suicide Alley clockwise"
        );
        $text .= "<br><br>";
        $text .=
            '<span class="text-bold">' .
            clienttranslate("Damage Cards: ") .
            "</span>";
        $text .= clienttranslate("2 Damage cards in the initial deck");
        $text .= "<br><br>";
        $text .=
            '<span class="text-bold">' .
            clienttranslate("Activation: ") .
            "</span>";
        $text .= clienttranslate(
            "When the Meta-ship passes the Bergs, they move one gap counterclockwise and a Damage card is moved to the discard pile."
        );
        $text .= "<br><br>";
        $text .=
            '<span class="text-bold">' .
            clienttranslate("Additional Defeat Condition: ") .
            "</span>";
        $text .= clienttranslate(
            "When the Bergs returns to their starting location the players lose."
        );
        return $text;
    }

    private function getEnemyTooltipTextBergs() {
        $text =
            '<span class="text-bold">' .
            clienttranslate("Initial Placement: ") .
            "</span>";
        $text .= clienttranslate(
            "The Bergs are placed in the gap just before Suicide Alley clockwise"
        );
        $text .= "<br><br>";
        $text .=
            '<span class="text-bold">' .
            clienttranslate("Damage Cards: ") .
            "</span>";
        $text .= clienttranslate("4 Damage cards in the initial deck");
        $text .= "<br><br>";
        $text .=
            '<span class="text-bold">' .
            clienttranslate("Activation: ") .
            "</span>";
        $text .= clienttranslate(
            "When the Meta-ship passes the Bergs, they move one gap counterclockwise and a Damage card is moved to the discard pile."
        );
        $text .= "<br><br>";
        $text .=
            '<span class="text-bold">' .
            clienttranslate("Additional Defeat Condition: ") .
            "</span>";
        $text .= clienttranslate(
            "When the Bergs returns to their starting location the players lose."
        );
        return $text;
    }

    private function getEnemyTooltipTextPresidentsHunchbacks() {
        $text =
            '<span class="text-bold">' .
            clienttranslate("Initial Placement: ") .
            "</span>";
        $text .= clienttranslate(
            "The President's Hunchbacks are placed on the the Location tile just before Suicide Alley clockwise"
        );
        $text .= "<br><br>";
        $text .=
            '<span class="text-bold">' .
            clienttranslate("Damage Cards: ") .
            "</span>";
        $text .= clienttranslate("3 Damage cards in the initial deck");
        $text .= "<br><br>";
        $text .=
            '<span class="text-bold">' .
            clienttranslate("Activation: ") .
            "</span>";
        $text .= clienttranslate(
            "When the Meta-ship passes over the President's Hunchbacks, they move one Location counterclockwise anf then a Damage Card is added to the discard pile."
        );
        $text .= "<br><br>";
        $text .=
            '<span class="text-bold">' .
            clienttranslate("Ability: ") .
            "</span>";
        $text .= clienttranslate(
            "It is impossible to travel to the Location occupied by the President's Hunchbacks. It is also impossible to move to the Location the President's Hunchbacks will move to after being passsed."
        );
        $text .= "<br><br>";
        $text .=
            '<span class="text-warning">' .
            clienttranslate("Warning: ") .
            "</span>";
        $text .= clienttranslate(
            "If it is impossible to travel to a location (blocked by the Hunchbacks or closed), the only thing left to do is to try the Ritual."
        );
        return $text;
    }

    private function getEnemyTooltipTextGorgo() {
        $text =
            '<span class="text-bold">' .
            clienttranslate("Initial Placement: ") .
            "</span>";
        $text .= clienttranslate(
            "Gorgo-the-dirty is placed in the gap just before Suicide Alley clockwise"
        );
        $text .= "<br><br>";
        $text .=
            '<span class="text-bold">' .
            clienttranslate("Damage Cards: ") .
            "</span>";
        $text .= clienttranslate("2 Damage cards in the initial deck");
        $text .= "<br><br>";
        $text .=
            '<span class="text-bold">' .
            clienttranslate("Activation: ") .
            "</span>";
        $text .= clienttranslate(
            "When the Meta-ship passes Gorgo-the-dirty, they move one gap counterclockwise. The player randomly picks a non-Damage card from another player's hand and it discards it. Finally, a Damage card is added to the discard pile."
        );
        $text .= "<br><br>";
        $text .=
            '<span class="text-bold">' .
            clienttranslate("Additional Defeat Condition: ") .
            "</span>";
        $text .= clienttranslate(
            "When Gorgo-the-dirty returns to their starting location the players lose."
        );
        return $text;
    }

    private function getEnemyTooltipTextNecrobot() {
        $text =
            '<span class="text-bold">' .
            clienttranslate("Initial Placement: ") .
            "</span>";
        $text .= clienttranslate(
            "The Necrobot is placed in the gap just before Suicide Alley clockwise"
        );
        $text .= "<br><br>";
        $text .=
            '<span class="text-bold">' .
            clienttranslate("Damage Cards: ") .
            "</span>";
        $text .= clienttranslate("1 Damage card in the initial deck");
        $text .= "<br><br>";
        $text .=
            '<span class="text-bold">' .
            clienttranslate("Activation: ") .
            "</span>";
        $text .= clienttranslate(
            "When the Meta-ship passes the Necrobot, they move one gap counterclockwise. The active player takes a Damage card from the reserve and places it directly in their hand."
        );
        $text .= "<br><br>";
        $text .=
            '<span class="text-bold">' .
            clienttranslate("Additional Defeat Condition: ") .
            "</span>";
        $text .= clienttranslate(
            "When the Necrobot returns to their starting location the players lose."
        );
        return $text;
    }

    private function getEnemyTooltipTextDarkness() {
        $text =
            '<span class="text-bold">' .
            clienttranslate("Incal Tokens: ") .
            "</span>";
        $text .= clienttranslate(
            "The Incal Tokens range from 1 to 9 instead of 1 to 7."
        );
        $text .= "<br><br>";
        $text .=
            '<span class="text-bold">' .
            clienttranslate("Initial Placement: ") .
            "</span>";
        $text .= clienttranslate(
            "The Darkness is placed in the gap just before Suicide Alley clockwise"
        );
        $text .= "<br><br>";
        $text .=
            '<span class="text-bold">' .
            clienttranslate("Damage Cards: ") .
            "</span>";
        $text .= clienttranslate("3 Damage cards in the initial deck");
        $text .= "<br><br>";
        $text .=
            '<span class="text-bold">' .
            clienttranslate("Activation: ") .
            "</span>";
        $text .= clienttranslate(
            "When the Meta-ship passes the Darkness, it moves one gap counterclockwise and a Damage card is added to the discard pile."
        );
        $text .= "<br><br>";
        $text .=
            '<span class="text-warning">' .
            clienttranslate("Special Rules:") .
            "</span>";
        $text .= "<br><br>";
        $text .=
            '<span class="text-bold">' .
            clienttranslate("Revelation: ") .
            "</span>";
        $text .= clienttranslate(
            "During a Revelation, the player who looks at the Incal token consults it as normal but then keeps it face-down in front of them. Each player may not possess more than 2 (or 3 in a 2-player game) Incal tokens in front of them. Communication rules still apply as normal."
        );
        $text .= "<br><br>";
        $text .=
            '<span class="text-bold">' .
            clienttranslate("Transfiguration Ritual: ") .
            "</span>";
        $text .= clienttranslate(
            "Attempting the Transgiguration Ritual cannot be taken as an action. The ritual is triggered automatically when all Incal tokens have been taken by the players. Players must reveal their Incal tokens in ascending order. There is no turn order during the ritual and players are not aloud to speak before or during the ritual. Victory and defeat conditions remain the same."
        );
        return $text;
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
            "tooltip" => $this->buildPowerTooltip(
                $powerId,
                POWER_KEYS[$powerId]
            ),
        ];
    }

    private function buildPowerTooltip($powerId, $powerKey) {
        $tooltip = '<div class="incal-tooltip">';
        $tooltip .= '<div class="tooltip-title title-power">';
        $tooltip .= POWERS[$powerId];
        $tooltip .=
            '<div class="tooltip-power-icon power ' . $powerKey . '"></div>';
        $tooltip .= "</div>";
        $tooltip .= '<div class="tooltip-text tooltip-text-location">';
        $tooltip .= $this->getPowerTooltipText($powerId);
        $tooltip .= "</div>";
        $tooltip .= "</div>";
        return $tooltip;
    }

    private function countPowersAvailable() {
        $powerCount = 0;
        foreach (POWER_GAME_STATE_KEYS as $powerKey) {
            if (self::getGameStateValue($powerKey) == 1) {
                $powerCount++;
            }
        }
        return $powerCount;
    }

    private function getPowerTooltipText($powerId) {
        switch ($powerId) {
            case POWER_DESTROY:
                return clienttranslate(
                    "The player designates a player (they may choose themselves). The designated player destroys a Damage card from their hand, removing it from the game."
                );
            case POWER_DISCARD:
                return clienttranslate(
                    "The player chooses a Location, moves 2 cards from it to the discard pile, and removes the rest from the game."
                );
            case POWER_MOVE:
                return clienttranslate(
                    "The player must move 1 card from a Location to another non-closed Location. If the Revelation condition is met, the player performs a Revelation."
                );
            case POWER_TALK:
                $text = clienttranslate(
                    "The player designates a location of their choice. The player(s) who have performed Revelations at the location must announce the number of the Incal chit at the location."
                );
                $text .= "<br><br>";
                $text .=
                    '<span class="text-warning">' .
                    clienttranslate("Note:") .
                    "</span>";
                $text .= clienttranslate(" This is done from memory, ");
                $text .=
                    '<span class="text-warning">' .
                    clienttranslate(
                        "It is forbidden to consult the Incal chit."
                    ) .
                    "</span>";
                return $text;
        }
    }

    private function randomizeEnemy() {
        self::setGameStateValue(
            GAME_STATE_LABEL_ENEMY,
            rand(ENEMY_BERGS, ENEMY_DARKNESS)
        );
    }

    public function argExplore() {
        return $this->states[STATE_EXPLORE]->getArgs();
    }

    public function argGorgoDiscard() {
        return $this->states[STATE_GORGO_DISCARD]->getArgs();
    }

    public function argPassTurn() {
        return $this->states[STATE_PASS_TURN]->getArgs();
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
