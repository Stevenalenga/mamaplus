import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { openApiSpec } from '../src/openapi'

const dest = path.resolve(__dirname, '../../../docs/openapi.json')
writeFileSync(dest, JSON.stringify(openApiSpec, null, 2))
console.log(`Wrote ${dest}`)
