{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- IncalInfinite implementation : © Evan Pulgino <evan.pulgino@gmail.com>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-------

    incalinfinite_incalinfinite.tpl

    This is the HTML template of your game.

    Everything you are writing in this file will be displayed in the HTML page of your game user interface,
    in the "main game zone" of the screen.

    You can use in this template:
    _ variables, with the format {MY_VARIABLE_ELEMENT}.
    _ HTML block, with the BEGIN/END format

    See your "view" PHP file to check how to set variables and control blocks

    Please REMOVE this comment before publishing your game on BGA
-->

<div id="incal-game">

    <div id="incal-table">
        <div id="incal-table-grid">
            <div id="incal-space-4" class="grid-item incal-location-space"></div>
            <div id="incal-space-5" class="grid-item incal-enemy-space"></div>
            <div id="incal-space-6" class="grid-item incal-location-space"></div>
            <div id="incal-space-7" class="grid-item incal-enemy-space"></div>
            <div id="incal-space-8" class="grid-item incal-location-space"></div>
            <div id="incal-space-3" class=" grid-item incal-enemy-space"></div>
            <div id="incal-space-empty-1"></div>
            <div id="incal-space-decks" class="grid-item">
                <div id="incal-deck-container">
                    <div id="incal-deck"></div>
                    <div id="incal-deck-count"></div>
                </div>
                <div id="incal-discard-container">
                    <div id="incal-discard"></div>
                    <div id="incal-discard-count"></div>
                </div>
            </div>
            <div id="incal-space-empty-2"></div>
            <div id="incal-space-9" class="grid-item incal-enemy-space"></div>
            <div id="incal-space-2" class="grid-item incal-location-space"></div>
            <div id="incal-space-1" class="grid-item incal-enemy-space"></div>
            <div id="incal-space-0" class="grid-item incal-location-space"></div>
            <div id="incal-space-11" class="grid-item incal-enemy-space"></div>
            <div id="incal-space-10" class="grid-item incal-location-space"></div>
        </div>
    </div>

    <div id="player-hand-area">
        <div id="floating-hand-wrapper">
            <div id="player-hand"></div>
        </div>
    </div>

</div>

{OVERALL_GAME_FOOTER}