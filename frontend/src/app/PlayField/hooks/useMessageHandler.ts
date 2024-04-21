import { useCallback, useState } from 'react'
import { useSnackbar, VariantType } from 'notistack'
import { Message, MessageType } from '../../utils/interfaces'

function mapTypeToVariant(type: MessageType) {
    let variant: VariantType
    switch (type) {
        case MessageType.ERROR:
            variant = 'error'
            break
        case MessageType.WARNING:
            variant = 'warning'
            break
        default:
            variant = 'info'
    }
    return variant
}

function mapCode(code: string) {
    let output: string
    switch (code) {
        case 'GAME_NOT_FOUND':
            output = 'Game not found'
            break
        case 'PLAYER_NOT_FOUND':
            output = 'Player not found'
            break
        case 'PLAYER_ID_ALREADY_USED':
            output = 'Player ID already used'
            break
        case 'INVALID_PLAYER_TOKEN':
            output = 'Invalid Player token'
            break
        case 'POINT_SCORED':
            output = 'Point!'
            break
        case 'NEW_PLAYER':
            output = 'There is a new player!!!'
            break
        case 'START_GAME':
            output = 'The game started!!!'
            break
        case 'GAME_CONTROLS':
            output = 'Game controls:\n'
            output += 'W/ArrowUp: Move Up\n'
            output += 'S/ArrowDown: Move Down\n'
            output += 'The y-coordinates of the start and end of the bar are shown next to the players name\n'
            output += 'Right-hand side shows the coordinates (x,y) of the ball and its destination\n'
            output += 'To the left is a table showing goals scored\n'
            break
        case 'WINNING':
            output = 'You are winning!!!'
            break
        case 'LOSING':
            output = 'You are losing!!!'
            break
        default:
            output = code
    }
    return output
}

export default function useMessageHandler() {
    const [pendingScored, setPendingScored] = useState<boolean>(false)
    const {
        enqueueSnackbar
    } = useSnackbar()

    const handleMessageChange = useCallback((message: Message) => {
        const variant = mapTypeToVariant(message.type)
        const msg = mapCode(message.code)
        enqueueSnackbar(msg, { variant })

        //set pendingScored to true if the message is POINT_SCORED, else for every other message received it becomes false
        if(message.code === 'POINT_SCORED'){
            setPendingScored(true)
        }
        else{
            setPendingScored(false)
        }

    }, [enqueueSnackbar])

    return {
        handleMessageChange, pendingScored
    }
}
