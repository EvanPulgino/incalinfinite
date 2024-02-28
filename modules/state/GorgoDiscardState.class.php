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
 * Backend functions used by the gorgoDiscard State
 *
 * In this state, the game handles the transition to the next player
 *
 * @EvanPulgino
 */

class GorgoDiscardState {
    private $game;

    public function __construct(IncalInfinite $game) {
        $this->game = $game;
    }

    public function getArgs() {
        $activePlayer = $this->game->getActivePlayer();

        return [
            "otherPlayers" => $this->game->playerController->getOtherPlayersUiData(
                $activePlayer->getId()
            ),
        ];
    }

    public function selectPlayer($playerId) {
        $activePlayer = $this->game->getActivePlayer();

        $playerHand = $this->game->cardController->getPlayerHandNoDamage(
            $playerId
        );
        shuffle($playerHand);

        $cardToDiscard = array_shift($playerHand);

        // Discard the card
        $this->game->cardController->discardCard($cardToDiscard->getId());

        // Notify players
        $this->game->notifyAllPlayers(
            "discardCardFromOtherPlayer",
            clienttranslate('${player_name} discards ${card_name} from the hand of ${player_name2}'),
            [
                "player_name" => $activePlayer->getName(),
                "player_id" => $activePlayer->getId(),
                "player_id2" => $playerId,
                "player_name2" => $this->game->playerController->getPlayer($playerId)->getName(),
                "card_name" => $cardToDiscard->getName(),
                "card" => $cardToDiscard->getUiData(),
            ]
        );

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
    }
}