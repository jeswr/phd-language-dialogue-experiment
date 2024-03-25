import { AccessFlow } from "../ldo/accessRequest.typings";

export interface ClientInterface {
    start(): Promise<void>;
    stop(): Promise<void>;
    accessFlow(req: AccessFlow['request']): Promise<AccessFlow['response']>;
}
