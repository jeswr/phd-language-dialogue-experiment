import { input, select } from '@inquirer/prompts';
import { AccessGrantsShape, AccessRequestShape, UserMessage } from '../ldo/accessRequest.typings';
import { ClientInterface } from './clientInterface';
import EventEmitter from 'events';

// const defaultInput = () => input({ message: "Let me know if there is anything I can do for you." });
const defaultInput = () => input({ message: "" });

type CancelablePromise<T> = ReturnType<typeof select<T>>;

export class CliInterface implements ClientInterface {
    private actions: [(() => void), (() => void)][] = [];
    private input: ReturnType<typeof input> | undefined;
    private currentAction: CancelablePromise<unknown> | undefined;
    private readonly eventEmitter = new EventEmitter();

    constructor() {
    }

    public async start() {
        this.registerInput();
    }

    public async stop() {
        // Reject all queued actions
        let action = this.actions.shift();
        while (action) {
            action[1]();
            action = this.actions.shift();
        }

        if (this.input) {
            this.input.cancel();
            this.input = undefined;
        }
        if (this.currentAction) {
            this.currentAction.cancel();
            this.currentAction = undefined;
        }
    }

    private registerInput(expectExistingInput: boolean = false) {
        if (expectExistingInput ? !this.input : this.input) {
            throw new Error(`Attempting to register input when one is ${expectExistingInput ? '' : 'not '}already registered`);
        }
        this.input = defaultInput();
        this.input.then(res => {
            // console.log('✓');
            this.eventEmitter.emit('userInitiatedRequest', { text: res } as UserMessage)
            this.registerInput(true);
        }).catch(() => {
            /* this means it has been cancelled */
        })
    }

    // TODO: Have a proper shape for this
    public on(event: 'userInitiatedRequest', cb: (req: UserMessage) => void): void {
        this.eventEmitter.on(event, cb);
    }

    private async getBaton() {
        if (this.input) {
            this.input.cancel();
            this.input = undefined;
            return;
        }
        return new Promise<void>((resolve, reject) => {
            this.actions.push([resolve, reject]);
        });
    }

    private returnBaton() {
        const action = this.actions.shift();
        if (action) {
            action[0]();
        } else {
            this.registerInput();
        }
    }

    private async select<T>(...args: Parameters<typeof select<T>>): Promise<ReturnType<typeof select<T>>> {
        await this.getBaton();
        this.currentAction = select(...args);
        const answer = await (this.currentAction as CancelablePromise<T>);
        this.returnBaton();
        return answer;
    }

    async accessFlow(req: AccessRequestShape): Promise<AccessGrantsShape> {
        const choices = [
            {
                value: "ReadOnce",
                name: "Once",
                description: "Provide access to the data this time only",
            },
            {
                value: "Read",
                name: "Always",
                description: "Provide access to the data indefinitely",
            },
            {
                value: "No",
                name: "No",
                description: "Do not provide access to the data",
            },
        ]

        if (req.requestedGraphs.length > 1) {
            choices.push({
                value: "Custom",
                name: "Custom",
                description: "Apply different permissions for each document",
            });
        }

        const permissions = await this.select({
            message: `In order to [${req.purposeDescription}] do you consent to provide <${req.requestor['@id']}> with access to the following data [${req.requestedGraphs.join(', ')}]`,
            choices: choices,
        });

        if (permissions === "Custom") {
            const grants: AccessGrantsShape['grants'] = [];
            for (const graph of req.requestedGraphs) {
                const permissions = await this.select({
                    message: `Select permissions for [${graph}]`,
                    choices: choices.slice(0, 3),
                });
                if (permissions === "ReadOnce" || permissions === "Read") {
                    grants.push({
                        grantedGraphs: [graph],
                        modes: [
                            {
                                "@id": permissions,
                            },
                        ],
                    });
                }
            }
            return { grants, processId: req.processId };
        }

        if (permissions === "ReadOnce" || permissions === "Read") {
            return {
                processId: req.processId,
                grants: [
                    {
                        grantedGraphs: req.requestedGraphs,
                        modes: [
                            {
                                "@id": permissions,
                            },
                        ],
                    },
                ],
            };
        }

        return {
            processId: req.processId,
            grants: [],
        };
    }
}

// const app = express();
// app.use(rdfHandler());


// async function main() {
//     const ip = await input({ message: "What can I do for you?" });
// }

// main();




















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

// const permissions = await inquirer.prompt([{
//     // FIXME: This should just be the predicate that we are using
//     name: "permissions",
//     type: "list",
//     message: "In order to proceed do you agree to provide {} with access to {}",
//     choices: [
//         "One time only",
//         "Indefinitely (I will provide access to all future requests without asking beforehand)",
//         "Not this time",
//         "Never (I won't ask you again)",
//     ],
// }]);

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
