'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Container, TextField, Button, Typography, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CardActionArea, Grid, Card, CardContent } from '@mui/material'
import { useUser } from '@clerk/nextjs'
import { db } from '../../firebase.js'
import { collection, doc, getDoc, writeBatch } from 'firebase/firestore'

export default function Generate() {
    const {isLoaded, isSignedIn, user} = useUser()      // Used to check if the user is logged in
    const [flashcards, setFlashcards] = useState([])    // Generated flashcards
    const [flipped, setFlipped] = useState([])          // Keeps track of which flashcards are flipped
    const [name, setName] = useState('')                // Name of the flashcard set
    const [text, setText] = useState('')                // Text entered by the user
    const [open, setOpen] = useState(false)             // Used to open and close the dialog modals
    const router = useRouter()                          // Used to navigate to other pages

    // Submit handler for generating flashcards
    const handleSubmit = async () => {
        if (!user) {
            alert('Please sign in to generate flashcards.')
            console.log('Error: User is not logged in.')
            return // Checks if user is logged in
        }

        fetch('/api/generate', { // Sends POST request to /api/generate route)
            method: 'POST',
            body: text,
        })
            .then((response) => response.json())
            .then((data) => setFlashcards(data))
    }

    // Flips the card
    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id]: !prev[id],
        }))
    }

    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)

    const saveFlashcards = async () => { // Saves the generated flashcards to the user's Firestore document under a new flashcard set with the given name
        if (!name) {
          alert('Please enter a name for your flashcard set.')
          return
        }

        const batch = writeBatch(db)
        const userDocRef = doc(collection(db, 'users'), user.id)
        const docSnap = await getDoc(userDocRef)

        if (docSnap.exists()) { // If the user document does not exist, it creates one
            const collections = docSnap.data().flashcards || []

            if (collections.find((set) => set.name === name)) {
                alert('A flashcard set with that name already exists.')
                return
            } else {
                collections.push({name})
                batch.set(userDocRef, {flashcards: collections}, {merge: true})
            }
        } else {
            batch.set(userDocRef, { flashcards: [{ name }] })
        }

        const colRef = collection(userDocRef, name)
        flashcards.forEach((flashcard) => {
            const cardDocRef = doc(colRef)
            batch.set(cardDocRef, flashcard)
        })

        await batch.commit()
        alert('Flashcards saved successfully!')   // After saving, it alerts the user and closes the dialog

        handleClose()
        router.push('/flashcards')                // Redirects the user to the flashcards page
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4, mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Generate Flashcards
                </Typography>
                <TextField
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    label="Enter text"
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    sx={{ mb: 2 }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    fullWidth
                >
                    Generate Flashcards
                </Button>
            </Box>

            {/* We'll add flashcard display here */}
            {flashcards.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h5" component="h2" gutterBottom>
                            Generated Flashcards
                        </Typography>
                        <Grid container spacing={2}>
                            {flashcards.map((flashcard, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Card>
                                        <CardActionArea
                                            onClick={() => {
                                                handleCardClick(index)
                                            }}
                                        >
                                            <CardContent>
                                                <Box
                                                    sx={{
                                                        perspective: '1000px',
                                                        '& > div': {
                                                            transition: 'transform 0.6s',
                                                            transformStyle: 'preserve-3d',
                                                            position: 'relative',
                                                            width: '100%',
                                                            height: '200px',
                                                            boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
                                                            transform: flipped[index] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                                        },
                                                        '& > div > div': {
                                                            position: 'absolute',
                                                            width: '100%',
                                                            height: '100%',
                                                            backfaceVisibility: 'hidden',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            padding: 2,
                                                            boxSizing: 'border-box',
                                                        },
                                                        '& > div > div:nth-of-type(2)': {
                                                            transform: 'rotateY(180deg)',
                                                        },
                                                    }}
                                                >
                                                    <div>
                                                        <div>
                                                            <Typography variant="h5" component="div">
                                                                {flashcard.front}
                                                            </Typography>
                                                        </div>
                                                        <div>
                                                            <Typography variant="h5" component="div">
                                                                {flashcard.back}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </Box>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                            <Box sx={{ mb: 4, p:4, display: 'flex', justifyContent: 'center' }}>
                                <Button variant="contained" color="primary" onClick={handleOpen}>
                                    Save Flashcards
                                </Button>
                            </Box>
                    </Box>
                )}

                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Save Flashcard Set</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Please enter a name for your flashcard set.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Set Name"
                            type="text"
                            fullWidth
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            variant="outlined"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button onClick={saveFlashcards} color="primary">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
        </Container>
    )
}
