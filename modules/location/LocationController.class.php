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
     * Get all locations in the game
     *
     * @return Location[] - An array of locations
     */
    public function getAllLocations() {
        $sql = "SELECT * FROM location";
        $locationsData = self::getObjectListFromDB($sql);
        $locationObjects = [];
        foreach ($locationsData as $locationData) {
            $locationObjects[] = new Location($locationData);
        }
        return $locationObjects;
    }

    /**
     * Get UI data for all locations
     *
     * @return array - An array of location UI data
     */
    public function getAllLocationsUiData() {
        $locations = $this->getAllLocations();
        $locationUiData = [];
        foreach ($locations as $location) {
            $locationUiData[] = $location->getUiData();
        }
        return $locationUiData;
    }

    /**
     * Get the location object from the location key
     *
     * @param string $locationKey - The key of the location
     * @return Location | null - The location object
     */
    public function getLocationFromKey($locationKey) {
        $locationId = $this->getLocationIdFromKey($locationKey);
        $sql = "SELECT * FROM location WHERE location_tile_id = $locationId";
        $data = self::getObjectFromDB($sql);
        if (!$data) {
            return null;
        }
        return new Location($data);
    }

    /**
     * Get the location object from the location position
     *
     * @param int $position - The position of the location
     * @return Location | null - The location object
     */
    public function getLocationFromPosition($position) {
        $sql = "SELECT * FROM location WHERE location_tile_position = $position";
        $data = self::getObjectFromDB($sql);
        if (!$data) {
            return null;
        }
        return new Location($data);
    }

    /**
     * Get the position of the location from the location key
     *
     * @param string $locationKey - The key of the location
     * @return int | null - The position of the location
     */
    public function getPositionFromKey($locationKey) {
        $locationId = $this->getLocationIdFromKey($locationKey);
        $sql = "SELECT location_tile_position FROM location WHERE location_tile_id = $locationId";
        $position = self::getUniqueValueFromDB($sql);
        if (!$position) {
            return null;
        }
        return $position;
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
     * Get the location ID from the location key
     *
     * @param string $locationKey - The key of the location
     * @return int - The ID of the location
     */
    private function getLocationIdFromKey($locationKey) {
        for ($id = 1; $id <= 9; $id++) {
            if ($locationKey == LOCATION_KEYS[$id]) {
                return $id;
            }
        }
        return 0;
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

    /**
     * Randomizes the location tiles used in the game
     * 
     * @return array - An array of location tiles
     */
    private function randomizeLocationTiles() {
        // Base pool of location tiles
        $locationTiles = [1, 2, 3, 4, 5, 6, 7, 8];

        // Shuffle the pool
        shuffle($locationTiles);

        // Return the first 5 values
        return array_slice($locationTiles, 0, 5);
    }
}
