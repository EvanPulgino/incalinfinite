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
 * Backend functions used by the passTurn State
 *
 * In this state, the game handles the effects of a player passing the turn
 *
 * @EvanPulgino
 */

class PassTurnState {
    private $game;

    public function __construct(IncalInfinite $game) {
        $this->game = $game;
    }

    /**
     * Get the arguments for the passTurn state
     *
     * @return array
     */
    public function getArgs() {
        $activePlayer = $this->game->getActivePlayer();

        return [
            "hand" => $this->game->cardController->getPlayerHandUiData(
                $activePlayer->getId()
            ),
        ];
    }

    /**
     * Discard a card from the active player's hand
     *
     * @param int $cardId - The ID of the card to discard
     */
    public function discardCard($cardId) {
        // Get player and card objects
        $activePlayer = $this->game->getActivePlayer();
        $discardedCard = $this->game->cardController->getCard($cardId);

        // Discard the card
        $this->game->cardController->discardCard($cardId);

        // Notify players
        $this->game->notifyAllPlayers(
            "discardCard",
            clienttranslate('${player_name} discards ${card_name}'),
            [
                "player_name" => $activePlayer->getName(),
                "player_id" => $activePlayer->getId(),
                "card_name" => $discardedCard->getName(),
                "card" => $discardedCard->getUiData(),
            ]
        );

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

        // Add damge card to the discard pile
        $damageCard = $this->game->cardController->moveDamageToDiscard();

        // Notify players
        $this->game->notifyAllPlayers(
            "addDamageToDiscard",
            clienttranslate("A Damage card is added to the discard pile"),
            [
                "card" => $damageCard->getUiData(),
                "player_id" => $activePlayer->getId(),
            ]
        );

        $this->game->gamestate->nextState(TRANSITION_END_TURN);
    }
}
