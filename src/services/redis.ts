import Redis from "ioredis";
import { Product } from "../kafka-event";

type RedisProduct = Omit<Product, "updated_at"> & {
    updated_at: string;
};

const TTL_IN_SECONDS = 600;

export class RedisClient {
    private readonly connection: Redis;

    constructor(port: number, host: string) {
        this.connection = new Redis(port, host, {
            lazyConnect: false,
            enableAutoPipelining: true,
        });
    }

    async saveProduct(product: RedisProduct) {
        await this.connection.set(createKey(product.id), JSON.stringify(product), "EX", TTL_IN_SECONDS);
    }

    async removeProduct(id: number) {
        console.log(`Removing product ${id} from Redis`);
        await this.connection.del(createKey(id));
    }

    async findProduct(id: number): Promise<RedisProduct> {
        const product: string = await this.connection.get(createKey(id));

        return product ? JSON.parse(product) : (product as null);
    }
}

function createKey(productId: number): string {
    return `product:${productId}`;
}

export const redis = new RedisClient(6379, "localhost");
