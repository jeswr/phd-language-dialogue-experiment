import { AccessFlow, UserMessage } from "../ldo/accessRequest.typings";
import { EventConfirmationShape, ConfirmationShape } from "../ldo/conclusions.typings";

export interface ClientInterface {
    start(): Promise<void>;
    stop(): Promise<void>;
    accessFlow(req: AccessFlow['request']): Promise<AccessFlow['response']>;
    // FIXME: This can be improved
    eventConfirmation(shape: EventConfirmationShape): Promise<ConfirmationShape>
    // FIXME: This should be a shape rather than a string
    on(event: 'userInitiatedRequest', cb: (req: UserMessage) => void): void;
}
