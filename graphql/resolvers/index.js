const userResolver = require("./userResolver");
const eventResolver = require("./eventResolver");
const bookingResolver = require("./bookingResolver");

const rootResolver = {
  ...userResolver,
  ...eventResolver,
  ...bookingResolver
};

module.exports = rootResolver;
