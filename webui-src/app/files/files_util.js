let m = require('mithril');
let rs = require('rswebui');

const RS_FILE_CTRL_PAUSE = 0x00000100;
const RS_FILE_CTRL_START = 0x00000200;
const RS_FILE_CTRL_FORCE_CHECK = 0x00000400;
const FT_STATE_FAILED = 0x0000;
const FT_STATE_OKAY = 0x0001;
const FT_STATE_WAITING = 0x0002;
const FT_STATE_DOWNLOADING = 0x0003;
const FT_STATE_COMPLETE = 0x0004;
const FT_STATE_QUEUED = 0x0005;
const FT_STATE_PAUSED = 0x0006;
const FT_STATE_CHECKING_HASH = 0x0007;

function makeFriendlyUnit(bytes) {
  if(bytes < 1e3)
    return bytes.toFixed(1) + 'B';
  if(bytes < 1e6)
    return (bytes / 1e3)
      .toFixed(1) + 'kB';
  if(bytes < 1e9)
    return (bytes / 1e6)
      .toFixed(1) + 'MB';
  if(bytes < 1e12)
    return (bytes / 1e9)
      .toFixed(1) + 'GB';
  return (bytes / 1e12)
    .toFixed(1) + 'TB';
}

function fileAction(hash, action) {
  let action_header = '';
  let json_params = {
    hash,
    flags: 0
  };
  switch (action) {
    case 'cancel':
      action_header = '/rsFiles/FileCancel';
      break;

    case 'pause':
      action_header = '/rsFiles/FileControl';
      json_params.flags = util.RS_FILE_CTRL_PAUSE;
      break;

    case 'resume':
      action_header = '/rsFiles/FileControl';
      json_params.flags = util.RS_FILE_CTRL_START;
      break;

    case 'force_check':
      action_header = '/rsFiles/FileControl';
      json_params.flags = util.RS_FILE_CTRL_FORCE_CHECK;
      break;

    default:
      console.error('Unknown action in Downloads.control()');
      return;
  };
  rs.rsJsonApiRequest(action_header, json_params, () => {});
};

function actionButton(file, action) {
  switch (action) {
    case 'resume':
      return m('button', {
        onclick: function() {
          fileAction(file.hash, 'resume');
        },
      }, m('i.fas.fa-play'));

    case 'pause':
      return m('button', {
        onclick: function() {
          fileAction(file.hash, 'pause');
        },
      }, m('i.fas.fa-pause'));

    case 'cancel':
      return m('button.red', {
        onclick: function() {
          fileAction(file.hash, 'cancel');
        },
      }, 'Cancel');
  }
};

const ProgressBar = () => {
  return {
    view: (v) => m('.progressbar', {
        style: {
          content: v.attrs.rate + '%'
        }
      },
      m('span.progress-status', {
        style: {
          width: v.attrs.rate + '%'
        }
      }, v.attrs.rate.toPrecision(3) + '%'))
  };
};

const File = () => {
  return {
    view: (v) => m('.file-view', {
      key: v.attrs.info.hash
    }, [
      m('p', v.attrs.info.name),
      actionButton(v.attrs.info, 'cancel'),
      actionButton(v.attrs.info,
        v.attrs.info.downloadStatus === FT_STATE_PAUSED ?
        'resume' : 'pause'),
      m(ProgressBar, {
        rate: v.attrs.info.transfered / v.attrs.info.size *
          100,
      }),
      m('span', m('i.fas.fa-file'), makeFriendlyUnit(
        v.attrs.info.size)),
      m('span', m('i.fas.fa-arrow-circle-down'),
        makeFriendlyUnit(v.attrs.info.tfRate * 1024) + '/s'),
    ]),
  }
};

module.exports = {
  RS_FILE_CTRL_PAUSE,
  RS_FILE_CTRL_START,
  RS_FILE_CTRL_FORCE_CHECK,
  FT_STATE_FAILED,
  FT_STATE_OKAY,
  FT_STATE_WAITING,
  FT_STATE_DOWNLOADING,
  FT_STATE_COMPLETE,
  FT_STATE_QUEUED,
  FT_STATE_PAUSED,
  FT_STATE_CHECKING_HASH,
  File,
};

