import { LdoBase, LdoBuilder, createLdoDataset, getDataset } from "@ldo/ldo";
import rdfHandler from '@rdfjs/express-handler';
import termSet from '@rdfjs/term-set';
import { BlankNode, NamedNode } from "@rdfjs/types";
import express from 'express';
import { AccessRequestShapeShapeType, AccessGrantsShapeShapeType } from "../ldo/accessRequest.shapeTypes";
import { getSubjects, postDataset } from "../utils";
import { ClientInterface } from "./clientInterface";

export class ClientServer {
    private readonly app: express.Express;
    private _server: ReturnType<typeof this.app.listen> | undefined = undefined;

    constructor(private readonly port: number = 3000, private readonly client: ClientInterface, private readonly server: string = 'http://localhost:3001/') {
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
            const accessGrantShape = ldoDataset.usingType(AccessGrantsShapeShapeType);
            for (const data of matches(subjects, accessRequestShape)) {
                this.client.accessFlow(data)
                    .then((response) => {
                        const dataset = getDataset(accessGrantShape.fromJson(response));
                        postDataset(this.server, dataset);
                    })
                    .catch(console.error);
            }

            return res.status(200).send('Dataset received');
        });
    }

    async start() {
        await this.client.start();
        this._server = this.app.listen(this.port);
    }

    async stop() {
        this._server?.close();
        await this.client.stop();
    }
}

function* matches<T extends LdoBase>(subjects: termSet<NamedNode<string> | BlankNode>, shapeBuilder: LdoBuilder<T>) {
    for (const subject of subjects) {
        try {
            yield shapeBuilder.fromSubject(subject);
        } catch (e) {
            // Do nothing, not all subjects will match every shape
        }
    }
}
