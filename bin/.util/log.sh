###
# Format the current datetime into a log-friendly format.
# Example: "2026-06-18T12:18:49"
###
log_date() {
    date '+%Y-%m-%dT%H:%M:%S'
}

###
# Format the current datetime into a filename-friendly format.
# (!) Generated once, then re-used for all logs generated in the current session, including sub-shells.
# Example: "2026-06-18T12-18-49"
###
export LOG_FILE_DATE="${LOG_FILE_DATE:-$(log_date | sed 's/:/-/g')}"
log_date_file() {
    echo "${LOG_FILE_DATE}"
}

###
# Return the current Process ID of the running script.
# @see https://tldp.org/LDP/abs/html/internalvariables.html#PROCCID
###
log_pid() {
    echo "$$"
}

###
# Return the current log group, or "default" if not defined.
# Example: export LOG_GROUP="pi-acp-bridge"
###
log_group() {
    echo "${LOG_GROUP:-default}"
}

###
# Return the current log channel, or "app" if not defined.
# Example: export LOG_CHANNEL="app"
###
log_channel() {
    echo "${LOG_CHANNEL:-app}"
}

###
# Return the current log directory.
# Example: export LOG_DIR="/path/to/logdir"
###
log_dir() {
    echo "${LOG_DIR}"
}

###
# Return the log filename.
# Example: "2026-06-18T12-18-49_app.log"
###
log_file() {
    echo "$(log_date_file)_$(log_channel).log"
}

###
# Return the full path to the logfile.
# Example: "/path/to/logdir/2026-06-18T12-18-49_app.log"
###
log_path() {
    echo "$(log_dir)/$(log_file)"
}

###
# Make sure the log directory exists so we can write logs to it.
###
log_config() {
    mkdir -p "$(log_dir)"
    
    # Keep only the 5 most recent log files per channel to prevent disk bloat.
    # Since filenames are timestamped (e.g., 2026-06-18T12-18-49_acp.log), 
    # alphabetical sorting correctly orders them chronologically.
    find "$(log_dir)" -maxdepth 1 -type f -name "*_$(log_channel).log" | \
        sort -r | \
        tail -n +6 | \
        xargs -I{} rm -f "{}" 2>/dev/null
}

###
# Output a log entry to the resolved log file.
# Example "[2026-06-18 12:18:49] [pi-acp-bridge] Prune old sessions"
###
log() {
    echo "[$(log_date)] [$(log_pid)] [$(log_group)] $*" >> "$(log_path)"
}

###
# Log a command to be executed before executing it.
###
log_exec() {
    log "log_exec: $@"
    $@; EXIT_CODE="$?"
    log "log_exec_finish: exit=${EXIT_CODE}"
}
