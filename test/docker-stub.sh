#!/bin/bash
echo "=====> $@" >&2
exec docker "$@"