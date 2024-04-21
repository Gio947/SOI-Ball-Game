import { CSSProperties, useEffect, useMemo } from 'react'
import { enqueueSnackbar } from 'notistack'
import { Typography } from '@mui/joy'
import {
    LEFT_TEAM_X,
    PLAYER_BASE_SVG_PROPS,
    PLAYER_HEIGHT,
    PLAYER_NOT_READY_SVG_PROPS,
    PLAYER_READY_SVG_PROPS,
    PLAYER_TEXT_BASE_STYLE,
    PLAYER_TEXT_LEFT_TEAM_STYLE,
    PLAYER_TEXT_RIGHT_TEAM_STYLE,
    PLAYER_WIDTH,
    RIGHT_TEAM_X,
} from '../../utils/const'
import { PlayerDTO, PlayerTeam } from '../../utils/interfaces'
import React from 'react'

export default function PlayFieldPlayer({
    userId,
    playerId,
    player,
    numPlayers,
}: {
    userId?: string,
    playerId: string,
    player: PlayerDTO,
    numPlayers: number,
}) {
    const {
        team,
        y: posY,
        readyToStart
    } = player

    const isUser = useMemo(() => (
        userId === playerId
    ), [userId, playerId])

    const playerStyle: CSSProperties = useMemo(() => ({
        zIndex: isUser ? 10 : undefined,
    }), [isUser])

    const playerSvgProps: React.SVGProps<SVGRectElement> = useMemo(() => {
        const posX = team === PlayerTeam.LEFT
            ? LEFT_TEAM_X
            : RIGHT_TEAM_X
        const extraProps = readyToStart
            ? PLAYER_READY_SVG_PROPS
            : PLAYER_NOT_READY_SVG_PROPS

        return {
            ...PLAYER_BASE_SVG_PROPS,
            ...extraProps,
            height: PLAYER_HEIGHT - 10 * numPlayers,
            // decrease height depending on number of players
            x: posX - PLAYER_WIDTH / 2,
            y: posY - PLAYER_HEIGHT / 2,
        }
    }, [team, posY, readyToStart, numPlayers])

    const textSvgProps: React.SVGProps<SVGForeignObjectElement> = useMemo(() => ({
        x: team === PlayerTeam.LEFT
            ? LEFT_TEAM_X - 2 * PLAYER_WIDTH
            : RIGHT_TEAM_X + 2 * PLAYER_WIDTH,
        textAnchor: team === PlayerTeam.LEFT
            ? 'end'
            : 'start',
        overflow: 'visible'
    }), [team])

    const textStyle: React.CSSProperties = useMemo(() => {
        const sideStyle = team === PlayerTeam.LEFT
            ? PLAYER_TEXT_LEFT_TEAM_STYLE
            : PLAYER_TEXT_RIGHT_TEAM_STYLE
        return {
            ...PLAYER_TEXT_BASE_STYLE,
            ...sideStyle,
        }
    }, [team])

    useEffect(() => {
        if (isUser && !readyToStart) {
            enqueueSnackbar('Press Enter to start the game', { variant: 'info' })
        }
    }, [isUser, readyToStart])

    return (
        <g>
            <rect
                {...playerSvgProps}
                style={playerStyle}
            />
            <foreignObject
                {...textSvgProps}
                y={posY}
                width={2}
                height={2}
                //add width and height to see player's name in playing field in Mozilla
            >
                <Typography
                    noWrap
                    level='body3'
                    variant={isUser ? 'solid' : 'soft'}
                    style={textStyle}
                >
                    {playerId} {'  '}
                    {/* y coordinates of player to show them to user, high end and low end of the bar */}
                    ({Number(playerSvgProps.y ?? 0) - Number(playerSvgProps.height ?? 0)/2}, {Number(playerSvgProps.y ?? 0) + Number(playerSvgProps.height ?? 0)/2})
                </Typography>
            </foreignObject>
        </g>
    )
}
