import { AccessFlow } from "../ldo/accessRequest.typings";

export interface ClientInterface {
    accessFlow(req: AccessFlow['request']): Promise<AccessFlow['response']>;
}
