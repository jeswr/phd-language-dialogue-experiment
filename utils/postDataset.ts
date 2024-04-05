import { DatasetCore } from '@rdfjs/types';
import { Writer } from 'n3';
import { write } from '@jeswr/pretty-turtle';

export async function postDataset(url: string, data: DatasetCore) {
  const writer = new Writer({
    format: 'application/trig-star',
  
  });
  // const res = [...data].map(quad => quad.graph);
  // console.log(res);
  return fetch(url, {
    method: 'POST',
    headers: {
      // 'Content-Type': 'text/turtle',
      'Content-Type': 'application/trig',
    },
    // body: writer.quadsToString([...data]),
    body: await write([...data], {
      format: 'text/turtle',
    }),
  });
}
