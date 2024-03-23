import { AccessRequestShapeShapeType } from "../ldo/accessRequest.shapeTypes";
import { createLdoDataset, ShapeType, type LdoDataset } from "@ldo/ldo";
// ... Get the LdoDataset
import express from 'express';
import rdfHandler from '@rdfjs/express-handler';
import termSet from '@rdfjs/term-set';
import { getSubjects } from "../utils";
import { ClientInterface } from "./clientInterface";

const shapesToHandle = [
    AccessRequestShapeShapeType
];

export class ClientServer {
    private readonly app: express.Express;

    constructor(private readonly port: number = 3000, private readonly client: ClientInterface) {
        this.app = express();
        this.app.use(rdfHandler());

        this.app.post('/', async (req, res) => {
            const dataset = await req.dataset?.();

            if (!dataset) {
                return res.status(400).send('Invalid request');
            }

            const ldoDataset = createLdoDataset([...dataset]);
            const subjects = getSubjects(ldoDataset);
            for (const shape of shapesToHandle) {
                const shapeBuilder = ldoDataset.usingType(shape);
                for (const subject of subjects) {
                    if (subject.termType === 'NamedNode' || subject.termType === 'BlankNode') {
                        try {
                            const data = shapeBuilder.fromSubject(subject);
                        } catch (e) {
                            // Do nothing, not all subjects will match every shape
                        }
                    }
                }
            }

            return res.status(200).send('Dataset received');
        });
    }

    start() {
        return this.app.listen(this.port);
    }
}
