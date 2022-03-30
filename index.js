const ENDPOINT_LINK = 'https://jsonplaceholder.typicode.com/users';

window.state = {
  users: [],
  sortKey: null,
  sortDirection: 'asc',
};

function getUsers(url) {
  return fetch(url).then((response) => response.json());
}

const createCustomDomElem = (type, id, className) => {
  const customDomElem = document.createElement(type);

  if (id) {
    customDomElem.id = id;
  }

  if (className) {
    customDomElem.className = className;
  }

  return customDomElem;
};

// modal logic

const modalBodyRef = document.getElementsByClassName('modal-body')[0];
modalBodyRef.addEventListener('click', hideModal);

function hideModal() {
  modalBodyRef.classList.remove('visible-modal');
}

function toggleModal(e) {
  const curUserId = +e.target.dataset.userId;
  const userData = window.state.users.find((user) => user.id === curUserId);

  showDetailsModal(userData);
}

function listFlow(data) {
  const mainTd = document.createElement('td');

  const iterableKeys = Object.keys(data);

  const iterateByKeys = (key) => {
    const tr = document.createElement('tr');
    const firstColumn = createCustomDomElem('td', null, 'pd-r-5');
    const secondColumn = document.createElement('td');

    firstColumn.innerText = `${key}:`;

    if (typeof data[key] === 'object') {
      secondColumn.appendChild(listFlow(data[key]));
    } else {
      secondColumn.innerText = data[key];
    }

    tr.appendChild(firstColumn);
    tr.appendChild(secondColumn);

    mainTd.appendChild(tr);
  };

  iterableKeys.map(iterateByKeys);

  return mainTd;
}

function showDetailsModal(user) {
  const modalRef = document.getElementById('modal');
  const modalDataRef = createCustomDomElem('tbody', 'modal-data');

  modalRef.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  modalBodyRef.classList.add('visible-modal');
 
  const iterableKeys = Object.keys(user);

  const iterateByKeys = (key) => {
    if (key === 'id') return;

    const row = document.createElement('tr');
    row.className = 'row';

    if (key) {
      const firstColumn = createCustomDomElem('td', null, 'column');
      const secondColumn = createCustomDomElem('td', null, 'column');

      firstColumn.innerText = key;

      if (typeof user[key] === 'string') {
        secondColumn.innerText = user[key];
      } else {
        secondColumn.appendChild(listFlow(user[key]));
      }

      row.appendChild(firstColumn);
      row.appendChild(secondColumn);

      modalDataRef.appendChild(row);
    }
  };

  iterableKeys.map(iterateByKeys);
  modalRef.replaceChildren(modalDataRef);
}

//table logic
const sortableHeaders = document.getElementsByClassName('sortable');

Array.prototype.forEach.call(sortableHeaders, (headerElement) => {
  headerElement.addEventListener('click', sortUsers);
});

function sortUsers(e) {
  const key = e.target.innerText.toLowerCase();
  window.state.sortKey = key;

  const users = window.state.users;

  const modifier = window.state.sortDirection === 'asc' ? 1 : -1;

  const sortedUsers = users.sort((a, b) => (a[key] > b[key] ? 1 * modifier : -1 * modifier));

  window.state.sortDirection = window.state.sortDirection === 'asc' ? 'desc' : 'asc';

  window.state.users = sortedUsers;

  renderTable();
}

function deleteUser(e) {
  const curUserId = +e.target.dataset.userId;
  const newState = window.state.users.filter((item) => item.id !== curUserId);

  window.state.users = newState;

  renderTable();
}

function renderTable() {
  const tableData = document.getElementById('table-data');
  const users = window.state.users;
  
  tableData.innerHTML = '';

  users.map((user) => {
    const row = document.createElement('tr');
    row.className = 'row';

    const iterableKeys = ['name', 'username', 'email', 'website'];

    const iterateByKeys = (key) => {
      const dataColumn = createCustomDomElem('td', null, 'column');
      dataColumn.innerText = user[key];
      row.appendChild(dataColumn);
    };

    iterableKeys.map(iterateByKeys);

    const controlsColumn = createCustomDomElem('td', null, 'column');
    const detailsBtn = createCustomDomElem('button', null, 'column');
    const deleteBtn = createCustomDomElem('button', null, 'column');
    
    detailsBtn.dataset.userId = user.id;
    deleteBtn.dataset.userId = user.id;

    detailsBtn.innerText = 'details';
    deleteBtn.innerText = 'delete';

    detailsBtn.addEventListener('click', toggleModal);
    deleteBtn.addEventListener('click', deleteUser);

    controlsColumn.appendChild(detailsBtn);
    controlsColumn.appendChild(deleteBtn);

    row.appendChild(controlsColumn);

    tableData.appendChild(row);
  });
}

getUsers(ENDPOINT_LINK).then((newValue) => {
  window.state.users = newValue;

  renderTable();
});

// add user logic
const addUserFormRef = document.getElementById('addUserForm');

addUserFormRef.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const target = [...e.target.elements];

  const res = target.reduce((prev, field) => {
    if (!field.id) return prev;
    return { ...prev, [field.id]: field.value };
  }, {});

  e.target.reset();

  res.id = Math.floor(Math.random() * 10000);

  window.state.users.push(res);

  renderTable();
});
