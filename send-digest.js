var fs = require('fs');
var url = require('url');
var path = require('path');
var request = require('request');
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
var POST_URL = process.env['POST_URL'];
var DRY_RUN = 'DRY_RUN' in process.env;
var SUBJECT = (process.env['DIGEST_NAME'] || 'Minigroup Digest') +
              ' for ' + new Date().toDateString();
var TEMPLATE = fs.readFileSync(path.join(__dirname, 'digest.html'), 'utf-8');

var client = new POP3Client(POP3_PORT, POP3_HOST, {enabletls: true});

function sendEmail(html) {
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
  });
}

function postToURL(html) {
  var parsed = url.parse(POST_URL);
  var auth, postURL;

  if (parsed.auth) {
    auth = parsed.auth.split(':');
    auth = {user: auth[0], pass: auth[1]};
    delete parsed.auth;
  }

  postURL = url.format(parsed);
  request.post({
    url: postURL,
    auth: auth,
    form: {
      html: html
    },
    timeout: 60000
  }, function(err, res, body) {
    if (err) throw err;
    if (res.statusCode != 200)
      throw new Error('expected status 200, got ' + res.statusCode);
    console.log("POST", postURL, "successful.");
  });
}

client.on('connect', function() { client.login(USERNAME, PASSWORD); });

client.on('login', function(status) {
  if (!status) throw new Error('login failed');

  var threads = {};
  var rawMessages = new MessageStream(client);
  var parsedMail = new MailParsingStream();

  rawMessages.pipe(parsedMail);
  parsedMail.on('data', function(data) {
    processMinigroupPost(data);
    if (data.minigroup) {
      var subject = data.minigroup.subject;
      if (!(subject in threads))
        threads[subject] = [];
      threads[subject].push(data);
    }
  });
  parsedMail.on('end', function() {
    var html = Mustache.render(TEMPLATE, {
      threads: Object.keys(threads).map(function(subject) {
        return {subject: subject, posts: threads[subject]};
      }),
      subject: SUBJECT
    });

    console.log("closing POP3 connection.");

    DRY_RUN ? client.end() : client.quit();

    if (RECIPIENTS) sendEmail(html);
    if (POST_URL) postToURL(html);
  });
});
