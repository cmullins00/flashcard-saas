'use client'
import Image from "next/image";
import getStripe from '@/utils/get-stripe'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { AppBar, Toolbar, Button, Typography, Box, Grid, Container } from '@mui/material'
import Head from 'next/head'

export default function Home() {

  // Stripe integration
  const handleSubmit = async () => {
    const checkoutSession = await fetch('/api/checkout_sessions', {
      method: 'POST',
      headers: { origin: 'http://localhost:3000' }, // Will need to change this once it is deployed
    })

    const checkoutSessionJson = await checkoutSession.json()

    if (checkoutSession.statusCode === 500) {
      console.error('Error:', checkoutSession.message)
      return
    }

    const stripe = await getStripe()
    const { error } = await stripe.redirectToCheckout({
      sessionId: checkoutSessionJson.id,
    })

    if (error) {
      console.warn(error.message)
    }
  }

  return (
    <Container maxWidth="lg">
      <Head>
        <title>Flashcard SaaS</title>
        <meta name = "description" content = "The easiest way to create flashcards from your text."/>
      </Head>

      <AppBar position="static" sx={{ backgroundColor: 'white', color: 'black' }}>
        {/* Header and Navigation */}
        <Toolbar sx={{ backgroundColor: '#3f51b5', color: 'white' }}>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Flashcard SaaS
          </Typography>
          <SignedOut>
            <Button color="inherit" href="/sign-in">Login</Button>
            <Button color="inherit" href="/sign-up">Sign Up</Button>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </Toolbar>

        {/* Hero section */}
        <Box sx={{ textAlign: 'center', display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", my: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to Flashcard SaaS
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            The easiest way to create flashcards from your text.
          </Typography>
          <Button variant="contained" color="primary"  sx={{ mt: 2, mr: 2 }} href="/generate">
            Get Started
          </Button>
        </Box>

        {/* Features section */}
        <Box sx={{ my: 6, textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom>Features</Typography>
          <Grid container spacing={4} >
            {/* Feature items */}
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6">Easy Text Input</Typography>
              <Typography>{`Simply type your text and we'll generate flashcards.`}</Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6">Smart Flashcards</Typography>
              <Typography>Some kind of description</Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6">Feature 3</Typography>
              <Typography>Some kind of description</Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Pricing section */}
        <Box sx={{ my: 6, p: 3, textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom>Pricing</Typography>
          <Grid container spacing={4}>
            {/* Feature items */}
            <Grid item xs={12} md={6}>
              <Box sx={{
                p: 3,
                border: '2px dashed',
                borderColor: 'grey.300',
                borderRadius: 2,
                backgroundColor: '#3f51b5',
                color: 'white'
              }}>
                <Typography variant="h5">Basic</Typography>
                <Typography variant="h6" gutterBottom>$5 / month</Typography>
                <Typography>
                  {' '}
                  Access to basic flashcard features and limited storage.
                </Typography>
                <Button variant="contained" sx={{ mt: 2 }} onClick={handleSubmit}>Select Option</Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{
                p: 3,
                border: '2px dashed',
                borderColor: 'grey.300',
                borderRadius: 2,
                backgroundColor: '#3f51b5',
                color: 'white'
              }}>
                <Typography variant="h5">Pro</Typography>
                <Typography variant="h6" gutterBottom>$10 / month</Typography>
                <Typography>
                  {' '}
                  Access to basic flashcard features and limited storage.
                </Typography>
                <Button variant="contained" sx={{ mt: 2 }} onClick={handleSubmit}>Select Option</Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </AppBar>
    </Container>
  )

}
