// jshint esversion: 9
if ('undefined' !== typeof require) {
  TestData = require('./TestData');
  MockData = require('./MockData');
  fp = require('./FP');
}

const ENV = 'undefined' === typeof ScriptApp ? 'dev' : 'prod';
const testingData =
  'undefined' !== typeof MockData
    ? new MockData().addData('user', TestData)
    : {};
// const testingData = new MockData().addData('user', TestData);

const User = {};

/**
 *
 * Global methods for all users
 *
 */

User.listUsers = () => {
  console.log('listUsers(), ENV:', ENV);
  const data =
    'dev' === ENV ? testingData.getData('user') : new DriveFile().readFile();
  return Object.entries(data).reduce((acc, user) => {
    const [userId, userData] = user;
    if (!/^_/.test(userId)) {
      acc.push([userId, userData.firstName]);
    }
    return acc;
  }, []);
};

/**
 *
 * Working with user data
 *
 */

User.getUser = userId => {
  const data = 
    'dev' === ENV ? testingData.getData('user') : new DriveFile().readFile();
  if (!(userId in data)) return null;
  return data[userId];
};

User.addUser = (userId, userObj) => {
  const data = testingData.getData('user');
  data[userId] = userObj;
  return data;
};

User.updateUser = (userId, userDataAr) => {
  const data = testingData.getData('user');
  for (let row of userDataAr) {
    data[userId][row[0]] = row[1];
  }
  return data;
};

User.deleteUser = userId => {
  const data = testingData.getData('user');
  if (!(userId in data)) return null;
  delete data[userId];
  return data;
};

/**
 *
 * Working with payments
 *
 */

User.getPayments = userId => {
  const user = User.getUser(userId);
  return user.payments;
};

User.addPayment = (userId, paymentObj) => {
  const user = User.getUser(userId);
  if (!user.payments) user.payments = [];
  user.payments.push(paymentObj);
  return user.payments;
};

User.deletePayment = (userId, paymentIndex) => {
  const user = User.getUser(userId);
  user.payments.splice(paymentIndex, 1);
  return user.payments;
};

/**
 *
 * Working with legal representatives
 *
 */

User.getLegalReps = userId => {
  const user = User.getUser(userId);
  return user.legalReps;
};

User.addLegalRep = (userId, repObj) => {
  const user = User.getUser(userId);
  if (!user.legalReps) user.legalReps = [];
  user.legalReps.push(repObj);
  return user.legalReps;
};

User.deleteLegalRep = (userId, repIndex) => {
  const user = User.getUser(userId);
  user.legalReps.splice(repIndex, 1);
  return user.legalReps;
};

User.updateLegalRep = (userId, repIndex, repsDataAr) => {
  const reps = User.getLegalReps(userId);
  const rep = reps[repIndex];
  for (let row of repsDataAr) {
    rep[row[0]] = row[1];
  }
  return reps;
};

if ('undefined' !== typeof module) module.exports = User;
