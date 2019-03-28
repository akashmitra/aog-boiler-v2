const UTIL = require('./util');
var sessionDump = [];

module.exports = {
  /*
    @desc: Store data in Session and track the last accessed timestamp
    @sessionID: Unique session ID for each request
    @key: Session Attribute name
    @value: Value of the Session attribute
  */
  setSession: (sessionID, key, value) => {
    if (UTIL.isEmpty(sessionDump[sessionID])) {
      sessionDump[sessionID] = new Object();
    }
    sessionDump[sessionID][key] = value;
    sessionDump[sessionID].lastAccessed = new Date();
  },

  /*
    @desc: Fetch data from Session and track the last accessed timestamp
    @sessionID: Unique session ID for each request
    @key: Session Attribute name
    @return: Value of the Session attribute if available, else undefined
  */
  getSession: (sessionID, key) => {
    if (!UTIL.isEmpty(sessionDump[sessionID])) {
      sessionDump[sessionID].lastAccessed = new Date();
      return sessionDump[sessionID][key];
    }
    return undefined;
  },

  /*
    @desc: Remove the user Session data from Session Dump
    @sessionID: Unique session ID for each request
  */
  clearUserSession: (sessionID) => {

  },

  /*
    @desc: Reset the Session Dump
  */
  clearSessionCache: () => {
    sessionDump = [];
  }
};