curl -X POST http://localhost:8083/connectors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "postgres-connector",
    "config": {
      "connector.class": "io.debezium.connector.postgresql.PostgresConnector",

      "database.hostname": "postgres",
      "database.port": "5432",
      "database.user": "postgres",
      "database.password": "password",
      "database.dbname": "postgres",

      "topic.prefix": "cdc",
      "plugin.name": "pgoutput",

      "slot.name": "debezium_slot",
      "publication.name": "debezium_publication",

      "schema.include.list": "public",
      "tombstones.on.delete": "false",

      "decimal.handling.mode": "string",

      "key.converter": "org.apache.kafka.connect.json.JsonConverter",
      "value.converter": "org.apache.kafka.connect.json.JsonConverter",

      "key.converter.schemas.enable": "false",
      "value.converter.schemas.enable": "false"
    }
  }'


# Por padrão o Debezium manda os campos decimais codificados;
# com a propriedade "decimal.handling.mode": "string" ele apenas envia como string.

# Por padrão o Debezium manda dois eventos para o Kafka em deleções na base de dados;
# com a propriedade "tombstones.on.delete": "false" ele omite o evento vazio.
