import parse from 'rdf-parse';

// @ts-nocheck
async function main() {
  // @ts-expect-error
  const vc = await import('@digitalbazaar/vc')
  // @ts-expect-error
  const EcdsaMultikey = await import('@digitalbazaar/ecdsa-multikey');
  const {
    CONTEXT_V1: odrlCtx,
    CONTEXT_URL_V1: odrlCtxUrl
    // @ts-expect-error
  } = await import('@digitalbazaar/odrl-context');
  const {
    CONTEXT_V1: vcExamplesV1Ctx,
    CONTEXT_URL_V1: vcExamplesV1CtxUrl
    // @ts-expect-error
  } = await import('@digitalbazaar/credentials-examples-context');
  // @ts-expect-error
  const { Ed25519Signature2018 } = await import('@digitalbazaar/ed25519-signature-2018');
  const {
    Ed25519VerificationKey2018
    // @ts-expect-error
  } = await import('@digitalbazaar/ed25519-verification-key-2018');
  // @ts-expect-error
  const jsigs = (await import('jsonld-signatures')).default;
  const jsonld = (await import("jsonld")).default;

  const remoteDocuments = new Map();
  remoteDocuments.set(vcExamplesV1CtxUrl, vcExamplesV1Ctx);
  remoteDocuments.set(odrlCtxUrl, odrlCtx);
  remoteDocuments.set("https://example.edu/issuers/565049", {
    '@context': 'https://w3id.org/security/v2',
    id: 'https://example.edu/issuers/565049',
    // actual keys are going to be added in the test suite before() block
    assertionMethod: [
      "https://example.edu/issuers/keys/1"
    ],
    authentication: []
  });

  const { extendContextLoader } = jsigs;
  const { defaultDocumentLoader } = vc;

  const testContextLoader = extendContextLoader(async (url: string) => {
    const remoteDocument = remoteDocuments.get(url);
    if (remoteDocument) {
      return {
        contextUrl: null,
        // @ts-expect-error
        document: jsonld.clone(remoteDocument),
        documentUrl: url
      };
    }
    return defaultDocumentLoader(url);
  });

  // set up the Ed25519 key pair that will be signing and verifying
  const keyPair = await Ed25519VerificationKey2018.generate({
    id: 'https://example.edu/issuers/keys/1',
    controller: 'https://example.edu/issuers/565049'
  });

  remoteDocuments.set(
    'https://example.edu/issuers/keys/1',
    await keyPair.export({ publicKey: true }));

  // set up the signature suite, using the generated key
  const suite = new Ed25519Signature2018({
    key: keyPair
  });

  // @ts-expect-error
  const credential = jsonld.clone({
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      // 'https://www.w3.org/2018/credentials/examples/v1'
    ],
    id: 'http://example.edu/credentials/1872',
    type: ['VerifiableCredential'],
    issuer: 'https://example.edu/issuers/565049',
    issuanceDate: '2010-01-01T19:23:24Z',
    credentialSubject: {
      id: 'https://jeswr.org/#me',
      ['http://example.edu/alumniOf']: 'Example University'
    }
  });
  const verifiableCredential = await vc.issue({
    credential,
    suite,
  });

  console.log(verifiableCredential);

  console.log(
    JSON.stringify(await vc.verifyCredential({
      credential: verifiableCredential,
      suite,
      documentLoader: testContextLoader,
    }), null, 2)
  );
}

main();
