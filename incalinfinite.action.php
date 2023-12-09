<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * IncalInfinite implementation : © Evan Pulgino <evan.pulgino@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 * 
 * incalinfinite.action.php
 *
 * IncalInfinite main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *       
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/incalinfinite/incalinfinite/myAction.html", ...)
 *
 */
  
  
  class action_incalinfinite extends APP_GameAction
  { 
    // Constructor: please do not modify
   	public function __default()
  	{
  	    if( self::isArg( 'notifwindow') )
  	    {
            $this->view = "common_notifwindow";
  	        $this->viewArgs['table'] = self::getArg( "table", AT_posint, true );
  	    }
  	    else
  	    {
            $this->view = "incalinfinite_incalinfinite";
            self::trace( "Complete reinitialization of board game" );
      }
  	} 
  	
  	public function pass() {
  	    self::setAjaxMode();
  	    $this->game->states[STATE_PLAYER_TURN]->pass();
  	    self::ajaxResponse();
  	}

  }
  

