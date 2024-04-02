import { PolicyPlugin, IPolicyType, DemoPlugin, makeComponentsManager } from 'koreografeye';
import * as N3 from 'n3';

export class PublicKeyHandler extends PolicyPlugin {   
    constructor(
        public readonly showMainStore: boolean,
        public readonly showPolicyStore: boolean,
        public readonly showParameters: boolean,
    ) {
        super();
    }

    async execute(mainStore: N3.Store, policyStore: N3.Store, policy: IPolicyType) {
        console.log("PublicKeyHandler executing", mainStore, policyStore, policy);
        mainStore.addQuad(N3.DataFactory.blankNode(), N3.DataFactory.namedNode('http://example.org/hasPublicKey'), N3.DataFactory.literal('true'));
        return true;
    }
}
