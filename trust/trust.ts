import { PolicyPlugin, IPolicyType, DemoPlugin, makeComponentsManager } from 'koreografeye';
import * as N3 from 'n3';
import * as path from 'path';

async function main() {
    const componentsManager = await makeComponentsManager(path.join(__dirname, 'config.jsonld'));
    console.log(Object.keys(componentsManager.componentResources).filter((key) => !key.includes('@comunica') && !key.includes('@solid')));
    // console.log(componentsManager.componentResources);
    // const publicKeyHandler = new PublicKeyHandler();

}

main();
