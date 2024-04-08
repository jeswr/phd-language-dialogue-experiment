// @ts-nocheck
async function main() {
  const vc = await import('@digitalbazaar/vc')  
  const EcdsaMultikey = await import('@digitalbazaar/ecdsa-multikey');
    const {
      CONTEXT_V1: odrlCtx,
      CONTEXT_URL_V1: odrlCtxUrl
    } = await import('@digitalbazaar/odrl-context');
    const {
      CONTEXT_V1: vcExamplesV1Ctx,
      CONTEXT_URL_V1: vcExamplesV1CtxUrl
    } = await import('@digitalbazaar/credentials-examples-context');
    const {Ed25519Signature2018} = await import('@digitalbazaar/ed25519-signature-2018');
    const {
      Ed25519VerificationKey2018
    } = await import('@digitalbazaar/ed25519-verification-key-2018');
    const jsigs = (await import('jsonld-signatures')).default;
    const jsonld = (await import("jsonld")).default;


const remoteDocuments = new Map();
remoteDocuments.set(vcExamplesV1CtxUrl, vcExamplesV1Ctx);
remoteDocuments.set(odrlCtxUrl, odrlCtx);

const {extendContextLoader} = jsigs;
const {defaultDocumentLoader} = vc;

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

  // set up the Ed25519 key pair that will be signing and verifying
  const keyPair = await Ed25519VerificationKey2018.generate({
    id: 'https://example.edu/issuers/keys/1',
    controller: 'https://example.edu/issuers/565049'
  });

  remoteDocuments.set(
    'https://example.edu/issuers/keys/1',
    await keyPair.export({publicKey: true}));

  // set up the signature suite, using the generated key
  const suite = new Ed25519Signature2018({
    // verificationMethod: 'https://example.edu/issuers/keys/1',
    key: keyPair
  });

    // set up the ECDSA key pair that will be signing and verifying
  const ecdsaKeyPair = await EcdsaMultikey.generate({
    curve: 'P-256',
    id: 'https://example.edu/issuers/keys/2',
    controller: 'https://example.edu/issuers/565049'
  });

  // add the key to the controller doc (authorizes its use for assertion)
  // assertionController.assertionMethod.push(ecdsaKeyPair.id);
  // register the key document with documentLoader
  remoteDocuments.set(
    'https://example.edu/issuers/keys/2',
    await ecdsaKeyPair.export({publicKey: true}));
    

    const credential = jsonld.clone({
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1'
      ],
      id: 'http://example.edu/credentials/1872',
      type: ['VerifiableCredential', 'AlumniCredential'],
      issuer: 'https://example.edu/issuers/565049',
      issuanceDate: '2010-01-01T19:23:24Z',
      credentialSubject: {
        id: 'https://jeswr.org/#me',
        alumniOf: '<span lang="en">Example University</span>'
      }
    });
    const verifiableCredential = await vc.issue({
      credential,
      suite,
      documentLoader: testContextLoader
    });
    console.log(suite, JSON.stringify(verifiableCredential, null, 2));
}

main();
