#!/bin/bash
APP_NAME=${APP_NAME:-dev}

function build_docker () {
	npm install

	npm run release

	docker build --tag=rxc/$APP_NAME:k8s --no-cache -f ./docker/Dockerfile .
}

build_docker