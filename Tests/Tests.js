// jshint esversion: 8
if (typeof require !== 'undefined') {
  UnitTestingApp = require('./UnitTestingApp');
  User = require('../App');
  DriveFile = require('../DriveFile');
}

/*****************
 * TESTS
 *****************/

/**
 * Runs the tests; insert online and offline tests where specified by comments
 * @returns {void}
 */
function runTests() {
  const test = new UnitTestingApp();
  test.enable();
  test.clearConsole();

  test.runInGas(false);
  test.printHeader('LOCAL TESTS - User Data');
  /************************
   * Run Local Tests Here
   ************************/

  test.assert(() => {
    const userList = User.listUsers();
    return Array.isArray(userList) && Array.isArray(userList);
  }, 'listUsers returns a 2D array');

  test.assert(() => {
    const user = User.getUser('user_hash_id_01');
    if (!user) return false;
    return 'Jean-Louis' === user.firstName;
  }, "User user_hash_id_01's name successfully retrieved");

  test.assert(() => {
    User.addUser('user_hash_id_02', {
      firstName: 'Luc',
      lastName: 'Skywalker',
      birthDate: '2013-01-11',
      legalRepresentatives: [
        {
          firstName: 'Dart',
          lastName: 'Vader',
          emails: ['dart@darkforce.com'],
          phones: ['6666666'],
          birthDate: '1968-05-30',
        },
      ],
    });

    const newUser = User.getUser('user_hash_id_02');
    return 'Skywalker' === newUser.lastName;
  }, 'New user added');

  test.assert(() => {
    const lukesId = 'user_hash_id_02';
    const luke = User.getUser(lukesId);
    if (luke) User.updateUser(lukesId, [['birthDate', '2013-01-12']]);
    return (
      User.getUser(lukesId) && '2013-01-12' === User.getUser(lukesId).birthDate
    );
  }, "Luc's birthday successfully changed");

  test.assert(() => {
    const lukesId = 'user_hash_id_02';
    User.deleteUser(lukesId);
    return null === User.getUser(lukesId);
  }, 'Luc removed from data');

  console.log();
  test.printHeader('LOCAL TESTS - Payments');

  test.assert(() => {
    const userId = 'user_hash_id_01';
    const payments = User.getPayments(userId);
    return Array.isArray(payments) && 'object' === typeof payments[0];
  }, 'Payments retrieved successfully');

  test.assert(() => {
    const userId = 'user_hash_id_01';
    const now = new Date();
    User.addPayment(userId, {
      date: fp.formatDate(now),
      sum: 99,
      paidUntil: fp.addTime(now, 'year', 1),
    });
    const user = User.getUser(userId);
    return 99 === user.payments[2].sum;
  }, 'Payment added successfully');

  test.assert(() => {
    const userId = 'user_hash_id_01';
    User.deletePayment(userId, 0);
    const payments = User.getPayments(userId);
    return 99.9 === payments[0].sum;
  }, "User's payment deleted");

  console.log();
  test.printHeader('LOCAL TESTS - Payments');

  test.assert(() => {
    const userId = 'user_hash_id_01';
    const reps = User.getLegalReps(userId);
    return Array.isArray(reps) && 'object' === typeof reps[0];
  }, 'Legal representatives extracted');

  test.assert(() => {
    const userId = 'user_hash_id_01';
    User.addLegalRep(userId, {
      firstName: 'Celine',
      lastName: 'Dion',
      emails: ['celine@outlook.com'],
      phones: ['0644321578'],
      birthDate: '1982-11-04',
    });
    const legalReps = User.getLegalReps(userId);

    return 'Dion' === legalReps[legalReps.length - 1].lastName;
  }, 'New legal rep added');

  test.assert(() => {
    const userId = 'user_hash_id_01';
    User.deleteLegalRep(userId, 0);
    const legalReps = User.getLegalReps(userId);
    return 'Jacques' !== legalReps[0].firstName;
  }, 'Removed first rep');

  test.assert(() => {
    const userId = 'user_hash_id_01';
    User.updateLegalRep(userId, 0, [['firstName', 'Céline']]);
    const legalReps = User.getLegalReps(userId);
    return 'Céline' === legalReps[0].firstName;
  }, "Céline's name now has an accent");

  test.runInGas(true);
  test.printHeader('ONLINE TESTS');
  /************************
   * Run Online Tests Here
   ************************/

  const driveFile =
    'undefined' !== typeof DriveApp
      ? new DriveFile('test-trfc-membres.json')
      : {};

  test.assert(() => {
    driveFile.createFile('Hello World');
    const fileContent = DriveApp.getFileById(driveFile.fileId)
      .getBlob()
      .getDataAsString();
    return 'Hello World' === fileContent;
  }, 'File created successfully');

  test.assert(() => {
    return 'Hello World' === driveFile.readFile();
  }, 'File read successfully');

  test.assert(() => {
    const content = driveFile.readFile();
    driveFile.updateFile(`${content}!!!`);
    return 'Hello World!!!' === driveFile.readFile();
  }, 'File updated successfully');

  test.catchErr(
    () => {
      driveFile.removeFile();
      const newDriveFile = new DriveFile('test-trfc-membres.json');
      newDriveFile.readFile();
    },
    "Le fichier test-trfc-membres.json n'exite pas",
    'File removed successfully'
  );
}

/**
 * If we're running locally, execute the tests. In GAS environment, runTests() needs to be executed manually
 */
(function () {
  /**
   * @param {Boolean} - if true, were're in the GAS environment, otherwise we're running locally
   */
  const IS_GAS_ENV = typeof ScriptApp !== 'undefined';
  if (!IS_GAS_ENV) runTests();
})();
