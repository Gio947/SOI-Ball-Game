import { Fragment } from 'react'
import {
    Button,
    Input,
    Stack,
    Typography,
    Select,
    Option,
    Divider,
    Card,
    CardContent,
} from '@mui/joy'
import {
    PLAYFIELD_STYLE,
    PLAYFIELD_SVG_VIEWBOX,
    PLAYFIELD_SVG_WIDTH,
    PLAYFIELD_SVG_HEIGHT,
    PLAYFIELD_TEXT_STYLE,
    TABLE_STYLE,
    DIV_TABLE_STYLE,
    H6_TABLE_STYLE,
    TITLE_TABLE_STYLE,
    KEY_TABLE_STYLE,
    VALUE_TABLE_STYLE,
    GOAL_ANIMATION_STYLE,
    COORDINATES_BALL_STYLE,
} from '../utils/const'
import usePlayField from './hooks/usePlayField'
import PlayFieldPlayer from './PlayFieldPlayer'
import React from 'react'

export default function PlayField() {

    const {
        gameId,
        playerId,
        playerTeam,
        disableEdit,
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
    } = usePlayField()

    return (
        <Fragment>
            {/* Table with goal results for team left and right */}
            {teamsScore && (
                <div style={TABLE_STYLE}>
                    <Typography level="h5" style={TITLE_TABLE_STYLE}>
                        Goal Results
                    </Typography>
                    <Divider />
                    <div>
                        <div style={DIV_TABLE_STYLE}>
                            <Typography level="h6" style={H6_TABLE_STYLE}>Team Left</Typography>
                            <Typography level="h6" style={H6_TABLE_STYLE}>Team Right</Typography>
                        </div>
                        {/* Map the results and create a row for each */}
                        {goalResults.map((result, index) => (
                            <div key={index} style={KEY_TABLE_STYLE}>
                                <div style={VALUE_TABLE_STYLE}>{result.leftTeamScore}</div>
                                <div style={VALUE_TABLE_STYLE}>{result.rightTeamScore}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {teamsScore && (
                <div style={PLAYFIELD_STYLE}>
                    {teamsScore && (
                        <Typography level='h1' style={PLAYFIELD_TEXT_STYLE}>
                            {`${teamsScore.leftTeamScore}-${teamsScore.rightTeamScore}`}
                        </Typography>
                    )}
                    <svg
                        tabIndex={0}
                        overflow='visible'
                        viewBox={PLAYFIELD_SVG_VIEWBOX}
                        width={PLAYFIELD_SVG_WIDTH}
                        height={PLAYFIELD_SVG_HEIGHT}
                        onKeyDown={handleKeyDown}
                        onKeyUp={handleKeyUp}
                    >
                        <line
                            {...lineProps}
                            onAnimationEnd={handleAnimationEnd}
                        />
                        <circle
                            {...ballProps}
                            onAnimationEnd={handleAnimationEnd}
                        />
                        {Object.keys(playerDTOMap).map((playerDTOId) => (
                            <PlayFieldPlayer
                                key={playerDTOId}
                                userId={playerId}
                                playerId={playerDTOId}
                                player={playerDTOMap[playerDTOId]}
                                numPlayers={Object.keys(playerDTOMap).length}
                                //numPlayers is the length of the playerDTOMap that is the number of players in the game
                            />
                        ))}
                    </svg>
                </div>
            )}
            {/* Animation for goal scored dependency of pendingScored */}
            <div
                style={GOAL_ANIMATION_STYLE}
            >
                <Typography
                    level='h1'
                    style={{
                        opacity: pendingScored ? 1 : 0,
                        transition: 'opacity 1s ease-in-out',
                        fontSize: '8em',
                        transform: pendingScored ? 'scale(1.2) rotate(20deg)' : '',
                        color: pendingScored ? '#55FF33' : '#55FF33',
                        textShadow: pendingScored ? '0 0 10px #55FF33, 0 0 20px #55FF33, 0 0 30px #55FF33, 0 0 40px #55FF33' : '',
                    }}
                >
                    {'GOALLLLLLL!!!!!'}
                </Typography>
            </div>
            <Stack
                direction='row'
                spacing={2}
            >
                <Input
                    size='sm'
                    variant='soft'
                    placeholder="Insert Game ID"
                    value={gameId}
                    disabled={disableEdit}
                    onChange={handleGameIdChange}
                />
                <Input
                    size='sm'
                    variant='soft'
                    placeholder="Insert Player ID"
                    value={playerId}
                    disabled={disableEdit}
                    onChange={handlePlayerIdChange}
                />
                <Select
                    size='sm'
                    variant='soft'
                    value={playerTeam}
                    disabled={disableEdit}
                    placeholder="Select Team"
                    onChange={handlePlayerTeamChange}>
                    <Option value="LEFT">LEFT</Option>
                    <Option value="RIGHT">RIGHT</Option>
                </Select>
                <Button
                    size='sm'
                    disabled={disableEdit}
                    onClick={handleButtonClick}
                >
                    Connect to game
                </Button>
                {/* Show ball coordinates and destination coordinates to help user to get the ball */}
                {teamsScore && (
                    <Card style={COORDINATES_BALL_STYLE}>
                        <CardContent>
                            <Typography level="h5" component="div">
                                Ball Coordinates
                            </Typography>
                            <Typography level="body2">
                                Position: ({ballProps.cx}, {ballProps.cy})
                            </Typography>
                            <Typography level="body2">
                                Destination: ({lineProps.x2}, {lineProps.y2})
                            </Typography>
                        </CardContent>
                    </Card>
                )}
            </Stack>
        </Fragment>
    )
}
