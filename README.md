
doorjam-web is a web app for the [doorjam](https://github.com/sudoroom/doorjam) physical hackerspace access control software.

# Functionality

The following features are currently implemented:

* Grant access to new members
* List all members with access
* Basic access control (one shared admin password)

# Security

Remember to set sane permissions for settings.js. You probably don't want it world-readable. Passwords are sent in plain text so only use this app over SSL.

# Running

Copy settings.js.example to settings.js and edit it to suit your needs, then run:

```
./index.js
```

# Init scripts

Init scripts are availabe for upstart (init_scripts/doorjam-web.conf) and for systemd (doorjam-web.sh). They both rely on the node.js program "forever". So install it using:

```
sudo npm install -g forever
```

## upstart

To use the upstart script (assuming your system is using upstart), simply copy it to /etc/init/:

```
sudo cp init_scripts/doorjam-web.conf /etc/init/
```

Make sure you tweak the paths in the init scripts before using it.

Now you should be able to start and stop:

```
sudo start doorjam-web
sudo stop doorjam-web
```

and doorjam-web should auto-start when you boot.

## systemd

To use the systemd script (assuming your system is using systemd), simply copy it to /etc/init.d/:

```
sudo cp init_script/doorjam-web.sh /etc/init.d/doorjam-web
```

Now you should be able to start and stop doorjam-web with:

```
sudo /etc/init.d/doorjam-web start
sudo /etc/init.d/doorjam-web stop
```

To make doorjam-web automatically start when you boot the system, run:

```
sudo update-rc.d doorjam-web defaults
```

Make sure you tweak the paths in the init scripts before using it.