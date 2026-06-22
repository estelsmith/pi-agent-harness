import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';
import { Type } from 'typebox';

export default function (pi: ExtensionAPI) {
    pi.registerTool({
        name: 'web_fetch',
        label: 'Web Fetch',
        description: 'Fetch content from a URL. If a specific URL is not provided by the user, prioritize using API endpoints whenever possible.',
        parameters: Type.Object({
            method: Type.Optional(Type.String({
                description: 'HTTP method (e.g., GET, POST)',
            })),
            url: Type.String({ description: 'The URL to fetch' }),
        }),
        async execute(toolCallId, params, signal, onUpdate, ctx) {
            const method = params.method ?? 'GET';
            try {
                const response = await fetch(params.url, {
                    method: method,
                    signal: signal,
                });

                if (!response.ok) {
                    return {
                        content: [{ type: 'text', text: `Error: ${response.status} ${response.statusText}` }],
                        details: {},
                    };
                }

                const text = await response.text();

                return {
                    content: [{ type: 'text', text }],
                    details: {
                        status: response.status,
                        headers: Object.fromEntries(response.headers.entries()),
                    },
                };
            } catch (error: any) {
                return {
                    content: [{ type: 'text', text: `Error: ${error.message}` }],
                    details: {},
                };
            }
        },
    });
}
