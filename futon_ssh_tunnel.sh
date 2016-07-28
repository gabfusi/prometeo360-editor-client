#!/usr/bin/env bash

# kill previous ssh connection
ps -ef | grep "ssh -i isrs-ubuntu-key.pem -L5984:127.0.0.1:5984 ubuntu@ec2-54-194-254-66.eu-west-1.compute.amazonaws.com" | grep -v grep | awk '{print $2}' | xargs kill -9

# create ssh tunnel to couchdb server
ssh -i "isrs-ubuntu-key.pem" -L5984:127.0.0.1:5984 ubuntu@ec2-54-194-254-66.eu-west-1.compute.amazonaws.com &

# open futon web interface on local machine
open http://localhost:5984/_utils


# ssh -i "isrs-ubuntu-key.pem" -L5984:127.0.0.1:5984 ubuntu@ec2-54-194-254-66.eu-west-1.compute.amazonaws.com