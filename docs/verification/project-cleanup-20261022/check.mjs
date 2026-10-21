// Run from the project root. Does not open a browser or alter learning records.
// Historical baselines/results stay unchanged; only explicitly retired files
// are excluded from their old source inventory, never from activity contracts.
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'

const reportDirectory = 'docs/verification/project-cleanup-20261022'
const retired = JSON.parse(fs.readFileSync(`${reportDirectory}/retired-sources.json`, 'utf8'))
assert.equal(process.argv.includes('--snapshot'), false, 'Do not replace historical baselines')
assert.equal(new Set(retired.removedPaths).size, 45)
for (const file of retired.removedPaths) assert.equal(fs.existsSync(file), false, file)
for (const file of retired.protectedSharedFiles) assert.ok(fs.existsSync(file), file)
const deleted = execFileSync('git', ['diff', '--name-only', '--diff-filter=D', '--', 'src'], { encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean)
assert.deepEqual(deleted.sort(), [...retired.removedPaths].sort())
const changedLiveSource = execFileSync('git', ['diff', '--name-only', '--diff-filter=ACMRT', '--', 'src'], { encoding: 'utf8' }).trim()
assert.equal(changedLiveSource, '', 'Cleanup must not edit live application source')

// Reuse the existing complete contract suite. Redirect new reports only.
let source = fs.readFileSync('output/responsive-20261021/contracts.mjs', 'utf8')
assert.ok(source.includes("const out=path.resolve('output/responsive-20261021')"))
source = source.replace("const out=path.resolve('output/responsive-20261021')", `const out=path.resolve('${reportDirectory}')`)
const baselineLine = "const baseline=JSON.parse(fs.readFileSync(path.join(out,'baseline.json'),'utf8'))"
assert.ok(source.includes(baselineLine))
source = source.replace(baselineLine, `
const baseline=JSON.parse(fs.readFileSync('output/responsive-20261021/baseline.json','utf8'))
const retired=JSON.parse(fs.readFileSync('${reportDirectory}/retired-sources.json','utf8'))
const exclusions={protectedSources:[],eventProjections:[]}
for(const section of Object.keys(exclusions))for(const file of retired.removedPaths){
 if(Object.hasOwn(baseline[section],file)){
  assert.equal(fs.existsSync(file),false,'Only removed unreachable files may be excluded')
  exclusions[section].push(file)
  delete baseline[section][file]
 }
}
assert.deepEqual(snapshot.counts.answers,115)
assert.deepEqual(snapshot.counts.submissions,106)
fs.writeFileSync(path.join(out,'historical-inventory-exclusions.json'),JSON.stringify(exclusions,null,2)+'\\n')
`)
await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)

// Reuse only the original finite-difference mathematics, not its old task-count
// assumptions or its writes to the preserved 2026-10-19 result files.
let finite = fs.readFileSync('output/foundations-20261019/check.mjs', 'utf8')
finite = finite.slice(0, finite.indexOf('const ids=new Set()'))
finite = finite.replace("const ui=load('src/lessons/foundations/TeachingUI.tsx')", '')
finite = finite.replace("const {curriculum}=load('src/lessons/foundations/curriculum.ts')", '')
finite += `
const result={scope:'Finite differences for all original model parameters; no UI or storage access',status:'passed',parameters:reports.reduce((count,r)=>count+r.gradients.dw.flat().length+r.gradients.db.length+r.gradients.dv.flat().length+r.gradients.dbo.length,0),reports}
fs.writeFileSync('${reportDirectory}/finite-differences.json',JSON.stringify(result,null,2)+'\\n')
console.log(JSON.stringify({finiteDifferences:result.status,parameters:result.parameters}))
`
await import(`data:text/javascript;base64,${Buffer.from(finite).toString('base64')}`)
console.log(JSON.stringify({retiredFiles: retired.removedPaths.length, liveSourceEdits: 0, historicalBaselinesOverwritten: false, reportDirectory: path.resolve(reportDirectory)}))
