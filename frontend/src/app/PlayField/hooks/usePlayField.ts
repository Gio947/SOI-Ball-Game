import {
    ChangeEvent,
    KeyboardEvent,
    SyntheticEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react'
import {
    BallAnimation,
    PlayerDTO,
    PlayerDTOMap,
    PlayerDirection,
    TeamsScore,
} from '../../utils/interfaces'
import {
    BALL_BASE_SVG_PROPS,
} from '../../utils/const'
import Arena from '../../utils/Arena'
import useSubmit from './useSubmit'
import useStompLogic from './useStompLogic'
import useMessageHandler from './useMessageHandler'

interface BallProps extends React.SVGProps<SVGCircleElement> {
    style: React.CSSProperties,
}

interface LineProps extends React.SVGProps<SVGLineElement> {
    style: React.CSSProperties,
}

export default function usePlayField() {
    const [pendingGameId, setPendingGameId] = useState<string>('')
    const [pendingPlayerId, setPendingPlayerId] = useState<string>('')
    const [pendingPlayerTeam, setPendingPlayerTeam] = useState<string>('')
    const [token, setToken] = useState<string>('')
    const [teamsScore, setTeamsScore] = useState<TeamsScore | null>(null)
    const [ballAnimation, setBallAnimation] = useState<BallAnimation | null>(null)
    const [playerDTOMap, setPlayerDTOMap] = useState<PlayerDTOMap>({})
    const [goalResults, setGoalResults] = useState<{ leftTeamScore: number; rightTeamScore: number; }[]>([])
    //Array with all scores in the game, used to update the table of goal results in file index.tsx

    const arenaRef = useRef<Arena>(new Arena())

    const ballProps: BallProps = useMemo(() => {
        const customStyle: React.CSSProperties = {}
        if (ballAnimation !== null) {
            //add specific properties of customStyle for Mozilla and
            // units of measurement (px) to fix bug animation in Firefox
            document.documentElement.style.setProperty('--ball-end-y', `${ballAnimation.endY}px`)
            document.documentElement.style.setProperty('--ball-end-x', `${ballAnimation.endX}px`)

            customStyle.MozAnimationName = 'ballAnimation'
            customStyle.MozAnimationTimingFunction = 'linear'
            customStyle.MozAnimationFillMode = 'forwards'
            customStyle.animationName = 'ballAnimation'
            customStyle.animationTimingFunction = 'linear'
            customStyle.animationFillMode = 'forwards'
            customStyle.animationDuration = `${ballAnimation.time}s`
        } else {
            customStyle.visibility = 'hidden'
        }
        return {
            style: customStyle,
            ...BALL_BASE_SVG_PROPS,
            cx: ballAnimation?.startX,
            cy: ballAnimation?.startY,
        }
    }, [ballAnimation])

    //set const lineProps for laser beam to see direction ball
    //direction ball only if ballAnimation is not null
    const lineProps: LineProps = useMemo(() => {
        const customStyle: React.CSSProperties = {}
        if (ballAnimation !== null) {
            customStyle.stroke = 'white'
            customStyle.strokeWidth = '10px'
            customStyle.strokeOpacity = '0.5'
        } else {
            customStyle.visibility = 'hidden'
        }
        return {
            style: customStyle,
            x1: ballAnimation?.startX,
            y1: ballAnimation?.startY,
            x2: ballAnimation?.endX,
            y2: ballAnimation?.endY,
        }
    }, [ballAnimation])

    const {
        gameId,
        playerId,
        handleButtonClick
    } = useSubmit({
        pendingGameId,
        pendingPlayerId,
        pendingPlayerTeam,
        disableEdit: !!token,
    })

    const handleBallAnimationChange = useCallback((ballAnim: BallAnimation) => {
        setBallAnimation((oldBallAnim) => {
            if (oldBallAnim?.endX === ballAnim.endX && oldBallAnim?.endY === ballAnim.endY) {
                return oldBallAnim
            }
            window.requestAnimationFrame(
                () => setBallAnimation(ballAnim)
            )
            return null
        })
    }, [])

    const handlePlayerDTOChange = useCallback((playerDTO: PlayerDTO) => {
        if (playerId === playerDTO.id) {
            arenaRef.current.setPlayerPosition({ team: playerDTO.team, y: playerDTO.y })
        }
        /* TODO
        Set the new value of playerDTOMap
        */
        setPlayerDTOMap((oldPlayerDTOMap) => ({
            ...oldPlayerDTOMap,
            [playerDTO.id]: playerDTO,
        }))
    }, [playerId])
    const {
        handleMessageChange,
        pendingScored
    } = useMessageHandler()

    const {
        sendStart,
        sendAnimationEnded,
        sendPosition
    } = useStompLogic({
        gameId,
        playerId,
        playerToken: token,
        playerTeam: pendingPlayerTeam,
        onTokenChange: setToken,
        onTeamsScoreChange: setTeamsScore,
        onBallAnimationChange: handleBallAnimationChange,
        onPlayerDTOChange: handlePlayerDTOChange,
        onMessageChange: handleMessageChange,
    })

    const [direction, setDirection] = useState('')

    const handleKeyDown = useCallback(({ key }: KeyboardEvent) => {
        let newDirection = ''
        switch (key) {
            case 'ArrowUp':
            case 'w':
                newDirection = 'Up'
                break
            case 's':
                newDirection = 'Down'
                break
            case 'Enter':
                sendStart(JSON.stringify({ playerId , token }))
                //return because in this case I do not have to set a direction
                return
        }
        setDirection(newDirection)
        //set new direction to player by newDirection that is a key of PlayerDirection
        arenaRef.current.getPlayer()?.setDirection(PlayerDirection[newDirection as keyof typeof PlayerDirection])
    }, [playerId , sendStart , token])

    const handleKeyUp = useCallback(({ key }: KeyboardEvent) => {
        let newDirection = ''
        switch (key) {
            case 'w':
                if (direction === 'Up') {
                    newDirection = 'Hold'
                }
                break
            case 'ArrowDown':
            case 's':
                if (direction === 'Down') {
                    newDirection = 'Hold'
                }
                break
        }
        setDirection(newDirection)
        if (newDirection) {
            //set new direction to player by newDirection that is a key of PlayerDirection
            arenaRef.current.getPlayer()?.setDirection(PlayerDirection[newDirection as keyof typeof PlayerDirection])
        }
    }, [direction])

    const handleAnimationEnd = useCallback(() => {
        /* TODO
        Notify the backend that the animation ended
        */
        sendAnimationEnded()
    }, [sendAnimationEnded])

    const handlePlayerPositionYChange = useCallback((playerPositionY: number) => {
        /* TODO
        Notify the backend the new player position
        */
        sendPosition(JSON.stringify({
            playerId , 'y': playerPositionY , token
        }))
    }, [sendPosition , playerId , token])

    const handleGameIdChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setPendingGameId(event.target.value)
    }, [])

    const handlePlayerIdChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setPendingPlayerId(event.target.value)
    }, [])

    const handlePlayerTeamChange = useCallback((event: SyntheticEvent | null, valueSelect: string | null) => {
        setPendingPlayerTeam(valueSelect ?? '')
    }, [])

    useEffect(() => {
        arenaRef.current.getPlayer()?.setOnChangePositionY(handlePlayerPositionYChange)
    }, [handlePlayerPositionYChange, teamsScore])

    //Update goalResults with last value of teamsScore
    useEffect(() => {
        // Update only if the current result is different from the last row of goalResults
        if (teamsScore && (!goalResults.length ||
            teamsScore.leftTeamScore !== goalResults[goalResults.length - 1].leftTeamScore ||
            teamsScore.rightTeamScore !== goalResults[goalResults.length - 1].rightTeamScore
        )) {
            setGoalResults((prevResults) => [
                ...prevResults,
                {
                    leftTeamScore: teamsScore.leftTeamScore,
                    rightTeamScore: teamsScore.rightTeamScore,
                },
            ])
        }
    }, [teamsScore, goalResults])

    return {
        gameId: pendingGameId,
        playerId: pendingPlayerId,
        playerTeam: pendingPlayerTeam,
        disableEdit: !!token,
        teamsScore,
        playerDTOMap,
        ballProps,
        lineProps,
        handleKeyDown,
        handleKeyUp,
        handleAnimationEnd,
        handleGameIdChange,
        handlePlayerIdChange,
        handlePlayerTeamChange,
        handleButtonClick,
        pendingScored,
        goalResults,
    }
}
