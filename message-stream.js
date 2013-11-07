var stream = require('stream');
var util = require('util');

function MessageStream(client) {
  stream.Readable.call(this);
  this._client = client;
  this._index = 1;
}

util.inherits(MessageStream, stream.Readable);

MessageStream.prototype._read = function() {
  var self = this;
  self._client.once('retr', function(status, msgnumber, data, rawdata) {
    if (!status) return self.push(null);
    self._index++;
    self.push(data);
  });
  self._client.retr(self._index);
};

module.exports = MessageStream;
