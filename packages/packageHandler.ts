import { Store } from "@rdfjs/types";
// Internal policy handling
// Related to
// - https://github.com/SolidLabResearch/user-managed-access/blob/0c0bbf683577fdf2e337ebfc25a9f9121a0174aa/packages/ucp/src/UcpPatternEnforcement.ts
// - https://github.com/SolidLabResearch/Vienna-prototype/blob/main/SolidPod/Interfaces/AuthZInterface/api.ts

// class DataPackageHandler {
//     constructor() {      
//     }
// }

// In some cases we will want to forward data to services that are not yet able to
// negotiate for themselves. Claude is one of them. In cases like this, we write interfaces
// on our side that reflect the policies that such services would have.
class ClaudeExchangeHandler {
    private readonly dataExchangeHandler: DataExchangeHandler;

    constructor() {

    }

    async getPolicyMatching() {
    }
}

class DataExchangeHandler {
    constructor() {
        
    }

    /**
     * @param iri The IRI that we want to forward data to
     * @param policies Any policies requested by the party we are forwarding to
     */
    async canForwardTo(iri: string, policies: Store) {

    }

    async getPolicyMatching() {
    }
}

class DataPackage {
    constructor() {
        
    }
}
