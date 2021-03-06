// jshint esversion: 9

if ('undefined' !== typeof require) MockData = require('./MockData');

let USER = {};

const onSuccess = data => {
  USER = data;
  return data;
};

const onFailure = data => {
  alert(`Une erreur est survenue: ${data}`);
};

const requestUsers = e => {
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
  return e.detail ? e.detail : e;
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

  const userBlock = document.querySelector('div.user-block').classList;
  const selectedId = document.querySelector('select.user-list').value;
  const userId = e.target.value || selectedId;
  if ('' === userId) {
    userBlock.add('v-hidden');
    resetForm();
    return;
  } else userBlock.remove('v-hidden');

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
  console.log('extractUser() from event', e);
  const user = e.detail.user;
  console.log(`extractUser(): ${JSON.stringify(user, null, 2)}`);
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
    'license',
    'comments',
  ];

  const getElement = element =>
    document.querySelector(`input.user.${element},textarea.user.${element}`);

  fields.forEach(field => {
    console.log('field', field);
    const el = getElement(field);
    console.log(`got element: ${el.tagName}`);
    if (el && field in userObj) el.value = userObj[field];
    else el.value = '';
  });

  return userObj;
};

const populateLegalReps = userObj => {
  console.log('populateLegalReps()', userObj);
  const { legalReps } = userObj;
  if (!legalReps) return userObj;
  const select = document.querySelector('select.legal-reps');
  let html = '';
  if (legalReps.length)
    html +=
      '<option value="">Selectionnez un représentant légal</option>' +
      legalReps
        .map((rep, i) => {
          return `<option value="${i}">${rep.firstName} ${rep.lastName}</option>`;
        })
        .join('');
  else html += '<option value="">Aucun représentant légal</option>';
  select.innerHTML = html;
  return userObj;
};

const populatePayments = userObj => {
  const { payments } = userObj;
  console.log('populatePayments', userObj, payments);
  const html = payments
    .map((payment, i) => {
      return `<tr class="payment-row ${i}"><td>${payment.date}</td><td>${payment.sum}</td><td>${payment.paidUntil}</td><td><button onclick="deletePayment(${i})" class="btn btn-danger">-</button></td></tr>`;
    })
    .join('');
  document.querySelector('.payments').innerHTML = html;
  return userObj;
};

const showAvatar = userObj => {
  if (undefined === userObj) userObj = USER;
  const preview = document.querySelector('img.user-avatar');
  preview.removeAttribute('src');
  if (!userObj.avatar) return;
  if ('undefined' === typeof google) return;
  preview.src =
    'https://drive.google.com/uc?export=view&id=' + userObj.avatar;
};

const handleUser = pipe(
  extractUser,
  populateUserData,
  populateLegalReps,
  populatePayments,
  showAvatar
);

const showLegalRep = e => {
  const repId = e.target.value;
  console.log('showLegalRep, repId', repId);
  const blockClass = document.querySelector('div.legal-reps-block').classList;
  if ('' === repId) return blockClass.add('v-hidden');
  else blockClass.remove('v-hidden');
  console.log('blockClass', blockClass);
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
  if ('undefined' !== typeof google) {
    const userId = document.querySelector('select.user-list').value;
    google.script.run.runFunc('updateUser', [userId, [[property, value]]]);
  }
  return USER;
};

const updateLegalRep = (property, value) => {
  const index = document.querySelector('select.legal-reps').value;
  if ('' === index) return;
  USER.legalReps[index][property] = value;
  if ('undefined' !== typeof google) {
    const userId = document.querySelector('select.user-list').value;
    google.script.run.runFunc('updateLegalRep', [
      userId,
      index,
      [[property, value]],
    ]);
  }
  return USER;
};

const addLegalRep = () => {
  if ('undefined' !== typeof google) {
    const userId = document.querySelector('select.user-list').value;
    google.script.run.runFunc('addLegalRep', [userId, { lastName: 'nouveau' }]);
  }
  USER.legalReps.push({});
  const len = USER.legalReps.length;
  const select = document.querySelector('select.legal-reps');
  select.innerHTML += `<option value="${
    len - 1
  }">Nouveau responsable légal</option>`;
  select.value = len - 1;
  select.dispatchEvent(new Event('change'));
};

const removeLegalRep = () => {
  const index = document.querySelector('select.legal-reps').value;
  USER.legalReps.splice(index, 1);
  populateLegalReps(USER);
  if ('undefined' !== typeof google) {
    const userId = document.querySelector('select.user-list').value;
    google.script.run.runFunc('deleteLegalRep', [userId, index]);
  }
};

const addUser = () => {
  console.log('addUser()');
  USER = {
    legalReps: [],
    payments: [],
  };

  const userId = sha256(Date.now() + randStr(30));
  const userCopy = JSON.parse(JSON.stringify(USER));

  document.querySelector('div.user-block').classList.remove('v-hidden');

  const showNewUser = id => {
    console.log('receiving event userAdded');
    const select = document.querySelector('select.user-list');
    select.innerHTML += `<option value="${userId}">Nouvel ahérent</option>`;
    select.value = id;
    console.log('dispatching event with new user', userCopy);
    document.dispatchEvent(
      new CustomEvent('userLoaded', { detail: { user: userCopy } })
    );
  };

  if ('undefined' !== typeof google) {
    google.script.run
      .withSuccessHandler(resonse => {
        showNewUser(userId);
      })
      .runFunc('addUser', [userId, USER]);
  } else {
    const md = new MockData();
    const users = md.getData('user');
    console.log('adding user to users', users);
    users[userId] = userCopy;
    showNewUser(userId);
  }
};

const deleteUser = () => {
  USER = {};
  const userId = document.querySelector('select.user-list').value;
  if ('undefined' !== typeof google) {
    google.script.run
      .withSuccessHandler(response => {
        console.log('delete succeeded:', response);
        resetForm();
        requestUsers();
      })
      .runFunc('deleteUser', [userId]);
  } else {
    const md = new MockData();
    const users = md.getData('user');
    console.log('deleting user from users', users);
    delete users[userId];
    resetForm();
    requestUsers();
  }
};

const deletePayment = index => {
  if ('undefined' !== typeof google) {
    const userId = document.querySelector('select.user-list').value;
    google.script.run.runFunc('deletePayment', [userId, index]);
  }
  USER.payments.splice(index, 1);
  populatePayments(USER);
};

const addPayment = () => {
  if (!USER.payments) return;
  console.log('adding payment');
  populatePayments(USER);
  const html = `<tr class="payment-row new-payment"><td><input type="date" class="new-payment new-payment-date" /></td><td><input type="number" class="new-payment new-payment-amount"/></td><td><input type="date" class="new-payment new-payment-until" /></td><td><button onclick="confirmPayment()" class="btn btn-primary">OK</button></td></tr>`;
  document.querySelector('.payments').innerHTML += html;
};

const confirmPayment = () => {
  console.log('confirmPayment()');
  const date = document.querySelector('.new-payment-date').value;
  const sum = document.querySelector('.new-payment-amount').value;
  const paidUntil = document.querySelector('.new-payment-until').value;
  if ('undefined' !== typeof google) {
    const userId = document.querySelector('select.user-list').value;
    google.script.run.runFunc('addPayment', [userId, { date, sum, paidUntil }]);
  }
  USER.payments.push({ date, sum, paidUntil });
  populatePayments(USER);
};

const resetForm = () => {
  document
    .querySelectorAll('.user, .legal-rep, select')
    .forEach(el => (el.value = ''));
  document.querySelector('select.legal-reps').innerHTML =
    '<option value="">Aucun représentant légal</option>';
  document.querySelector('tbody.payments').innerHTML = '';
  USER = {};
};

const filterUsers = e => {
  const searchString = e.target.value;
  const re = new RegExp(searchString, 'i');
  Array.from(document.querySelector('select').children).forEach(option => {
    if ('' !== searchString.trim() && re.test(option)) {
      option.setAttribute('selected', true);
      option.parentElement.dispatchEvent(new Event('change'));
    }
  });
};

const uploadAvatar = e => {
  // console.log('uploadAvatar()', e);
  const preview = document.querySelector('img.user-avatar');
  const file = document.querySelector('input[type=file].avatar-upload')
    .files[0];
  const reader = new FileReader();

  reader.addEventListener(
    'load',
    function () {
      preview.src = reader.result;
    },
    false
  );

  reader.onloadend = function (e) {
    if ('undefined' === typeof google) return;
    const data = e.target.result.split(',');
    const obj = {
      fileName: file.name,
      mimeType: data[0].match(/:(\w.+);/)[1],
      data: data[1],
    };
    const userId = document.querySelector('select.user-list').value;
    google.script.run.runFunc('uploadAvatar', [
      userId,
      obj,
    ]);
  };

  reader.readAsDataURL(file);
};

document.addEventListener('userlistLoaded', handleUserList);
document.addEventListener('userLoaded', handleUser);

document
  .querySelector('select.user-list')
  .addEventListener('change', getUserData);

document
  .querySelector('input.user-filter')
  .addEventListener('keypress', filterUsers);

document
  .querySelector('select.legal-reps')
  .addEventListener('change', showLegalRep);

document
  .querySelector('input.avatar-upload')
  .addEventListener('change', uploadAvatar);

document.querySelectorAll('.user').forEach(field => {
  field.addEventListener('change', e => {
    updateUserObj(field.dataset.field, e.target.value);
  });
});

document.querySelectorAll('.legal-rep').forEach(field => {
  field.addEventListener('change', e => {
    const value =
      'textarea' === field.type
        ? e.target.value.split(',').map(val => val.trim())
        : e.target.value;

    updateLegalRep(field.dataset.field, value);
  });
});

requestUsers();
