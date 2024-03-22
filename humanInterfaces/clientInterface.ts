export interface ClientInterface {
    readRequest(namedGraphs: string[]): Promise<'always'| 'yes' | 'no' | 'never'>;
}
