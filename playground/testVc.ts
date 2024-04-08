// @ts-nocheck
import { v4 } from 'uuid';

async function main() {
  const EcdsaMultikey = await import('@digitalbazaar/ecdsa-multikey');
  const ecdsaSd2023Cryptosuite = await import('@digitalbazaar/ecdsa-sd-2023-cryptosuite');
  const vc = await import('@digitalbazaar/vc');
  const {DataIntegrityProof} = await import('@digitalbazaar/data-integrity');
  const { securityLoader } = await import('@digitalbazaar/security-document-loader');
  const secCtx = await import('@digitalbazaar/security-context');
  const webkmsCtx = await import('webkms-context');
  const zcapCtx = await import('zcap-context');
  
  const ecdsaKeyPair = await EcdsaMultikey.generate({
    curve: 'P-256',
    id: 'https://example.edu/issuers/keys/2',
    controller: 'https://example.edu/issuers/565049'
  });
  
  // sample exported key pair
  /*
  {
    "@context": "https://w3id.org/security/multikey/v1",
    "id": "https://example.edu/issuers/keys/2",
    "type": "Multikey",
    "controller": "https://example.edu/issuers/565049",
    "publicKeyMultibase": "zDnaeWJjGpXnQAbEpRur3kSWFapGZbwGnFCkzyhiq7nDeXXrM",
    "secretKeyMultibase": "z42trzSpncjWFaB9cKE2Gg5hxtbuAQa5mVJgGwjrugHMacdM"
  }
  */
  
  // sample unsigned credential
  const credential = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      // "https://www.w3.org/2018/credentials/examples/v1"
    ],
    "id": "https://example.com/credentials/1872",
    "type": ["VerifiableCredential", "AlumniCredential"],
    "issuer": "https://example.edu/issuers/565049",
    "issuanceDate": "2010-01-01T19:23:24Z",
    "credentialSubject": {
      "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
      "alumniOf": "Example University"
    }
  };
  
  // setup ecdsa-sd-2023 suite for signing selective disclosure VCs
  const suite = new DataIntegrityProof({
    signer: ecdsaKeyPair.signer(),
    cryptosuite: ecdsaSd2023Cryptosuite.createSignCryptosuite({
      // require the `issuer` and `issuanceDate` fields to always be disclosed
      // by the holder (presenter)
      mandatoryPointers: [
        '/issuanceDate',
        '/issuer'
      ]
    })
  });
  // use a proof ID to enable it to be found and transformed into a disclosure
  // proof by the holder later
  const proofId = `urn:uuid:${v4()}`;
  suite.proof = {id: proofId};

  // const documentLoader = securityLoader().build();

  const documentLoader = vc.defaultDocumentLoader()
  console.log(documentLoader)
  // loader.addStatic(
  //   secCtx.SECURITY_CONTEXT_V2_URL,
  //   secCtx.contexts.get(secCtx.SECURITY_CONTEXT_V2_URL)
  // );
  // loader.addStatic(webkmsCtx.CONTEXT_URL, webkmsCtx.CONTEXT);
  // loader.addStatic(zcapCtx.CONTEXT_URL, zcapCtx.CONTEXT);
  // const documentLoader = loader.build();
  // const documentLoader = vc.defaultDocumentLoader()
  
  const signedVC = await vc.issue({credential, suite, documentLoader});
  console.log(JSON.stringify(signedVC, null, 2));
  
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
