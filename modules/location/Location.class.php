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
 * Object class for a Location that represents a location tile in the game.
 * Contains:
 * - The location's ID
 * - The location tile's ID
 * - The position of the location on the table
 * - The value of the Incal chit on the location
 *
 * @EvanPulgino
 */

class Location {
    /**
     * @var int $id The database ID of the location
     */
    protected $id;

    /**
     * @var int $tileId The database ID of the location tile
     */
    protected $tileId;

    /**
     * @var int $tilePosition The position of the location tile on the table
     */
    protected $tilePosition;

    /**
     * @var int $incalChit The value of the Incal chit on the location
     */
    protected $incalChit;

    public function __construct($data) {
        $this->id = $data["location_id"];
        $this->tileId = $data["location_tile_id"];
        $this->tilePosition = $data["location_tile_position"];
        $this->incalChit = $data["location_incal_chit"];
    }

    /**
     * Get the database ID of the location
     *
     * @return int
     */
    public function getId() {
        return $this->id;
    }

    /**
     * Get the name of the location
     *
     * @return string
     */
    public function getName() {
        return LOCATIONS[$this->tileId];
    }

    /**
     * Get the database ID of the location tile
     *
     * @return int
     */
    public function getTileId() {
        return $this->tileId;
    }

    /**
     * Get the position of the location on the table
     *
     * @return int
     */
    public function getTilePosition() {
        return $this->tilePosition;
    }

    /**
     * Get the value of the Incal chit on the location
     *
     * @return int
     */
    public function getIncalChit() {
        return $this->incalChit;
    }

    /**
     * Get the location's data formatted for the UI
     *
     * @return array - The location's data formatted for the UI
     */
    public function getUiData() {
        return [
            "id" => $this->id,
            "name" => $this->getName(),
            "tileId" => $this->tileId,
            "tilePosition" => $this->tilePosition,
            "incalChit" => $this->incalChit,
        ];
    }
}
