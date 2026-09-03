import Stripe from 'stripe'

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
})

export async function POST({ request }: { request: Request }) {
  try {
    const { priceId } = await request.json()

    if (!priceId || !priceId.startsWith('price_')) {
      return new Response(JSON.stringify({ error: 'Invalid price ID' }), { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: `${import.meta.env.VITE_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${import.meta.env.VITE_BASE_URL}/cancel`,
      metadata: {
        productId: priceId === 'price_diy_blueprint' ? 'diy_blueprint' : 'dwy_setup',
        productName: priceId === 'price_diy_blueprint' ? 'DIY Blueprint' : 'Done-With-You Setup',
      },
    })

    return new Response(JSON.stringify({ url: session.url }))
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
