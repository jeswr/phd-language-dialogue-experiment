import { PolicyPlugin, IPolicyType } from 'koreografeye';
import * as N3 from 'n3';
import { promisifyEventEmitter } from 'event-emitter-promisify';
const { quad, blankNode, literal, namedNode } = N3.DataFactory;

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
        console.log("PublicKeyHandler executing", policy.node, policy.args);
        return [quad(blankNode(), namedNode('http://example.org/hasPublicKey'), literal('true', namedNode('http://www.w3.org/2001/XMLSchema#boolean')))];
    }
}
