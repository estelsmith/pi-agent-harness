import { Type } from 'typebox';
import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';

function register(pi: ExtensionAPI) {
    pi.registerTool({
        name: 'fetch-url',
        label: 'Fetch URL',
        description: 'Fetch web content from a URL.',
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
                    throw new Error(`${response.status} ${response.statusText}`);
                }

                const contentType = response.headers.get('content-type');
                let content: string;

                if (contentType && contentType.includes('application/json')) {
                    const json = await response.json();
                    content = JSON.stringify(json, null, 2);
                } else {
                    content = await response.text();
                }

                return {
                    content: [{ type: 'text', text: content }],
                    details: {
                        status: response.status,
                        headers: Object.fromEntries(response.headers.entries()),
                    },
                };
            } catch (error: any) {
                return {
                    isError: true,
                    content: [{ type: 'text', text: `Error: ${error.message}` }],
                    details: {},
                };
            }
        },
    });
}

const fetchUrl = {
    register
};
export default fetchUrl;