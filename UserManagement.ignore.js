// jshint esversion: 9

const onSuccess = data => {
  return data;
};

const onFailure = data => {

};

const pipe = (...fns) => init => fns.reduce((v, f) => f(v), init);

const requestUsers = () => {
  google.script.run
    .withSuccessHandler(data => {
      const users = onSuccess(data);
      document.dispatchEvent(new CustomEvent('userlistLoaded', {  
        detail: {
          users
        }
      }));
    })
    .runFunc('listUsers', []);
};

const receiveUsers = e => {
  console.log('receiveUsers()', e.detail);
  return e.detail;
};

const addUsersToSelect = userList => {
  console.log('addUsersToSelect()', userList)
  const select = document.querySelector('.user-list');
  const html = '<option value="">Seléctionnez un abonné</option>' + userList.users.map(user => {
    return `<option value="${user[0]}">${user[1]}</option>`;
  }).join('');
  select.innerHTML = html;
};

const handleUserList = pipe(
  receiveUsers,
  addUsersToSelect
);

const getUserData = userId => {
  google.script.run
    .withSuccessHandler(userData => {
      document.dispatchEvent(new CustomEvent('userLoaded', {  
        detail: {
          userData
        }
      }));
    })
    .runFunc('getUser', [userId]);
};

const handleUser = e => {
  console.log('handleUser():', e.detail);
};

window.onload = requestUsers;
document.addEventListener('userlistLoaded', handleUserList);
document.addEventListener('userLoaded', handleUser);