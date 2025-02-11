# Disable all networking
net none

# Use a new /tmp and disable access to /dev, except for basic devices (null, random, urandom)
private-tmp
private-dev

# Block access to the kernel filesystems
disable-mnt

# Make the home directory inaccessible and provide a new temporary home
private

# Allow access to the /app/code directory
# TODO: review this strategy
read-write /app/code

# Restrict access to the /proc and /sys directories, which contain system and process information
proc none
sysfs none

# Disable shared memory access to prevent communication with processes outside the sandbox
disable-shm

# Restrict D-Bus access to cut off inter-process communication via D-Bus
dbus-user none
dbus-system none

# Disable X11 access (important if the environment has a GUI, to prevent keylogging and other attacks)
x11 none

# Block sound access (optional, based on requirements)
noaudio

# Disable various other potentially sensitive system aspects
nodvd
nogroups
nonewprivs
noroot
notv
novideo

# Apply a default seccomp filter to block other potentially dangerous system calls
seccomp

# Drop all capabilities to minimize privileges further
caps.drop all

shell none
memory-deny-write-execute  # Prevent code injection attacks
noexec /tmp  # Extra protection for temp space
