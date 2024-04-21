import { CSSProperties } from 'react'

// GAME DATA

export const PLAYFIELD_WIDTH = 1000
export const PLAYFIELD_HEIGHT = 750

export const FPS = 60
// ms between frames
export const MS_PER_FRAME = 1000 / FPS

export const BALL_DIAMETER = 20
export const BALL_RADIUS = BALL_DIAMETER / 2
// unit per sec
export const BALL_SPEED = PLAYFIELD_WIDTH / 2

export const PLAYER_WIDTH = 10
export const PLAYER_HEIGHT = 100
export const PLAYER_RADIUS = Math.min(PLAYER_WIDTH, PLAYER_HEIGHT) / 2
// unit per sec
export const PLAYER_SPEED = PLAYFIELD_HEIGHT / 3
// unit per frame
export const PLAYER_STEP = Math.floor(PLAYER_SPEED / FPS)

export const LEFT_TEAM_X = Math.floor(PLAYFIELD_WIDTH / 20)
export const RIGHT_TEAM_X = Math.floor(PLAYFIELD_WIDTH - LEFT_TEAM_X)

// PLAYFIELD STYLE

export const PLAYFIELD_SVG_VIEWBOX = `0 0 ${PLAYFIELD_WIDTH} ${PLAYFIELD_HEIGHT}`
export const PLAYFIELD_SVG_WIDTH = '100vmin'
export const PLAYFIELD_SVG_HEIGHT = '75vmin'

export const PLAYFIELD_STYLE: CSSProperties = Object.freeze({
    position: 'relative',
    backgroundColor: '#0096FF'
})

export const PLAYFIELD_TEXT_STYLE: CSSProperties = Object.freeze({
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    top: '50%',
    left: '50%',
})

// BALL STYLE

export const BALL_BASE_SVG_PROPS: React.SVGProps<SVGCircleElement> = Object.freeze({
    fill: '#ff4db8',
    r: BALL_RADIUS,
})

// PLAYER STYLE

export const PLAYER_BASE_SVG_PROPS: React.SVGProps<SVGRectElement> = Object.freeze({
    rx: PLAYER_RADIUS,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
})
export const PLAYER_READY_SVG_PROPS: React.SVGProps<SVGRectElement> = Object.freeze({
    fill: '#ff4d4d',
})
export const PLAYER_NOT_READY_SVG_PROPS: React.SVGProps<SVGRectElement> = Object.freeze({
    fill: '#e4ff4d',
})

export const PLAYER_TEXT_BASE_STYLE: CSSProperties = Object.freeze({
    width: 'fit-content',
})
export const PLAYER_TEXT_LEFT_TEAM_STYLE: CSSProperties = Object.freeze({
    transform: 'translate(-100%, -50%)',
})
export const PLAYER_TEXT_RIGHT_TEAM_STYLE: CSSProperties = Object.freeze({
    transform: 'translate(100%, -50%)',
})

// COMPONENTS STYLE

export const TABLE_STYLE: CSSProperties = Object.freeze({
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    margin: '10px',
    padding: '10px',
    border: '3px solid #55FF33',
    borderRadius: '10px',
    width:'14%',
})

export const DIV_TABLE_STYLE: CSSProperties = Object.freeze({
    display: 'flex',
    borderBottom: '1px solid #55FF33',
})

export const H6_TABLE_STYLE: CSSProperties = Object.freeze({
    flex: '1',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
})

export const TITLE_TABLE_STYLE: CSSProperties = Object.freeze({
    marginBottom: '10px',
})

export const KEY_TABLE_STYLE: CSSProperties = Object.freeze({
    display: 'flex',
    marginTop: '10px',
})

export const VALUE_TABLE_STYLE: CSSProperties = Object.freeze({
    flex: '1',
})

export const GOAL_ANIMATION_STYLE: CSSProperties = Object.freeze({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    position: 'absolute',
    zIndex: 1000,
    pointerEvents: 'none',
    marginTop: '-5rem',
})

export const COORDINATES_BALL_STYLE: CSSProperties = Object.freeze({
    position: 'absolute',
    right: 0, top: '50%',
    transform: 'translateY(-50%)',
    border: '3px solid #55FF33',
    margin: '10px',
    padding: '10px',
})
