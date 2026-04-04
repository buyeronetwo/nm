import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'

import lockfile from 'proper-lockfile'

import { type Vacancy, parseVacanciesJson } from './types'

export function getVacanciesFilePath(projectRoot: string, environment: Record<string, string>): string {
  const configuredPath = environment.VACANCIES_FILE?.trim()
  if (configuredPath && configuredPath.length > 0) {
    return path.isAbsolute(configuredPath)
      ? configuredPath
      : path.resolve(projectRoot, configuredPath)
  }
  return path.join(projectRoot, 'data', 'vacancies.json')
}

async function ensureParentDirectoryExists(filePath: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true })
}

async function ensureVacanciesFileExists(filePath: string): Promise<void> {
  await ensureParentDirectoryExists(filePath)
  try {
    await readFile(filePath, 'utf8')
  } catch {
    await writeFile(filePath, '[]\n', 'utf8')
  }
}

export async function readVacancies(
  projectRoot: string,
  environment: Record<string, string>,
): Promise<Vacancy[]> {
  const filePath = getVacanciesFilePath(projectRoot, environment)
  try {
    const raw = await readFile(filePath, 'utf8')
    return parseVacanciesJson(raw)
  } catch {
    return []
  }
}

async function writeVacanciesUnlocked(filePath: string, vacancies: Vacancy[]): Promise<void> {
  await ensureParentDirectoryExists(filePath)
  const payload = `${JSON.stringify(vacancies, null, 2)}\n`
  const temporaryPath = `${filePath}.${process.pid}.${Date.now()}.tmp`
  await writeFile(temporaryPath, payload, 'utf8')
  await rename(temporaryPath, filePath)
}

export async function appendVacancy(
  projectRoot: string,
  environment: Record<string, string>,
  vacancy: Vacancy,
): Promise<void> {
  const filePath = getVacanciesFilePath(projectRoot, environment)
  await ensureVacanciesFileExists(filePath)
  let releaseLock: (() => Promise<void>) | undefined
  try {
    releaseLock = await lockfile.lock(filePath, {
      retries: { retries: 8, minTimeout: 50, maxTimeout: 250 },
    })
    const raw = await readFile(filePath, 'utf8')
    const current = parseVacanciesJson(raw)
    current.push(vacancy)
    await writeVacanciesUnlocked(filePath, current)
  } finally {
    if (releaseLock) {
      await releaseLock().catch(() => undefined)
    }
  }
}

export async function removeVacancyById(
  projectRoot: string,
  environment: Record<string, string>,
  vacancyId: string,
): Promise<boolean> {
  const filePath = getVacanciesFilePath(projectRoot, environment)
  await ensureVacanciesFileExists(filePath)
  let releaseLock: (() => Promise<void>) | undefined
  try {
    releaseLock = await lockfile.lock(filePath, {
      retries: { retries: 8, minTimeout: 50, maxTimeout: 250 },
    })
    const raw = await readFile(filePath, 'utf8')
    const current = parseVacanciesJson(raw)
    const nextList = current.filter((item) => item.id !== vacancyId)
    if (nextList.length === current.length) {
      return false
    }
    await writeVacanciesUnlocked(filePath, nextList)
    return true
  } finally {
    if (releaseLock) {
      await releaseLock().catch(() => undefined)
    }
  }
}
