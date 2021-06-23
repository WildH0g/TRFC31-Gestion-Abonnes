// jshint esversion: 9

let USER = {};

const onSuccess = data => {
  USER = data;
  return data;
};

const onFailure = data => {};

const requestUsers = () => {
  console.log('requestUsers()');
  const func = 'listUsers';
  const args = [];
  const dispatch = users => {
    document.dispatchEvent(
      new CustomEvent('userlistLoaded', {
        detail: {
          users,
        },
      })
    );
  };

  if ('undefined' === typeof google) {
    console.log('executing locally');
    const users = onSuccess(User[func](...args));
    return dispatch(users);
  }

  google.script.run
    .withSuccessHandler(data => {
      const users = onSuccess(data);
      dispatch(users);
    })
    .runFunc(func, args);
};

const receiveUsers = e => {
  console.log('receiveUsers()', e.detail);
  return e.detail;
};

const addUsersToSelect = userList => {
  console.log('addUsersToSelect()', userList);
  const select = document.querySelector('.user-list');
  const html =
    '<option value="">Seléctionnez un abonné</option>' +
    userList.users
      .map(user => {
        return `<option value="${user[0]}">${user[1]}</option>`;
      })
      .join('');
  select.innerHTML = html;
};

const handleUserList = pipe(receiveUsers, addUsersToSelect);

const getUserData = e => {
  console.log('requestUsers()');

  const userId = e.target.value;

  const func = 'getUser';
  const args = [userId];

  const dispatch = user => {
    document.dispatchEvent(
      new CustomEvent('userLoaded', {
        detail: {
          user,
        },
      })
    );
  };

  if ('undefined' === typeof google) {
    console.log('executing locally');
    const user = onSuccess(User[func](...args));
    console.log('got user', user);
    return dispatch(user);
  }

  google.script.run
    .withSuccessHandler(userData => dispatch(onSuccess(userData)))
    .runFunc(func, args);
};

const extractUser = e => {
  const user = e.detail.user;
  console.log(`extractUser(): ${user}`);
  return user;
};

const populateUserData = userObj => {
  console.log(`populateUserData(), ${userObj.firstName}`);

  const fields = [
    'lastName',
    'firstName',
    'birthDate',
    'birthPlace',
    'address',
    'phone',
  ];

  const getElement = element => document.querySelector(`input.user.${element}`);

  fields.forEach(field => {
    const el = getElement(field);
    console.log(`got element: ${el}`);
    if (el && field in userObj) el.value = userObj[field];
  });

  return userObj;
};

const populateLegalReps = userObj => {
  const { legalReps } = userObj;
  if (!legalReps) return userObj;
  const select = document.querySelector('select.legal-reps');
  const html =
    '<option value="">Selectionnez un représentant légal</option>' +
    legalReps
      .map((rep, i) => {
        return `<option value="${i}">${rep.firstName} ${rep.lastName}</option>`;
      })
      .join('');
  select.innerHTML = html;
  return userObj;
};

const populatePayments = userObj => {
  const { payments } = userObj;
  const html = payments
    .map(payment => {
      return `<tr><td>${payment.date}</td><td>${payment.sum}</td><td>${payment.paidUntil}</td><td><button class="btn btn-danger">-</button></td></tr>`;
    })
    .join('');
  document.querySelector('.payments').innerHTML = html;
  return userObj;
};

const handleUser = pipe(
  extractUser,
  populateUserData,
  populateLegalReps,
  populatePayments
);

const showLegalRep = e => {
  const repId = e.target.value;
  const rep = USER.legalReps[repId];
  console.log(rep);
  console.log('showLegalRep()');

  const fields = [
    'lastName',
    'firstName',
    'birthDate',
    'birthPlace',
    'address',
    'phones',
    'emails',
    'profession',
  ];

  const getElement = element => document.querySelector(`.legal-rep.${element}`);

  fields.forEach(field => {
    const el = getElement(field);
    console.log(`got element: ${el}`);
    if (!el) return;
    if (rep && field in rep) el.value = rep[field];
    else el.value = '';
  });

  return rep;
};

const updateUserObj = (property, value) => {
  USER[property] = value;
  return USER;
};

document.addEventListener('userlistLoaded', handleUserList);
document.addEventListener('userLoaded', handleUser);

document
  .querySelector('select.user-list')
  .addEventListener('change', getUserData);

document
  .querySelector('select.legal-reps')
  .addEventListener('change', showLegalRep);

document.querySelectorAll('.user').forEach(field => {
  field.addEventListener('change', e => {
    updateUserObj(field.dataset.field, e.target.value);
  });
});

requestUsers();
