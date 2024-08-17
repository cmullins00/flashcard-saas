import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
})

// Utility function to format the amount for Stripe
const formatAmountForStripe = (amount, currency) => {
    return Math.round(amount * 100)
   }


/**
 * This function handles the POST request to create a checkout session on the server.
 * It uses the Stripe API to create a session and returns the session object as a JSON response.
 */
export async function POST(req) {
  try {
    // Create the checkout session
    const params = {
        mode: 'subscription', // Set the mode to subscription for recurring payments
        payment_method_types: ['card'], // Set the payment method types to card
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Pro subscription',
              },
              unit_amount: formatAmountForStripe(10, 'usd'), // $10 USD for 1 month
              recurring: {
                interval: 'month',
                interval_count: 1,
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${req.headers.get( // Set the success URL, redirecting the user to the result page
          'Referer',
        )}result?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get(  // Set the cancel URL, same thing as above
          'Referer',
        )}result?session_id={CHECKOUT_SESSION_ID}`,
      }
      
      const checkoutSession = await stripe.checkout.sessions.create(params)
      
      return NextResponse.json(checkoutSession, { status: 200 })
  } catch (error) {
    // Log the error and return an error response
    console.error('Error creating checkout session:', error);
    console.error('Error creating checkout session:', error)
    return new NextResponse(JSON.stringify({ error: { message: error.message } }), {
      status: 500,
    })
  }
}

// This function handles the GET request to retrieve a checkout session on the server.
export async function GET(req) {
    const searchParams = req.nextUrl.searchParams
    const session_id = searchParams.get('session_id')   // Get the session ID from the URL's search parameters
  
    try {
      if (!session_id) {    // If no session ID is provided, return an error
        throw new Error('Session ID is required')
      }

      // Retrieve the checkout session using Stripe API
      const checkoutSession = await stripe.checkout.sessions.retrieve(session_id)
  
      return NextResponse.json(checkoutSession)
    } catch (error) {
      console.error('Error retrieving checkout session:', error)
      return NextResponse.json({ error: { message: error.message } }, { status: 500 })
    }
  }
