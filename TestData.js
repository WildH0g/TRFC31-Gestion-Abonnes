// jshint esversion: 9
const TestData = {
  _totalRecords: 1,
  'user_hash_id_01': {
    firstName: 'Jean-Louis',
    lastName: 'Dupond',
    birthDate: '2010-03-23',
    legalReps: [
      {
        firstName: 'Jacques',
        lastName: 'Prévert',
        emails: [
          'jacques39@yahoo.com'
        ], 
        phones: [
          '0614543222'
        ],
        birthDate: '1970-03-23'
      }
    ],
    payments: [
      {
        date: '2021-01-07',
        sum: 230.90,
        paidUntil: '2021-12-31'
      },
      {
        date: '2020-02-27',
        sum: 99.90,
        paidUntil: '2020-12-31'
      }
    ]
  }

};

if ('undefined' !== module) module.exports = TestData;