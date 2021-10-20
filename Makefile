down:
	docker-compose down
dev:
	docker-compose -f app.yaml up
sdev: #silent
	docker-compose -f  app.yaml up -d
prod:
	docker-compose -f  app.yaml -f app.prod.yaml  up --build
sprod: #silent
	docker-compose -f  app.yaml -f app.prod.yaml  up --build -d
buildtest: #run this to build test environment
	$ pghost="testPostgres" docker-compose -f test.build.yaml up --build
test: #runs integration tests
	$ pghost="testPostgres" docker-compose -f test.build.yaml -f test.yaml up