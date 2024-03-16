#!/bin/bash

SESSION_NAME="ALT"
tmux new-session -d -s "$SESSION_NAME"

tmux set -g pane-border-format " #{pane_index} - #{pane_title} "

# Create grid
tmux split-window -h
tmux select-pane -t 0

# Fill er up
tmux select-pane -t 0 -T 'Site'
tmux send-keys -t "$SESSION_NAME":0.0 "cd site; node server.js" C-m

sleep 2

tmux select-pane -t 1 -T 'Rpi'
tmux send-keys -t "$SESSION_NAME":0.1 "cd rpi; sudo python3 readAccelerate.py" C-m

tmux attach-session -t "$SESSION_NAME"
