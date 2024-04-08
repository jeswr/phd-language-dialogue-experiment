import { MomentoVectorIndex } from "@langchain/community/vectorstores/momento_vector_index";
// For browser/edge, adjust this to import from "@gomomento/sdk-web";
import {
  PreviewVectorIndexClient,
  VectorIndexConfigurations,
  CredentialProvider,
} from "@gomomento/sdk";
import { OpenAIEmbeddings } from "@langchain/openai";
import { sleep } from "langchain/util/time";
import 'dotenv/config';

async function main() {
    const vectorStore = new MomentoVectorIndex(new OpenAIEmbeddings(), {
        client: new PreviewVectorIndexClient({
          configuration: VectorIndexConfigurations.Laptop.latest(),
          credentialProvider: CredentialProvider.fromEnvironmentVariable({
            environmentVariableName: "MOMENTO_API_KEY",
          }),
        }),
        indexName: "langchain-example-index",
      });

      

      // because indexing is async, wait for it to finish to search directly after
      await sleep();
      
      const response = await vectorStore.similaritySearchWithScore("hello", 3);
      console.log(response);
      
      /*
      [
        Document { pageContent: 'hello world', metadata: {} },
        Document { pageContent: 'salutations world', metadata: {} }
      ]
      */
}

main();
