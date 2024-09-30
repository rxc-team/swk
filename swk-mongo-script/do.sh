#!/bin/bash
APP_NAME=${APP_NAME:-mongo-script}

function build_docker() {
    npm install

    npm run build

    docker build --tag=rxc/$APP_NAME:k8s --no-cache -f ./Dockerfile .
}

build_docker
