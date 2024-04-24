'use strict'
const name = 'stripe'

async function send(data) {
    try {

        if (data.req)
            return await webhooks(data)

        let environment = data.environment || 'production';
        if (!data.environment && (data.host.startsWith('dev.') || data.host.startsWith('test.')))
            environment = 'test'

        const key = data.apis[environment].key;
        const stripe = require('stripe')(key);

        let param
        if (data.parameters) {
            param = data.stripe.parameters
        }

        if (data.stripe.$param) {
            param = data.stripe.$param[0]
            delete data.stripe.$param
        }

        switch (data.method.replace('stripe.', '')) {
            case 'accounts.create':
                data.stripe = await stripe.accounts.create(data.stripe);
                break;
            case 'accounts.update':
                data.stripe = await stripe.accounts.update(param, data.stripe);
                break;
            case 'files.create':
                data.stripe = await stripe.files.create(data.stripe)
                break;
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
            case 'customers.createSource':
                data.stripe = await stripe.customers.createSource(customer, data.stripe);
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
                data.stripe = await stripe.subscriptions.update(param, data.stripe);
                break;
            case 'subscriptionItems.update':
                data.stripe = await stripe.subscriptionItems.update(param, data.stripe);
                break;
            case 'subscriptions.del':
                data.stripe = await stripe.subscriptions.del(data.stripe.subscriptionId);
                break;
            case 'subscriptions.create':
                data.stripe = await stripe.subscriptions.create(data.stripe);
                break;
            case 'transfers.create':
                data.stripe = await stripe.transfers.create(data.stripe);
                break;
            default:
                data.error = "unknown method"
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
        if (data.host.startsWith('dev.') || data.host.startsWith('test.'))
            environment = 'test'

        const key = data.apis[environment].key;
        const stripe = require('stripe')(key);
        let name = data.req.url.split('/');
        name = name[3] || name[2] || name[1]

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

        const webhookSecret = data.apis[environment].webhooks[name];
        const sig = data.req.headers['stripe-signature'];
        const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);

        switch (data.req.method) {
            case 'POST':
            case 'PUT':
                // Handle the event
                switch (event.type) {
                    case 'customer.subscription.deleted':
                        let subscription = event.data.object; // The subscription object
                        let subscriptionId = subscription.id;

                        await data.crud.send({
                            host: data.host,
                            broadcast: false,
                            broadcastSender: true,
                            method: 'object.update',
                            array: 'users',
                            object: {
                                subscription: 'canceled'
                            },
                            $filter: {
                                query: { subscriptionId }
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
                    case 'invoice.payment_succeeded':
                        const invoice = event.data.object;
                        const user = await data.crud.send({
                            host: data.host,
                            broadcast: false,
                            broadcastSender: true,
                            method: 'object.read',
                            array: 'users',
                            $filter: {
                                query: { customerId: invoice.customer }
                            },
                            organization_id: data.organization_id
                        })

                        if (user.object && user.object[0] && user.object[0]) {
                            await data.crud.send({
                                host: data.host,
                                broadcast: false,
                                broadcastSender: true,
                                method: 'object.create',
                                array: 'payments',
                                object: {
                                    amount: invoice.amount_paid,
                                    user_id: user.object[0]._id,
                                    customerId: invoice.customer,
                                    subscription: user.object[0].subscription,
                                    subscriptionId: invoice.subscription,
                                    ambassador: user.object[0].ambassador
                                },
                                organization_id: data.organization_id
                            })

                            if (user.object[0].ambassador) {
                                await data.crud.send({
                                    host: data.host,
                                    broadcast: false,
                                    broadcastSender: true,
                                    method: 'object.update',
                                    array: 'payouts',
                                    object: {
                                        $inc: { amount: (invoice.amount_paid * 0.15) / 100 },
                                        user_id: user.object[0]._id,
                                        ambassador: user.object[0].ambassador,
                                        status: "pending",
                                    },
                                    $filter: {
                                        query: {
                                            ambassador: user.object[0].ambassador,
                                            status: 'pending'
                                        }
                                    },
                                    upsert: true,
                                    organization_id: data.organization_id
                                })
                            }
                        }
                        break;
                    case 'account.updated':
                        // Handle additional information request
                        await data.crud.send({
                            host: data.host,
                            broadcast: false,
                            broadcastSender: true,
                            method: 'object.update',
                            array: 'users',
                            object: {
                                "stripe.account": event.data.object,
                            },
                            $filter: {
                                query: {
                                    "stripe.account.id": event.data.object.id
                                }
                            },
                            organization_id: data.organization_id
                        })
                        break;
                    case 'balance.available':
                        await data.crud.send({
                            host: data.host,
                            broadcast: false,
                            broadcastSender: true,
                            method: 'object.update',
                            array: 'users',
                            $filter: {
                                query: { ambassadorAccount: event.data.object.accountId }
                            },
                            object: {
                                "stripe.balance": event.data.object
                            },
                            organization_id: data.organization_id
                        })
                        break;
                    case 'payout.created':
                        await data.crud.send({
                            host: data.host,
                            broadcast: false,
                            broadcastSender: true,
                            method: 'object.create',
                            array: 'payouts',
                            object: event.data.object,
                            organization_id: data.organization_id
                        })
                        break;
                    case 'payout.paid':
                    case 'payout.failed':
                        await data.crud.send({
                            host: data.host,
                            broadcast: false,
                            broadcastSender: true,
                            method: 'object.update',
                            array: 'payouts',
                            $filter: {
                                query: { "id": event.data.object.id } // Use the payout ID to find the correct record
                            },
                            object: event.data.object, // Directly use the event data object
                            organization_id: data.organization_id
                        });
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
        return data
    } catch (error) {
        data.error = error.message
        data.res.writeHead(400, { 'Content-Type': 'text/plain' });
        data.res.end(`Webhook Error: ${err.message}`);
        return data
    }
}

module.exports = { send, webhooks };
