import { Store } from 'n3';
import dereference from 'rdf-dereference';
import { promisifyEventEmitter } from 'event-emitter-promisify';

export async function dereferenceToStore(file: string) {
    const store = new Store();
    return promisifyEventEmitter(store.import((await dereference.dereference(file, { localFiles: true })).data), store);
}
