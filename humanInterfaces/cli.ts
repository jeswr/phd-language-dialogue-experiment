import { input, confirm } from '@inquirer/prompts';
import express from 'express';
import rdfHandler from '@rdfjs/express-handler'



const app = express();
app.use(rdfHandler());

const defaultInput = () => input({ message: "What can I do for you?" });

async function main() {
    const ip = await input({ message: "What can I do for you?" });
}

main();




















// setTimeout(() => {}, 10_000);

// const answers = {
//   firstName: await input({ message: "What's your first name?" }, {
//     clearPromptOnDone: true
//   }),
//   allowEmail: await confirm({ message: 'Do you allow us to send you email?' }),
// };
// const answer = confirm(...); // note: for this you cannot use `await`

// answer.cancel();



// import inquirer, { type Answers } from "inquirer";
// import express from "express";
// import rdfHandler from '@rdfjs/express-handler';
// import Rx from "rxjs";



// const answer = inquirer.prompt([{
//     // FIXME: This should just be the predicate that we are using
//     name: "action",
//     type: "string",
//     message: "How can I help you today?",
// }]);

// answer.ui.



// const prompts = new Rx.Subject<Answers>();
// const data = inquirer.prompt(prompts);

// const ui = new inquirer.ui.BottomBar();
// console.clear();
// ui.updateBottomBar('Wait for it... \n');

// inquirer.ui.on
// ui.log.write("Hello from Bob");

// At some point in the future, push new questions

// setTimeout(() => {
//     prompts.next({
//         name: "action",
//         type: "string",
//         message: "How can I help you today?",
//     });
// }, 3_000);

// prompts.next({
//     name: "action",
//     type: "string",
//     message: "How can I help you today 1?",
// });
// prompts.next({
//     name: "action",
//     type: "string",
//     message: "How can I help you today?",
// });
// prompts.complete();

// data.ui.process.subscribe((answers) => {
//     console.log(answers);
// });

// prompts.next({
//   /* question... */
// });

// When you're done
// prompts.complete();

// const app = express();
// app.use(rdfHandler());

// // FIXME: We should probably evolve towards having an interface that handles
// // most of the queing of posted actions and then we just implement actions
// // required by different messages
// app.post('/', async (req, res) => {
//     const dataset = await req.dataset?.();
//     console.log("Dataset posted to Bob\n", dataset?.size);
//     res.status(200).send('Hello from Bob');
// });

// async function main() {
    // const answer = await inquirer.prompt([{
    //     // FIXME: This should just be the predicate that we are using
    //     name: "action",
    //     type: "string",
    //     message: "How can I help you today?",
    // }]);

//     const permissions = await inquirer.prompt([{
//         // FIXME: This should just be the predicate that we are using
//         name: "permissions",
//         type: "list",
//         message: "In order to proceed do you agree to provide {} with access to {}",
//         choices: [
//             "One time only",
//             "Indefinitely (I will provide access to all future requests without asking beforehand)",
//             "Not this time",
//             "Never (I won't ask you again)",
//         ],
//     }]);

//     console.log(answer, permissions);
// }

// main();

// inquirer.prompt(["How can I help you today?"])
//   .then((answers) => {
//     console.log(answers);
//   })
//   .catch((error) => {
//     if (error.isTtyError) {
//       // Prompt couldn't be rendered in the current environment
//     } else {
//       // Something else went wrong
//     }
//   });
