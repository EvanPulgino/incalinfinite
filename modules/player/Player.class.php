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
 * Object class for a Player that represents a player in the game.
 * Contains:
 * - The player's ID
 * - The player's natural order
 * - The player's name
 * - The player's color
 *
 * @EvanPulgino
 */

 class Player {
    /**
     * @var int $id The database ID of the player
     */
    protected $id;

    /**
     * @var int $naturalOrder The natural order of the player, this is set by the system and does not change
     */
    protected $naturalOrder;

    /**
     * @var string $name The player's name
     */
    protected $name;

    /**
     * @var string $color The player's color as a hex code
     */
    protected $color;

    public function __construct($data) {
        $this->id = $data['player_id'];
        $this->naturalOrder = $data['player_no'];
        $this->name = $data['player_name'];
        $this->color = $data['player_color'];
    }

    /**
     * Get the database ID of the player
     *
     * @return int
     */
    public function getId() {
        return $this->id;
    }

    /**
     * Get the natural order of the player, this is set by the system and does not change
     *
     * @return int
     */
    public function getNaturalOrder() {
        return $this->naturalOrder;
    }

    /**
     * Get the player's name
     *
     * @return string
     */
    public function getName() {
        return $this->name;
    }

    /**
     * Get the player's color as a hex code
     *
     * @return string
     */
    public function getColor() {
        return $this->color;
    }
 }