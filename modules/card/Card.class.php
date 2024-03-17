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
 * - The card's HTML Tooltip
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

    /**
     * @var string $name The HTML formatted name of the card
     */
    protected $name;

    /**
     * @var string $tooltip The HTML tooltip of the card
     */
    protected $tooltip;

    public function __construct($data) {
        $this->id = $data["id"];
        $this->type = $data["type"];
        $this->value = $data["type_arg"];
        $this->location = $data["location"];
        $this->locationArg = $data["location_arg"];
        $this->name = $this->buildName();
        $this->tooltip = $this->buildTooltip();
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

    public function getName() {
        return $this->name;
    }

    /**
     * Get the HTML tooltip of the card
     *
     * @return string
     */
    public function getTooltip() {
        return $this->tooltip;
    }

    public function getUiData() {
        return [
            "id" => $this->id,
            "type" => $this->type,
            "value" => intval($this->value),
            "location" => $this->location,
            "locationArg" => $this->locationArg,
            "name" => $this->getName(),
            "tooltip" => $this->getTooltip(),
        ];
    }

    private function buildName() {
        switch ($this->type) {
            case CARD_DAMAGE:
                return clienttranslate("a Damage card");
            case CARD_JOHN_DIFOOL:
                return CARDS[$this->type];
            default:
                return clienttranslate("a value-") .
                    $this->value .
                    " " .
                    CARDS[$this->type];
        }
    }

    private function buildTooltip() {
        return '<div id="card-tooltip-' .
            $this->id .
            '" class="incal-tooltip">' .
            $this->buildTooltipTitle() .
            $this->buildTooltipBody() .
            "</div>";
    }

    private function buildTooltipTitle() {
        if ($this->type == CARD_DAMAGE) {
            return $this->buildTooltipTitleDamage();
        } elseif ($this->type == CARD_JOHN_DIFOOL) {
            return $this->buildTooltipTitleJohnDifool();
        }

        return '<div class="tooltip-title title-' .
            $this->type .
            '">' .
            '<span class="tooltip-title-name">' .
            CARDS[$this->type] .
            "</span>" .
            '<div class="hexagon"><span class="tooltip-card-value text-' .
            $this->type .
            '">' .
            $this->value .
            "</span></div>" .
            "</div>";
    }

    private function buildTooltipBody() {
        $cardClass = $this->type;
        if ($this->value > 0) {
            $cardClass .= "-" . $this->value;
        }

        return '<div class="tooltip-body"><div id="tooltip-card-' .
            $this->id .
            '" class="card-full ' .
            $cardClass .
            '"></div>' .
            $this->buildTooltipText() .
            "</div>";
    }

    private function buildTooltipTitleDamage() {
        return '<div class="tooltip-title title-' .
            $this->type .
            '">' .
            '<span class="tooltip-title-name">' .
            CARDS[$this->type] .
            "</span>" .
            "</div>";
    }

    private function buildTooltipTitleJohnDifool() {
        return '<div class="tooltip-title title-' .
            $this->type .
            '">' .
            '<span class="tooltip-title-name text-johndifool">' .
            CARDS[$this->type] .
            "</span>" .
            '<div class="hexagon"><span class="tooltip-card-value text-johndifool">?</span></div>' .
            "</div>";
    }

    private function buildTooltipText() {
        return '<div class="tooltip-text">' .
            $this->getTooltipTextHeader() .
            "<br><br>" .
            $this->getTooltipTextBody() .
            "</div>";
    }

    private function getTooltipTextHeader() {
        switch ($this->type) {
            case CARD_DAMAGE:
                return '<span class="text-bold">' .
                    clienttranslate("DAMAGE:") .
                    "</span>";
            case CARD_JOHN_DIFOOL:
                return '<span class="text-bold">' .
                    clienttranslate("JOHN DIFOOL:") .
                    "</span>";
            default:
                return '<span class="text-bold">' .
                    clienttranslate("IDENTICAL CARDS:") .
                    "</span>";
        }
    }

    private function getTooltipTextBody() {
        switch ($this->type) {
            case CARD_DAMAGE:
                return $this->getTooltipTextDamage();
            case CARD_JOHN_DIFOOL:
                return $this->getTooltipTextJohnDifool();
            default:
                return $this->getTooltipTextRegular();
        }
    }

    private function getTooltipTextDamage() {
        $text = clienttranslate(
            "Damage cards are unplayable. The only way to get rid of them is to activate the "
        );
        $text .=
            '<span class="text-bold">' . clienttranslate("DESTROY") . "</span>";
        $text .= clienttranslate(" power of Suicide Alley.");
        $text .= "<br><br>";
        $text .= clienttranslate(
            "The game is instantly lost if a player has 3 Damage cards in their hand."
        );

        return $text;
    }

    private function getTooltipTextJohnDifool() {
        $text = clienttranslate("John Difool is considered a wild card.");
        $text .= "<br><br>";
        $text .= clienttranslate("When you ");
        $text .=
            '<span class="text-bold">' . clienttranslate("explore") . "</span>";
        $text .= clienttranslate(", you can either ");
        $text .=
            '<span class="text-bold">' .
            clienttranslate("play it alone") .
            "</span>";
        $text .= clienttranslate(
            " and in this case, name which Character it becomes (Animah, Tanatah, the Meta-Baron, Deepo, Kill, or Solune) as well as its value (1, 2, 3, 4, or 5); or "
        );
        $text .=
            '<span class="text-bold">' .
            clienttranslate("associate") .
            "</span>";
        $text .= clienttranslate(
            " it with other identical cards (of which it becomes the Character with the value of your choice)."
        );
        $text .= "<br><br>";
        $text .= clienttranslate(
            "Played alone on Suicide Alley, it remains John Difool and allows to activate a grayed-out Power."
        );
        $text .= "<br><br>";
        $text .=
            '<span class="text-bold">' .
            clienttranslate(
                "But beware, once your turn ends, John Difool is ALWAYS DIRECTLY sent to the Discard pile."
            ) .
            "</span>";
        return $text;
    }

    private function getTooltipTextRegular() {
        return clienttranslate(
            "During the Explore action, it is possible to play several cards as long as they are identical, i.e. with the same chracter (the value of the card not being taken into account)."
        );
    }
}
