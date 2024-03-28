import { input, select } from '@inquirer/prompts';
import { AccessGrantsShape, AccessRequestShape, UserMessage } from '../ldo/accessRequest.typings';
import { ClientInterface } from './clientInterface';
import EventEmitter from 'events';
import { ConfirmationShape, EventConfirmationShape } from '../ldo/conclusions.typings';
import { displayEventShape } from './conclusions';

// const defaultInput = () => input({ message: "Let me know if there is anything I can do for you." });
const defaultInput = () => input({
    message: "",
    // FIXME: Remove this default outside of dev
    default: "Schedule a half hour meeting with Nigel next week",
});

type CancelablePromise<T> = ReturnType<typeof select<T>>;

export class CliInterface implements ClientInterface {
    private actions: [(() => void), (() => void)][] = [];
    private input: ReturnType<typeof input> | undefined;
    private currentAction: CancelablePromise<unknown> | undefined;
    private readonly eventEmitter = new EventEmitter();

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
    
    async eventConfirmation(shape: EventConfirmationShape): Promise<ConfirmationShape> {
        const description = displayEventShape(shape.event);
        const response = await this.select({
            message: description,
            choices: [
                {
                    value: true,
                    name: "Yes",
                },
                {
                    value: false,
                    name: "No",
                },
            ],
        });
        return {
            confirm: response,
            processId: shape.processId,
        };
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
            message: `In order to [${req.purposeDescription}] do you consent to provide <${req.requestor['@id']}> with access to the following data [${req.requestedGraphs.map(graph => graph['@id']).join(', ')}]`,
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
