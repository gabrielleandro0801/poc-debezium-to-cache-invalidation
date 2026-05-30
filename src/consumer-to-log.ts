import { Consumer } from "@confluentinc/kafka-javascript/types/kafkajs";
import { createConsumer } from "./services/kafka-consumer";
import { Body, parseUpdatedAt } from "./kafka-event";

async function main() {
    const groupId: string = "consumer-to-log";
    const clientId: string = "consumer-to-log";
    const topic: string = "cdc.public.products";

    const consumer: Consumer = await createConsumer(groupId, clientId, topic);

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log("🔥 Mensagem recebida");
            const body: Body = JSON.parse(message.value?.toString());

            if (body.op === "c") {
                logCreateEvent(body);
                return;
            }

            if (body.op === "u") {
                logUpdateEvent(body);
                return;
            }

            if (body.op === "d") {
                logDeleteEvent(body);
                return;
            }

            logReadEvent(body);
        },
    });
}

function logReadEvent(body: Body) {
    console.log("🔥 Mensagem R recebida - registro já estava na base");
    console.log({ ...body.after, updated_at: parseUpdatedAt(body.after.updated_at) });
}

function logCreateEvent(body: Body) {
    console.log("🔥 Mensagem C recebida - registro criado");
    console.log({ ...body.after, updated_at: parseUpdatedAt(body.after.updated_at) });
}

function logUpdateEvent(body: Body) {
    console.log("🔥 Mensagem U recebida - registro atualizado");
    console.log("Antes:");
    console.log({ ...body.before, updated_at: parseUpdatedAt(body.before.updated_at) });
    console.log("Depois:");
    console.log({ ...body.after, updated_at: parseUpdatedAt(body.after.updated_at) });
}

function logDeleteEvent(body: Body) {
    console.log("🔥 Mensagem D recebida - registro deletado");
    console.log({ ...body.before, updated_at: parseUpdatedAt(body.before.updated_at) });
}

(async () => {
    await main();
})();
