#!/bin/bash
### BEGIN INIT INFO
# Provides:          /root/doorjam/index.js
# Required-Start:    $remote_fs $syslog
# Required-Stop:     $remote_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: forever running /root/doorjam/index.js
# Description:       /root/doorjam/index.js
### END INIT INFO
#
# initd a node app
# Based on a script posted by https://gist.github.com/jinze at https://gist.github.com/3748766
#

# Source function library.
. /lib/lsb/init-functions

pidFile="/var/run/doorjam-web.pid"
logFile="/var/www/omnidoor.local/logs/doorjam-web.log"

command="node"
nodeApp="/opt/doorjam-web/index.js"
foreverApp="/usr/local/bin/forever"
workingDir="/opt/doorjam-web"

start() {
	echo "Starting $nodeApp"

	# Notice that we change the PATH because on reboot
   # the PATH does not include the path to node.
   # Launching forever with a full path
   # does not work unless we set the PATH.
   PATH=/usr/local/bin:$PATH
	export NODE_ENV=production
   #PORT=80
   cd $workingDir
   $foreverApp start --pidFile $pidFile -l $logFile -a -d -c "$command" --workingDir $workingDir $nodeApp
   RETVAL=$?
}

restart() {
	echo -n "Restarting $nodeApp"
	$foreverApp restart $nodeApp
	RETVAL=$?
}

stop() {
	echo -n "Shutting down $nodeApp"
   $foreverApp stop $nodeApp
   RETVAL=$?
}

status() {
   echo -n "Status $nodeApp"
   $foreverApp list
   RETVAL=$?
}

case "$1" in
   start)
        start
        ;;
    stop)
        stop
        ;;
   status)
        status
       ;;
   restart)
   	restart
        ;;
	*)
       echo "Usage:  {start|stop|status|restart}"
       exit 1
        ;;
esac
exit $RETVAL
