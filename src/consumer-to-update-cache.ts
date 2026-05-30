import { Consumer } from "@confluentinc/kafka-javascript/types/kafkajs";
import { createConsumer } from "./services/kafka-consumer";
import { Body, parseUpdatedAt } from "./kafka-event";
import { redis } from "./services/redis";

async function main() {
    const groupId: string = "consumer-to-update-cache";
    const clientId: string = "consumer-to-update-cache";
    const topic: string = "cdc.public.products";

    const consumer: Consumer = await createConsumer(groupId, clientId, topic);

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log("🔥 Mensagem recebida");
            const body: Body = JSON.parse(message.value?.toString());

            if (body.op === "c") {
                await addNewProductIntoCache(body);
                return;
            }

            if (body.op === "u") {
                await updateProductInCache(body);
                return;
            }

            if (body.op === "d") {
                await removeProductFromCache(body);
                return;
            }

            await addExistingProductIntoCache(body);
        },
    });
}

async function addNewProductIntoCache(body: Body) {
    console.log("🔥 Mensagem C recebida - registro criado sendo inserido no Redis");

    await redis.saveProduct({
        ...body.after,
        updated_at: parseUpdatedAt(body.after.updated_at),
    });
}

async function updateProductInCache(body: Body) {
    console.log("🔥 Mensagem U recebida - registro atualizado sendo inserido no Redis");

    await redis.saveProduct({
        ...body.after,
        updated_at: parseUpdatedAt(body.after.updated_at),
    });
}

async function removeProductFromCache(body: Body) {
    console.log("🔥 Mensagem D recebida - registro deletado sendo deletado no Redis");

    await redis.removeProduct(body.before.id);
}

async function addExistingProductIntoCache(body: Body) {
    console.log("🔥 Mensagem R recebida - registro já existente sendo inserido no Redis");

    await redis.saveProduct({
        ...body.after,
        updated_at: parseUpdatedAt(body.after.updated_at),
    });
}

(async () => {
    await main();
})();
