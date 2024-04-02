import { PolicyPlugin, IPolicyType, DemoPlugin, makeComponentsManager } from 'koreografeye';
import * as N3 from 'n3';
import { promisifyEventEmitter } from 'event-emitter-promisify';

export abstract class HookInHandler extends PolicyPlugin {   
    constructor() {
        super();
    }

    abstract run(policy: IPolicyType): Promise<N3.Quad[]>;

    async execute(mainStore: N3.Store, policyStore: N3.Store, policy: IPolicyType) {
        await promisifyEventEmitter(mainStore.removeMatches(policy.node))
        mainStore.addQuads(await this.run(policy));
        return true;
    }
}

export class PublicKeyHandler extends HookInHandler {   
    constructor(
        public readonly showMainStore: boolean,
        public readonly showPolicyStore: boolean,
        public readonly showParameters: boolean,
    ) {
        super();
    }

    async run(policy: IPolicyType) {
        return [N3.DataFactory.quad(N3.DataFactory.blankNode(), N3.DataFactory.namedNode('http://example.org/hasPublicKey'), N3.DataFactory.literal('true'))];
    }
}
