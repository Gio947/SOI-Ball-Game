package it.unipr.soi23.game_web_server.rest;

import it.unipr.soi23.game_web_server.model.*;
import it.unipr.soi23.game_web_server.service.Soi23GameWebServerService;
import it.unipr.soi23.game_web_server.utils.Soi23GameWebServerConst;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

@Controller
public class Soi23GameWebServerController {

    private final Soi23GameWebServerService service;

    public Soi23GameWebServerController(Soi23GameWebServerService service) {
        this.service = service;
    }

    @SubscribeMapping("game.{gameId}")
    public WatchGameResponse watchGame(@DestinationVariable String gameId) {
        return service.watchGame(gameId);
    }

    //add token and playerTeam to register; used for local storage and choice player team
    @SubscribeMapping("game.{gameId}.player.{playerId}.token.{token}.team.{playerTeam}")
    public RegisterResponse register(@DestinationVariable String gameId, @DestinationVariable String playerId, @DestinationVariable String token, @DestinationVariable String playerTeam) {
        return service.register(gameId, playerId, token, playerTeam);
    }

    @MessageMapping("game.{gameId}.start")
    @SendTo(Soi23GameWebServerConst.TOPIC_GAME_PREFIX + "{gameId}")
    public GameDataDTO startGame(@DestinationVariable String gameId, StartGameRequest request) {
        return service.startGame(gameId, request);
    }

    @MessageMapping("game.{gameId}.position")
    @SendTo(Soi23GameWebServerConst.TOPIC_GAME_PREFIX + "{gameId}.players")
    public PlayerDTO movePlayer(@DestinationVariable String gameId, MovePlayerRequest request) {
        return service.movePlayer(gameId, request);
    }

    @MessageMapping("game.{gameId}.animation")
    @SendTo(Soi23GameWebServerConst.TOPIC_GAME_PREFIX + "{gameId}.ball")
    public BallAnimation animationEnd(@DestinationVariable String gameId) {
        return service.animationEnd(gameId);
    }
}
