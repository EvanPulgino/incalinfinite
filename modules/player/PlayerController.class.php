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
     * Gets an IncalInfinitePlayer object for a specific player ID
     *
     * @param int $playerId The ID of the player
     * @return IncalInfinitePlayer - A player object
     */
    public function getPlayer($playerId) {
        return $this->getPlayers([$playerId])[0];
    }

    public function getOtherPlayers($playerId) {
        $players = $this->getPlayers();
        $otherPlayers = [];
        foreach ($players as $player) {
            if ($player->getId() != $playerId) {
                $otherPlayers[] = $player;
            }
        }
        return $otherPlayers;
    }

    public function getOtherPlayersUiData($playerId) {
        $players = $this->getOtherPlayers($playerId);
        $playersUiData = [];
        foreach ($players as $player) {
            $playersUiData[] = $player->getUiData();
        }

        return $playersUiData;
    }

    /**
     * Gets an array of IncalInfinitePlayer objects for all/specifed player IDs
     *
     * @param array $playerIds An array of player IDs
     * @return IncalInfinitePlayer[] - An array of player objects
     */
    public function getPlayers($playerIds = null) {
        $sql = "SELECT * FROM player";
        if ($playerIds) {
            $sql .= " WHERE player_id IN (" . implode(",", $playerIds) . ")";
        }
        $playersData = self::getObjectListFromDb($sql);
        $playerObjects = [];
        foreach ($playersData as $playerData) {
            $playerObjects[] = new IncalInfinitePlayer($playerData);
        }

        return $playerObjects;
    }

    /**
     * Gets an array of player data formatted for the UI for all/specifed player IDs
     *
     * @return array - An array of players formatted for the UI
     */
    public function getPlayersUiData($playerIds = null) {
        $players = $this->getPlayers($playerIds);
        $playersUiData = [];
        foreach ($players as $player) {
            $playersUiData[] = $player->getUiData();
        }

        return $playersUiData;
    }
}
