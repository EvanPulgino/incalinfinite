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
 * Object class for a Card that represents a card in the game.
 * Contains:
 * - The card's ID
 * - The card's type
 * - The card's value (aka type_arg)
 * - The card's location
 * - The card's location arg
 *
 * @EvanPulgino
 */

class Card {
    /**
     * @var int $id The database ID of the card
     */
    protected $id;

    /**
     * @var string $type The type of the card
     * @see constants.inc.php for a list of card types
     */
    protected $type;

    /**
     * @var int $value The value of the card
     * If regular character range of 1-5, else 0
     */
    protected $value;

    /**
     * @var string $location The location of the card
     * @see constants.inc.php for a list of card locations
     */
    protected $location;

    /**
     * @var int $locationArg The location arg of the card
     */
    protected $locationArg;

    public function __construct($data) {
        $this->id = $data["card_id"];
        $this->type = $data["card_type"];
        $this->value = $data["card_type_arg"];
        $this->location = $data["card_location"];
        $this->locationArg = $data["card_location_arg"];
    }

    /**
     * Get the database ID of the card
     *
     * @return int
     */
    public function getId() {
        return $this->id;
    }

    /**
     * Get the type of the card
     *
     * @return string
     */
    public function getType() {
        return $this->type;
    }

    /**
     * Get the value of the card
     *
     * @return int
     */
    public function getValue() {
        return $this->value;
    }

    /**
     * Get the location of the card
     *
     * @return string
     */
    public function getLocation() {
        return $this->location;
    }

    /**
     * Get the location arg of the card
     *
     * @return int
     */
    public function getLocationArg() {
        return $this->locationArg;
    }
}
