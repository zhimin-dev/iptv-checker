.PHONY: migrate

all: migrate

migrate:
	rm -rf ../iptv-checker-rs/web/
	cp -rf ../iptv-checker-web/dist/ ../iptv-checker-rs/web/