import { Sequelize } from "sequelize";
import { Product } from "../kafka-event";

export type DbProduct = Omit<Product, "updated_at"> & {
    updated_at: string;
};

export type DbProductToSave = Omit<DbProduct, "id" | "updated_at">;

export class PostgresDatabase {
    private connection: Sequelize;

    async findProductById(id: number): Promise<DbProduct> {
        const connection = await this.getDbConnection();
        const [products, _] = await connection.query(`SELECT * FROM products WHERE id = ${id};`);

        return products[0] as DbProduct;
    }

    async findProductByName(name: string): Promise<DbProduct> {
        const connection = await this.getDbConnection();
        const [products, _] = await connection.query(`SELECT * FROM products WHERE name = '${name}';`);

        return products[0] as DbProduct;
    }

    async saveProduct(product: DbProductToSave): Promise<DbProduct> {
        const connection = await this.getDbConnection();
        const [products, _] = await connection.query(`INSERT INTO products
            (name, price, stock, updated_at) VALUES
            ('${product.name}', ${product.price}, ${product.stock}, now())
            RETURNING id, name, price, stock, updated_at;`);

        return products[0] as DbProduct;
    }

    async removeProduct(id: number): Promise<void> {
        const connection = await this.getDbConnection();
        await connection.query(`DELETE FROM products WHERE id = ${id};`);
    }

    async updateProduct(product: DbProduct): Promise<DbProduct> {
        const connection = await this.getDbConnection();
        const [products, _] = await connection.query(`UPDATE products SET
            name = '${product.name}',
            price = ${product.price},
            stock = ${product.stock},
            updated_at = now()
            WHERE id = ${product.id}
            RETURNING id, name, price, stock, updated_at;`);

        return products[0] as DbProduct;
    }

    private async getDbConnection() {
        if (!this.connection) {
            this.connection = new Sequelize({
                database: "postgres",
                define: {
                    freezeTableName: true,
                    createdAt: false,
                    updatedAt: false,
                },
                dialect: "postgres",
                host: "localhost",
                logging: false,
                password: "password",
                pool: {
                    max: 5,
                    min: 1,
                    acquire: 10_000,
                    idle: 10_000,
                },
                sync: {
                    force: false,
                },
                username: "postgres",
            });

            await this.connection.authenticate();
        }

        return this.connection;
    }
}

export const database: PostgresDatabase = new PostgresDatabase();
