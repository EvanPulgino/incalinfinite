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

    /**
     * @var string $tooltip The HTML tooltip for the location
     */
    protected $tooltip;

    public function __construct($data) {
        $this->id = $data["location_id"];
        $this->tileId = $data["location_tile_id"];
        $this->tilePosition = $data["location_tile_position"];
        $this->incalChit = $data["location_incal_chit"];
        $this->tooltip = $this->buildTooltip();
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
     * Get the location's key - a unique text identifier for the location
     *
     * @return string
     */
    public function getKey() {
        return LOCATION_KEYS[$this->tileId];
    }

    /**
     * Get the HTML tooltip for the location
     *
     * @return string
     */
    public function getTooltip() {
        return $this->tooltip;
    }

    /**
     * Get the location's data formatted for the UI
     *
     * @return array - The location's data formatted for the UI
     */
    public function getUiData() {
        return [
            "id" => intval($this->id),
            "name" => $this->getName(),
            "tileId" => intval($this->tileId),
            "tilePosition" => intval($this->tilePosition),
            "incalChit" => intval($this->incalChit),
            "key" => $this->getKey(),
            "tooltip" => $this->getTooltip(),
        ];
    }

    /**
     * Build the HTML tooltip for the location
     *
     * @return string - The HTML tooltip for the location
     */
    private function buildTooltip() {
        return "<div class='incal-tooltip'>
            <div class='tooltip-title title-location'>{$this->getName()}<div class='location-hexagon'></div></div>
            <div class='locationtile locationtile-tooltip {$this->getKey()}'></div>
            <div class='tooltip-text tooltip-text-location'>{$this->getTooltipText()}</div>
        </div>";
    }

    /**
     * Get the HTML tooltip text for the location
     *
     * @return string - The HTML tooltip text for the location
     */
    private function getTooltipText() {
        switch ($this->getKey()) {
            case "acidlake":
                return $this->getTooltipTextAcidlake();
            case "aquaend":
                return $this->getTooltipTextAquaend();
            case "centralcalculator":
                return $this->getTooltipTextCentralCalculator();
            case "crystalforest":
                return $this->getTooltipTextCrystalForest();
            case "ourgargan":
                return $this->getTooltipTextOurgargan();
            case "psychoratsdump":
                return $this->getTooltipTextPsychoratsDump();
            case "suicidealley":
                return $this->getTooltipTextSuicideAlley();
            case "technocity":
                return $this->getTooltipTextTechnoCity();
            case "undergroundriver":
                return $this->getTooltipTextUndergroundRiver();
            default:
                return "";
        }
    }

    /**
     * Get the HTML tooltip text for the Acid Lake location
     *
     * @return string - The HTML tooltip text for the Acid Lake location
     */
    private function getTooltipTextAcidlake() {
        $text =
            '<span class="text-bold">' .
            clienttranslate("Revelation condition:") .
            "</span>";

        $text .= clienttranslate(
            " a Revelation occurs when 2 three-card sets of identical characaters are found here. The two three-card sets must be different characters."
        );
        return $text;
    }

    /**
     * Get the HTML tooltip text for the Aqua End location
     *
     * @return string - The HTML tooltip text for the Aqua End location
     */
    private function getTooltipTextAquaend() {
        $text =
            '<span class="text-bold">' .
            clienttranslate("Revelation condition:") .
            "</span>";

        $text .= clienttranslate(
            " a Revelation occurs when 2 pairs of identical chacracters are found here. The 2 pairs must be different characters."
        );
        return $text;
    }

    /**
     * Get the HTML tooltip text for the Central Calculator location
     *
     * @return string - The HTML tooltip text for the Central Calculator location
     */
    private function getTooltipTextCentralCalculator() {
        $text =
            '<span class="text-bold">' .
            clienttranslate("Revelation condition:") .
            "</span>";

        $text .= clienttranslate(
            " a Revelation occurs when 4 identical characters are found here."
        );
        return $text;
    }

    /**
     * Get the HTML tooltip text for the Crystal Forest location
     *
     * @return string - The HTML tooltip text for the Crystal Forest location
     */
    private function getTooltipTextCrystalForest() {
        $text = clienttranslate(
            "This location requires that the cards are placed in a certain order. Only the value of the card is taken into account here, not the character. Starting with the card placed at the location at the start of the game, the following cards must be placed in ascending order one after the other. If the last card placed is a card of value 5, the next card must be a card of value 1."
        );
        $text .= "<br><br>";
        $text .=
            '<span class="text-bold">' .
            clienttranslate("Revelation condition:") .
            "</span>";

        $text .= clienttranslate(
            " a Revelation occurs when 5 cards of different values are here."
        );
        return $text;
    }

    /**
     * Get the HTML tooltip text for the Ourgar-gan location
     *
     * @return string - The HTML tooltip text for the Ourgar-gan location
     */
    private function getTooltipTextOurgargan() {
        $text =
            '<span class="text-bold">' .
            clienttranslate("Revelation condition:") .
            "</span>";

        $text .= clienttranslate(
            " a Revelation occurs when the sum of the values of all cards at the location is 11 or more. The location is then considered closed. As long as there has been no Revelation on Ourgar-gan, the number of cards that can be placed at the location is not limited."
        );
        return $text;
    }

    /**
     * Get the HTML tooltip text for the Psychorats Dump location
     *
     * @return string - The HTML tooltip text for the Psychorats Dump location
     */
    private function getTooltipTextPsychoratsDump() {
        $text =
            '<span class="text-bold">' .
            clienttranslate("Revelation condition:") .
            "</span>";

        $text .= clienttranslate(
            " a Revelation occurs when 5 different characters are here."
        );
        return $text;
    }

    /**
     * Get the HTML tooltip text for the Suicide Alley location
     *
     * @return string - The HTML tooltip text for Suicide Alley location
     */
    private function getTooltipTextSuicideAlley() {
        $text = clienttranslate(
            "Unlike the other locations, Suicide Alley does not allow Revelation but works as follows: that player who has moved the Metacraft to this location must activate one or more Powers: "
        );
        $text .=
            '<span class="text-bold">' .
            clienttranslate(
                "1 discarded character activates a Power once, 2 identical characters active the same power twice or two different powers, etc..."
            ) .
            "</span>";
        $text .= "<br><br>";
        $text .=
            "Once a Power has been used it is flipped over to its inactive side. A Power on the inactive side can no longer be activated (except by John Difool).";
        return $text;
    }

    /**
     * Get the HTML tooltip text for the Techno City location
     *
     * @return string - The HTML tooltip text for Techno City location
     */
    private function getTooltipTextTechnoCity() {
        $text =
            '<span class="text-bold">' .
            clienttranslate("Revelation condition:") .
            "</span>";

        $text .= clienttranslate(
            " a Revelation occurs when 1 set of 3 identical chracters and a pair of identical characters are found here. The three-card set and the pair must be different characters."
        );
        return $text;
    }

    /**
     * Get the HTML tooltip text for the Undergroun River location
     *
     * @return string - The HTML tooltip text for Underground River location
     */
    private function getTooltipTextUndergroundRiver() {
        $text = clienttranslate(
            "It is only possible to explore this location by placing a single character card from your hand. Once the card has been placed, the player reveals the top card of the deck and places it at the location. Then add up the values of all the cards at the location."
        );
        $text .= "<br><br>";
        $text .=
            '<span class="text-bold">' .
            clienttranslate("Revelation condition:") .
            "</span>";

        $text .= clienttranslate(
            " there is a Revelation if the sum equals 8, 9, or 10. The cards then remain under the location and it is considered closed. If the sum does not equal 8, 9, or 10, the exploration fails. The card played from the player's hand and the card added from the deck are discarded. If the card drawn is a Damage card, the exploration also fails."
        );
        $text .= "<br><br>";
        $text .= clienttranslate("The ");
        $text .=
            '<span class="text-bold">' . clienttranslate("MOVE") . "</span>";
        $text .= clienttranslate(
            " power cannot be used from or to this location."
        );
        return $text;
    }
}
