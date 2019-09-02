import { Report } from './report'

// tslint:disable-next-line: no-empty-interface because will probably not be empty soon
export interface ParserOpts {}

export type Parser = (path: string, info: ParserOpts) => Promise<Report>
