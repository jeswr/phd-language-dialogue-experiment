import { PolicyPlugin, IPolicyType, DemoPlugin, makeComponentsManager, EyeJsReasoner, executePolicies, parseAsN3Store, readText, EyeReasoner } from 'koreografeye';
import * as N3 from 'n3';
import * as path from 'path';
import { write } from "@jeswr/pretty-turtle";

async function main() {
    const inputData  = './input/demo.jsonld';
    const inputRules = './input/demo.n3';

    // Read the input graph as an N3 store
    const store  = await parseAsN3Store(inputData); 
    // Read the N3 rules as an array of strings
    const rules  = [readText(inputRules)]; 

    // Load the components we need for reasoning
    const manager = await makeComponentsManager(path.join(__dirname, 'config.jsonld'), __dirname);

    // Get a reasoner
    const reasoner = await manager.instantiate('urn:koreografeye:reasonerInstance');

    // Execute the reasoner (orch)
    const resultStore: N3.Store = await (reasoner as any).reason(store, rules);

    // Execute the policies (pol)
    const numOfErrors = await executePolicies(manager, resultStore);

    console.log(`Number of quads: ${await write([...resultStore], {
        prefixes: {
            as: 'https://www.w3.org/ns/activitystreams#',
            ex: 'http://example.org/',
            fno: 'https://w3id.org/function/ontology#'
        }
    })}`);



    // const componentsManager = await makeComponentsManager(path.join(__dirname, 'config.jsonld'), __dirname);
    // // console.log(Object.keys(componentsManager.componentResources).filter((key) => !key.includes('@comunica') && !key.includes('@solid')));
    // // console.log(componentsManager.componentResources);
    // // const publicKeyHandler = new PublicKeyHandler();
    // // const store = new N3.Store();
    // console.log(await executePolicies(componentsManager, store))

}

main();
