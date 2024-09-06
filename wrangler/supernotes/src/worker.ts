/* eslint-disable no-unused-vars */
/* eslint-disable import/no-anonymous-default-export */
import { KVNamespace } from '@cloudflare/workers-types';
import { buildPushPayload, type PushSubscription, type PushMessage, type VapidKeys } from '@block65/webcrypto-web-push';

async function generateVAPIDHeaders(subscription, payload, vapid) {
	//const pushResponse = await sendPushNotification(subscription, payload, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

	const message: PushMessage = {
		data: { type: 'CHECK_REMINDERS' },
		options: {
			ttl: 60,
		},
	};

	const test = await buildPushPayload(message, subscription, vapid);
	const res = await fetch(subscription.endpoint, test);
	console.log(subscription);
	console.log(res.status);
	return res.status;
}

export interface Env {
	PUSH_SUBSCRIPTION_KV: KVNamespace;
}

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const vapid: VapidKeys = {
			subject: env.VAPID_EMAIL,
			publicKey: env.VAPID_PUBLIC_KEY,
			privateKey: env.VAPID_PRIVATE_KEY,
		};

		let response;
		if (url.pathname === '/hello') {
			return new Response(JSON.stringify({ message: 'Hello World!' }), {
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Handle OPTIONS preflight requests
		if (request.method === 'OPTIONS') {
			response = new Response(null, {
				status: 204, // no content
				headers: {
					'Access-Control-Allow-Origin': '*', // Allow any origin
					'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // Allowed methods
					'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Allowed headers
					'Access-Control-Max-Age': '86400', // Allowed headers
				},
			});

			return response;
		}

		if (url.pathname === '/api/notifications/subscribe' && request.method === 'POST') {
			// Save the subscription object to KV storage
			const subscription = await request.json();
			// check if not already present
			if ((await env.PUSH_SUBSCRIPTION_KV.get(subscription.endpoint)) === null)
				await env.PUSH_SUBSCRIPTION_KV.put(subscription.endpoint, JSON.stringify(subscription));
			response = new Response('Subscription saved', { status: 200 });
		}

		if (url.pathname === '/api/notifications/send' && request.method === 'GET') {
			// Save the subscription object to KV storage
			const data = await env.PUSH_SUBSCRIPTION_KV.list();

			for (let i = 0; i < data.keys.length; i++) {
				const subscriptionData = await env.PUSH_SUBSCRIPTION_KV.get(data.keys[i].name);
				console.log(subscriptionData);
				const parsedSubscriptionData = JSON.parse(subscriptionData);
				const result = await generateVAPIDHeaders(parsedSubscriptionData, 'Hello world', vapid);

				if (result === 410) {
					// This means the endpoint is no longer available
					// delete it

					await env.PUSH_SUBSCRIPTION_KV.delete(data.keys[i].name);
				}
			}

			response = new Response('Notifications sent!', { status: 200 });
		}

		if (response) {
			response = new Response(response.body, {
				status: response.status,
				headers: {
					'Access-Control-Allow-Origin': '*', // Allow any origin
					'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // Allowed methods
					'Access-Control-Allow-Headers': 'Content-Type', // Allowed headers
				},
			});

			return response;
		}

		return new Response('Not found', { status: 404 });
	},
};
