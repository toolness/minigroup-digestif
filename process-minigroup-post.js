var cheerio = require('cheerio');

var SUBJECT_MATCH = /^(?:Re\: |You’re invited to attend )?(.*) — (.+)$/;

function processMinigroupPost(mail) {
  if (mail.from[0].address == 'notification@minigroupmail.com') {
    var $ = cheerio.load(mail.html);
    var subjectMatch = mail.subject.match(SUBJECT_MATCH);

    mail.minigroup = {
      subject: mail.subject,
      from: mail.from[0].name.split(' via Minigroup')[0],
      thumbnailURL: $('img.thumb').attr('src'),
      html: $('div.formatted').html()
    };
    if (subjectMatch) {
      mail.minigroup.subject = subjectMatch[1];
      mail.minigroup.group = subjectMatch[2];
    }
    $('a[href^="http://email.minigroupmail.com"]').each(function() {
      if ($(this).text().match(/View this post/i))
        mail.minigroup.viewURL = $(this).attr("href");
    });
  }
}

module.exports = processMinigroupPost;
