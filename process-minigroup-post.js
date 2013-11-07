var cheerio = require('cheerio');

function processMinigroupPost(mail) {
  if (mail.from[0].address == 'notification@minigroupmail.com') {
    var $ = cheerio.load(mail.html);

    mail.minigroup = {
      from: mail.from[0].name.split(' via Minigroup')[0],
      thumbnailURL: $('img.thumb').attr('src'),
      html: $('div.formatted').html()
    };
    $('a[href^="http://email.minigroupmail.com"]').each(function() {
      if ($(this).text().match(/View this post/i))
        mail.minigroup.viewURL = $(this).attr("href");
    });
  }
}

module.exports = processMinigroupPost;
