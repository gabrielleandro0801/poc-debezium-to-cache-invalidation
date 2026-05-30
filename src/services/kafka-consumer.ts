import { KafkaJS } from "@confluentinc/kafka-javascript";
import { logLevel } from "@confluentinc/kafka-javascript/lib/kafkajs";
import { Consumer, Kafka } from "@confluentinc/kafka-javascript/types/kafkajs";

const { Kafka: KafkaClient } = KafkaJS;

export async function createConsumer(groupId: string, clientId: string, topic: string): Promise<Consumer> {
    const client: Kafka = createClient();

    const consumer = client.consumer({
        "group.id": groupId,
        "client.id": clientId,
        "auto.commit.enable": true,
        "auto.offset.reset": "earliest",
    });

    await consumer.connect();
    console.log("✅ Consumer conectado");

    await consumer.subscribe({ topics: [topic] });
    console.log(`📡 Subscrito ao tópico '${topic}'`);

    return consumer;
}

function createClient(): Kafka {
    return new KafkaClient({
        "bootstrap.servers": "172.17.0.1:9092",
        log_level: logLevel.ERROR,
    });
}
