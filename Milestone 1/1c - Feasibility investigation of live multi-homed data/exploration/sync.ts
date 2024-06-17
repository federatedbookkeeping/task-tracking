import { readFileSync } from 'node:fs'

const text = readFileSync('./gh.json')
const obj = JSON.parse(text)
console.log(obj)