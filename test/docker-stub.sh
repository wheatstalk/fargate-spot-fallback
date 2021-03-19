#!/bin/bash
echo "PWD: $(pwd)"
echo "Tree:"
find $(pwd) -not -path "*/node_modules/*" -not -path  "*/.git/*" -not -path "*/cdk.out/*"
echo "=====> $@" >&2
docker --version
exec docker "$@"