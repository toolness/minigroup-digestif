var stream = require('stream');
var util = require('util');
var MailParser = require('mailparser').MailParser;

function MailParsingStream() {
  stream.Transform.call(this, {
    decodeStrings: false,
    objectMode: true
  });
}

util.inherits(MailParsingStream, stream.Transform);

MailParsingStream.prototype._transform = function(chunk, encoding, cb) {
  var self = this;
  var mailParser = new MailParser();
  mailParser.on('end', function(mail) {
    self.push(mail);
    cb();
  });
  mailParser.write(chunk);
  mailParser.end();
};

module.exports = MailParsingStream;
