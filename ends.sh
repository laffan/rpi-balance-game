#!/bin/bash

./reset.sh

SESSION_NAME="ALT"

# Kill anything going on in each pane
tmux send-keys -t "$SESSION_NAME":0.1 C-c
tmux send-keys -t "$SESSION_NAME":0.0 C-c

sleep 1

tmux kill-session -t "$SESSION_NAME"

clear
