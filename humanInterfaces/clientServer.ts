import { createLdoDataset, getDataset } from "@ldo/ldo";
import rdfHandler from '@rdfjs/express-handler';
import express from 'express';
import { AccessRequestShapeShapeType, AccessGrantsShapeShapeType, UserMessageShapeType } from "../ldo/accessRequest.shapeTypes";
import { getSubjects, postDataset } from "../utils";
import { ClientInterface } from "./clientInterface";
import { matches } from "../utils/matches";

export class ClientServer {
    private readonly app: express.Express;
    private _server: ReturnType<typeof this.app.listen> | undefined = undefined;

    constructor(
        private readonly port: number,
        private readonly client: ClientInterface,
        // How do we verify the validity of requests coming from this URL
        private readonly server: string,
        // Should this be made available here?
        private readonly agentId: string
    ) {
        this.app = express();
        this.app.use(rdfHandler());

        this.app.post('/', async (req, res) => {
            const dataset = await req.dataset?.();

            if (!dataset) {
                return res.status(400).send('Invalid request');
            }

            const ldoDataset = createLdoDataset([...dataset]);
            const subjects = getSubjects(ldoDataset);
            
            // FIXME: Generalise this
            const accessRequestShape = ldoDataset.usingType(AccessRequestShapeShapeType);
            // IMPORTANT: We don't actually care about the input data when constructing
            // the grant response so I'm not quite sure what's going on here
            const accessGrantShape = ldoDataset.usingType(AccessGrantsShapeShapeType);
            for (const data of matches(subjects, accessRequestShape)) {
                this.client.accessFlow(data)
                    .then((response) => {
                        // TODO: Check if this is sensible
                        response['@id'] ??= this.agentId;
                        const dataset = getDataset(accessGrantShape.fromJson(response));
                        postDataset(this.server, dataset);
                    })
                    .catch(console.error);
            }

            return res.status(200).send('Dataset received');
        });
    }

    async start() {
        // This only makes sense on pop-out tabs and should be removed in the future
        console.clear();
        // FIXME use WebId to make this a string
        // console.log(`Terminal for ${this.agentId} running on http://localhost:${this.port}/`);

        this.client.on('userInitiatedRequest', (msg) => {
            const userMessageShape = createLdoDataset([]).usingType(UserMessageShapeType);
            msg['@id'] ??= this.agentId;
            const dataset = getDataset(userMessageShape.fromJson(msg));
            postDataset(this.server, dataset);
        });

        await this.client.start();
        this._server = this.app.listen(this.port);
    }

    async stop() {
        this._server?.close();
        await this.client.stop();
    }
}
