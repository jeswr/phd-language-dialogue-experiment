import { parse } from 'shaclc-parse';
import { write } from '@jeswr/pretty-turtle';
import Writer from "@shexjs/writer";
import def from "@shexjs/parser";
import { Store, DataFactory } from "n3";
import { rdf } from "rdf-namespaces";
import { stringToTerm, termToString } from "rdf-string-ttl"
import * as fs from 'fs';
import * as path from 'path';
const { namedNode, literal, defaultGraph, quad } = DataFactory;

const shapesDir = './shapes';

// Get all .shaclc files in the shapes directory
const shaclcFiles = fs.readdirSync(shapesDir, { recursive: true }).filter(file => path.extname(file) === '.shaclc');

// Convert each .shaclc file to .ttl
shaclcFiles.forEach(async file => {
    const shaclcPath = path.join(shapesDir, file);
    const ttlPath = path.join(shapesDir, `${path.basename(file, '.shaclc')}.ttl`);
    const shapes = parse(fs.readFileSync(shaclcPath, 'utf8'));
    
    // Hacky SHACL -> SHEX
    const shapeStore = new Store(shapes);
    const shexShapes = [];
    for (const shape of shapeStore.getSubjects(rdf.type, namedNode('http://www.w3.org/ns/shacl#NodeShape'), defaultGraph())) {
        const eachOf = [];
        for (const property of shapeStore.getObjects(shape, namedNode('http://www.w3.org/ns/shacl#property'), defaultGraph())) {
            const minCount = shapeStore.getObjects(property, namedNode('http://www.w3.org/ns/shacl#minCount'), defaultGraph());
            const maxCount = shapeStore.getObjects(property, namedNode('http://www.w3.org/ns/shacl#maxCount'), defaultGraph());
            const datatype = shapeStore.getObjects(property, namedNode('http://www.w3.org/ns/shacl#datatype'), defaultGraph());
            const nodeKind = shapeStore.getObjects(property, namedNode('http://www.w3.org/ns/shacl#nodeKind'), defaultGraph());
            const pattern = shapeStore.getObjects(property, namedNode('http://www.w3.org/ns/shacl#pattern'), defaultGraph());
            const minLength = shapeStore.getObjects(property, namedNode('http://www.w3.org/ns/shacl#minLength'), defaultGraph());
            const maxLength = shapeStore.getObjects(property, namedNode('http://www.w3.org/ns/shacl#maxLength'), defaultGraph());
            const inValues = shapeStore.getObjects(property, namedNode('http://www.w3.org/ns/shacl#in'), defaultGraph());
            const hasValue = shapeStore.getObjects(property, namedNode('http://www.w3.org/ns/shacl#hasValue'), defaultGraph());
            const shapeRef = shapeStore.getObjects(property, namedNode('http://www.w3.org/ns/shacl#node'), defaultGraph());

            const path = shapeStore.getObjects(property, namedNode('http://www.w3.org/ns/shacl#path'), defaultGraph());

            if (path.length !== 1 || path[0].termType !== 'NamedNode') {
                throw new Error('Unsupported path');
            }

            let valueExpr = {
              "type": "NodeConstraint",
            }

            if (datatype.length === 1) {
              valueExpr.datatype = datatype[0].value;
            }
            if (nodeKind.length === 1) {
              valueExpr.nodeKind = nodeKind[0].value.split('#')[1].toLowerCase();
            }
            if (inValues.length === 1) {
              console.log('inValues', inValues, shapeStore.extractLists())
              const list = shapeStore.extractLists()[inValues[0].value];
              if (list) {
                // FIXME, make this work for literals
                valueExpr.values = list.map(v => v.value);
              }
            }
            if (shapeRef.length === 1) {
              // TODO: Error if there are any other constraints
              valueExpr = shapeRef[0].value;
            }
            // if (pattern.length === 1) {
            //   valueExpr.pattern = pattern[0].value;
            // }
            // if (minLength.length === 1) {
            //   valueExpr.minLength = minLength[0].value;
            // }

            eachOf.push({
              "type": "TripleConstraint",
              "predicate": path[0].value,
              "valueExpr": valueExpr,
              // FIXME: Int checks etc should be done here
              "min": minCount[0]?.value ?? 0,
              "max": maxCount[0]?.value ?? -1
            })
        }
        if (false) {
          shexShapes.push({
            "id": shape.value,
            "type": "ShapeDecl",
            "shapeExpr": eachOf[0]
          })
        } else {
          shexShapes.push({
            "id": shape.value,
            "type": "ShapeDecl",
            "shapeExpr": {
              "type": "Shape",
              "expression": {
                "type": "EachOf",
                "expressions": eachOf
              }
            }
          })
        }
        
    }

    // const ttl = shexWriter.write(shapes);
    // console.log(shapes.prefixes)

    // const ttl = await write(shapes, { prefixes: shapes.prefixes });
    // fs.writeFileSync(ttlPath, ttl);

//     console.log(def)

//     const parser = def.construct()

//     console.log(JSON.stringify(parser.parse(`
//     prefix xsd: <http://www.w3.org/2001/XMLSchema#>
// prefix ex: <http://example.org/test#>
// prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
// prefix sh: <http://www.w3.org/ns/shacl#>
// ex:AccessGrantShape  {
// ex:grantedGraphs [ex:unassigned ex:assigned];
// ex:grantedGraphs2 @ex:MyShapeRef
// }

//      `), null, 2))

    console.log(JSON.stringify(shexShapes, null, 2))

    const shexWriter = new Writer({ prefixes: shapes.prefixes });

    shexWriter.writeSchema(
        {
            "type": "Schema",
            "shapes": shexShapes
          },
          (error, text, prefixes) => {
            if (error)
              throw error;
            console.log(text);
          }
    )
});

function writeShexSchema(schema, prefixes) {
    const shexWriter = new Writer({ prefixes });
    return new Promise((resolve, reject) => {
        shexWriter.writeSchema(
            schema,
            (error, text, prefixes) => {
                if (error)
                    reject(error);
                resolve(text);
            }
        )
    });
}
