#!/bin/bash
echo "PWD: $(pwd)"
echo "Tree:"
tree $(pwd)
echo "=====> $@" >&2
exec docker "$@"