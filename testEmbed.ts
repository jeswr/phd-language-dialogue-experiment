// import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Index } from "@upstash/vector";
import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";
import { OpenAIEmbeddings } from "@langchain/openai";
import 'dotenv/config';

async function main() {
  const index = new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL as string,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN as string,
  });

  const vectorStore = await UpstashVectorStore.fromTexts(
    ["Hello world", "Bye bye", "hello nice world"],
    [{ id: 2 }, { id: 1 }, { id: 3 }],
    new OpenAIEmbeddings(),
    {
      index
    }
  );

  const resultOne = await vectorStore.similaritySearch("hello world", 1);
  console.log(resultOne);
  
}

main();

// import { Index } from "@upstash/vector";
// import { OpenAIEmbeddings } from "@langchain/openai";
// import { Document } from "@langchain/core/documents";
// import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";
// import 'dotenv/config';

// async function main() {
  // const index = new Index({
  //   url: process.env.UPSTASH_VECTOR_REST_URL as string,
  //   token: process.env.UPSTASH_VECTOR_REST_TOKEN as string,
  // });

//   console.log("Index created");
  
//   const embeddings = new OpenAIEmbeddings();

//   console.log("Embeddings created");
  
//   const UpstashVector = new UpstashVectorStore(embeddings, { index });

//   console.log("UpstashVector created");
  
//   // Creating the docs to be indexed.
//   const id = new Date().getTime();
//   const documents = [
//     new Document({
//       metadata: { name: id },
//       pageContent: "Hello there!",
//     }),
//     new Document({
//       metadata: { name: id },
//       pageContent: "What are you building?",
//     }),
//     new Document({
//       metadata: { time: id },
//       pageContent: "Upstash Vector is great for building AI applications.",
//     }),
//     new Document({
//       metadata: { time: id },
//       pageContent: "To be, or not to be, that is the question.",
//     }),
//   ];

//   console.log("Documents created");

//   // Creating embeddings from the provided documents, and adding them to Upstash database.
//   await UpstashVector.addDocuments(documents);

//   console.log("Documents added");
  

//   // Waiting vectors to be indexed in the vector store.
//   // eslint-disable-next-line no-promise-executor-return
//   await new Promise((resolve) => setTimeout(resolve, 1000));

//   console.log("Waiting for vectors to be indexed");

//   const queryResult = await UpstashVector.similaritySearchWithScore(
//     "Vector database",
//     2
//   );

//   console.log(queryResult);
// }

// main();
