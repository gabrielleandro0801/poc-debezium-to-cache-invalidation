export function parseUpdatedAt(updatedAtInUnix: number): string {
    return new Date(updatedAtInUnix / 1000).toISOString();
}

export type Body = {
    before: Product;
    after: Product;
    source: Source;
    transaction: any;
    op: "c" | "r" | "u" | "d";
    ts_ms: number;
    ts_us: number;
    ts_ns: number;
};

export type Product = {
    id: number;
    name: string;
    price: string;
    stock: number;
    updated_at: number;
};

export type Source = {
    version: string;
    connector: string;
    name: string;
    ts_ms: number;
    snapshot: string;
    db: string;
    sequence: string;
    ts_us: number;
    ts_ns: number;
    schema: string;
    table: string;
    txId: number;
    lsn: number;
    xmin: any;
};
