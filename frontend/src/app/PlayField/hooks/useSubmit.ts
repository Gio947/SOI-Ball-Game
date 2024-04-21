import { useCallback, useState } from 'react'

export default function useSubmit({
    pendingGameId,
    pendingPlayerId,
    pendingPlayerTeam,
    disableEdit,
}: {
    pendingGameId: string,
    pendingPlayerId: string,
    pendingPlayerTeam: string,
    disableEdit: boolean,
}) {
    const [gameId, setGameId] = useState<string>('')
    const [playerId, setPlayerId] = useState<string>('')
    const [playerTeam, setPlayerTeam] = useState<string>('')

    const handleButtonClick = useCallback(() => {
        if (!disableEdit) {
            setGameId(pendingGameId)
            if (pendingPlayerId) {
                setPlayerId(pendingPlayerId)
                setPlayerTeam(pendingPlayerTeam)
            }
        }
    }, [pendingGameId, pendingPlayerId, pendingPlayerTeam, disableEdit])

    return {
        gameId,
        playerId,
        playerTeam,
        handleButtonClick
    }
}
