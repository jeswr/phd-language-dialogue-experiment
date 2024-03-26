import { Store } from 'n3';
import dereference, { type IDereferenceOptions } from 'rdf-dereference';
import { promisifyEventEmitter } from 'event-emitter-promisify';

// FIXME: Work out why this default thing is happening
function deref(url: string, options: IDereferenceOptions) {
    return dereference.dereference(url, options);
}
export async function dereferenceToStore(file: string) {
    const store = new Store();
    return promisifyEventEmitter(store.import((await deref(file, { localFiles: true })).data), store);
}
