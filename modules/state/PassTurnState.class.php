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

    public function getArgs() {
        return [];
    }

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
                "card_name" => $discardedCard->getName(),
                "card_id" => $cardId,
            ]
        );

        // Draw cards until the player has 4 cards
        $cardsToDraw =
            4 -
            $this->game->cardController->getPlayerHandCount(
                $activePlayer->getId()
            );

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
                "card_id" => $damageCard->getId(),
            ]
        );

        $this->game->gamestate->nextState(TRANSITION_END_TURN);
    }
}
