'use strict'
const name = 'stripe'

async function send(data) {
    if (data.req)
        return await webhooks(data)
    let environment = data.environment || 'production';
    let stripe = false;

    try {
        let key = data.apis[environment].key;
        stripe = require('stripe')(key);
    } catch (e) {
        console.log(name + " : Error Connect to api", e)
    }

    try {
        switch (data.method.replace('stripe.', '')) {
            case 'customers.list':
                data.stripe = await stripe.customers.list();
                break;
            case 'customers.create':
                data.stripe = await stripe.customers.create(data.stripe);
                break;
            case 'customers.update':
                delete data.stripe['customer'];
                data.stripe = await stripe.customers.update(customer, data.stripe);
                break;
            case 'tokens.create':
                data.stripe = await stripe.tokens.create(data.stripe);
                break;
            case 'charges.create':
                data.stripe = await stripe.charges.create(data.stripe);
                break;
            case 'balance.retrieve':
                data.stripe = await stripe.balance.retrieve();
                break;
            case 'balanceTransactions.retrieve':
                data.stripe = await stripe.balanceTransactions.retrieve(
                    data.stripe.balance_transaction
                );
                break;
            case 'balanceTransactions.list':
                data.stripe = await stripe.balanceTransactions.list();
                break;
            case 'createSourceCustomer':
                delete data.stripe['customer'];
                data.stripe = await stripe.customers.createSource(customer, data.stripe);
                break;
            case 'paymentIntents.create':
                data.stripe = await stripe.paymentIntents.create(data.paymentIntents);
                break;
            case 'checkout.sessions':
                data.stripe = await stripe.checkout.sessions.retrieve(data.sessionId);

                // Check if the session has a customer associated with it
                // if (session.customer) {
                //     return session.customer; // This is the Customer ID
                // } else {
                //     console.log('No customer associated with this session.');
                //     return null;
                // }
                break;
            case 'subscriptions.update':
                data.stripe = await stripe.subscriptions.update(data.stripe.subscriptionId, data.stripe.subscriptions);
                break;
            case 'subscriptions.del':
                data.stripe = await stripe.subscriptions.del(data.stripe.subscriptionId);
                break;
            case 'subscriptions.create':
                data.stripe = await stripe.subscriptions.create(data.stripe);
                break;
        }

        return data

    } catch (error) {
        data.error = error.message
        return data
    }
}


async function webhooks(data) {
    try {
        let environment = data.environment || 'production';
        let stripe = false;

        try {
            let key = data.apis[environment].key;
            stripe = require('stripe')(key);
        } catch (e) {
            console.log(name + " : Error Connect to api", e)
        }

        let name = data.req.url.split('/');
        name = name[3] || name[2] || name[1]
        const webhookSecret = data.apis[environment].webhooks[name];

        let rawBody = '';
        await new Promise((resolve, reject) => {
            data.req.on('data', chunk => {
                rawBody += chunk.toString();
            });
            data.req.on('end', () => {
                resolve();
            });
            data.req.on('error', (err) => {
                reject(err);
            });
        });

        switch (data.req.method) {
            case 'POST':
            case 'PUT':
                const sig = data.req.headers['stripe-signature'];
                let event;

                // Verify the event by signature
                try {
                    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
                } catch (err) {
                    data.res.writeHead(400, { 'Content-Type': 'text/plain' });
                    return data.res.end(`Webhook Error: ${err.message}`);
                }

                // Handle the event
                switch (event.type) {
                    case 'customer.subscription.deleted':
                        let subscription = event.data.object; // The subscription object
                        let subscriptionId = subscription.id;

                        await data.crud.send({
                            broadcast: false,
                            broadcastSender: true,
                            method: 'object.update',
                            array: 'users',
                            object: {
                                subscription: 'canceled'
                            },
                            $filter: {
                                query: [
                                    { key: 'subscriptionId', value: subscriptionId, operator: '$eq' }
                                ]
                            },
                            organization_id: data.organization_id
                        })

                        break;
                    case 'checkout.session.completed':
                        const session = event.data.object;
                        const userId = session.metadata.user_id;
                        console.log('userId', userId)
                        // Process the session object as needed
                        break;
                    // Handle other event types
                    default:
                        console.log(`Unhandled event type ${event.type}`);
                }
                break;

            case 'GET':
            case 'DELETE':
                // Handle GET and DELETE requests if necessary
                break;
            // Add other cases as needed
        }

        data.res.writeHead(200, { 'Content-Type': 'application/json' });
        data.res.end(JSON.stringify({ message: 'Webhook received and processed' }));

    } catch (error) {
        data.error = error.message
        return data
    }
}

module.exports = { send, webhooks };
