import { SnackbarProvider } from 'notistack'
import '@fontsource/public-sans'
import {
    CssVarsProvider,
    Stack,
    Typography
} from '@mui/joy'
import StompProvider from './stomp/StompProvider'
import theme from './theme'
import PlayField from './PlayField'
import React from 'react'

export default function App() {
    return (
        <StompProvider>
            <SnackbarProvider preventDuplicate>
                <CssVarsProvider theme={theme}>
                    <Stack
                        spacing={4}
                        alignItems='center'
                        justifyContent='center'
                    >
                        <Typography
                            noWrap
                            level='display1'
                            variant='soft'
                            color='primary'
                            fontWeight='bold'
                            fontSize='40px'
                            letterSpacing='1px'
                        >
                           Project SOI Ball Game
                        </Typography>
                        <PlayField />
                    </Stack>
                </CssVarsProvider>
            </SnackbarProvider>
        </StompProvider>
    )
}
