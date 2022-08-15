down: 
	docker-compose down
dev:
	docker-compose -f dev.yaml up
sdev: #silent
	npm run copy-files; docker-compose -f  app.yaml up -d
prod-build:
	npm run copy-files; docker-compose -f  app.yaml -f app.prod.yaml  up --build
prod:
	npm run copy-files; docker-compose -f  app.yaml -f app.prod.yaml  up
sprod: #silent
	docker-compose -f  app.yaml -f app.prod.yaml  up --build -d
buildtest: #run this to build test environment
	$ pghost="testPostgres" docker-compose -f test.build.yaml up --build
test: #runs integration tests
	$ pghost="testPostgres" docker-compose -f test.build.yaml -f test.yaml up