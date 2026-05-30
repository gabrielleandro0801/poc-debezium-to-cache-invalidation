import express, { Express, Request, Response } from "express";
import { database } from "./services/database";
import { redis } from "./services/redis";
import bodyParser from "body-parser";

const server: Express = express();
server.use(bodyParser.json());

server.post("/products", async (req: Request, res: Response) => {
    console.log("=== POST /products ===");
    const productToSave = req.body;

    const existingProduct = await database.findProductByName(productToSave.name);
    if (existingProduct) {
        return res.status(422).send({ message: "Product already exists" });
    }

    console.log(`Saving product ${productToSave.name} in Database`);
    const product = await database.saveProduct(productToSave);

    return res.status(200).send(product);
});

server.get("/products/:id", async (req: Request, res: Response) => {
    const id = req.params.id;
    console.log(`=== GET /products/${id} ===`);

    console.log(`Finding product ${id} in Redis`);
    let product = await redis.findProduct(Number(id));

    if (!product) {
        console.log(`Finding product ${id} in Database`);
        product = await database.findProductById(Number(id));

        if (!product) {
            return res.status(404).send({ message: "Not found" });
        }

        console.log(`Saving product ${id} in Redis`);
        await redis.saveProduct(product);
    }

    return res.status(200).send(product);
});

server.delete("/products/:id", async (req: Request, res: Response) => {
    const id = req.params.id;
    console.log(`=== DELETE /products/${id} ===`);

    console.log(`Finding product ${id} in Database`);
    const product = await database.findProductById(Number(id));
    if (!product) {
        res.status(404).send({ message: "Not found" });
    }

    console.log(`Deleting product ${id} from Database`);
    await database.removeProduct(product.id);

    return res.status(204).send();
});

server.patch("/products/:id", async (req: Request, res: Response) => {
    const id = req.params.id;
    console.log(`=== PATCH /products/${id} ===`);

    console.log(`Finding product ${id} in Database`);
    const product = await database.findProductById(Number(id));
    if (!product) {
        res.status(404).send({ message: "Not found" });
    }

    console.log(`Updating product ${id} in Database`);
    const productToUpdate = { ...req.body, id };
    const updated = await database.updateProduct(productToUpdate);

    return res.status(200).send(updated);
});

const port = 3000;
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
