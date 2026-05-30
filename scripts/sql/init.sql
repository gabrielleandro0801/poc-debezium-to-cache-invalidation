create table if not exists products (
	id bigint generated always as identity primary key not null,
	name varchar(30) not null,
	price decimal(10,2) not null,
	stock bigint not null,
	updated_at timestamp without time zone
);

/*
* Este alter table é necessário para que o Postgres grave a linha toda no WAL
* e assim o Debezium consiga preencher o campo "before" nos registros de atualização (u).
*/
ALTER TABLE products REPLICA IDENTITY FULL;

insert into products
(name, price, stock, updated_at) values
('Laptop', 5000, 200, now()),
('Mouse', 100, 800, now());
