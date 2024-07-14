'use strict';

// Example of using a writeable with get to retrieve a file.
// This code will read the remote file, convert all characters to upper case
// and then save it to a local file

import Client from '../src/index.js';
import { join } from 'node:path';
import { createWriteStream } from 'node:fs';
import through from 'through2';

const config = {
  host: 'arch-vbox',
  port: 22,
  username: 'tim',
  password: 'xxxx',
};

const sftp = new Client();
const remoteDir = '/home/tim/testServer';

function toupper() {
  return through(function (buf, _, next) {
    next(null, buf.toString().toUpperCase());
  });
}

sftp
  .connect(config)
  .then(() => {
    return sftp.list(remoteDir);
  })
  .then((data) => {
    // list of files in testServer
    console.dir(data);
    let remoteFile = join(remoteDir, 'test.txt');
    let upperWtr = toupper();
    let fileWtr = createWriteStream('./test.data');
    upperWtr.pipe(fileWtr);
    return sftp.get(remoteFile, upperWtr);
  })
  .then(() => {
    return sftp.end();
  })
  .catch((err) => {
    console.error(err.message);
  });
