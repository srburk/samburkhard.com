
#!/bin/bash

trap "echo -n 'Stopping watcher'; exit 0" SIGINT SIGTERM

fswatch -0 --exclude "build" "./" | while read -d "" file; do
    if [[ "$file" == *.md || "$file" == *.html || "$file" == *.js || "$file" == *.css ]]; then
        echo "Detected change in $file, rebuilding..."
        make draft
    fi
done