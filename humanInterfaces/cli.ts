import inquirer from "inquirer";
import express from "express";
import rdfHandler from '@rdfjs/express-handler';

const app = express();
app.use(rdfHandler());

// FIXME: We should probably evolve towards having an interface that handles
// most of the queing of posted actions and then we just implement actions
// required by different messages
app.post('/', async (req, res) => {
    const dataset = await req.dataset?.();
    console.log("Dataset posted to Bob\n", dataset?.size);
    res.status(200).send('Hello from Bob');
});

async function main() {
    const answer = await inquirer.prompt([{
        // FIXME: This should just be the predicate that we are using
        name: "action",
        type: "string",
        message: "How can I help you today?",
    }]);

    const permissions = await inquirer.prompt([{
        // FIXME: This should just be the predicate that we are using
        name: "permissions",
        type: "list",
        message: "In order to proceed do you agree to provide {} with access to {}",
        choices: [
            "One time only",
            "Indefinitely (I will provide access to all future requests without asking beforehand)",
            "Not this time",
            "Never (I won't ask you again)",
        ],
    }]);

    console.log(answer, permissions);
}

main();

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
