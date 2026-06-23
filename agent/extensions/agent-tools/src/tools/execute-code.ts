import { Type } from 'typebox';
import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';
import * as vm from 'node:vm';

function register(pi: ExtensionAPI) {
    /**
     * Disable the bash tool before the agent starts, forcing the agent to use provided tools to perform its work.
     */
    pi.on('before_agent_start', () => {
        const toolsToDisable = ['bash'];
        const activeTools = pi.getActiveTools();
        const toolsMinusDisabled = activeTools.filter((i) => !toolsToDisable.includes(i));
        pi.setActiveTools(toolsMinusDisabled);
    });

    pi.registerTool({
        name: 'execute-code',
        label: 'Execute Code',
        description: 'Run JavaScript code in a sandboxed environment. You MUST use `return` to return results.',
        parameters: Type.Object({
            code: Type.String({ description: 'The JavaScript code to execute. The code will be wrapped in a self-invoking function.' }),
        }),
        async execute(toolCallId, params, signal, onUpdate, ctx) {
            const { code } = params;
            const contextObject: Record<string, any> = {};

            try {
                const contextifiedObject = vm.createContext(contextObject);
                // Wrap code in IIFE so `return` can be used to return results.
                const wrappedCode = `(() => {${code}})();`;
                const script = new vm.Script(wrappedCode);
                const result = script.runInContext(contextifiedObject, { timeout: 15_000 });

                const resultText = result !== undefined ? JSON.stringify(result, null, 2) : '';

                return {
                    content: [{ type: 'text', text: (resultText).trim() || 'Code executed successfully with no output.' }],
                    details: {},
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

const executeCode = {
    register
};
export default executeCode;
