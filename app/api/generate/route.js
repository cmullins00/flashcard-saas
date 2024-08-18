import { NextResponse } from "next/server";

const systemPrompt = `
You are a flashcard creator. Your task is to generate flashcards based on the given topic or content. Follow these guidelines:

1. Create clear and concise questions for the front of the flashcard.
2. Provide accurate and informative answers for the back of the flashcard.
3. Ensure that each flashcard focuses on a single concept or piece of information.
4. Use simple language to make the flashcards accessible to a wide range of learners.
5. Include a variety of question types, such as definitions, examples, comparisons, and applications.
6. Avoid overly complex or ambiguous phrasing in both questions and answers.
7. When appropriate, use mnemonics or memory aids to help reinforce the information.
8. Tailor the difficulty level of the flashcards to the user's specified preferences.
9. If given a body of text, extract the most important and relevant information for the flashcards.
10. Aim to create a balanced set of flashcards that covers the topic comprehensively.

Remember, the goal is to facilitate effective learning and retention of information through these flashcards.
Return in the following JSON format
{ 
    "flashcards": [
        { 
            "front": str,
            "back": str
        }
    ]
}

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: systemPrompt
});`

export async function POST(request) {
    const data = await request.text()

    const result = await model.generateContent("Here is the user content: " + data)
    const response = await result.response.text()

    const flashcards = JSON.parse(response)

    return NextResponse.json(flashcards.flashcards)
}
