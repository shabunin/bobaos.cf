// this file is not a part of CommandFusion gui
// it is nodejs script to assemble whole project into single zip file
//
// Usage:
// $ npm install archiver
// $ node ./createZipFile.js
// $ http-server

var fs = require("fs");
var archiver = require("archiver");

// create a file to stream archive data to.
var output = fs.createWriteStream(__dirname + "/gui.zip");
var archive = archiver("zip", {
  store: true // Sets the compression method to STORE.
});

// listen for all archive data to be written
output.on("close", function() {
  console.log(archive.pointer() + " total bytes");
  console.log("archiver has been finalized and the output file descriptor has closed.");
});

// good practice to catch this error explicitly
archive.on("error", function(err) {
  throw err;
});

// pipe archive data to the file
archive.pipe(output);

// append a file from stream
var gui = __dirname + "/bobaos.gui";
archive.append(fs.createReadStream(gui), { name: "bobaos.gui" });

var asv = __dirname + "/bobaos.gui";
archive.append(fs.createReadStream(asv), { name: "bobaos.asv" });

// append files from a directory
archive.directory("assets/");

// append files from a glob pattern
archive.glob("subdir/*");

// finalize the archive (ie we are done appending files but streams have to finish yet)
archive.finalize();
