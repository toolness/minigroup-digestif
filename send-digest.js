var fs = require('fs');
var path = require('path');
var nodemailer = require('nodemailer');
var POP3Client = require('poplib');
var Mustache = require('mustache');

var MessageStream = require('./message-stream');
var MailParsingStream = require('./mail-parsing-stream');
var processMinigroupPost = require('./process-minigroup-post');

var POP3_PORT = process.env['POP3_PORT'] || 995
var POP3_HOST = process.env['POP3_HOST'] || 'pop.gmail.com';
var USERNAME = process.env['USERNAME'];
var PASSWORD = process.env['PASSWORD'];
var RECIPIENTS = process.env['RECIPIENTS'];
var DRY_RUN = 'DRY_RUN' in process.env;
var SUBJECT = (process.env['DIGEST_NAME'] || 'Minigroup Digest') +
              ' for ' + new Date().toDateString();
var TEMPLATE = fs.readFileSync(path.join(__dirname, 'digest.html'), 'utf-8');

var client = new POP3Client(POP3_PORT, POP3_HOST, {enabletls: true});

client.on('connect', function() { client.login(USERNAME, PASSWORD); });

client.on('login', function(status) {
  if (!status) throw new Error('login failed');

  var posts = [];
  var rawMessages = new MessageStream(client);
  var parsedMail = new MailParsingStream();

  rawMessages.pipe(parsedMail);
  parsedMail.on('data', function(data) {
    processMinigroupPost(data);
    if (data.minigroup)
      posts.push(data);
  });
  parsedMail.on('end', function() {
    var html = Mustache.render(TEMPLATE, {
      posts: posts,
      subject: SUBJECT
    });
    var smtp = nodemailer.createTransport("SMTP", {
      service: "Gmail",
      auth: {
        user: USERNAME,
        pass: PASSWORD
      }
    });
    smtp.sendMail({
      from: USERNAME,
      to: RECIPIENTS,
      subject: SUBJECT,
      html: html
    }, function(err, res) {
      if (err) throw err;
      console.log("email sent to " + RECIPIENTS + ".");
      smtp.close();
      DRY_RUN ? client.end() : client.quit();
    });
  });
});
