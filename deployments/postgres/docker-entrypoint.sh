#!/bin/sh

pg_restore -v --clean --dbname=$POSTGRES_DB --username=$POSTGRES_USER docker-entrypoint-initdb.d/backup.pgdmp
