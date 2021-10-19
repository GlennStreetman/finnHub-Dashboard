down:
	docker-compose down
dev:
	docker-compose -f app.yaml up
sdev:
	docker-compose -f  app.yaml up -d
prod:
	docker-compose -f  app.yaml -f app.prod.yaml  up --build
sprod: docker-compose -f  app.yaml -f app.prod.yaml  up --build -d