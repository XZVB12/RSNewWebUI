const rs = require('rswebui');

const Data = {
  gpgDetails: {},
  refreshGpgDetails,
};

async function refreshIds() {
  let sslIds = [];
  await rs.rsJsonApiRequest(
    '/rsPeers/getFriendList',
    {},
    data => (sslIds = data.sslIds),
  );
  return sslIds;
}

async function loadSslDetails() {
  let sslDetails = [];
  let sslIds = await refreshIds();
  await Promise.all(
    sslIds.map(sslId =>
      rs.rsJsonApiRequest('/rsPeers/getPeerDetails', {sslId}, data =>
        sslDetails.push(data.det),
      ),
    ),
  );
  return sslDetails;
}

async function refreshGpgDetails() {
  let details = {};
  let sslDetails = await loadSslDetails();
  await Promise.all(
    sslDetails.map(data => {
      let isOnline = false;
      return rs
        .rsJsonApiRequest(
          '/rsPeers/isOnline',
          {sslId: data.id},
          stat => (isOnline = stat.retval),
        )
        .then(() => {
          loc = {
            name: data.location,
            id: data.id,
            lastSeen: data.lastConnect,
            isOnline,
            gpg_id: data.gpg_id,
          };

          if (details[data.gpg_id] === undefined) {
            details[data.gpg_id] = {
              name: data.name,
              isSearched: true,
              isOnline,
              locations: [loc],
            };
          } else {
            details[data.gpg_id].locations.push(loc);
          }
          details[data.gpg_id].isOnline =
            details[data.gpg_id].isOnline || isOnline;
        });
    }),
  );
  Data.gpgDetails = details;
}

module.exports = Data;
