let tablesInUse = {};

function markTableInUse(tableNum) {
  tablesInUse[tableNum] = true;
}

function releaseTable(tableNum) {
  delete tablesInUse[tableNum];
}

function isTableInUse(tableNum) {
  return tablesInUse.hasOwnProperty(tableNum);
}

module.exports = { markTableInUse, releaseTable, isTableInUse };
