import React from 'react'
import { Container, Box, Typography, AppBar, Toolbar, Button } from '@mui/material'
import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'

export default function SignUpPage() {

    return(
        <Container maxWidth="sm">
            <AppBar position="static" sx={{ backgroundColor: '#3f51b5' }}>
                {/* Header and Navigation */}
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Flashcard SaaS
                    </Typography>
                    <Button color="inherit">
                        <Link href="/sign-in" passHref>
                            Login
                        </Link>
                    </Button>
                </Toolbar>

                {/* Sign-Up Section */}
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    sx={{ textAlign: 'center', my: 4 }}
                >
                    <Typography variant="h4" component="h1" gutterBottom>
                        Sign Up
                    </Typography>
                    <SignUp />
                </Box>
            </AppBar>
        </Container>
    )
}