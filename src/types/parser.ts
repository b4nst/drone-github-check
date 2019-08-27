import { Report } from './report'

export type Parser = (path: string, info: { repo: string }) => Promise<Report>
