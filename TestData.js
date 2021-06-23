// jshint esversion: 9
const TestData = {
  _totalRecords: 1,
  'user_hash_id_01': {
    firstName: 'Jean-Louis',
    lastName: 'Dupond',
    birthDate: '2010-03-23',
    birthPlace: 'Toulouse',
    phone: '+33725889634878',
    address: '27 rue Charles de Gaulles',
    legalReps: [
      {
        firstName: 'Jacques',
        lastName: 'Prévert',
        emails: [
          'jacques39@yahoo.com',
          'jprev@renault.fr'
        ], 
        phones: [
          '0614543222'
        ],
        birthDate: '1970-03-23',
        profession: 'ingénieur',
        address: '1, place de l\'Etoile, 11111 Toulouse'
      },
      {
        firstName: 'Manon',
        lastName: 'Dupond',
        emails: [
          'mdupond@outlook.com'
        ], 
        phones: [
          '0658779321'
        ],
        birthDate: '1983-05-07'
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

if ('undefined' !== typeof module) module.exports = TestData;