import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';
import fetchUrl from './src/tools/fetch-url';

export default function (pi: ExtensionAPI) {
    fetchUrl.register(pi);
}
