
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

Make sure you tweak the paths in the init scripts before using them.