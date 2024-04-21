package it.unipr.soi23.game_web_server.service.impl;

import it.unipr.soi23.game_web_server.broker.GameDataBroker;
import it.unipr.soi23.game_web_server.broker.PlayerBroker;
import it.unipr.soi23.game_web_server.model.*;
import it.unipr.soi23.game_web_server.repo.PersistenceRepo;
import it.unipr.soi23.game_web_server.service.Soi23GameWebServerService;
import org.springframework.messaging.core.MessageSendingOperations;
import org.springframework.stereotype.Service;


import java.util.UUID;


import static it.unipr.soi23.game_web_server.utils.Soi23GameWebServerConst.*;

@Service
public class Soi23GameWebServerServiceImpl implements Soi23GameWebServerService {

    private final MessageSendingOperations<String> messageSendingOperations;
    private final PersistenceRepo persistenceRepo;

    public Soi23GameWebServerServiceImpl( //
                                          MessageSendingOperations<String> messageSendingOperations, //
                                          PersistenceRepo persistenceRepo //
    ) {
        this.messageSendingOperations = messageSendingOperations;
        this.persistenceRepo = persistenceRepo;
    }

    @Override
    public WatchGameResponse watchGame(String gameId) {
        final GameData gameData = persistenceRepo.findGameData().findById(gameId).orElse(null);
        if (gameData == null) {
            return new WatchGameResponse().message(new Message() //
                    .type(Message.Type.ERROR) //
                    .code(Message.Code.GAME_NOT_FOUND));
        }
        final Iterable<Player> players = persistenceRepo.findPlayer().findAllByGameId(gameId);

        final WatchGameResponse response = new WatchGameResponse() //
                .teamsScore(gameData.getTeamsScore()) //
                .ballAnimation(gameData.getBallAnimation());
        players.forEach(response::addPlayer);

        return response;
    }

    @Override
    public RegisterResponse register(String gameId, String playerId, String token, String playerTeam) {
        final GameData gameDataRead = persistenceRepo.findGameData().findById(gameId).orElse(null);
        final boolean gameDataFound = gameDataRead != null;
        final GameData gameData = gameDataFound ? gameDataRead : new GameData(gameId);

        Player player;
        
        //get player from local storage if the specific token ( with key: gameId - playerId) already exists, else create a new player
        if(!token.equals("null")){
        	 player = retrievePlayer(gameId,retrieveFullPlayerId(gameId, playerId),token);
        }
        else{
        	 player = createPlayer(gameId, playerId, playerTeam);
             if (player == null) {
                 return new RegisterResponse().message(new Message() //
                         .type(Message.Type.ERROR) //
                         .code(Message.Code.PLAYER_ID_ALREADY_USED));
             }      
        }

        if (gameData.isPlaying()) {
            player.setReadyToStart(true);
        }
        //save the new player
        persistenceRepo.insertPlayer().player(player).apply();
        
    	// notify to all players that there is a new player in the game with message code NEW_PLAYER
    	final Iterable<Player> players = persistenceRepo.findPlayer().findAllByGameId(gameId);
    	for (Player p : players) {
    		sendMessage(gameId, p.getToken(), Message.Type.INFO, Message.Code.NEW_PLAYER);
    	}
        
        //save game data in persistenceRepo
        if (!gameDataFound) {
            persistenceRepo.insertGameData().gameData(gameData).apply();
        }

        messageSendingOperations.convertAndSend( //
                TOPIC_GAME_PREFIX + gameId + TOPIC_GAME_PLAYERS_SUFFIX, //
                new PlayerDTO().fromPlayer(player));
        
        
        final RegisterResponse response = new RegisterResponse() //
                .teamsScore(gameData.getTeamsScore()) //
                .ballAnimation(gameData.getBallAnimation()) //
                .token(player.getToken());
        players.forEach(response::addPlayer);
        
        return response;
    }

    @Override
    public GameDataDTO startGame(String gameId, StartGameRequest request) {
        final String playerId = retrieveFullPlayerId(gameId, request.getPlayerId());
        /* TODO
        Update the readyToStart property of the player and send the new Player
        to the front-end.
        Then, start the game if it can, or reset its ballAnimation to BALL_LOBBY_ANIMATION.
        Finally return the new GameData.
        NOTE: Keep in mind to persist the updates in the repository
         */
        GameData gameData = retrieveGameData(gameId , request.getToken());
    	Player player = retrievePlayer(gameId , playerId , request.getToken());
    	
    	player.setReadyToStart(true);
    	
    	persistenceRepo.updatePlayer(playerId).player(player).apply();
    	
        messageSendingOperations.convertAndSend( //
                TOPIC_GAME_PREFIX + gameId + TOPIC_GAME_PLAYERS_SUFFIX, //
                new PlayerDTO().fromPlayer(player));
    	
    	if(canGameStart(gameId)) {
    		GameDataBroker g = new GameDataBroker();
    		g = g.gameData(gameData);
    		g.startGame();
    		
    		// notify to all players the started game with message code START_GAME, used also to remove animation 'Goal' then the goal when match restarts
        	final Iterable<Player> players = persistenceRepo.findPlayer().findAllByGameId(gameId);
        	for (Player p : players) {
        		sendMessage(gameId, p.getToken(), Message.Type.INFO, Message.Code.START_GAME);
        		
        		//send to player message with game controls
        		sendMessage(gameId, p.getToken(), Message.Type.INFO, Message.Code.GAME_CONTROLS);
        		
        		//send message lose or win dependency of score
        		if(gameData.getTeamsScore().getRightTeamScore() > gameData.getTeamsScore().getLeftTeamScore()) {
	            	if(p.getTeam().equals(Player.Team.RIGHT))
	            		sendMessage(gameId, p.getToken(), Message.Type.INFO, Message.Code.WINNING);
	            	else
	            		sendMessage(gameId, p.getToken(), Message.Type.INFO, Message.Code.LOSING);
            	
	            }else if (gameData.getTeamsScore().getRightTeamScore() < gameData.getTeamsScore().getLeftTeamScore()) {
	            	if(p.getTeam().equals(Player.Team.RIGHT))
	            		sendMessage(gameId, p.getToken(), Message.Type.INFO, Message.Code.LOSING);
	            	else
	            		sendMessage(gameId, p.getToken(), Message.Type.INFO, Message.Code.WINNING);
	            }
        	}
    	}
    	else {
    		gameData.setBallAnimation(BALL_LOBBY_ANIMATION);
    	}
    	
    	persistenceRepo.updateGameData(gameId).gameData(gameData).apply();
    	
    	return new GameDataDTO()
                .teamsScore(gameData.getTeamsScore())
                .ballAnimation(gameData.getBallAnimation());
    }

    @Override
    public PlayerDTO movePlayer(String gameId, MovePlayerRequest request) {
        final String playerId = retrieveFullPlayerId(gameId, request.getPlayerId());
        /* TODO
        Update the Y value of the player using PlayerBroker and return it.
        NOTE: Keep in mind to persist the updates in the repository
         */
        PlayerDTO pDTO = new PlayerDTO();
    	
        Player player = retrievePlayer(gameId , playerId, request.getToken());
        
        PlayerBroker broker = new PlayerBroker();
        broker = broker.player(player);
        broker.moveToY(request.getY());
        
        persistenceRepo.updatePlayer(playerId).y(player.getY()).apply();
    			
    	return pDTO.fromPlayer(player);
    }

    @Override
    public BallAnimation animationEnd(String gameId) {
        final GameData gameData = retrieveGameData(gameId, null);
        final Iterable<Player> players = persistenceRepo.findPlayer().findAllByGameId(gameId);
        final GameDataBroker.UpdateAnimationResult updateAnimationResult = new GameDataBroker() //
                .players(players) //
                .gameData(gameData) //
                .updateAnimation();
        
        
        /* TODO
        If updateAnimation result is SCORE or NEXT, return the new ballAnimation.
        If updateAnimation result is SCORE:
            - Reset every player's readyToStart
            - Send to the front-end every new Player
            - Send to every player the message PointScored
        NOTE: Keep in mind to persist the updates in the repository
         */
        
        if(updateAnimationResult == GameDataBroker.UpdateAnimationResult.NONE) {
        	return null;
        }
        
        persistenceRepo.updateGameData(gameId).gameData(gameData).apply();
        
        //if there is a scored point, notify to every players the point scored message and so the animation thanks to this message
        if(updateAnimationResult == GameDataBroker.UpdateAnimationResult.SCORE) {
        	for (Player p : players) {
                p.setReadyToStart(false);
                
                persistenceRepo.updatePlayer(p.getId()).player(p).apply();
                
                messageSendingOperations.convertAndSend( //
                        TOPIC_GAME_PREFIX + gameId + TOPIC_GAME_PLAYERS_SUFFIX, //
                        new PlayerDTO().fromPlayer(p));
                
                sendMessage(gameId, p.getToken(), Message.Type.INFO, Message.Code.POINT_SCORED);
                
        	}
        	
            return gameData.getBallAnimation();
        }
        
        if(updateAnimationResult == GameDataBroker.UpdateAnimationResult.NEXT) {
        	return gameData.getBallAnimation();
        }
        
        return null;
        
    }

    // Private

    private String retrieveFullPlayerId(String gameId, String playerId) {
        return playerId.concat(PLAYER_ID_SEPARATOR).concat(gameId);
    }

    private GameData retrieveGameData(String gameId, String token) {
        final GameData gameData = persistenceRepo.findGameData().findById(gameId).orElse(null);
        if (gameData == null) {
            /* TODO
            Send a message to the player to notify the error
             */
        	sendMessage(gameId, token, Message.Type.ERROR, Message.Code.GAME_NOT_FOUND);
        	
            throw new GameWebServerException(GAME_NOT_FOUND + gameId);
        }
        return gameData;
    }

    private Player retrievePlayer(String gameId, String playerId, String token) {
        final Player player = persistenceRepo.findPlayer().findById(playerId).orElse(null);
        if (player == null) {
            /* TODO
            Send a message to the player to notify the error
             */
        	sendMessage(gameId, token, Message.Type.ERROR, Message.Code.GAME_NOT_FOUND);
        	
            throw new GameWebServerException(PLAYER_NOT_FOUND + playerId);
        }
        final boolean isValidToken = new PlayerBroker() //
                .player(player) //
                .checkPlayerToken(token);
        if (!isValidToken) {
            /* TODO
            Send a message to the player to notify the error
             */
        	sendMessage(gameId, token, Message.Type.ERROR, Message.Code.GAME_NOT_FOUND);
        	
            throw new GameWebServerException(INVALID_PLAYER_TOKEN + playerId);
        }
        return player;
    }

    private Player createPlayer(String gameId, String playerId, String teamPlayer) {
        final String fullPlayerId = retrieveFullPlayerId(gameId, playerId);
        final boolean playerAlreadyExists = persistenceRepo.findPlayer().findById(fullPlayerId).isPresent();
        if (playerAlreadyExists) {
            return null;
        }

        final String token = UUID.randomUUID().toString();
        /* TODO
        Instantiate and return the new Player.
        NOTE: Use fullPlayerId as id
         */
        
        //boolean used to assign the player's team
        boolean choiseTeam = false;
        
        //set choiseTeam according to value of teamPlayer
        //if the user enters words other than left or right then it puts right by default
        if(teamPlayer.equals("LEFT") || teamPlayer.equals("left")) {
        	choiseTeam = true;
        }
        else {
        	choiseTeam = false;
        }
        
        return new Player()
        	.id(fullPlayerId)
        	.gameId(gameId)
        	.team((choiseTeam) ? Player.Team.LEFT : Player.Team.RIGHT) //if choiseTeam is true so Team=Left, else Team=Right
        	.y(PLAYFIELD_HEIGHT / 2)
        	.token(token);
     
    }

    private boolean canGameStart(String gameId) {
        /* TODO
        The game can start if:
            - All players are ready to start
            - There is at least one player for each team (side)
         */
    	boolean allPlayersReady = false;
    	boolean atLeastOnePlayerLeft = false;
    	boolean atLeastOnePlayerRight = false;
    	
    	final Iterable<Player> players = persistenceRepo.findPlayer().findAllByGameId(gameId);
    	
    	for(Player player : players) {
    		if(!player.isReadyToStart()) {
    			return false;
    		}
    		allPlayersReady = true;
    		if(player.getTeam() == Player.Team.LEFT) {
    			atLeastOnePlayerLeft = true;
    		}
    		if(player.getTeam() == Player.Team.RIGHT) {
    			atLeastOnePlayerRight = true;
    		}
    	}
    	
    	if(allPlayersReady && atLeastOnePlayerLeft && atLeastOnePlayerRight) {
    		return true;
    	}
    	
    	return false;
    }

    private void sendMessage(String gameId, String token, Message.Type type, Message.Code code) {
        final Message msg = new Message() //
                .type(type) //
                .code(code);
        messageSendingOperations.convertAndSend( //
                TOPIC_GAME_PREFIX + gameId + TOPIC_GAME_MESSAGES_SUFFIX + token, //
                msg);
    }
}
