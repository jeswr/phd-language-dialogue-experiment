import { PolicyPlugin, IPolicyType, DemoPlugin, makeComponentsManager } from 'koreografeye';
import * as N3 from 'n3';

class PublicKeyHandler extends PolicyPlugin {
    constructor() {
        super();
    }

    async execute(mainStore: N3.Store, policyStore: N3.Store, policy: IPolicyType) {
        console.log("PublicKeyHandler executing", mainStore, policyStore, policy);
        return true;
    }
}
