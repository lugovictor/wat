'use strict';

const chalk = require('chalk');

module.exports = function (vorpal, options) {
  const app = options.app;

  vorpal
    .command('update index', 'Forces an update of the document index.')
    .action(function (args, cb) {
      const self = this;
      app.clerk.indexer.update({force: true}, function (err) {
        if (!err) {
          self.log(chalk.cyan('\n  Successfully updated index.'));
          const amt = app.clerk.updater.queue.length;
          if (amt > 1) {
            self.log(`\n  ${amt} documents are queued for updating.`);
          }
          self.log(' ');
          cb();
        }
      });
    });

  vorpal
    .command('get updates', 'Shows what docs are mid being updated.')
    .option('-m, --max', 'Maximum history items to show.')
    .action(function (args, cb) {
      const queue = app.clerk.updater.queue;
      const max = args.options.max || 30;
      let limit = queue.length - 1 - max;
      limit = (limit < 0) ? 0 : limit;
      if (queue.length > 0) {
        this.log(chalk.bold('\n  Command'));
      } else {
        this.log(chalk.bold(`\n  No updates in the queue.\n  To do a fresh update, run the "${chalk.cyan('update')}" command.`));
      }
      for (let i = queue.length - 1; i > limit; i--) {
        let item = String(queue[i]).split('docs/');
        item = (item.length > 1) ? item[1] : item[0];
        let cmd = String(item).split('/').join(' ');
        cmd = String(cmd).replace('.md', '');
        cmd = String(cmd).replace('.detail', chalk.gray(' (detailed)'));
        cmd = String(cmd).replace('.install', chalk.gray(' (install)'));
        cmd = String(cmd).replace(' index', chalk.gray(' '));
        this.log(`  ${cmd}`);
      }
      this.log(' ');
      cb();
    });
};