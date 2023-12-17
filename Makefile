#/bin/bash
start-server:
	cd server && cargo run dev

start-client:
	npm run dev

run:
	make start-server && make start-client