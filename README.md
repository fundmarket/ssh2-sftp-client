# Table of Contents

1.  [Overview](#org72b1cf3)
2.  [Installation](#orgdd942db)
3.  [Basic Usage](#orge3d38d0)
4.  [Version 5.x](#orge7409f3)
    1.  [Breaking Changes in Version 5.x](#org9dbaf2f)
        1.  [Error Event Handling](#org6769326)
        2.  [Technical Details](#org7af3384)
    2.  [New Methods](#orgdeb4e97)
    3.  [Version 5.0.1](#org3236162)
    4.  [Version 5.0.2](#orgda7f034)
    5.  [Version 5.1.0](#org490550b)
    6.  [Version 5.1.1](#org92545ad)
    7.  [Version 5.1.2](#orgc1ede09)
    8.  [Version 5.1.3](#orgfea31b3)
    9.  [Version 5.2.0](#orgea261fe)
    10. [Version 5.2.1](#org8ae8af2)
    11. [Version 5.2.2](#org0d8d1a9)
    12. [Version 5.3.0](#org5358837)
    13. [Version 5.3.1](#orgcfdaf91)
5.  [Documentation](#orge47e737)
    1.  [Specifying Paths](#orga82dce2)
    2.  [Methods](#orge15a4bc)
        1.  [new SftpClient(name) ===> SFTP client object](#orgc975268)
        2.  [connect(config) ===> SFTPstream](#org4626445)
        3.  [list(path, pattern) ==> Array[object]](#orgc1acf02)
        4.  [exists(path) ==> boolean](#org8749d2e)
        5.  [stat(path) ==> object](#orge238ec5)
        6.  [get(path, dst, options) ==> String|Stream|Buffer](#orgc95292d)
        7.  [fastGet(remotePath, localPath, options) ===> string](#org9bec733)
        8.  [put(src, remotePath, options) ==> string](#org9eac979)
        9.  [fastPut(localPath, remotePath, options) ==> string](#org4151217)
        10. [append(input, remotePath, options) ==> string](#orgd40b535)
        11. [mkdir(path, recursive) ==> string](#org3e3d42a)
        12. [rmdir(path, recursive) ==> string](#org25b2074)
        13. [delete(path) ==> string](#org98fd339)
        14. [rename(fromPath, toPath) ==> string](#orgf458421)
        15. [posixRename(fromPath, toPath) ==> string](#orgb864c69)
        16. [chmod(path, mode) ==> string](#org057b2d7)
        17. [realPath(path) ===> string](#org587ee7e)
        18. [cwd() ==> string](#org3c92652)
        19. [uploadDir(srcDir, dstDir) ==> string](#org79dbbf7)
        20. [downloadDir(srcDir, dstDir) ==> string](#orgb353458)
        21. [end() ==> boolean](#orge03d8fc)
        22. [Add and Remove Listeners](#orgbcffecf)
6.  [Platform Quirks & Warnings](#orge8865c0)
    1.  [Server Capabilities](#org93825c3)
    2.  [Promises & Events](#orgfb10b68)
    3.  [Windows Based Servers](#org78d9cc9)
    4.  [Don't Re-use SftpClient Objects](#org3cf0fa1)
7.  [FAQ](#org321b304)
    1.  [Remote server drops connections with only an end event](#orgc32199b)
    2.  [How can I pass writable stream as dst for get method?](#org0fc4a8c)
    3.  [How can I upload files without having to specify a password?](#org333b89b)
    4.  [How can I connect through a Socks Proxy](#org0751bb0)
    5.  [Timeout while waiting for handshake or handshake errors](#orgcd6dd66)
    6.  [How can I limit upload/download speed](#orgb323717)
8.  [Examples](#orgd7f74ee)
9.  [Troubleshooting](#org25bd174)
    1.  [Common Errors](#org9af0c4d)
        1.  [Not returning the promise in a `then()` block](#org0eb8b2b)
        2.  [Mixing Promise Chains and Async/Await](#org9c70121)
        3.  [Try/catch and Error Handlers](#org5418fd1)
    2.  [Debugging Support](#org3707780)
10. [Logging Issues](#org91866b1)
11. [Pull Requests](#org2aaa323)
12. [Contributors](#org8d9423a)



<a id="org72b1cf3"></a>

# Overview

an SFTP client for node.js, a wrapper around [SSH2](https://github.com/mscdex/ssh2)  which provides a high level
convenience abstraction as well as a Promise based API.

Documentation on the methods and available options in the underlying modules can
be found on the [SSH2](https://github.com/mscdex/ssh2) and [SSH2-STREAMS](https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md)  project pages.

Current stable release is **v5.3.1**.

Code has been tested against Node versions 12.18.2 and 13.14.0

Node versions < 10.x are not supported.

<span class="underline">WARNING</span> There is currently a regression error with versions of node later than
version 14.0. It appears that when using streams with chunk sizes which exceed
the high water mark for the stream, a drain event is no longer emitted. As a
result, streams with sufficient data will hang indefinitely. This appears to
affect fastput, fastget, put and possibly get operations. Until this issue is
resolved and a new version of ssh2/ssh2-streams is released, using node v14 is
not recommended.

A bug report hass been logged against the ssh2-streams library as [issue 156](https://github.com/mscdex/ssh2-streams/issues/156).

<span class="underline">UPDATE</span>: The author of the upstream ssh2 and ssh2-streams module has decided on
a re-write of the ssh2 module to address the above issues as well as some other
design limitations and to allow the module to better fit in with newer versions
of node. As part of that process, the functionality of ssh2-streams is being
incorporated into the main ssh2 module and the ssh2-streams module is being
deprecated. This will require a significant update to this module and may result
in some API changes, depending on what changes in the re-write of ssh2.

To support these changes, a new branch called *version-6* has been created. This
branch will use the newest version of ssh2 and for now is very much experimental
and subject to change.


<a id="orgdd942db"></a>

# Installation

    npm install ssh2-sftp-client


<a id="orge3d38d0"></a>

# Basic Usage

    let Client = require('ssh2-sftp-client');
    let sftp = new Client();

    sftp.connect({
      host: '127.0.0.1',
      port: '8080',
      username: 'username',
      password: '******'
    }).then(() => {
      return sftp.list('/pathname');
    }).then(data => {
      console.log(data, 'the data info');
    }).catch(err => {
      console.log(err, 'catch error');
    });


<a id="orge7409f3"></a>

# Version 5.x


<a id="org9dbaf2f"></a>

## Breaking Changes in Version 5.x

-   The auxList() method has been removed. This method was flagged as deprecated
    in version 4.x. The functionality provided by `auxList()` is available in
    `list()`, making `auxList()` unnecessary.
-   The realPath() method now returns `''` if the path does not exist
    rather than throwing an exception.
-   Improved error handling. The `ssh2` and `ssh2-streams` libraries use events
    to signal errors. Providing a clean Promise based API and managing these
    events can be challenging as an error event can fire at any time (including
    in-between the resolution of one promise and the commencement of another). As
    you cannot use `try/catch` blocks to reliably manage error events (for a
    similar reason - see Node's event documentation for details), a slightly
    more complex solution was required. See the section below on Error Event
    Handling for more details. In basic terms, a default handler is now used
    that will log the error and clear the SFTP connection if no Promise error
    handler has handled the error. This prevents the uncaughtException error
    and provides a reasonably clean way to deal with unexpected errors that
    fire in-between Promise execution activities.
-   Ignore Errors during `end()` processing. At least one SFTP server (Azure
    SFTP) seems to generate an error in response to the `end()` call. As
    `end()` has been called, we don't really care if an error occurs provided
    the connection is closed. Therefore, a new default error listener for the
    `end()` method has been added that will simply ignore any errors which
    occur during a call to end the connection.


<a id="org6769326"></a>

### Error Event Handling

Providing a clean Promise API for the SSH2 to manage basic SFTP functionality
presents a couple of challenges for managing errors. The `SSH2` module uses
events to communicate various state changes and error conditions. These
events can fire at any time.

On the client side, we wrap basic SFTP actions in Javascript Promises,
allowing clients to use either the standard Promise API or async/await to
model SFTP interactions. Creating an SFTP connection returns a promise, which
resolves if a connection is successfully established and is rejected
otherwise. Downloading a file using `get()` or `fastGet()` generates a new
Promise which is either resolved, indicating file has been successfully
downloaded or rejected, indicating the download failed. All pretty
straight-forward.

When the Promise is created, an error event handler is added to the SFTP
object to catch any errors that fire during the execution of the promise. If
an error event fires, the Promise is rejected and the error returned to the
client as part of the rejection. After the Promise has resolved or rejected,
the error listener is removed (the error listener is specific to each promise
because it needs to call the reject method associated with that promise). As
a promise can only be resolved or rejected once, after the Promise has
completed, the error listener is of no further use.

This all works fine when an error event fires during the execution of a
Promise. However, what about outside promise execution? Consider the
following flow;

1.  You have an active SFTP connection which you use to download a file
2.  When you make the download request, a new Promise is created which will
    resolve when the file is downloaded or be rejected if the download fails
    for some reason. The promise resolves successfully.
3.  You start processing the data downloaded. At this point, you still have an
    open connection to the SFTP server, but you are not actively interacting
    with it. There is no active Promise in play.
4.  The remote SFTP server resets the connection for some reason, generating a
    ECONNRESET error that is emitted as an error event.

What happens at this point? There is no active promise executing, so no
Promise specific error handler in play. Your script is off processing the
data from the previously downloaded file, so there is no currently executing
try/catch block around the SFTP client object. Basically, there is nothing
listening of any errors at this point. What will happen?

Well, basically, the error event will bubble up to the top level of the node
process context and cause an uncaughtException error, display the error and
dump a stack trace and cause the node process to exit. In basic terms, your
process will crash. Not a great outcome.

There are a number of things we can do to improve the situation. However,
nearly all of them have some drawbacks. We could -

-   Add our own error handler. The `client.on()` method would allow you to add
    your own error handler. This would provide a way to manage error events,
    but you want to make sure you only handle error events not handled already
    by the Promise error handlers. Worse yet, you cannot know before hand the
    processing context of your script at the point the error event fires. This
    means your error handling is likely to be complex and difficult to
    manage. Worse yet, these types of errors are quite rare in most situations
    and your now being required to add significant additional complexity to
    deal with a rare edge case. However, sometimes, you just need to deal with
    this sort of complexity and the `client.on()` method does give you that
    option.
-   Another alternative is to just add an uncaughtException handler to your Node
    process object. This would also prevent node from dumping the error and
    exiting abruptly. However, now you need to think about ALL the possible
    uncaughtExceptions which might happen, not just those associated with the
    SFTP client. Again, things are getting complicated for something which only
    occurs occasionally.  .

What we really want is a solution which will be simple for the majority of
clients, but provide additional power when needed. What we have done is add a
default error handler which will only take action if no Promise error handler
has fired. All the default error handler does is log the error to
console.error() and set the SFTP connection to undefined so that any further
attempts to use the connection will throw an error inside the Promise which
attempts to use it.

The advantage of this approach is that it stops the abrupt exiting of the
node script due to an uncaught exception error and provides a reasonable
outcome for most use cases. For example, in the scenario outlined above, if
an error event fires while your script is processing the data already
downloaded, it will not impact on your script immediately. An error will be
logged to console.error(), but your script will continue to run. Once you
have completed processing your data, if you attempt another SFTP call, it
will fail with an error about no available SFTP connections. As this will
occur within the context of interacting with the SFTP server, your script can
take appropriate action to resolve the issue (such as re-connecting to the
server). On the other hand, if after processing the file your done and just
want to end, then you can just ignore the error, perform any necessary
cleanup work and exit successfully.


<a id="org7af3384"></a>

### Technical Details

The event handlers added by each Promise are added using the `prependListener()`
function. This ensures the handler is fired before any other error handlers
which may be defined. As part of the processing, these error handler set a flag
property `this.errorHandled` to true, indicating the error has been handled.

In addition to the Promise error handlers, there is a default error handler
which will fire after any Promise error handler. The default error handler looks
to see if the `this.errorHandler` flag is true. If it is, it knows the error has
been handled and it just resets it to false, taking no other action (so taht we
are ready for the next error). If the flag is false, the default handler knows
it must handle the error. In this case, the handler will log the error to
`console.error()`, will set the SFTP connection to undefined to prevent any
further attempts to use it and finally, ensure the `this.errorHandler` flag is
reset to false in preparation for the next error.


<a id="orgdeb4e97"></a>

## New Methods

-   Added the method uploadDir(). This method will upload a directory
    (including any subdirectories) to the remote server. Only directories and
    regular files are uploaded (no symbolic links, FIFOs, socket FDs etc). Will
    overwrite existing files or directories, but will not delete any remote
    files or directories.
-   Added the method downloadDir(). This method will download a directory
    (including any subdirectories) to the local file system. Only directories
    and regular files are downloaded (no symbolic links, FIFOs, socket FDs
    etc).. Will overwrite existing files or directories, but will not delete
    any local files in the directories.
-   Added the method posixRename(). This method will use the POSIX atomic
    rename openSSH extension. As this is an extension to the SFTP protocol, not
    all servers will support this operation.


<a id="org3236162"></a>

## Version 5.0.1

-   The error checking was a little too stringent. The use of exist() to test
    for file types had a problem when the user does not have read/execute
    rights on the directory. Replaced with stat() method, which should avoid
    this issue.


<a id="orgda7f034"></a>

## Version 5.0.2

-   Fix error in local directory tests due to missing await statement.
-   Fix path handling under win32. Paths were not being parsed correctly due to
    the use of path.posix.parse() instead of path.parse().


<a id="org490550b"></a>

## Version 5.1.0

-   Add missing connection check in end() method
-   Add debugging support. Now adding a debug property to the connection
    configuration object will enable debugging. The value of the debug property
    should be a function which accepts a single string argument. Typically,
    this function will send the value passed in to stderr or a file.
-   Fix bug in checkRemotePath() relating to poor path specifications where
    you cannot determine parent directory.


<a id="org92545ad"></a>

## Version 5.1.1

-   Bug fix for unexpected close of connections. It would seem that a
    connections can be unexpectedly closed without an accompanying error event.
    As methods only looked for error events, the method promise wold never
    fulfil and the method would appear to hang. Have now added close event
    handlers to each method that will reject the promise if the connection is
    closed unexpectedly.
-   Missing return statement in connect method would result in the connect
    method attempting to re-connect again after it had reached maximum connect
    retries. Added the missing return statement.
-   Added some more troubleshooting documentation. Numerous issues have been
    raised that turn out to be due to client code failing to return Promises
    inside promise chains. Common symptom is what appears to be truncated file
    upload/download. What is really happening is that the end method is being
    called before the transfer has completed.


<a id="orgc1ede09"></a>

## Version 5.1.2

-   Mainly a bug fix. We needed to add back a global close listener to ensure
    the sftp object is unset whenever a close event occurs. As close events can
    occur outside main method calls, only having method based listeners was not
    sufficient.
-   Also added a utils.dumpListeners() method, useful when debugging issues with
    listener 'leakage' due to failure to remove listeners when no longer required.


<a id="orgfea31b3"></a>

## Version 5.1.3

-   Fix issue with permissions for writing to root directory
-   Cleanup tests to use less connections and eliminate need for test delays
-   Bumped some dependencies to latest versions


<a id="orgea261fe"></a>

## Version 5.2.0

-   Add posixRename() method. This is an openssh extension added in openssh
    v4.8 and will only work on servers which support this extension.conflict
-   Bumped through2 dependency version to 4.0.2


<a id="org8ae8af2"></a>

## Version 5.2.1

-   Move some dev dependencies from dependencies to devDependencies.


<a id="org0d8d1a9"></a>

## Version 5.2.2

-   Bug fix. Some servers appear to issue errors with code 4 instead of code 2
    for file not found errors. This version adds checks for error code 4 to the
    stat() method. Thanks to teenangst for the fix.


<a id="org5358837"></a>

## Version 5.3.0

-   Add code to only add connect() and end() event handlers if they are not
    already active. For connect(), remove event handlers as late as possible to
    help catch error events raised late on some platforms (like win32). don't
    remove end() error handler as some platforms, like win32, send an
    additional error event even after a successful and requested end() call.
-   Fix path handling when connecting to a remoe SFTP server running on win32
    platform. Assume server honours 'nix' path convention rather than using
    native win32 path format.
-   Add additional documentation on events/promises, platform quirks and
    platform differences.


<a id="orgcfdaf91"></a>

## Version 5.3.1

-   Fix bug in handling of relative local paths
-   Modified `get()` and `put()` methods to support special purpose streams
    which require `autoClose` to be `false`. These methods will now look for
    the `autoClose: false` property in the options object and if it is false,
    will issue a `destroy()` on the underlying stream just before the promise
    is resolved. The default is `autoClose: true` and this default should be
    used unless there is a known specific reason to change it to false.


<a id="orge47e737"></a>

# Documentation

The connection options are the same as those offered by the underlying SSH2
module. For full details, please see [SSH2 client methods](https://github.com/mscdex/ssh2#user-content-client-methods)

All the methods will return a Promise, except for `on()` and
`removeListener()`, which are typically only used in special use cases.


<a id="orga82dce2"></a>

## Specifying Paths

The convention with both FTP and SFTP is that paths are specified using a
'nix' style i.e. use '*' as the path separator. This means that even if your
SFTP server is running on a win32 platform, you should use '*' instead of '\\'
as the path separator. For example, for a win32 path of 'C:\Users\fred' you
would actually use '/C:/Users/fred'. If your win32 server does not support
the 'nix' path convention, you can try setting the `remotePathSep` property
of the `SftpClient` object to the path separator of your remote server. This
**might** work, but has not been tested. Please let me know if you need to do
this and provide details of the SFTP server so that I can try to create an
appropriate environment and adjust things as necessary. At this point, I'm
not aware of any win32 based SFTP servers which do not support the 'nix' path
convention.

All remote paths must either be absolute e.g. `/absolute/path/to/file` or
they can be relative with a prefix of either `./` (relative to current remote
directory) or `../` (relative to parent of current remote directory) e.g.
`./relative/path/to/file` or `../relative/to/parent/file`. It is also
possible to do things like `../../../file` to specify the parent of the
parent of the parent of the current remote directory. The shell tilde (`~`)
and common environment variables like `$HOME` are NOT supported.

It is important to recognise that the current remote directory may not always
be what you may expect. A lot will depend on the remote platform of the SFTP
server and how the SFTP server has been configured. When things don't seem to
be working as expected, it is often a good idea to verify your assumptions
regarding the remote directory and remote paths. One way to do this is to
login using a command line program like `sftp` or `lftp`.

There is a small performance hit for using `./` and `../` as the module must
query the remote server to determine what the root path is and derive the
absolute path. Using absolute paths are therefore more efficient and likely
more robust.

When specifying file paths, ensure to include a full path i.e. include the
remote filename. Don't expect the module to append the local file name to the
path you provide. For example, the following will not work

    client.put('/home/fred/test.txt', '/remote/dir');

will not result in the file `test.txt` being copied to
`/remote/dir/test.txt`. You need to specify the target filename as well e.g.

    client.put('/home/fred/test.txt', '/remote/dir/test.txt');

Note that the remote file name does not have to be the same as the local file
name. The following works fine;

    client.put('/home/fred/test.txt', '/remote/dir/test-copy.txt');

This will copy the local file `test.txt` to the remote file `test-copy.txt`
in the directory `/remote/dir`.


<a id="orge15a4bc"></a>

## Methods


<a id="orgc975268"></a>

### new SftpClient(name) ===> SFTP client object

Constructor to create a new `ssh2-sftp-client` object. An optional `name` string
can be provided, which will be used in error messages to help identify which
client has thrown the error.

1.  Constructor Arguments

    -   **name:** string. An optional name string used in error messages

2.  Example Use

        'use strict';

        const Client = require('ssh2-sftp-client');

        const config = {
          host: 'example.com',
          username: 'donald',
          password: 'my-secret'
        };

        const sftp = new Client('example-client');

        sftp.connect(config)
          .then(() => {
            return sftp.cwd();
          })
          .then(p => {
            console.log(`Remote working directory is ${p}`);
            return sftp.end();
          })
          .catch(err => {
            console.log(`Error: ${err.message}`); // error message will include 'example-client'
          });


<a id="org4626445"></a>

### connect(config) ===> SFTPstream

Connect to an sftp server. Full documentation for connection options is
available [here](https://github.com/mscdex/ssh2#user-content-client-methods)

1.  Connection Options

    This module is based on the excellent [SSH2](https://github.com/mscdex/ssh2#client) module. That module is a general SSH2
    client and server library and provides much more functionality than just SFTP
    connectivity. Many of the connect options provided by that module are less
    relevant for SFTP connections. It is recommended you keep the config options to
    the minimum needed and stick to the options listed in the `commonOpts` below.

    The `retries`, `retry_factor` and `retry_minTimeout` options are not part of the
    SSH2 module. These are part of the configuration for the [retry](https://www.npmjs.com/package/retry) package and what
    is used to enable retrying of sftp connection attempts. See the documentation
    for that package for an explanation of these values.

        // common options

        let commonOpts {
          host: 'localhost', // string Hostname or IP of server.
          port: 22, // Port number of the server.
          forceIPv4: false, // boolean (optional) Only connect via IPv4 address
          forceIPv6: false, // boolean (optional) Only connect via IPv6 address
          username: 'donald', // string Username for authentication.
          password: 'borsch', // string Password for password-based user authentication
          agent: process.env.SSH_AGENT, // string - Path to ssh-agent's UNIX socket
          privateKey: fs.readFileSync('/path/to/key'), // Buffer or string that contains
          passphrase: 'a pass phrase', // string - For an encrypted private key
          readyTimeout: 20000, // integer How long (in ms) to wait for the SSH handshake
          strictVendor: true // boolean - Performs a strict server vendor check
          debug: myDebug // function - Set this to a function that receives a single
                        // string argument to get detailed (local) debug information.
          retries: 2 // integer. Number of times to retry connecting
          retry_factor: 2 // integer. Time factor used to calculate time between retries
          retry_minTimeout: 2000 // integer. Minimum timeout between attempts
        };

        // rarely used options

        let advancedOpts {
          localAddress,
          localPort,
          hostHash,
          hostVerifier,
          agentForward,
          localHostname,
          localUsername,
          tryKeyboard,
          authHandler,
          keepaliveInterval,
          keepaliveCountMax,
          sock,
          algorithms,
          compress
        };

2.  Example Use

        sftp.connect({
          host: example.com,
          port: 22,
          username: 'donald',
          password: 'youarefired'
        });


<a id="orgc1acf02"></a>

### list(path, pattern) ==> Array[object]

Retrieves a directory listing. This method returns a Promise, which once
realised, returns an array of objects representing items in the remote
directory.

-   **path:** {String} Remote directory path
-   **pattern:** (optional) {string|RegExp} A pattern used to filter the items included in the returned
    array. Pattern can be a simple *glob*-style string or a regular
    expression. Defaults to `/.*/`.

1.  Example Use

        const Client = require('ssh2-sftp-client');

        const config = {
          host: 'example.com',
          port: 22,
          username: 'red-don',
          password: 'my-secret'
        };

        let sftp = new Client;

        sftp.connect(config)
          .then(() => {
            return sftp.list('/path/to/remote/dir');
          })
          .then(data => {
            console.log(data);
          })
          .then(() => {
            sftp.end();
          })
          .catch(err => {
            console.error(err.message);
          });

2.  Return Objects

    The objects in the array returned by `list()` have the following properties;

        {
          type: // file type(-, d, l)
          name: // file name
          size: // file size
          modifyTime: // file timestamp of modified time
          accessTime: // file timestamp of access time
          rights: {
            user:
            group:
            other:
          },
          owner: // user ID
          group: // group ID
        }

3.  Pattern Filter

    The filter options can be a regular expression (most powerful option) or a
    simple *glob*-like string where \* will match any number of characters, e.g.

        foo* => foo, foobar, foobaz
        *bar => bar, foobar, tabbar
        *oo* => foo, foobar, look, book

    The *glob*-style matching is very simple. In most cases, you are best off using
    a real regular expression which will allow you to do more powerful matching and
    anchor matches to the beginning/end of the string etc.


<a id="org8749d2e"></a>

### exists(path) ==> boolean

Tests to see if remote file or directory exists. Returns type of remote object
if it exists or false if it does not.

1.  Example Use

        const Client = require('ssh2-sftp-client');

        const config = {
          host: 'example.com',
          port: 22,
          username: 'red-don',
          password: 'my-secret'
        };

        let sftp = new Client;

        sftp.connect(config)
          .then(() => {
            return sftp.exists('/path/to/remote/dir');
          })
          .then(data => {
            console.log(data);          // will be false or d, -, l (dir, file or link)
          })
          .then(() => {
            sftp.end();
          })
          .catch(err => {
            console.error(err.message);
          });


<a id="orge238ec5"></a>

### stat(path) ==> object

Returns the attributes associated with the object pointed to by `path`.

-   **path:** String. Remote path to directory or file on remote server

1.  Attributes

    The `stat()` method returns an object with the following properties;

        let stats = {
          mode: 33279, // integer representing type and permissions
          uid: 1000, // user ID
          gid: 985, // group ID
          size: 5, // file size
          accessTime: 1566868566000, // Last access time. milliseconds
          modifyTime: 1566868566000, // last modify time. milliseconds
          isDirectory: false, // true if object is a directory
          isFile: true, // true if object is a file
          isBlockDevice: false, // true if object is a block device
          isCharacterDevice: false, // true if object is a character device
          isSymbolicLink: false, // true if object is a symbolic link
          isFIFO: false, // true if object is a FIFO
          isSocket: false // true if object is a socket
        };

2.  Example Use

        let client = new Client();

        client.connect(config)
          .then(() => {
            return client.stat('/path/to/remote/file');
          })
          .then(data => {
            // do something with data
          })
          .then(() => {
            client.end();
          })
          .catch(err => {
            console.error(err.message);
          });


<a id="orgc95292d"></a>

### get(path, dst, options) ==> String|Stream|Buffer

Retrieve a file from a remote SFTP server. The `dst` argument defines the
destination and can be either a string, a stream object or undefined. If it is a
string, it is interpreted as the path to a location on the local file system
(path should include the file name). If it is a stream object, the remote data
is passed to it via a call to pipe(). If `dst` is undefined, the method will put
the data into a buffer and return that buffer when the Promise is resolved. If
`dst` is defined, it is returned when the Promise is resolved.

In general, if your going to pass in a string as the destination, you are
better off using the `fastGet()` method.

-   **path:** String. Path to the remote file to download
-   **dst:** String|Stream. Destination for the data. If a string, it
    should be a local file path.
-   **options:** Options for the `get()` command (see below).

1.  Options

    The options object can be used to pass options to the underlying readStream used
    to read the data from the remote server.

        {
          flags: 'r',
          encoding: null,
          handle: null,
          mode: 0o666,
          autoClose: true
        }

    Most of the time, you won't want to use any options. Sometimes, it may be useful
    to set the encoding. For example, to 'utf-8'. However, it is important not to do
    this for binary files to avoid data corruption.

2.  Example Use

        let client = new Client();

        let remotePath = '/remote/server/path/file.txt';
        let dst = fs.createWriteStream('/local/file/path/copy.txt');

        client.connect(config)
          .then(() => {
            return client.get(remotePath, dst);
          })
          .then(() => {
            client.end();
          })
          .catch(err => {
            console.error(err.message);
          });

    -   **Tip:** See examples file in the Git repository for more examples. You can pass
        any writeable stream in as the destination. For example, if you pass in
        `zlib.createGunzip()` writeable stream, you can both download and
        decompress a gzip file 'on the fly'.


<a id="org9bec733"></a>

### fastGet(remotePath, localPath, options) ===> string

Downloads a file at remotePath to localPath using parallel reads for faster
throughput. This is the simplest method if you just want to download a file.

-   **remotePath:** String. Path to the remote file to download
-   **localPath:** String. Path on local file system for the downloaded file. The
    local path should include the filename to use for saving the
    file.
-   **options:** Options for `fastGet()` (see below)

1.  Options

        {
          concurrency: 64, // integer. Number of concurrent reads to use
          chunkSize: 32768, // integer. Size of each read in bytes
          step: function(total_transferred, chunk, total) // callback called each time a
                                                          // chunk is transferred
        }

    -   **Warning:** Some servers do not respond correctly to requests to alter chunk
        size. This can result in lost or corrupted data.

2.  Sample Use

        let client = new Client();
        let remotePath = '/server/path/file.txt';
        let localPath = '/local/path/file.txt';

        client.connect(config)
          .then(() => {
            client.fastGet(remotePath, localPath);
          })
          .then(() => {
            client.end();
          })
          .catch(err => {
            console.error(err.message);
          });


<a id="org9eac979"></a>

### put(src, remotePath, options) ==> string

Upload data from local system to remote server. If the `src` argument is a
string, it is interpreted as a local file path to be used for the data to
transfer. If the `src` argument is a buffer, the contents of the buffer are
copied to the remote file and if it is a readable stream, the contents of that
stream are piped to the `remotePath` on the server.

-   **src:** string | buffer | readable stream. Data source for data to copy to the
    remote server.
-   **remotePath:** string. Path to the remote file to be created on the server.
-   **options:** object. Options which can be passed to adjust the write stream used
    in sending the data to the remote server (see below).

1.  Options

    The following options are supported;

        {
          flags: 'w',  // w - write and a - append
          encoding: null, // use null for binary files
          mode: 0o666, // mode to use for created file (rwx)
          autoClose: true // automatically close the write stream when finished
        }

    The most common options to use are mode and encoding. The values shown above are
    the defaults. You do not have to set encoding to utf-8 for text files, null is
    fine for all file types. However, using utf-8 encoding for binary files will
    often result in data corruption.

2.  Example Use

        let client = new Client();

        let data = fs.createReadStream('/path/to/local/file.txt');
        let remote = '/path/to/remote/file.txt';

        client.connect(config)
          .then(() => {
            return client.put(data, remote);
          })
          .then(() => {
            return client.end();
          })
          .catch(err => {
            console.error(err.message);
          });

    -   **Tip:** If the src argument is a path string, consider just using `fastPut()`.


<a id="org4151217"></a>

### fastPut(localPath, remotePath, options) ==> string

Uploads the data in file at `localPath` to a new file on remote server at
`remotePath` using concurrency. The options object allows tweaking of the fast put process.

-   **localPath:** string. Path to local file to upload
-   **remotePath:** string. Path to remote file to create
-   **options:** object. Options passed to createWriteStream (see below)

1.  Options

        {
          concurrency: 64, // integer. Number of concurrent reads
          chunkSize: 32768, // integer. Size of each read in bytes
          mode: 0o755, // mixed. Integer or string representing the file mode to set
          step: function(total_transferred, chunk, total) // function. Called every time
          // a part of a file was transferred
        }

    -   **Warning:** There have been reports that some SFTP servers will not honour
        requests for non-default chunk sizes. This can result in data loss
        or corruption.

2.  Example Use

        let localFile = '/path/to/file.txt';
        let remoteFile = '/path/to/remote/file.txt';
        let client = new Client();

        client.connect(config)
          .then(() => {
            client.fastPut(localFile, remoteFile);
          })
          .then(() => {
            client.end();
          })
          .catch(err => {
            console.error(err.message);
          });


<a id="orgd40b535"></a>

### append(input, remotePath, options) ==> string

Append the `input` data to an existing remote file. There is no integrity
checking performed apart from normal writeStream checks. This function simply
opens a writeStream on the remote file in append mode and writes the data passed
in to the file.

-   **input:** buffer | readStream. Data to append to remote file
-   **remotePath:** string. Path to remote file
-   **options:** object. Options to pass to writeStream (see below)

1.  Options

    The following options are supported;

        {
          flags: 'a',  // w - write and a - append
          encoding: null, // use null for binary files
          mode: 0o666, // mode to use for created file (rwx)
          autoClose: true // automatically close the write stream when finished
        }

    The most common options to use are mode and encoding. The values shown above are
    the defaults. You do not have to set encoding to utf-8 for text files, null is
    fine for all file types. Generally, I would not attempt to append binary files.

2.  Example Use

        let remotePath = '/path/to/remote/file.txt';
        let client = new Client();

        client.connect(config)
          .then(() => {
            return client.append(Buffer.from('Hello world'), remotePath);
          })
          .then(() => {
            return client.end();
          })
          .catch(err => {
            console.error(err.message);
          });


<a id="org3e3d42a"></a>

### mkdir(path, recursive) ==> string

Create a new directory. If the recursive flag is set to true, the method will
create any directories in the path which do not already exist. Recursive flag
defaults to false.

-   **path:** string. Path to remote directory to create
-   **recursive:** boolean. If true, create any missing directories in the path as
    well

1.  Example Use

        let remoteDir = '/path/to/new/dir';
        let client = new Client();

        client.connect(config)
          .then(() => {
            return client.mkdir(remoteDir, true);
          })
          .then(() => {
            return client.end();
          })
          .catch(err => {
            console.error(err.message);
          });


<a id="org25b2074"></a>

### rmdir(path, recursive) ==> string

Remove a directory. If removing a directory and recursive flag is set to
`true`, the specified directory and all sub-directories and files will be
deleted. If set to false and the directory has sub-directories or files, the
action will fail.

-   **path:** string. Path to remote directory
-   **recursive:** boolean. If true, remove all files and directories in target
    directory. Defaults to false

**Note**: There has been at least one report that some SFTP servers will allow
non-empty directories to be removed even without the recursive flag being set to
true. While this is not standard behaviour, it is recommended that users verify
the behaviour of rmdir if there are plans to rely on the recursive flag to
prevent removal of non-empty directories.

1.  Example Use

        let remoteDir = '/path/to/remote/dir';
        let client = new Client();

        client.connect(config)
          .then(() => {
            return client.rmdir(remoteDir, true);
          })
          .then(() => {
            return client.end();
          })
          .catch(err => {
            console.error(err.message);
          });


<a id="org98fd339"></a>

### delete(path) ==> string

Delete a file on the remote server.

-   **path:** string. Path to remote file to be deleted.

1.  Example Use

        let remoteFile = '/path/to/remote/file.txt';
        let client = new Client();

        client.connect(config)
          .then(() => {
            return client.delete(remoteFile);
          })
          .then(() => {
            return client.end();
          })
          .catch(err => {
            console.error(err.message);
          });


<a id="orgf458421"></a>

### rename(fromPath, toPath) ==> string

Rename a file or directory from `fromPath` to `toPath`. You must have the
necessary permissions to modify the remote file.

-   **fromPath:** string. Path to existing file to be renamed
-   **toPath:** string. Path to new file existing file is to be renamed to. Should
    not already exist.

1.  Example Use

        let from = '/remote/path/to/old.txt';
        let to = '/remote/path/to/new.txt';
        let client = new Client();

        client.connect(config)
          .then(() => {
            return client.rename(from, to);
          })
          .then(() => {
            return client.end();
          })
          .catch(err => {
            console.error(err.message);
          });


<a id="orgb864c69"></a>

### posixRename(fromPath, toPath) ==> string

This method uses the openssh POSIX rename extension introduced in OpenSSH 4.8.
The advantage of this version of rename over standard SFTP rename is that it is
an atomic operation and will allow renaming a resource where the destination
name exists. The POSIX rename will also work on some filesystems which do not
support standard SFTP rename because they don't support the system hardlink()
call. The POSIX rename extension is available on all openSSH servers from 4.8
and some other implementations. This is an extension to the standard SFTP
protocol and therefore is not supported on all sSFTP servers.

-   **fromPath:** string. Path to existing file to be renamed.
-   **toPath:** string. Path for new name. If it already exists, it will be replaced
    by file specified in fromPath

    let from = '/remote/path/to/old.txt';
    let to = '/remote/path/to/new.txt';
    let client = new Client();

    client.connect(config)
      .then(() => {
        return client.posixRename(from, to);
      })
      .then(() => {
        return client.end();
      })
      .catch(err => {
        console.error(err.message);
      });


<a id="org057b2d7"></a>

### chmod(path, mode) ==> string

Change the mode (read, write or execute permissions) of a remote file or
directory.

-   **path:** string. Path to the remote file or directory
-   **mode:** octal. New mode to set for the remote file or directory

1.  Example Use

        let path = '/path/to/remote/file.txt';
        let newMode = 0o644;  // rw-r-r
        let client = new Client();

        client.connect(config)
          .then(() => {
            return client.chmod(path, newMode);
          })
          .then(() => {
            return client.end();
          })
          .catch(err => {
            console.error(err.message);
          });


<a id="org587ee7e"></a>

### realPath(path) ===> string

Converts a relative path to an absolute path on the remote server. This method
is mainly used internally to resolve remote path names.

**Warning**: Currently, there is a platform inconsistency with this method on
win32 platforms. For servers running on non-win32 platforms, providing a path
which does not exist on the remote server will result in an empty e.g. '',
absolute path being returned. On servers running on win32 platforms, a
normalised path will be returned even if the path does not exist on the remote
server. It is therefore advised not to use this method to also verify a path
exists. instead, use the `exist()` method.

-   **path:** A file path, either relative or absolute. Can handle '.' and '..', but
    does not expand '~'.


<a id="org3c92652"></a>

### cwd() ==> string

Returns what the server believes is the current remote working directory.


<a id="org79dbbf7"></a>

### uploadDir(srcDir, dstDir) ==> string

Upload the directory specified by `srcDir` to the remote directory specified by
`dstDir`. The `dstDir` will be created if necessary. Any sub directories within
`srcDir` will also be uploaded. Any existing files in the remote path will be
overwritten.

The upload process also emits 'upload' events. These events are fired for each
successfully uploaded file. The `upload` event calls listeners with 1 argument,
an object which has properties source and destination. The source property is
the path of the file uploaded and the destination property is the path to where
the file was uploaded to. The purpose of this event is to provide some way for
client code to get feedback on the upload progress. You can add your own lisener
using the `on()` method.

-   **srcDir:** A local file path specified as a string
-   **dstDir:** A remote file path specified as a string

1.  Example

            'use strict';

            // Example of using the uploadDir() method to upload a directory
            // to a remote SFTP server

            const path = require('path');
            const SftpClient = require('../src/index');

            const dotenvPath = path.join(__dirname, '..', '.env');
            require('dotenv').config({path: dotenvPath});

            const config = {
        host: process.env.SFTP_SERVER,
        username: process.env.SFTP_USER,
        password: process.env.SFTP_PASSWORD,
        port: process.env.SFTP_PORT || 22
            };

            async function main() {
        const client = new SftpClient('upload-test');
        const src = path.join(__dirname, '..', 'test', 'testData', 'upload-src');
        const dst = '/home/tim/upload-test';

        try {
          await client.connect(config);
          client.on('upload', info => {
            console.log(`Listener: Uploaded ${info.source}`);
          });
          let rslt = await client.uploadDir(src, dst);
          return rslt;
        } finally {
          client.end();
        }
            }

            main()
        .then(msg => {
          console.log(msg);
        })
        .catch(err => {
          console.log(`main error: ${err.message}`);
        });


<a id="orgb353458"></a>

### downloadDir(srcDir, dstDir) ==> string

Download the remote directory specified by `srcDir` to the local file system
directory specified by `dstDir`. The `dstDir` directory will be created if
required. All sub directories within `srcDir` will also be copied. Any existing
files in the local path will be overwritten. No files in the local path will be
deleted.

The method also emites `download` events to provide a way to monitor download
progress. The download event listener is called with one argument, an object
with two properties, source and destination. The source property is the path to
the remote file that has been downloaded and the destination is the local path
to where the file was downloaded to. You can add a listener for this event using
the `on()` method.

-   **srcDir:** A remote file path specified as a string
-   **dstDir:** A local file path specified as a string

1.  Example

        'use strict';

        // Example of using the downloadDir() method to upload a directory
        // to a remote SFTP server

        const path = require('path');
        const SftpClient = require('../src/index');

        const dotenvPath = path.join(__dirname, '..', '.env');
        require('dotenv').config({path: dotenvPath});

        const config = {
          host: process.env.SFTP_SERVER,
          username: process.env.SFTP_USER,
          password: process.env.SFTP_PASSWORD,
          port: process.env.SFTP_PORT || 22
        };

        async function main() {
          const client = new SftpClient('upload-test');
          const dst = '/tmp';
          const src = '/home/tim/upload-test';

          try {
            await client.connect(config);
            client.on('download', info => {
        console.log(`Listener: Download ${info.source}`);
            });
            let rslt = await client.downloadDir(src, dst);
            return rslt;
          } finally {
            client.end();
          }
        }

        main()
          .then(msg => {
            console.log(msg);
          })
          .catch(err => {
            console.log(`main error: ${err.message}`);
          });


<a id="orge03d8fc"></a>

### end() ==> boolean

Ends the current client session, releasing the client socket and associated
resources. This function also removes all listeners associated with the client.

1.  Example Use

        let client = new Client();

        client.connect(config)
          .then(() => {
            // do some sftp stuff
          })
          .then(() => {
            return client.end();
          })
          .catch(err => {
            console.error(err.message);
          });


<a id="orgbcffecf"></a>

### Add and Remove Listeners

Although normally not required, you can add and remove custom listeners on the
ssh2 client object. This object supports a number of events, but only a few of
them have any meaning in the context of SFTP. These are

-   **error:** An error occurred. Calls listener with an error argument.
-   **end:** The socket has been disconnected. No argument.
-   **close:** The socket was closed. Boolean argument which is true when the socket
    was closed due to errors.

1.  on(eventType, listener)

    Adds the specified listener to the specified event type. It the event type is
    `error`, the listener should accept 1 argument, which will be an Error object. If
    the event type is `close`, the listener should accept one argument of a boolean
    type, which will be true when the client connection was closed due to errors.

2.  removeListener(eventType, listener)

    Removes the specified listener from the event specified in eventType. Note that
    the `end()` method automatically removes all listeners from the client object.


<a id="orge8865c0"></a>

# Platform Quirks & Warnings


<a id="org93825c3"></a>

## Server Capabilities

All SFTP servers and platforms are not equal. Some facilities provided by
`ssh2-sfto-client` either depend on capabilities of the remote server or the
underlying capabilities of the remote server platform. As an example,
consider `chmod()`. This command depends on a remote filesystem which
implements the 'nix' concept of users and groups. The *win32* platform does
not have the same concept of users and groups, so `chmod()` will not behave
in the same way.

One way to determine whether an issue you are encountering is due to
`ssh2-sftp-client` or due to the remote server or server platform is to use a
simple CLI sftp program, such as openSSH's sftp command. If you observe the
same behaviour using plain `sftp` on the command line, the issue is likely
due to server or remote platform limitations. Note that you should not use a
GUI sftp client, like `Filezilla` or `winSCP` as such GUI programs often
attempt to hide these server and platform incompatibilities and will take
additional steps to simulate missing functionality etc. You want to use a CLI
program which does as little as possible.

One way to determine whether an issue you are encountering is due to
`ssh2-sftp-client` or due to the remote server or server platform is to use a
simple CLI sftp program, such as openSSH's sftp command. If you observe the
same behaviour using plain `sftp` on the command line, the issue is likely
due to server or remote platform limitations. Note that you should not use a
GUI sftp client, like `Filezilla` or `winSCP` as such GUI programs often
attempt to hide these server and platform incompatibilities and will take
additional steps to simulate missing functionality etc.


<a id="orgfb10b68"></a>

## Promises & Events

The reality of the current Node environment is that Promises and Events don't
play nicely together. Part of the problem is that events are asynchronous in
nature and can occur at any time. It is very difficult to ensure an event is
captured inside a Promise and handled appropriately. More information can be
found in the Node documentation for Events.

Node v12 has introduced some experimental features to make working with
Events and Promises a little easier. At this stage, we are not using these
features because they are experimental and because it would mean you cannot
use this module with Node v10. Use of these features will likely be examined
more closely once they become stable and non-experimental.

So, what does this mean for this module? The `ssh2-sftp-client` module works
hard to ensure things work as expected. In most cases, events are handled
appropriately. However, there are some edge cases where events may not be
handled and you may see an uncaught error exception. The most common place to
see this is when you keep an SFTP connection open, but don't use it for some
time. When the connection is open, but no methods are active (running), there
are no error handlers defined. Should an error event be emitted (for exmaple,
because the network connection has been lost), there is no handler and you
will get an uncaught error exception.

One way to handle this is to add your own error handler using the on()
method. Note however, you need to be careful how many times your error
handler is added. If you begin to see a warning about a possible memory leak,
it is an indication your error handler is being added multiple times (Node
will generate this warning if it finds more than 11 listeners attached to an
event emitter).

The other issue that can occur is that in some rare cases, the error message
you get will be potentially misleading. For example, SFTP servers running on
Windows appear to emit an *ECONNRESET* error in addition to the main error
(for example, for failed authentication). This can result in an error which
looks like a connection was reset by the remote host when in fact the real
error was due to bad authentication (bad password or bad username). This
situation can be made even worse by some platforms which deliberately hide
the real error for security reasons e.g. does not report an error indicating
a bad username because that information can be used to try and identify
legitimate usernames. While this module attempts to provide meaningful error
messages which can assist developers track down problems, it is a good idea
to consider these errors with a grain of salt and verify the error when
possible.


<a id="org78d9cc9"></a>

## Windows Based Servers

It appears that when the sftp server is running on Windows, a *ECONNRESET*
error signal is raised when the end() method is called. Unfortunately, this
signal is raised after a considerable delay. This means we cannot remove the
error handler used in the end() promise as otherwise you will get an uncaught
exception error. Leaving the handler in place, even though we will ignore
this error, solves that issue, but unfortunately introduces a new problem.
Because we are not removing the listener, if you re-use the client object for
subsequent connections, an additional error handler will be added. If this
happens more than 11 times, you will eventually see the Node warning about a
possible memory leak. This is because node monitors the number of error
handlers and if it sees more than 11 added to an object, it assumes there is
a problem and generates the warning.

The best way to avoid this issue is to not re-use client objects. Always
generate a new sftp client object for each new connection.


<a id="org3cf0fa1"></a>

## Don't Re-use SftpClient Objects

Due to an issue with *ECONNRESET* error signals when connecting to Windows
based SFTP servers, it is not possible to remove the error handler in the
end() method. This means that if you re-use the SftpClient object for
multiple connections e.g. calling connect(), then end(), then connect() etc,
you run the risk of multiple error handlers being added to the SftpClient
object. After 11 handlers have been added, Node will generate a possible
memory leak warning.

To avoid this problem, don't re-use SftpClient objects. Generate a new
SftpClient object for each connection. You can perform multiple actions with
a single connection e.g. upload multiple files, download multiple files etc,
but after you have called end(), you should not try to re-use the object with
a further connect() call. Create a new object instead.


<a id="org321b304"></a>

# FAQ


<a id="orgc32199b"></a>

## Remote server drops connections with only an end event

Many SFTP servers have rate limiting protection which will drop connections once
a limit has been reached. In particular, openSSH has the setting `MaxStartups`,
which can be a tuple of the form `max:drop:full` where `max` is the maximum
allowed unauthenticated connections, `drop` is a percentage value which
specifies percentage of connections to be dropped once `max` connections has
been reached and `full` is the number of connections at which point all
subsequent connections will be dropped. e.g. `10:30:60` means allow up to 10
unauthenticated connections after which drop 30% of connection attempts until
reaching 60 unauthenticated connections, at which time, drop all attempts.

Clients first make an unauthenticated connection to the SFTP server to begin
negotiation of protocol settings (cipher, authentication method etc). If you are
creating multiple connections in a script, it is easy to exceed the limit,
resulting in some connections being dropped. As SSH2 only raises an 'end' event
for these dropped connections, no error is detected. The `ssh2-sftp-client` now
listens for `end` events during the connection process and if one is detected,
will reject the connection promise.

One way to avoid this type of issue is to add a delay between connection
attempts. It does not need to be a very long delay - just sufficient to permit
the previous connection to be authenticated. In fact, the default setting for
openSSH is `10:30:60`, so you really just need to have enough delay to ensure
that the 1st connection has completed authentication before the 11th connection
is attempted.


<a id="org0fc4a8c"></a>

## How can I pass writable stream as dst for get method?

If the dst argument passed to the get method is a writeable stream, the remote
file will be piped into that writeable. If the writeable you pass in is a
writeable stream created with `fs.createWriteStream()`, the data will be written
to the file specified in the constructor call to `createWriteStream()`.

The writeable stream can be any type of write stream. For example, the below code
will convert all the characters in the remote file to upper case before it is
saved to the local file system. This could just as easily be something like a
gunzip stream from `zlib`, enabling you to decompress remote zipped files as you
bring them across before saving to local file system.

    'use strict';

    // Example of using a writeable with get to retrieve a file.
    // This code will read the remote file, convert all characters to upper case
    // and then save it to a local file

    const Client = require('../src/index.js');
    const path = require('path');
    const fs = require('fs');
    const through = require('through2');

    const config = {
      host: 'arch-vbox',
      port: 22,
      username: 'tim',
      password: 'xxxx'
    };

    const sftp = new Client();
    const remoteDir = '/home/tim/testServer';

    function toupper() {
      return through(function(buf, enc, next) {
        next(null, buf.toString().toUpperCase());
      });
    }

    sftp
      .connect(config)
      .then(() => {
        return sftp.list(remoteDir);
      })
      .then(data => {
        // list of files in testServer
        console.dir(data);
        let remoteFile = path.join(remoteDir, 'test.txt');
        let upperWtr = toupper();
        let fileWtr = fs.createWriteStream(path.join(__dirname, 'loud-text.txt'));
        upperWtr.pipe(fileWtr);
        return sftp.get(remoteFile, upperWtr);
      })
      .then(() => {
        return sftp.end();
      })
      .catch(err => {
        console.error(err.message);
      });


<a id="org333b89b"></a>

## How can I upload files without having to specify a password?

There are a couple of ways to do this. Essentially, you want to setup SSH keys
and use these for authentication to the remote server.

One solution, provided by @KalleVuorjoki is to use the SSH agent
process. **Note**: SSH<sub>AUTH</sub><sub>SOCK</sub> is normally created by your OS when you load the
ssh-agent as part of the login session.

    let sftp = new Client();
    sftp.connect({
      host: 'YOUR-HOST',
      port: 'YOUR-PORT',
      username: 'YOUR-USERNAME',
      agent: process.env.SSH_AUTH_SOCK
    }).then(() => {
      sftp.fastPut(/* ... */)
    }

Another alternative is to just pass in the SSH key directly as part of the
configuration.

    let sftp = new Client();
    sftp.connect({
      host: 'YOUR-HOST',
      port: 'YOUR-PORT',
      username: 'YOUR-USERNAME',
      privateKey: fs.readFileSync('/path/to/ssh/key')
    }).then(() => {
      sftp.fastPut(/* ... */)
    }


<a id="org0751bb0"></a>

## How can I connect through a Socks Proxy

This solution was provided by @jmorino.

    import { SocksClient } from 'socks';
    import SFTPClient from 'ssh2-sftp-client';

    const host = 'my-sftp-server.net';
    const port = 22; // default SSH/SFTP port on remote server

    // connect to SOCKS 5 proxy
    const { socket } = await SocksClient.createConnection({
      proxy: {
        host: 'my.proxy', // proxy hostname
        port: 1080, // proxy port
        type: 5, // for SOCKS v5
      },
      command: 'connect',
      destination: { host, port } // the remote SFTP server
    });

    const client = new SFTPClient();
    client.connect({
      host,
      sock: socket, // pass the socket to proxy here (see ssh2 doc)
      username: '.....',
      privateKey: '.....'
    })

    // client is connected


<a id="orgcd6dd66"></a>

## Timeout while waiting for handshake or handshake errors

Some users have encountered the error 'Timeout while waiting for handshake' or
'Handshake failed, no matching client->server ciphers. This is often due to the
client not having the correct configuration for the transport layer algorithms
used by ssh2. One of the connect options provided by the ssh2 module is
`algorithm`, which is an object that allows you to explicitly set the key
exchange, ciphers, hmac and compression algorithms as well as server
host key used to establish the initial secure connection. See the SSH2
documentation for details. Getting these parameters correct usually resolves the
issue.


<a id="orgb323717"></a>

## How can I limit upload/download speed

If you want to limit the amount of bandwidth used during upload/download of
data, you can use a stream to limit throughput. The following example was
provided by *kennylbj*. Note that there is a caveat that we must set the
`autoClose` flag to false to avoid calling an extra `_read()` on a closed stream
that may cause \_get Permission Denied error in ssh2-streams.



    const Throttle = require('throttle');
    const progress = require('progress-stream');

    // limit download speed
    const throttleStream = new Throttle(config.throttle);

    // download progress stream
    const progressStream = progress({
      length: fileSize,
      time: 500,
    });
    progressStream.on('progress', (progress) => {
      console.log(progress.percentage.toFixed(2));
    });

    const outStream = createWriteStream(localPath);

    // pipe streams together
    throttleStream.pipe(progressStream).pipe(outStream);

    try {
      // set autoClose to false
      await client.get(remotePath, throttleStream, { autoClose: false });
    } catch (e) {
      console.log('sftp error', e);
    } finally {
      await client.end();
    }


<a id="orgd7f74ee"></a>

# Examples

I have started collecting example scripts in the example directory of the
repository. These are mainly scripts I have put together in order to investigate
issues or provide samples for users. They are not robust, lack adequate error
handling and may contain errors. However, I think they are still useful for
helping developers see how the module and API can be used.


<a id="org25bd174"></a>

# Troubleshooting

The `ssh2-sftp-client` module is essentially a wrapper around the `ssh2` and
`ssh2-streams` modules, providing a higher level `promise` based API. When you
run into issues, it is important to try and determine where the issue lies -
either in the ssh2-sftp-client module or the underlying `ssh2` and
`ssh2-streams` modules. One way to do this is to first identify a minimal
reproducible example which reproduces the issue. Once you have that, try to
replicate the functionality just using the `ssh2` and `ssh2-streams` modules. If
the issue still occurs, then you can be fairly confident it is something related
to those later 2 modules and therefore and issue which should be referred to the
maintainer of that module.

The `ssh2` and `ssh2-streams` modules are very solid, high quality modules with
a large user base. Most of the time, issues with those modules are due to client
misconfiguration. It is therefore very important when trying to diagnose an
issue to also check the documentation for both `ssh2` and `ssh2-streams`. While
these modules have good defaults, the flexibility of the ssh2 protocol means
that not all options are available by default. You may need to tweak the
connection options, ssh2 algorithms and ciphers etc for some remote servers. The
documentation for both the `ssh2` and `ssh2-streams` module is quite
comprehensive and there is lots of valuable information in the issue logs.

If you run into an issue which is not repeatable with just the `ssh2` and
`ssh2-streams` modules, then please log an issue against the `ssh2-sftp-client`
module and I will investigate. Please note the next section on logging issues.

Note also that in the repository there are two useful directories. The first is
the examples directory, which contain some examples of using `ssh2-sftp-client`
to perform common tasks. A few minutes reviewing these examples can provide that
additional bit of detail to help fix any problems you are encountering.

The second directory is the tools directory. I have some very basic simple
scripts in this directory which perform basic tasks using only the `ssh2` and
`ssh2-streams` modules (no ssh2-sftp-client module). These can be useful when
trying to determine if the issue is with the underlying `ssh2` and
`ssh2-streams` modules.


<a id="org9af0c4d"></a>

## Common Errors

There are some common errors people tend to make when using Promises or
Asyc/Await. These are by far the most common problem found in issues logged
against this module. Please check for some of these before logging your
issue.


<a id="org0eb8b2b"></a>

### Not returning the promise in a `then()` block

All methods in `ssh2-sftp-client` return a Promise. This means methods are
executed *asynchrnously*. When you call a method inside the `then()` block
of a promise chain, it is critical that you return the Promise that call
generates. Failing to do this will result in the `then()` block completing
and your code starting execution of the next `then()`, `catch()` or
`finally()` block before your promise has been fulfilled. For exmaple, the
following will not do what you expect

    sftp.connect(config)
      .then(() => {
        sftp.fastGet('foo.txt', 'bar.txt');
      }).then(rslt => {
        console.log(rslt);
        sftp.end();
      }).catch(e => {
        console.error(e.message);
      });

In the above code, the `sftp.end()` method will almost certainly be called
before `sftp.gastGet()` has been fulfilled (unless the *foo.txt* file is
really small!). In fact, the whole promise chain will complete and exit even
before the `sftp.end()` call has been fulfilled. The correct code would be
something like

    sftp.connect(config)
      .then(() => {
        return sftp.fastGet('foo.txt', 'bar.txt');
      }).then(rslt => {
        console.log(rslt);
        return sftp.end();
      }).catch(e => {
        console.error(e.message);
      });

Note the `return` statements. These ensure that the Promise returned by the
client method is returned into the promise chain. It will be this promise
the next block in the chain will wait on to be fulfilled before the next
block is executed. Without the return statement, that block will return the
default promise for that block, which essentially says *this block has been
fulfilled*. What you really want is the promise which says *your sftp client
method call has been fulfilled*.

A common symptom of this type of error is for file uploads or download to
fail to complete or for data in those files to be truncated. What is
happening is that the connection is being ended before the transfer has
completed.


<a id="org9c70121"></a>

### Mixing Promise Chains and Async/Await

Another common error is to mix Promise chains and async/await calls. This is
rarely a great idea. While you can do this, it tends to create complicated
and difficult to maintain code. Select one approach and stick with it. Both
approaches are functionally equivalent, so there is no reason to mix up the
two paradigms. My personal preference would be to use async/await as I think
that is more *natural* for most developers. For example, the following is
more complex and difficult to follow than necessary (and has a bug!)

    sftp.connect(config)
      .then(() => {
        return sftp.cwd();
      }).then(async (d) => {
        console.log(`Remote directory is ${d}`);
        try {
          await sftp.fastGet(`${d}/foo.txt`, `./bar.txt`);
        }.catch(e => {
          console.error(e.message);
        });
      }).catch(e => {
        console.error(e.message);
      }).finally(() => {
        sftp.end();
      });

The main bug in the above code is the `then()` block is not returning the
Promise generated by the call to `sftp.fastGet()`. What it is actually
returning is a fulfilled promise which says the `then()` block has been run
(note that the await'ed promise is not being returned and is therefore
outside the main Promise chain). As a result, the `finally()` block will be
executed before the await promise has been fulfilled.

Using async/await inside the promise chain has created unnecessary
complexity and leads to incorrect assumptions regarding how the code will
execute. A quick glance at the code is likely to give the impression that
execution will wait for the `sftp.fastGet()` call to be fulfilled before
continuing. This is not the case. The code would be more clearly expressed
as either

    sftp.connect(config)
      .then(() => {
        return sftp.cwd();
      }).then(d => {
        console.log(`remote dir ${d}`);
        return sftp.fastGet(`${d}/foot.txt`, 'bar.txt');
      }).catch(e => {
        console.error(e.message);
      }).finally(() => {
        return sftp.end();
      });

**or, using async/await**

    async function doSftp() {
      try {
        let sftp = await sftp.connect(conf);
        let d = await sftp.cwd();
        console.log(`remote dir is ${d}`);
        await sftp.fastGet(`${d}/foo.txt`, 'bat.txt');
      } catch (e) {
        console.error(e.message);
      } finally () {
        await sftp.end();
      }
    }


<a id="org5418fd1"></a>

### Try/catch and Error Handlers

Another common error is to try and use a try/catch block to catch event
signals, such as an error event. In general, you cannot use try/catch blocks
for asynchronous code and expect errors to be caught by the `catch` block.
Handling errors in asynchronous code is one of the key reasons we now have
the Promise and async/await frameworks.

The basic problem is that the try/catch block will have completed execution
before the asynchronous code has completed. If the asynchronous code has not
compleed, then there is a potential for it to raise an error. However, as
the try/catch block has already completed, there is no *catch* waiting to
catch the error. It will bubble up and probably result in your script
exiting with an uncaught exception error.

Error events are essentially asynchronous code. You don't know when such
events will fire. Therefore, you cannot use a try/catch block to catch such
event errors. Even creating an error handler which then throws an exception
won't help as the key problem is that your try/catch block has already
executed. There are a number of alternative ways to deal with this
situation. However, the key symptom is that you see occasional uncaught
error exceptions that cause your script to exit abnormally despite having
try/catch blocks in your script. What you need to do is look at your code
and find where errors are raised asynchronously and use an event handler or
some other mechanism to manage any errors raised.


<a id="org3707780"></a>

## Debugging Support

You can add a `debug` property to the config object passed in to `connect()` to
turn on debugging. This will generate quite a lot of output. The value of the
property should be a function which accepts a single string argument. For example;

    config.debug = msg => {
      console.error(msg);
    };

Enabling debugging can generate a lot of output. If you use console.error() as
the output (as in the example above), you can redirect the output to a file
using shell redirection e.g.

    node script.js 2> debug.log

If you just want to see debug messages from `ssh2-sftp-client` and exclude debug
messages from the underlying `ssh2` and `ssh2-streams` modules, you can filter
based on messages which start with 'CLIENT' e.g.

    {
      debug: (msg) => {
        if (msg.startsWith('CLIENT')) {
          console.error(msg);
        }
      }
    }


<a id="org91866b1"></a>

# Logging Issues

Please log an issue for all bugs, questions, feature and enhancement
requests. Please ensure you include the module version, node version and
platform.

I am happy to try and help diagnose and fix any issues you encounter while using
the `ssh2-sftp-client` module. However, I will only put in effort if you are
prepared to put in the effort to provide the information necessary to reproduce
the issue. Things which will help

-   Node version you are using
-   Version of ssh2-sftp-client you are using
-   Platform your client is running on (Linux, macOS, Windows)
-   Platform and software for the remote SFTP server when possible
-   Example of your code. By far, the most common issue is incorrect use of the
    module API. Example code can usually result in such issues being resolved very
    quickly.

Perhaps the best assistance is a minimal reproducible example of the issue. Once
the issue can be readily reproduced, it can usually be fixed very quickly.


<a id="org2aaa323"></a>

# Pull Requests

Pull requests are always welcomed. However, please ensure your changes pass all
tests and if your adding a new feature, that tests for that feature are
included. Likewise, for new features or enhancements, please include any
relevant documentation updates.

This module will adopt a standard semantic versioning policy. Please indicate in
your pull request what level of change it represents i.e.

-   **Major:** Change to API or major change in functionality which will require an
    increase in major version number.
-   **Minor:** Minor change, enhancement or new feature which does not change
    existing API and will not break existing client code.
-   **Bug Fix:** No change to functionality or features. Simple fix of an existing
    bug.


<a id="org8d9423a"></a>

# Contributors

This module was initially written by jyu213. On August 23rd, 2019, theophilusx
took over responsibility for maintaining this module. A number of other people
have contributed to this module, but until now, this was not tracked. My
intention is to credit anyone who contributes going forward.

Thanks to the following for their contributions -

-   **jyu213:** Original author
-   **theophilusx:** Current maintainer
-   **henrytk:** Documentation fix
-   **waldyrious:** Documentation fixes
-   **james-pellow:** Cleanup and fix for connect method logic
-   **jhorbulyk:** Contributed posixRename() functionality
-   **teenangst:** Contributed fix for error code 4 in stat() method
-   **kennylbj:** Contributed example of using a throttle stream to limit
    upload/download bandwidth.
-   **anton-erofeev:** Documentation fix
