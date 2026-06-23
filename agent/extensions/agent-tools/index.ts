import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';
import fetchUrl from './src/tools/fetch-url';
import executeCode from './src/tools/execute-code';

export default function (pi: ExtensionAPI) {
    fetchUrl.register(pi);
    executeCode.register(pi);
}
