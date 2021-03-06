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
  const data =
    'dev' === ENV ? testingData.getData('user') : new DriveFile().readFile();
  if (userId in data) return null;
  data[userId] = userObj;
  data._totalRecords++;
  new DriveFile().updateFile(JSON.stringify(data));
  return data;
};

User.updateUser = (userId, userDataAr) => {
  console.log('updateUser()', userId, userDataAr);
  const data =
    'dev' === ENV ? testingData.getData('user') : new DriveFile().readFile();
  for (let row of userDataAr) {
    data[userId][row[0]] = row[1];
  }
  new DriveFile().updateFile(JSON.stringify(data));
  return data;
};

User.deleteUser = userId => {
  const data =
    'dev' === ENV ? testingData.getData('user') : new DriveFile().readFile();
  if (!(userId in data)) return false;
  delete data[userId];
  data._totalRecords--;
  new DriveFile().updateFile(JSON.stringify(data));
  return true;
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
  const data =
    'dev' === ENV ? testingData.getData('user') : new DriveFile().readFile();
  const user = data[userId];
  if (!user.payments) user.payments = [];
  const payments = user.payments;
  user.payments.push(paymentObj);
  new DriveFile().updateFile(JSON.stringify(data));
  return user.payments;
};

User.deletePayment = (userId, paymentIndex) => {
  const data =
    'dev' === ENV ? testingData.getData('user') : new DriveFile().readFile();
  const user = data[userId];
  const payments = user.payments;
  payments.splice(paymentIndex, 1);
  new DriveFile().updateFile(JSON.stringify(data));
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

User.addLegalRep = (userId, repObj = {}) => {
  const data =
    'dev' === ENV ? testingData.getData('user') : new DriveFile().readFile();
  const user = data[userId];
  const reps = user.legalReps;
  if (!user.legalReps) user.legalReps = [];
  reps.push(repObj);
  new DriveFile().updateFile(JSON.stringify(data));
  return user.legalReps;
};

User.deleteLegalRep = (userId, repIndex) => {
  const data =
    'dev' === ENV ? testingData.getData('user') : new DriveFile().readFile();
  const user = data[userId];
  const reps = user.legalReps;
  reps.splice(repIndex, 1);
  new DriveFile().updateFile(JSON.stringify(data));
  return user.legalReps;
};

User.updateLegalRep = (userId, repIndex, repsDataAr) => {
  const data =
    'dev' === ENV ? testingData.getData('user') : new DriveFile().readFile();
  const user = data[userId];
  const reps = user.legalReps;
  const rep = reps[repIndex];
  for (let row of repsDataAr) {
    rep[row[0]] = row[1];
  }
  new DriveFile().updateFile(JSON.stringify(data));
  return rep;
};

/**
 *
 * Working with picture
 *
 */

User.uploadAvatar = (userId, obj) => {
  var blob = Utilities.newBlob(
    Utilities.base64Decode(obj.data),
    obj.mimeType,
    obj.fileName
  );
  console.log(`getting blob for user ${userId}: ${blob}`);
  const targetFolderId = '1DqyFHtUE_f2XGvIQaBctXuZzRsrnW_Rf';

  const data =
    'dev' === ENV ? testingData.getData('user') : new DriveFile().readFile();
  const user = data[userId];
  const avatar = user.avatar;
  const d = DriveApp;
  if (avatar) {
    try {
      d.getFileById(avatar).setTrashed(true);
    } catch (err) {
      console.log(`Could not delete file ${avatar}`);
    }
  }
  const avatarFile = d
    .getFolderById(targetFolderId)
    .createFile(blob)
    .setName(userId)
    .setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
  user.avatar = avatarFile.getId();
  new DriveFile().updateFile(JSON.stringify(data));
  return avatar;
};

if ('undefined' !== typeof module) module.exports = User;
