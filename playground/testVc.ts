// import {} from "@web5/common";
// import { VerifiableCredential } from "@web5/credentials";
// import { DidKey } from "@web5/dids";


// async function main() {
//   class StreetCredibility {
//     constructor(public readonly localRespect: string, public readonly legit: boolean) {
//     }
//   }

//   const vc = await VerifiableCredential.create({
//     type: "StreetCred",
//     issuer: "did:example:issuer",
//     subject: "did:example:subject",
//     data: new StreetCredibility("high", true)
//   });

//   const key = DidKey.create();

//   vc.sign()
//   // console.log(vc.sign);
// }

// @ts-ignore
// import vc from '@digitalbazaar/vc';
// @ts-ignore
// import {Ed25519VerificationKey2020} from '@digitalbazaar/ed25519-verification-key-2020';
// @ts-ignore
// import {Ed25519Signature2020} from '@digitalbazaar/ed25519-signature-2020';

async function main() {
  // @ts-ignore
  const vc = await import('@digitalbazaar/vc');

  // const keyPair = await Ed25519VerificationKey2020.generate();
  // const suite = new Ed25519Signature2020({key: keyPair});  
}

main();
