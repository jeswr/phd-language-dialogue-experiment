import { parse } from 'shaclc-parse';
import { write } from '@jeswr/pretty-turtle';
import * as fs from 'fs';
import * as path from 'path';

const shapesDir = './shapes';

// Get all .shaclc files in the shapes directory
const shaclcFiles = fs.readdirSync(shapesDir).filter(file => path.extname(file) === '.shaclc');

// Convert each .shaclc file to .ttl
shaclcFiles.forEach(async file => {
    const shaclcPath = path.join(shapesDir, file);
    const ttlPath = path.join(shapesDir, `${path.basename(file, '.shaclc')}.ttl`);

    const shaclc = fs.readFileSync(shaclcPath, 'utf8');
    const shapes = parse(shaclc);
    const ttl = await write(shapes, { prefixes: shapes.prefixes });
    fs.writeFileSync(ttlPath, ttl);
});
