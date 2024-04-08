// @ts-nocheck
// const { v4 } = await import('uuid');
export class MultiLoader {
  constructor({documentLoader} = {}) {
    this.loaders = [];
    if(documentLoader) {
      this.loaders = this.loaders.concat(documentLoader);
    }
  }

  addLoader(loader) {
    this.loaders.push(loader);
  }

  async documentLoader(url) {
    let result;
    for(const loader of this.loaders) {
      try {
        result = await loader(url);
      } catch(e) {
        // this loader failed move on to the next
        continue;
      }
      if(result) {
        return result;
      }
    }
    // failure, throw
    throw new Error(`Document not found: ${url}`);
  }

} // end MultiLoader

const nullVersion =
{
  "@context": [{
    "@version": null
  }, {
    "cred": "https://w3.org/2018/credentials#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "Policy2": "cred:Policy",
    "VerifiableCredential": "cred:VerifiableCredential",
    "VerifiablePresentation": "cred:VerifiablePresentation",
    "credentialStatus": {"@id": "cred:credentialStatus", "@type": "@id"},
    "credentialSubject": {"@id": "cred:credentialSubject", "@type": "@id"},
    "evidence": {"@id": "cred:evidence", "@type": "@id"},
    "expirationDate": {"@id": "cred:expirationDate", "@type": "xsd:dateTime"},
    "issuanceDate": {"@id": "cred:issuanceDate", "@type": "xsd:dateTime"},
    "issuer": {"@id": "cred:issuer", "@type": "@id"},
    "revocation": {"@id": "cred:revocation", "@type": "@id"},
    "termsOfUse": {"@id": "cred:termsOfUse", "@type": "@id"},
    "verifiableCredential": {"@id": "cred:verifiableCredential", "@type": "@id", "@container": "@graph"},

    "referenceId": "cred:referenceId"
  }]
};

const nullId =
{
  "@context": [{
    "@version": 1.1,
    "@id": null
  }, "https://w3id.org/security/v2", {
    "cred": "https://w3.org/2018/credentials#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",

    "Policy": "cred:Policy",
    "VerifiableCredential": "cred:VerifiableCredential",
    "VerifiablePresentation": "cred:VerifiablePresentation",
    "credentialStatus": {"@id": "cred:credentialStatus", "@type": "@id"},
    "credentialSubject": {"@id": "cred:credentialSubject", "@type": "@id"},
    "evidence": {"@id": "cred:evidence", "@type": "@id"},
    "expirationDate": {"@id": "cred:expirationDate", "@type": "xsd:dateTime"},
    "issuanceDate": {"@id": "cred:issuanceDate", "@type": "xsd:dateTime"},
    "issuer": {"@id": "cred:issuer", "@type": "@id"},
    "revocation": {"@id": "cred:revocation", "@type": "@id"},
    "termsOfUse": {"@id": "cred:termsOfUse", "@type": "@id"},
    "verifiableCredential": {"@id": "cred:verifiableCredential", "@type": "@id", "@container": "@graph"},

    "referenceId": "cred:referenceId"
  }]
};

const credential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://www.w3.org/2018/credentials/examples/v1'
  ],
  id: 'http://example.edu/credentials/1872',
  type: ['VerifiableCredential', 'AlumniCredential'],
  issuer: 'https://example.edu/issuers/565049',
  issuanceDate: '2010-01-01T19:23:24Z',
  credentialSubject: {
    id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
    alumniOf: '<span lang="en">Example University</span>'
  }
};

const invalidId =
{
  "@context": [{
    "@version": 1.1
  }, "https://w3id.org/security/v2", {
    "cred": "https://w3.org/2018/credentials#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",

    "Policy": "cred:Policy",
    "VerifiableCredential": "cred:VerifiableCredential",
    "VerifiablePresentation": "cred:VerifiablePresentation",
    "credentialStatus": {"@id": "cred:credentialStatus", "@type": "@id"},
    "credentialSubject": {"@id": "cred:credentialSubject", "@type": "@id"},
    "evidence": {"id": "cred:evidence", "@type": "@id"},
    "expirationDate": {"@id": "cred:expirationDate", "@type": "xsd:dateTime"},
    "issuanceDate": {"@id": "cred:issuanceDate", "@type": "xsd:dateTime"},
    "issuer": {"@id": "cred:issuer", "@type": "@id"},
    "revocation": {"@id": "cred:revocation", "@type": "@id"},
    "termsOfUse": {"@id": "cred:termsOfUse", "@type": "@id"},
    "verifiableCredential": {"@id": "cred:verifiableCredential", "@type": "@id", "@container": "@graph"},

    "referenceId": "cred:referenceId"
  }]
};

export const nullType =
{
  "@context": [{
    "@version": 1.1
  }, "https://w3id.org/security/v2", {
    "cred": "https://w3.org/2018/credentials#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",

    "Policy": "cred:Policy",
    "VerifiableCredential": "cred:VerifiableCredential",
    "VerifiablePresentation": "cred:VerifiablePresentation",
    "credentialStatus": {"@id": "cred:credentialStatus", "@type": null},
    "credentialSubject": {"@id": "cred:credentialSubject", "@type": "@id"},
    "evidence": {"@id": "cred:evidence", "@type": "@id"},
    "expirationDate": {"@id": "cred:expirationDate", "@type": "xsd:dateTime"},
    "issuanceDate": {"@id": "cred:issuanceDate", "@type": "xsd:dateTime"},
    "issuer": {"@id": "cred:issuer", "@type": "@id"},
    "revocation": {"@id": "cred:revocation", "@type": "@id"},
    "termsOfUse": {"@id": "cred:termsOfUse", "@type": "@id"},
    "verifiableCredential": {"@id": "cred:verifiableCredential", "@type": "@id", "@container": "@graph"},

    "referenceId": "cred:referenceId"
  }]
};

async function main() {
  const bbs2023Cryptosuite = await import('@digitalbazaar/bbs-2023-cryptosuite');
  const Bls12381Multikey = await import('@digitalbazaar/bls12-381-multikey');
  const EcdsaMultikey = await import('@digitalbazaar/ecdsa-multikey');
  const ecdsaSd2023Cryptosuite = await import('@digitalbazaar/ecdsa-sd-2023-cryptosuite');
  const {
    CONTEXT_V1: odrlCtx,
    CONTEXT_URL_V1: odrlCtxUrl
  } = await import('@digitalbazaar/odrl-context');
  const {
    CONTEXT_V1: vcExamplesV1Ctx,
    CONTEXT_URL_V1: vcExamplesV1CtxUrl
  } = await import('@digitalbazaar/credentials-examples-context');
  // const {assertionController} = await import('./mocks/assertionController.js');
  // const {CredentialIssuancePurpose} = await import('../lib/CredentialIssuancePurpose.js');
  const dataIntegrityContext = await import('@digitalbazaar/data-integrity-context');
  const {DataIntegrityProof} = await import('@digitalbazaar/data-integrity');
  const {Ed25519Signature2018} = await import('@digitalbazaar/ed25519-signature-2018');
  const {
    Ed25519VerificationKey2018
  } = await import('@digitalbazaar/ed25519-verification-key-2018');
  // const {invalidContexts} = await import('./contexts/index.js');
  const jsigs = await import('jsonld-signatures');
  // const jsonld = await import('jsonld');
  // const {credential: mockCredential} = await import('./mocks/credential.js');
  // const {mock: mockData} = await import('./mocks/mock.data.js');
  const multikeyContext = await import('@digitalbazaar/multikey-context');
  // const {MultiLoader} = await import('./MultiLoader.js');
  const {v4: uuid} = await import('uuid');
  const {VeresOneDriver} = await import('did-veres-one');
  
  
  // const EcdsaMultikey = await import('@digitalbazaar/ecdsa-multikey');
  // const ecdsaSd2023Cryptosuite = await import('@digitalbazaar/ecdsa-sd-2023-cryptosuite');
  const vc = await import('@digitalbazaar/vc');
  // const {DataIntegrityProof} = await import('@digitalbazaar/data-integrity');
  const { securityLoader } = await import('@digitalbazaar/security-document-loader');
  const secCtx = await import('@digitalbazaar/security-context');
  const webkmsCtx = await import('webkms-context');
  const zcapCtx = await import('zcap-context');
  const jsonld = await import('jsonld');
  const {
    constants: credentialConstants,
    contexts: credentialsContexts
  } = await import('credentials-context');
  const {
    constants: didConstants,
    contexts: didContexts
  } = await import('did-context');
  const {
    constants: v1Constants,
    contexts: v1Contexts
  } = await import('veres-one-context');



const {CREDENTIALS_CONTEXT_V1_URL} = credentialConstants;
const {DID_CONTEXT_URL} = didConstants;
const {VERES_ONE_CONTEXT_V1_URL} = v1Constants;


const invalidContexts = {
  veresOne: {
    url: VERES_ONE_CONTEXT_V1_URL,
    value: v1Contexts.get(VERES_ONE_CONTEXT_V1_URL)
  },
  did: {
    url: DID_CONTEXT_URL,
    value: didContexts.get(DID_CONTEXT_URL)
  },
  valid: {
    url: CREDENTIALS_CONTEXT_V1_URL,
    value: credentialsContexts.get(CREDENTIALS_CONTEXT_V1_URL)
  },
  invalidId: {
    url: 'https://invalid-id.org',
    value: invalidId
  },
  nullVersion: {
    url: 'https://null-version.org',
    value: nullVersion
  },
  nullId: {
    url: 'https://null-id.org',
    value: nullId
  },
  nullType: {
    url: 'https://null-type.org',
    value: nullType
  },
  nullDoc: {
    url: 'https://null-doc.org',
    value: null
  }
};


  const suite = new Ed25519Signature2018({
    // Note no key id or verificationMethod passed to suite
    key: await Ed25519VerificationKey2018.generate()
  });


const remoteDocuments = new Map();
remoteDocuments.set(vcExamplesV1CtxUrl, vcExamplesV1Ctx);
remoteDocuments.set(odrlCtxUrl, odrlCtx);
remoteDocuments.set(
  dataIntegrityContext.constants.CONTEXT_URL,
  dataIntegrityContext.contexts.get(
    dataIntegrityContext.constants.CONTEXT_URL));
remoteDocuments.set(
  multikeyContext.constants.CONTEXT_URL,
  multikeyContext.contexts.get(
    multikeyContext.constants.CONTEXT_URL));
for(const key in invalidContexts) {
  const {url, value} = invalidContexts[key];
  remoteDocuments.set(url, value);
}
const {extendContextLoader} = jsigs.default;
const {defaultDocumentLoader} = vc;

console.log(
  // jsigs,
  defaultDocumentLoader
)

const testContextLoader = extendContextLoader(async url => {
  const remoteDocument = remoteDocuments.get(url);
  if(remoteDocument) {
    return {
      contextUrl: null,
      document: jsonld.clone(remoteDocument),
      documentUrl: url
    };
  }
  return defaultDocumentLoader(url);
});

// documents are added to this documentLoader incrementally
const testLoader = new MultiLoader({
  documentLoader: [
    // CREDENTIALS_CONTEXT_URL
    testContextLoader
  ]
});

const documentLoader = testLoader.documentLoader.bind(testLoader);


  const verifiableCredential = await vc.issue({
    credential,
    suite,
    documentLoader
  });

  // console.log(
  //   suite
  // )

  
  // const ecdsaKeyPair = await EcdsaMultikey.generate({
  //   curve: 'P-256',
  //   id: 'https://example.edu/issuers/keys/2',
  //   controller: 'https://example.edu/issuers/565049'
  // });
  
  // // sample exported key pair
  // /*
  // {
  //   "@context": "https://w3id.org/security/multikey/v1",
  //   "id": "https://example.edu/issuers/keys/2",
  //   "type": "Multikey",
  //   "controller": "https://example.edu/issuers/565049",
  //   "publicKeyMultibase": "zDnaeWJjGpXnQAbEpRur3kSWFapGZbwGnFCkzyhiq7nDeXXrM",
  //   "secretKeyMultibase": "z42trzSpncjWFaB9cKE2Gg5hxtbuAQa5mVJgGwjrugHMacdM"
  // }
  // */
  
  // // sample unsigned credential
  // const credential = {
  //   "@context": [
  //     "https://www.w3.org/2018/credentials/v1",
  //     // "https://www.w3.org/2018/credentials/examples/v1"
  //   ],
  //   "id": "https://example.com/credentials/1872",
  //   "type": ["VerifiableCredential", "AlumniCredential"],
  //   "issuer": "https://example.edu/issuers/565049",
  //   "issuanceDate": "2010-01-01T19:23:24Z",
  //   "credentialSubject": {
  //     "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
  //     "alumniOf": "Example University"
  //   }
  // };
  
  // // setup ecdsa-sd-2023 suite for signing selective disclosure VCs
  // const suite = new DataIntegrityProof({
  //   signer: ecdsaKeyPair.signer(),
  //   cryptosuite: ecdsaSd2023Cryptosuite.createSignCryptosuite({
  //     // require the `issuer` and `issuanceDate` fields to always be disclosed
  //     // by the holder (presenter)
  //     mandatoryPointers: [
  //       '/issuanceDate',
  //       '/issuer'
  //     ]
  //   })
  // });
  // // use a proof ID to enable it to be found and transformed into a disclosure
  // // proof by the holder later
  // const proofId = `urn:uuid:${v4()}`;
  // suite.proof = {id: proofId};

  // // const documentLoader = securityLoader().build();

  // const documentLoader = vc.defaultDocumentLoader()
  // console.log(documentLoader)
  // // loader.addStatic(
  // //   secCtx.SECURITY_CONTEXT_V2_URL,
  // //   secCtx.contexts.get(secCtx.SECURITY_CONTEXT_V2_URL)
  // // );
  // // loader.addStatic(webkmsCtx.CONTEXT_URL, webkmsCtx.CONTEXT);
  // // loader.addStatic(zcapCtx.CONTEXT_URL, zcapCtx.CONTEXT);
  // // const documentLoader = loader.build();
  // // const documentLoader = vc.defaultDocumentLoader()
  
  // const signedVC = await vc.issue({credential, suite, documentLoader});
  // console.log(JSON.stringify(signedVC, null, 2));
  
  // const vc = await import('@digitalbazaar/vc');
  // const { Ed25519VerificationKey2020 } = await import('@digitalbazaar/ed25519-verification-key-2020');
  // const { Ed25519Signature2020 } = await import('@digitalbazaar/ed25519-signature-2020');
  // const { securityLoader } = await import('@digitalbazaar/security-document-loader');
  // const secCtx = await import('@digitalbazaar/security-context');
  // const webkmsCtx = await import('webkms-context');
  // const zcapCtx = await import('zcap-context');

  // const loader = securityLoader()
  // loader.addStatic(
  //   secCtx.SECURITY_CONTEXT_V2_URL,
  //   secCtx.contexts.get(secCtx.SECURITY_CONTEXT_V2_URL)
  // );
  // loader.addStatic(webkmsCtx.CONTEXT_URL, webkmsCtx.CONTEXT);
  // loader.addStatic(zcapCtx.CONTEXT_URL, zcapCtx.CONTEXT);

  // const keyPair = await Ed25519VerificationKey2020.generate();
  // const suite = new Ed25519Signature2020({ key: keyPair });
  // console.log(suite);

  // // const vc = require('@digitalbazaar/vc');

  // // Sample unsigned credential
  // const credential = {
  //   "@context": [
  //     "https://www.w3.org/2018/credentials/v1",
  //     "https://www.w3.org/2018/credentials/examples/v1"
  //   ],
  //   "id": "https://example.com/credentials/1872",
  //   "type": ["VerifiableCredential", "AlumniCredential"],
  //   "issuer": "https://example.edu/issuers/565049",
  //   "issuanceDate": "2010-01-01T19:23:24Z",
  //   "credentialSubject": {
  //     "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
  //     "alumniOf": "Example University"
  //   }
  // };

  // const signedVC = await vc.issue({ credential, suite, documentLoader: securityLoader().build() });
  // console.log(JSON.stringify(signedVC, null, 2));
}

main();
