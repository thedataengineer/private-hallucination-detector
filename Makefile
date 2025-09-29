SHELL := /bin/bash

.PHONY: install dev build start lint test

install:
	npm install

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

lint:
	npm run lint

test:
	@echo "No dedicated test suite configured; running lint instead."
	npm run lint
