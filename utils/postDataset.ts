import { write } from '@jeswr/pretty-turtle';
import { DatasetCore } from '@rdfjs/types';
import { Writer } from 'n3';

export async function postDataset(url: string, data: DatasetCore) {
  const writer = new Writer({
    format: 'application/trig',
  
  });
  return fetch(url, {
    method: 'POST',
    headers: {
      // 'Content-Type': 'text/turtle',
      'Content-Type': 'application/trig',
    },
    body: writer.quadsToString([...data]),
  });
}
