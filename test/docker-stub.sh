#!/bin/bash
echo "PWD: $(pwd)"
echo "Tree:"
find $(pwd)
echo "=====> $@" >&2
exec docker "$@"