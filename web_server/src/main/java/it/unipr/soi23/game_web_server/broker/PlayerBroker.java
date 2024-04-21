package it.unipr.soi23.game_web_server.broker;

import static it.unipr.soi23.game_web_server.utils.Soi23GameWebServerConst.MS_PER_FRAME;
import static it.unipr.soi23.game_web_server.utils.Soi23GameWebServerConst.PLAYER_MAX_Y;
import static it.unipr.soi23.game_web_server.utils.Soi23GameWebServerConst.PLAYER_MIN_Y;
import static it.unipr.soi23.game_web_server.utils.Soi23GameWebServerConst.PLAYER_STEP;

import it.unipr.soi23.game_web_server.model.Player;

public class PlayerBroker {

    private final long nowTimestamp;

    private Player player;

    public PlayerBroker() {
        this.nowTimestamp = System.currentTimeMillis();
    }

    public PlayerBroker player(Player player) {
        this.player = player;
        return this;
    }

    /**
     * Compares the provided token with the originally saved one
     *
     * @param  token Token to compare
     * @return       true if the token is correct, false otherwise
     */
    public boolean checkPlayerToken(String token) {
        /* TODO
        Return true if the token is correct (and not null), false otherwise
         */
    	if(token != null && token.equals(player.getToken())){
    		return true;
    	}
    	
    	return false;
    }

    /**
     * Moves the player applying validation, blocking cheaters. Allows the player to
     * move only for at most his defined step every frame.
     *
     * @param y The new position along the Y axis
     */
    public void moveToY(int y) {
        /* TODO
        Set the new y and lastMovementTimestamp of the player only if:
        - the new value is between PLAYER_MIN_Y and PLAYER_MAX_Y
        - the distance between old and new y values is less or equal to elapsedFrames * PLAYER_STEP
         */
    	if(y >= PLAYER_MIN_Y && y <= PLAYER_MAX_Y) {
    		if(Math.abs(player.getY() - y) <= (((nowTimestamp - player.getLastMovementTimestamp())/MS_PER_FRAME) * PLAYER_STEP)) {
    			player.setY(y);
    			player.setLastMovementTimestamp(nowTimestamp);
    		}
    	}
    }
}
