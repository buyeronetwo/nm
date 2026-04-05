import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(scriptDirectory, '..')
const dataVacancies = join(projectRoot, 'data', 'vacancies.json')
const seedVacancies = join(projectRoot, 'data', 'vacancies.seed.json')
const destination = join(projectRoot, 'public', 'vacancies.json')

const sourcePath = existsSync(dataVacancies) ? dataVacancies : seedVacancies

mkdirSync(dirname(destination), { recursive: true })
copyFileSync(sourcePath, destination)

const label = sourcePath === dataVacancies ? 'data/vacancies.json' : 'data/vacancies.seed.json'
console.info(`[copy-vacancies] ${label} → public/vacancies.json`)
