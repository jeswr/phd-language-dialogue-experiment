import { write } from '@jeswr/pretty-turtle';
import { DatasetCore } from '@rdfjs/types';

export async function postDataset(url: string, data: DatasetCore) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/turtle',
    },
    body: await write([...data]),
  });
}
