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
 * Player controller class, handles all player related logic
 *
 * @EvanPulgino
 */

class PlayerController extends APP_GameClass {
    /**
     * Setup the players for the game
     *
     * @param array $players An array of players
     * @param array $gameInfo An array of game info
     * @return void
     */
    public function setupPlayers($players, $gameInfo) {
        $defaultColors = $gameInfo["player_colors"];
        $sql =
            "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES ";
        $values = [];
        foreach ($players as $playerId => $player) {
            $color = array_shift($defaultColors);
            $values[] =
                "('" .
                $playerId .
                "','$color','" .
                $player["player_canal"] .
                "','" .
                addslashes($player["player_name"]) .
                "','" .
                addslashes($player["player_avatar"]) .
                "')";
        }

        $sql .= implode(",", $values);
        self::DbQuery($sql);
    }

    /**
     * Get all players in the game
     *
     * @return IncalInfinitePlayer[] - An array of players
     */
    public function getAllPlayers() {
        $sql = "SELECT * FROM player";
        $playersData = self::getObjectListFromDb($sql);
        $playerObjects = [];
        foreach ($playersData as $playerData) {
            $playerObjects[] = new IncalInfinitePlayer($playerData);
        }

        return $playerObjects;
    }

    /**
     * Get all players in the game formatted for the UI
     *
     * @return array - An array of players formatted for the UI
     */
    public function getAllPlayersUiData() {
        $players = $this->getAllPlayers();
        $playersUiData = [];
        foreach ($players as $player) {
            $playersUiData[] = $player->getUiData();
        }

        return $playersUiData;
    }
}
