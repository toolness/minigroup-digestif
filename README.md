This is a simple program that takes all the [Minigroup][] emails sent
to a Gmail account, compiles them into a digest, and sends them to a list
of recipients.

## Prerequisites

Node v0.10.

## Usage

```
git clone https://github.com/toolness/minigroup-digestif.git
cd minigroup-digestif
npm install
```

You'll want to define the following environment variables:

* `USERNAME` is the Gmail email address that will be used to receive
  minigroup notifications and send digests from. e.g.,
  `minigroupdigestif@gmail.com`.
* `PASSWORD` is the password for the Gmail account.
* `RECIPIENTS` is the comma-separated list of email addresses to
  send digests to.

Additionally, for testing purposes you can define the `DRY_RUN` 
environment variable to an empty string, in which case messages
will never be marked as unread when a digest is generated (the digest,
however, will still be sent out).

Once you've defined your environment variables, simply run
`node send-digest.js`. This will send a digest of all unread
Minigroup notifications. Set up this command as a daily
`cron` or [Heroku Scheduler][] job and you're done.

## Limitations

Originally the solution was to use any email account accessible via
POP3, but Gmail's POP3 server behaves idiosyncratically, so this
solution probably won't work very well with other services out-of-the-box.
However, it wouldn't be too hard to add support for more services, either.

## License

Public Domain [CC0 1.0 Universal][cczero].

  [Minigroup]: http://minigroup.com/
  [Heroku scheduler]: https://devcenter.heroku.com/articles/scheduler
  [cczero]: http://creativecommons.org/publicdomain/zero/1.0/
