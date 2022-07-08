import { readFile } from 'node:fs/promises'


export function readSrc(path: string) {
    return readFile(path, { encoding: 'utf-8' })
}