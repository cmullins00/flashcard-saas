'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Container, TextField, Button, Typography, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CardActionArea, Grid, Card, CardContent } from '@mui/material'
import { useUser } from '@clerk/nextjs'
import { db } from '../../firebase.js'
import { collection, doc, getDoc, setDoc, writeBatch } from 'firebase/firestore'

export default function Generate() {
    const {isLoaded, isSignedIn, user} = useUser()      // Used to check if the user is logged in
    const [flashcards, setFlashcards] = useState([])    // Generated flashcards
    const [flipped, setFlipped] = useState([])          // Keeps track of which flashcards are flipped
    const [name, setName] = useState('')                // Name of the flashcard set
    const [text, setText] = useState('')                // Text entered by the user
    const [open, setOpen] = useState(false)             // Used to open and close the dialog modals
    const router = useRouter()                          // Used to navigate to other pages

    const systemPrompt = `You are a flashcard creator, you take in text and create multiple flashcards from it. Make sure to create exactly 10 flashcards. Both front and back should be one sentence long. You should return in the following JSON format: { "flashcards":[ { "front": "Front of the card", "back": "Back of the card" } ] }`

    const { GoogleGenerativeAI } = require("@google/generative-ai");

    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: systemPrompt
    });

    // Submit handler for generating flashcards
    const handleSubmit = async () => {
        if (!user) return // Checks if user is logged in

        fetch('api/generate', { // Sends POST request to /api/generate route)
            method: 'POST',
            body: text,
        }).then((res) => res.json())
          .then(data => setFlashcards(data)) // Response is an array of flashcards

        if (!text.trim()) { // Checks if text is empty
            alert('Please enter some text to generate flashcards.')
            return
        }

        try {
            const response = await fetch('/api/generate', { // Sends POST request to /api/generate route
                method: 'POST',
                body: text,
            })

            if (!response.ok) { // Checks if response is successful
                throw new Error('Failed to generate flashcards')
            }

            const data = await response.json()
            setFlashcards(data) // Sets flashcards to data
        } catch (error) {
            console.error('Error generating flashcards:', error)
            alert('An error occurred while generating flashcards. Please try again.')
        }
    }

    // Flips the card
    const handleCardClick = (id) => {
        setFlipped((prevFlipped) => ({
            ...prev,
            [id]: !prev[id],
        }))
    }

    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)

    const saveFlashcards = async () => { // Saves the generated flashcards to the user's Firestore document under a new flashcard set with the given name
        if (!name.trim()) {
          alert('Please enter a name for your flashcard set.')
          return
        }

        try {
            const batch = writeBatch(db)
            const userDocRef = doc(collection(db, 'users'), user.id)
            const userDocSnap = await getDoc(userDocRef)

            if (userDocSnap.exists()) { // If the user document does not exist, it creates one
                const collections = docSnap.data().flashcardSets || []

                if (collections.some((set) => set.name === name)) {
                    alert('A flashcard set with that name already exists.')
                    return
                } else {
                    collections.push({name})
                    batch.set(userDocRef, {flashcards: collections}, {merge: true})
                }

                const userData = userDocSnap.data()
                const updatedSets = [...(userData.flashcardSets || []), {name}] 
                batch.update(userDocRef, { flashcardSets: updatedSets })
            } else {
                batch.set(userDocRef, { flashcardSets: [{ name }] })
            }

            const colRef = collection(userDocRef, name)
            flashcards.forEach((flashcard) => {
                const cardDocRef = doc(colRef)
                batch.set(cardDocRef, flashcard)
            })

            await batch.commit()
            alert('Flashcards saved successfully!')   // After saving, it alerts the user and closes the dialog

            handleClose()
            //name('')
            router.push('/flashcards')                // Redirects the user to the flashcards page
        } catch (error) {
            console.error('Error saving flashcards:', error)
            alert('An error occurred while saving flashcards. Please try again.')
        }
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
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
                                                    </div>

                                                    <Typography variant="h5" sx={{ mt: 2 }}>Back:</Typography>
                                                    <Typography>{flashcard.back}</Typography>
                                                </Box>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                        {flashcards.length > 0 && (
                            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                                <Button variant="contained" color="primary" onClick={handleOpen}>
                                    Save Flashcards
                                </Button>
                            </Box>
                        )}
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
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button onClick={saveFlashcards} color="primary">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
        </Container>
    )
}
