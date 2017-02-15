// Load packages
var path = require('path')
var run = require('./run')
var spawn = require('./spawn')
var showOnly = require('./show-only')
var write = require('write')
var saveJSON = require('jsonfile')
var isThere = require('is-there')
saveJSON.spaces = 2

// Load configuration
var cfg = require('./config.js')

showOnly('Preparing Firebase backup - please wait ...')
run('node "' + path.resolve(cfg.packageRoot, 'scripts/prepare-firebase') + '"', function () {
  showOnly('Login to Firebase - please wait ...')

  spawn.sync(path.resolve(cfg.projectRoot, 'node_modules/firebase-tools/bin'), 'firebase', ['login'], function () {
    showOnly('Backup Firebase database - please wait ...')
    spawn.async(path.resolve(cfg.projectRoot, 'node_modules/firebase-tools/bin'), 'firebase', ['database:get', '/'], function (res) {
      if (!isThere(cfg.appRoot + 'database-backup.json')) {
        write.sync(cfg.appRoot + 'database-backup.json', '{}')
      }
      saveJSON.writeFileSync(cfg.appRoot + 'database-backup.json', JSON.parse(res))
      showOnly('Clean up - please wait ...')
      run('node "' + path.resolve(cfg.packageRoot, 'scripts/cleanup-firebase') + '"', function () {
        showOnly('Firebase database backup done!')
      }, 'Firebase clean up failed')
    }, 'Firebase database backup failed')
  }, 'Firebase login failed')
}, 'Cannot prepare Firebase backup')
