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
 * Location controller class, handles all location related logic
 *
 * @EvanPulgino
 */

class LocationController extends APP_GameClass {
    /**
     * Setup the locations for the game
     *
     * @param int $enemy - The ID of the enemy used in the game
     */
    public function setupLocations($enemy) {
        // Suicide Alley always goes on position 0 with no Incal chit (aka 0)
        $this->createLocation(LOCATION_SUICIDE_ALLEY, 0, 0);

        // Set position of next location
        $position = 2;

        // Get five random Incal chits
        $incalChits = $this->randomizeIncalChits($enemy);

        // Get five random location tiles
        $locations = $this->randomizeLocationTiles();

        // Create locations on table
        foreach ($locations as $location) {
            $this->createLocation($location, $position, array_pop($incalChits));
            $position += 2;
        }
    }

    /**
     * Create a location record
     *
     * @param int $tileId - Id of the location tile
     * @param int $tilePosition - Position of the tile on the table
     * @param int $incalChit - Value of the Incal chit attached to the location
     */
    private function createLocation($tileId, $tilePosition, $incalChit) {
        $sql = "INSERT INTO location (location_tile_id, location_tile_position, location_incal_chit) VALUES ($tileId, $tilePosition, $incalChit)";
        self::DbQuery($sql);
    }

    /**
     * Randomizes the Incal chits used in the game
     *
     * @param int $enemy - The ID of the enemy used in the game
     */
    private function randomizeIncalChits($enemy) {
        // Base pool of chits
        $incalChitPool = [1, 2, 3, 4, 5, 6, 7];

        // If The Darkness is the enemy add 8 and 9 to the pool
        if ($enemy == ENEMY_DARKNESS) {
            array_push($incalChitPool, 8, 9);
        }

        // Shuffle the pool
        shuffle($incalChitPool);

        // Return the first 5 values
        return array_slice($incalChitPool, 0, 5);
    }

    private function randomizeLocationTiles() {
        // Base pool of location tiles
        $locationTiles = [1, 2, 3, 4, 5, 6, 7, 8];

        // Shuffle the pool
        shuffle($locationTiles);

        // Return the first 5 values
        return array_slice($locationTiles, 0, 5);
    }
}
