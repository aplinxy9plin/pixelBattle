#!/usr/bin/env bash
ng build --prod
docker build -t sydykov/pixelbattle .
docker push sydykov/pixelbattle
