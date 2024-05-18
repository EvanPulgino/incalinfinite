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
 * Backend functions used by the explore State
 *
 * In this state, the game handles exploring a location
 *
 * @EvanPulgino
 */

class ExploreState {
    private $game;

    public function __construct(IncalInfinite $game) {
        $this->game = $game;
    }

    public function getArgs() {
        // Get active player
        $activePlayer = $this->game->getActivePlayer();

        // Get current ship location
        $currentLocation = $this->game->getGameStateValue(
            GAME_STATE_LABEL_METASHIP_LOCATION
        );

        // Get location object
        $location = $this->game->locationController->getLocationFromPosition(
            $currentLocation
        );

        // Get location status
        $locationStatus = $this->game->getLocationStatus($location->getKey());

        return [
            "crystalForestCurrentValue" => $this->game->getGameStateValue(
                GAME_STATE_LABEL_CRYSTAL_FOREST_CURRENT_VALUE
            ),
            "locationMessage" => $this->getLocationMessage($location),
            "locationStatus" => $locationStatus->getUiData(),
            "playerHand" => $this->game->cardController->getPlayerHandUiData(
                $activePlayer->getId()
            ),
        ];
    }

    public function exploreLocation($cardIds, $tilePosition) {
        // Get active player
        $activePlayer = $this->game->getActivePlayer();

        // Get location object
        $location = $this->game->locationController->getLocationFromPosition(
            $tilePosition
        );

        // Move cards to location tile
        $this->game->cardController->moveCards(
            $cardIds,
            CARD_LOCATION_LOCATION_TILE,
            $tilePosition
        );

        // Get UI data for cards
        $cardsUIData = [];
        foreach ($cardIds as $cardId) {
            $card = $this->game->cardController->getCard($cardId);
            $cardsUIData[] = $card->getUiData();
        }

        // Notify players
        $this->game->notifyAllPlayers(
            "exploreLocation",
            clienttranslate(
                '${player_name} plays ${cardCount} ${cardString} at ${tileName}'
            ),
            [
                "player_id" => $activePlayer->getId(),
                "player_name" => $activePlayer->getName(),
                "cardCount" => count($cardIds),
                "cardString" => count($cardIds) > 1 ? "cards" : "card",
                "tileName" => $location->getName(),
                "cards" => $cardsUIData,
                "location" => $location->getUiData(),
            ]
        );

        $this->game->notifyPlayer(
            $activePlayer->getId(),
            "exploreLocationPrivate",
            clienttranslate(
                '${player_name} plays ${cardCount} ${cardString} at ${tileName}'
            ),
            [
                "player_id" => $activePlayer->getId(),
                "player_name" => $activePlayer->getName(),
                "cardCount" => count($cardIds),
                "cardString" => count($cardIds) > 1 ? "cards" : "card",
                "tileName" => $location->getName(),
                "cards" => $cardsUIData,
                "location" => $location->getUiData(),
            ]
        );

        // TODO: Check for Revelation Effect

        // Refill hand
        // Determine how many cards to draw - hand size is 4
        $cardsToDraw =
            4 -
            $this->game->cardController->getPlayerHandCount(
                $activePlayer->getId()
            );

        // Draw cards
        while ($cardsToDraw > 0) {
            $this->game->cardController->drawCard($activePlayer, $this->game);
            $cardsToDraw--;
        }

        // End turn for now
        $this->game->gamestate->nextState(TRANSITION_END_TURN);
    }

    private function getLocationMessage(Location $location) {
        if ($location->getKey() === LOCATION_KEYS[LOCATION_PSYCHORATS_DUMP]) {
            return clienttranslate("must play exactly 1 character card at") .
                " " .
                $location->getName();
        }

        return clienttranslate(
            "must play 1 or more cards of a single character type at"
        ) .
            " " .
            $location->getName();
    }
}
