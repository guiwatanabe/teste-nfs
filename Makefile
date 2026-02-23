.PHONY: setup remove rebuild up down ps stop npm-install migrate seed key

setup:
	@if [ ! -f .env ]; then cp .env.example .env; fi
	make key
	docker compose build
	docker compose up -d
	make migrate
	make seed
	echo "Project setup complete."

remove:
	docker compose down --rmi all --volumes --remove-orphans

rebuild:
	docker compose down
	docker compose build --no-cache
	docker compose up -d

up:
	docker compose up -d

down:
	docker compose down

ps:
	docker compose ps

stop:
	docker compose stop

migrate:
	docker compose exec api npx drizzle-kit push

seed:
	docker compose exec api npm run seed

key:
	@JWT_SECRET=$$(openssl rand -hex 32) && \
	APP_KEY=$$(openssl rand -hex 32) && \
	sed -i "/^JWT_SECRET=/c\JWT_SECRET=$$JWT_SECRET" .env && \
	sed -i "/^APP_KEY=/c\APP_KEY=$$APP_KEY" .env