<h1 align="center"> POC Debezium to Cache invalidation</h1>

This project contains the Debezium service connected in a Postgres Database to CDC.
There are two Kafka consumers consuming the topic:
- consumer-to-log: a simple consumer to log all the events
- consumer-to-update-cache: a consumer to update the registers in Redis

Also. there's an API to make CRUD operations in the Database.

## Running
Start all the services:
``` bash
docker-compose up -d
```

It will immediately add two items in Database.

After some minutes, connect Debezium on Postgres:
``` bash
sh ./scripts/bash/1-add-debezium-on-postgres.sh
sh ./scripts/bash/2-list-connectors.sh
```

Start all the services in three different terminals:
``` bash
npm run execute src/api.ts
```
``` bash
npm run execute src/consumer-to-log.ts
```
``` bash
npm run execute src/consumer-to-update-cache.ts
```

Then, use these cURLs to make requests to the API and check the logs emitted on the terminals + the items being updated on Redis.

Retrieve product:
``` bash
curl -X GET "http://localhost:3000/products/5"
```

Add new product:
``` bash
curl -X POST "http://localhost:3000/products" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Xbox",
  "price": 7000,
  "stock": 2
}'
```

Update product:
``` bash
curl -X PATCH "http://localhost:3000/products/1" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Laptop",
  "price": 4500,
  "stock": 200
}'
```

Delete product:
``` bash
curl -X DELETE "http://localhost:3000/products/3"
```
