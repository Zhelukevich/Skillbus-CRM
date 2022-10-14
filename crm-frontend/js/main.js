const DELAY_TIME = 300;
const VISIBLE_CSS = 'visible';
const URI = 'http://localhost:3000/api/clients';

// Объект состояния клиентов (сортировка, массив объектов клиентов)
const clientsState = {
  columnOfSort: 'id',
  stateOfSort: {
    id: true,
    fullname: false,
    createdAt: false,
    updatedAt: false,
  },
  clients: [],
};

// Массив типов контактов
const contactsTypes = ['Телефон', 'Facebook', 'VK', 'Email', 'Другое'];

// Объект структуры модального окна  
const modalWindowStructure = {
  type: 'new', // Может принимать значения delete, new, change

  headTitle: function () {
    let title = null;
    switch (this.type) {
      case 'delete':
        title = 'Удалить клиента';
        break;
      case 'new':
        title = 'Новый клиент';
        break;
      case 'change':
        title = 'Изменить данные';
        break;
    }
    return title;
  },

  buttonSubmit: function () {
    return (this.type === 'delete') ? 'Удалить' : 'Сохранить';
  },

  button: function () {
    return (this.type === 'change') ? 'Удалить клиента' : 'Отмена';
  },
};

// Вставляем данные в таблицу
function insertClientsData({ columnOfSort, stateOfSort, clients }) {
  const tbodyElement = document.querySelector('tbody');
  const { id: typeSortingById, fullname: typeSortingByFullname, createdAt: typeSortingByCreatedAt, updatedAt: typeSortingByUpdatedAt } = stateOfSort;

  let sortedClients = [];

  switch (columnOfSort) {
    case 'fullname':
      sortedClients = sortClientsByFullname(clients, typeSortingByFullname);
      break;
    case 'createdAt':
      sortedClients = sortClientsByDate(clients, columnOfSort, typeSortingByCreatedAt);
      break;
    case 'updatedAt':
      sortedClients = sortClientsByDate(clients, columnOfSort, typeSortingByUpdatedAt);
      break;
    default:
      sortedClients = sortClientsById(clients, typeSortingById);
  };

  // Очищаю данные о клиентах
  tbodyElement.innerHTML = '';

  markColumnOfSort(columnOfSort, stateOfSort);

  // Вставляю данные о клиентах в таблицу
  sortedClients.forEach(function (client) {
    tbodyElement.append(createRowWithClientData(client));
  });

  // Разворот комбинированных контактов
  showAllContacts(tbodyElement);

  // Удаление клиента из таблицы
  const deleteClientButtons = tbodyElement.querySelectorAll('.delete-btn');
  deleteClientButtons.forEach(function (deleteClientbutton) {
    deleteClientbutton.addEventListener('click', async function () {
      const clientId = this.dataset.id;
      // Установил тип окна для модалки 
      modalWindowStructure.type = 'delete';
      // получил данные из базы о клиенте с id
      const client = await fetchGetClientById(this.dataset.id);
      // Вызвал модалку
      createModalWindow(client, modalWindowStructure);
    });
  });

  // Изменить клиента из таблицы
  const changeClientButtons = tbodyElement.querySelectorAll('.edit-btn');
  changeClientButtons.forEach(function (changeClientButton) {
    changeClientButton.addEventListener('click', async function () {
      const clientId = this.dataset.id;
      const iconElement = changeClientButton.querySelector('.edit-btn__icon');
      // Установил тип окна для модалки 
      modalWindowStructure.type = 'change';
      iconElement.classList.add('load__icon');
      // получил данные из базы о клиенте с id
      const client = await fetchGetClientById(clientId);
      iconElement.classList.remove('load__icon');
      // Вызвал модалку
      createModalWindow(client, modalWindowStructure);
      document.location.hash = 'id_' + clientId;
      // };
    });
  });
};

// Создаем строку в таблице с данными клиента
function createRowWithClientData(client) {
  const tr = document.createElement('tr');
  const tdId = document.createElement('td');
  const tdFullname = document.createElement('td');
  const tdCreateDate = document.createElement('td');
  const wrapCreateDate = document.createElement('div');
  const createDate = document.createElement('span');
  const createTime = document.createElement('span');
  const tdUpdateDate = document.createElement('td');
  const wrapUpdateDate = document.createElement('div');
  const updateDate = document.createElement('span');
  const updateTime = document.createElement('span');
  const tdContacts = document.createElement('td');
  const ulContacts = createContactList(client.contacts);
  const tdActions = document.createElement('td');
  const wrapActions = document.createElement('div');
  const buttonEdit = document.createElement('button');
  const buttonEditImg = document.createElement('span');
  const buttonEditText = document.createElement('span');
  const buttonDelete = document.createElement('button');
  const buttonDeleteImg = document.createElement('span');
  const buttonDeleteText = document.createElement('span');

  tr.classList.add('table__row');
  tdId.classList.add('row__cells', 'body-cells_id');
  tdFullname.classList.add('row__cells', 'body-cells_fullname');
  tdCreateDate.classList.add('row__cells');
  wrapCreateDate.classList.add('cell-create__wrapper');
  createDate.classList.add('cell-create__date');
  createTime.classList.add('cell-create__time');
  tdUpdateDate.classList.add('row__cells');
  wrapUpdateDate.classList.add('cell-update__wrapper');
  updateDate.classList.add('cell-update__date');
  updateTime.classList.add('cell-update__time');
  tdContacts.classList.add('row__cells');
  tdActions.classList.add('row__cells');
  wrapActions.classList.add('actions__wrapper');
  buttonEdit.classList.add('edit-btn', 'btn');
  buttonEditImg.classList.add('actions-btn__icon', 'edit-btn__icon');
  buttonEditText.classList.add('edit-btn__text');
  buttonDelete.classList.add('delete-btn', 'btn');
  buttonDeleteImg.classList.add('actions-btn__icon', 'delete-btn__icon');
  buttonDeleteText.classList.add('delete-btn__text');

  tr.setAttribute('id', client.id); // Для поиска клиентов в таблице и скролла к ним
  buttonEdit.setAttribute('data-id', client.id);
  buttonDelete.setAttribute('data-id', client.id);

  tdId.innerText = client.id.slice(-6);
  tdFullname.innerText = `${client.surname.trim()} ${client.name.trim()} ${client.lastName.trim()}`;
  createDate.innerText = formatDate(client.createdAt);
  createTime.innerText = formatTime(client.createdAt);
  updateDate.innerText = formatDate(client.updatedAt);
  updateTime.innerText = formatTime(client.updatedAt);
  buttonEditText.innerText = 'Изменить';
  buttonDeleteText.innerText = 'Удалить';

  wrapCreateDate.append(createDate);
  wrapCreateDate.append(createTime);
  tdCreateDate.append(wrapCreateDate);

  wrapUpdateDate.append(updateDate);
  wrapUpdateDate.append(updateTime);
  tdUpdateDate.append(wrapUpdateDate);
  tdContacts.append(ulContacts);
  buttonEdit.append(buttonEditImg);
  buttonEdit.append(buttonEditText);
  buttonDelete.append(buttonDeleteImg);
  buttonDelete.append(buttonDeleteText);
  wrapActions.append(buttonEdit);
  wrapActions.append(buttonDelete);
  tdActions.append(wrapActions);

  tr.append(tdId);
  tr.append(tdFullname);
  tr.append(tdCreateDate);
  tr.append(tdUpdateDate);
  tr.append(tdContacts);
  tr.append(tdActions);

  return tr;
}

// Получаем дату из json
function formatDate(str) {
  return str.slice(8, 10) + '.' + str.slice(5, 7) + '.' + str.slice(0, 4);
}

// Получаем время из json
function formatTime(str) {
  return str.slice(11, 16);
}

// Создаем список контактов клиента
function createContactList(contacts) {
  const ul = document.createElement('ul');
  ul.classList.add('contacts__list');
  const amountOfContacts = contacts.length;
  let visible = true;

  contacts.forEach(function (contact, index) {
    if (index === 4 && amountOfContacts > 5) {
      const li = document.createElement('li');
      const span = document.createElement('span');
      li.classList.add('contacts__item');
      span.classList.add('contacts__icon_ring');
      li.setAttribute('id', 'comb');
      span.setAttribute('data-value', 'Развернуть');
      span.innerText = '+' + (amountOfContacts - 1 - index);
      li.append(span);
      ul.append(li);
      visible = false;
    }

    ul.append(createContactItem(contact, visible));
  });

  return ul;
};

// Функция создает li элемент для иконок списка контактов
function createContactItem(contact, visible) {
  const li = document.createElement('li');
  const img = document.createElement('img');
  const link = document.createElement('a');


  li.classList.add('contacts__item');


  if (!visible) {
    li.classList.add('blocked');
  };
  link.classList.add('contacts__link');
  img.classList.add('contacts__icon');

  if (contact.type === 'Другое') {
    img.setAttribute('data-type', '');
  } else {
    img.setAttribute('data-type', contact.type + ':');
  };
  img.setAttribute('data-value', contact.value);
  link.setAttribute('target', '_blank');


  switch (contact.type) {
    case 'Телефон':
      img.setAttribute('src', './img/phone.svg');
      img.setAttribute('alt', 'Телефон');
      link.setAttribute('href', 'tel:' + contact.value);
      break;
    case 'Facebook':
      img.setAttribute('src', './img/fb.svg');
      img.setAttribute('alt', 'Фэйсбук');
      link.setAttribute('href', contact.value);
      break;
    case 'VK':
      img.setAttribute('src', './img/vk.svg');
      img.setAttribute('alt', 'В контактах');
      link.setAttribute('href', contact.value);
      break;
    case 'Email':
      img.setAttribute('src', './img/mail.svg');
      img.setAttribute('alt', 'Имэйл');
      link.setAttribute('href', 'mailto:' + contact.value);
      break;
    default:
      img.setAttribute('src', './img/other.svg');
      img.setAttribute('alt', 'Другое');
      link.setAttribute('href', contact.value);

  };

  // li.append(img);

  li.append(link)
  link.append(img);

  return li;
};

// ======= Функции активностей в таблице
// Сортировка данных в таблице в первом аргументе объект, во втоом tableHead.tr
function sortDataInTable(clientsState, tableHeadElement) {
  const thElements = tableHeadElement.querySelectorAll('.table__column_sort');
  thElements.forEach(function (thElement) {
    thElement.addEventListener('click', function () {
      clientsState.columnOfSort = thElement.id;
      if (clientsState.stateOfSort[thElement.id]) {
        clientsState.stateOfSort[thElement.id] = false;
      } else {
        clientsState.stateOfSort[thElement.id] = true;
      };
      insertClientsData(clientsState);
    });
  });
};

// Сорировка списка клиентов по полю ID
function sortClientsById(clients, ascending) {
  if (ascending) {
    return clients.sort(function (a, b) {
      return a.id > b.id ? 1 : -1;
    });
  };
  return clients.sort(function (a, b) {
    return a.id < b.id ? 1 : -1;
  });
};

// Сортировка списка клиентов по полю Ф.И.О.
function sortClientsByFullname(clients, ascending) {
  if (ascending) {
    return clients.sort(function (a, b) {
      return a.surname.trim().toLowerCase() + a.name.trim().toLowerCase() + a.lastName.trim().toLowerCase() < b.surname.trim().toLowerCase() + b.name.trim().toLowerCase() + b.lastName.trim().toLowerCase() ? 1 : -1;
    });
  };
  return clients.sort(function (a, b) {
    return a.surname.trim().toLowerCase() + a.name.trim().toLowerCase() + a.lastName.trim().toLowerCase() > b.surname.trim().toLowerCase() + b.name.trim().toLowerCase() + b.lastName.trim().toLowerCase() ? 1 : -1;
  });
};

// Сорировка списка клиентов по полю Дата и время создания
function sortClientsByDate(clients, field, ascending) {
  if (ascending) {
    return clients.sort(function (a, b) {
      return new Date(a[field]).getTime() > new Date(b[field]).getTime() ? 1 : -1;
    });
  };
  return clients.sort(function (a, b) {
    return new Date(a[field]).getTime() < new Date(b[field]).getTime() ? 1 : -1;
  });
};

// Маркировка столбца сортировки
function markColumnOfSort(columnOfSort, stateOfSort) {
  const columns = document.querySelectorAll('.table__column_sort');
  columns.forEach(function (column) {
    if (column.id === columnOfSort) {
      column.childNodes[0].classList.add('color_light-slate-blue');
    } else {
      column.childNodes[0].classList.remove('color_light-slate-blue')
    };
    if (stateOfSort[column.id]) {
      column.childNodes[1].classList.remove('rotate_180');
      if (column.id === 'fullname') {
        column.childNodes[2].innerText = 'Я-А';
      };
    } else {
      column.childNodes[1].classList.add('rotate_180');
      if (column.id === 'fullname') {
        column.childNodes[2].innerText = 'А-Я';
      };
    };
  });
};

// Показываю тултипы [data-type] и [data-value]
function showTooltips() {
  let tooltipElememt;
  let tooltipTypeElement;
  let tooltipValueElement;
  document.addEventListener('mouseover', function (event) {
    let target = event.target;
    let tooltipType = target.dataset.type;
    let tooltipValue = target.dataset.value;

    if (!tooltipType && !tooltipValue) return;

    tooltipElememt = document.createElement('div');
    tooltipValueElement = document.createElement('span');

    tooltipElememt.classList.add('tooltip');
    tooltipValueElement.classList.add('tooltip__value');

    if (tooltipType) {
      tooltipTypeElement = document.createElement('span');
      tooltipTypeElement.classList.add('tooltip__title');
      tooltipTypeElement.innerText = tooltipType;
      tooltipElememt.append(tooltipTypeElement);
      tooltipValueElement.classList.add('color_light-slate-blue');
    };

    tooltipValueElement.innerText = tooltipValue;

    tooltipElememt.append(tooltipValueElement);
    document.body.append(tooltipElememt);

    let coords = target.getBoundingClientRect();

    let left = coords.left + (target.offsetWidth - tooltipElememt.offsetWidth) / 2;
    if (left < 0) left = 0;

    let top = coords.top - tooltipElememt.offsetHeight - 10;
    if (top < 0) { // если подсказка не помещается сверху, то отображать её снизу
      top = coords.top + target.offsetHeight + 10;
    };

    tooltipElememt.style.left = left + 'px';
    tooltipElememt.style.top = top + 'px';
    tooltipElememt.style.opacity = 1;
  });

  document.addEventListener('mouseout', function () {
    if (tooltipElememt) {
      tooltipElememt.remove();
      tooltipElememt = null;
    };
  });
};

// Показываю все контакты клинета по нажатию на Comb кнопку
function showAllContacts(tbodyElement) {
  const combElements = tbodyElement.querySelectorAll('#comb');
  combElements.forEach(function (combElement) {
    combElement.addEventListener('click', function () {
      const contactsElements = combElement.parentNode.querySelectorAll('.contacts__item');
      contactsElements.forEach(function (contactsElement) {
        if (contactsElement.id) {
          contactsElement.classList.add('blocked');
        } else {
          contactsElement.classList.remove('blocked');
        };
      });
    });
  });
};

// ========= Отрисовка модального окна
// Собираю модалку
function createModalWindow(client, modalWindowStructure) {
  const { id, surname, name, lastName, contacts } = client;
  const { type: typeOfModal, buttonSubmit: buttonSubmitText, button: buttonSmallText } = modalWindowStructure;

  // Создал контейнер
  const modal = document.createElement('div');
  const wrapper = document.createElement('div');
  const buttonWindowClose = document.createElement('span');

  modal.classList.add('modal');
  wrapper.classList.add('modal__wrapper');
  buttonWindowClose.classList.add('modal__close');
  buttonWindowClose.setAttribute('data-btn', 'close');

  wrapper.append(buttonWindowClose);

  // Создал шапку модалки header элемент
  // ID передаём только в модалку по изменению данных клиента
  let idValue = null;
  if (typeOfModal === 'change') {
    idValue = id;
  };

  const headerElement = createHeadOfModal(modalWindowStructure.headTitle(), idValue);
  wrapper.append(headerElement.header); //вставил шапку

  // Создал контейнер формы
  const formElement = document.createElement('form');
  formElement.classList.add('modal__form');
  formElement.setAttribute('action', '#');

  // Создал Блок ошибок
  const blockError = createErrorForModal();

  // Создал части формы
  if (typeOfModal !== 'delete') {
    // Создал Блок с ФИО клиента
    const clietntNameElement = createClientNameForModal(surname, name, lastName);
    formElement.append(clietntNameElement);

    // Создал Блок с контактами клиента
    const { fieldsetContacts, buttonAddContactElement, wrapperContacts } = createClientContactsForModal(contacts);
    formElement.append(fieldsetContacts);
    wrapper.append(formElement);

    // Добавил переключатель активна/неактивна кнопка "Добавить контакт" (по кол-ву контактов)
    disabledButtonAddContact(buttonAddContactElement, fieldsetContacts);

    // Добавление нового клиента при нажатии на кнопку
    addNewContact(buttonAddContactElement, wrapperContacts);

    // Удаление контакта клиента при нажатии на кнопку
    deleteContact(buttonAddContactElement, wrapperContacts);

    // Добавил переключатель активна/неактивна кнопка "Удалить контакт" при условии наличия данных в инпуте 
    checkValueInInputs(wrapperContacts);

    // Добавил Блок Ошибок
    wrapper.append(blockError.wrapperError);

  } else {
    // Добавил Блок Ошибок
    wrapper.append(blockError.wrapperError);
    // Показал его
    blockError.wrapperError.classList.remove('blocked');
    // Записал значение ошибки/предупреждения
    blockError.spanError.textContent = 'Вы действительно хотите удалить данного клиента?';
    // Меняем цвет блока ошибок
    blockError.spanError.classList.add('modal-error__text-style');
    // Выравнивание заголовка шапки посредине
    headerElement.header.classList.add('align-center', 'modal-header-margin-bottom');
    headerElement.headerTitle.classList.add('modal-header__heading-padding-top');
  };

  // Создал блок кнопок
  const buttonsElement = createButtonsForModal(modalWindowStructure.buttonSubmit(), modalWindowStructure.button());
  wrapper.append(buttonsElement.wrapperButtons);

  modal.append(wrapper);
  document.body.append(modal);

  // Обработчики событий
  // Нажатие на Esc
  document.addEventListener('keydown', function (event) {
    if (event.code == "Escape") {
      onClose(modal, wrapper);
    };
  });

  // Клик на иконку закрытия окна
  buttonWindowClose.addEventListener('click', function () {
    onClose(modal);
  });

  // Клик на оверлей
  modal.addEventListener('click', function (event) {
    if (!event.target.classList.contains('modal')) {
      return;
    }
    onClose(modal);
  });

  // Клик на большую кнопку
  buttonsElement.buttonSubmit.addEventListener('click', async function () {
    // e.preventDefault(); TODO как сделать submit?
    if (typeOfModal == 'delete') {
      onDelete(id, modal); // Удаляем клиента из базы по ID
    } else {
      // Собираем данные из формы здесь же можно установить в disabled
      const clientValues = getValuesFromModal(modal);

      // Есть ли ошибки при заполнении формы?
      if (!clientValues.textError) {
        const iconButtonSubmit = buttonsElement.buttonSubmit.querySelector('.submit-btn__icon');
        // Ставим лоадер на кнопку
        iconButtonSubmit.classList.add('upload_visible');
        // Устанавливаем disabled на форму
        setDisabledOnElementsOfForm(modal, true);
        if (typeOfModal == 'new') {
          await onSave(clientValues, modal);
        } else if (typeOfModal == 'change') {
          await onUpdate(clientValues, idValue, modal);
        };
        //Убираем лоадер с кнопки
        iconButtonSubmit.classList.remove('upload_visible');
        // Снимаем disabled
        setDisabledOnElementsOfForm(modal, false);
      } else {
        blockError.wrapperError.classList.remove('blocked');
        blockError.spanError.innerHTML = clientValues.textError;
      }
    };
  });

  // Клик на маленькую кнопку
  buttonsElement.buttonSmall.addEventListener('click', function () {
    if (typeOfModal !== 'change') {
      onClose(modal);
    } else {
      onDelete(id, modal); // Удаляем клиента из базы по ID
    };
  });

  // Добавил открытие дропдауна при нажатии на кнопку
  showDropDown(modal);

  const timeoutId = setTimeout(function () {
    modal.classList.add(VISIBLE_CSS);
    wrapper.classList.add(VISIBLE_CSS);
  }, 100);

  return modal;
};

// Проверка наличия контактов и добавления в блок паддингов
function setPaddingToContacrsWrap() {
  const contactsWrap = document.querySelector('.modal-contacts');
  if (contactsWrap) {
    const contactsElements = contactsWrap.querySelectorAll('.modal-contacts__item');
    if (!contactsElements.length) {
      contactsWrap.classList.remove('modal-contacts_padding');
    } else {
      contactsWrap.classList.add('modal-contacts_padding');
    };
  };
};


// Шапка модалки
function createHeadOfModal(title, idValue) {
  const header = document.createElement('div');
  const headerTitle = document.createElement('h2');

  header.classList.add('modal__header', 'modal__container');
  headerTitle.classList.add('modal-header__heading');

  headerTitle.textContent = title;

  header.append(headerTitle);

  if (idValue) {
    const headerInfo = document.createElement('span');
    headerInfo.classList.add('modal-header__id');
    headerInfo.innerText = `ID: ${idValue.slice(-6)}`;
    header.append(headerInfo);
  }

  return {
    header,
    headerTitle,
  };
};

// Создал часть формы с ФИО клиента
function createClientNameForModal(surname, name, lastName) {
  const fieldsetClientName = document.createElement('fieldset');
  const wrapperClientName = document.createElement('div');
  const wrapperSurname = document.createElement('div');
  const inputSurname = document.createElement('input');
  const lableSurname = document.createElement('lable');
  const asterixSurname = document.createElement('span');
  const wrapperName = document.createElement('div');
  const inputName = document.createElement('input');
  const lableName = document.createElement('lable');
  const asterixName = document.createElement('span');
  const wrapperLastname = document.createElement('div');
  const inputLastname = document.createElement('input');
  const lableLastname = document.createElement('lable');

  fieldsetClientName.classList.add('fieldset_reset', 'modal-fullname');
  wrapperClientName.classList.add('modal__container', 'modal-contaiter_position_flex');

  wrapperSurname.classList.add('inputs__wrap');
  inputSurname.classList.add('input', 'modal__intup');
  lableSurname.classList.add('modal__lable');
  asterixSurname.classList.add('lable_asterix');
  wrapperName.classList.add('inputs__wrap');
  inputName.classList.add('input', 'modal__intup');
  lableName.classList.add('modal__lable');
  asterixName.classList.add('lable_asterix');
  wrapperLastname.classList.add('inputs__wrap');
  inputLastname.classList.add('input', 'modal__intup');
  lableLastname.classList.add('modal__lable');

  inputSurname.setAttribute('id', 'surname');
  inputSurname.setAttribute('data-input', 'surname');
  inputSurname.setAttribute('type', 'text');
  inputSurname.setAttribute('name', 'surname');
  lableSurname.setAttribute('for', 'surname');
  inputName.setAttribute('id', 'name');
  inputName.setAttribute('data-input', 'name');
  inputName.setAttribute('type', 'text');
  inputName.setAttribute('name', 'name');
  lableName.setAttribute('for', 'name');
  inputLastname.setAttribute('id', 'lastname');
  inputLastname.setAttribute('data-input', 'lastname');
  inputLastname.setAttribute('type', 'text');
  inputLastname.setAttribute('name', 'lastname');
  lableLastname.setAttribute('for', 'lastname');

  lableSurname.textContent = 'Фамилия';
  asterixSurname.textContent = '*';
  lableName.textContent = 'Имя';
  asterixName.textContent = '*';
  lableLastname.textContent = 'Отчество';

  if (surname) {
    lableSurname.classList.add('modal__lable_up');
    inputSurname.value = surname;
  };

  if (name) {
    lableName.classList.add('modal__lable_up');
    inputName.value = name;
  };

  if (lastName) {
    lableLastname.classList.add('modal__lable_up');
    inputLastname.value = lastName;
  };

  lableSurname.append(asterixSurname);
  lableName.append(asterixName);

  wrapperSurname.append(lableSurname);
  wrapperSurname.append(inputSurname);
  wrapperName.append(lableName);
  wrapperName.append(inputName);
  wrapperLastname.append(lableLastname);
  wrapperLastname.append(inputLastname);

  wrapperClientName.append(wrapperSurname);
  wrapperClientName.append(wrapperName);
  wrapperClientName.append(wrapperLastname);

  fieldsetClientName.append(wrapperClientName);

  // Навешиваю обработчики на inputs для сброса стилизации ошибок
  inputSurname.addEventListener('input', function () {
    inputSurname.parentNode.classList.remove('border-color_burnt-sienna');
  });

  inputName.addEventListener('input', function () {
    inputName.parentNode.classList.remove('border-color_burnt-sienna');
  });


  // Подъем lables
  showInpunsUnderLables(wrapperClientName);

  return fieldsetClientName;
}

// Функция подъёма label если фокус на input
function showInpunsUnderLables(wrapperClientName) {
  const inputs = wrapperClientName.querySelectorAll('.inputs__wrap');
  inputs.forEach(addListenersOnInput);
};

// Добавил обработчики событий на инпут 
function addListenersOnInput(input) {
  const inputElement = input.querySelector('.modal__intup');
  const lableElement = input.querySelector('.modal__lable');
  inputElement.addEventListener('focus', function () {
    lableElement.classList.add('modal__lable_up');
  });
  inputElement.addEventListener('blur', function () {
    if (!inputElement.value) {
      lableElement.classList.remove('modal__lable_up');
    };
  });
};

// Создал часть формы с контактами клиента
function createClientContactsForModal(contacts) {
  const fieldsetContacts = document.createElement('fieldset');
  const wrapperContacts = document.createElement('div');
  const listOfContacts = document.createElement('ul');

  fieldsetContacts.classList.add('modal-contacts', 'fieldset_reset');
  wrapperContacts.classList.add('modal__container');
  listOfContacts.classList.add('modal-contacts__list');

  wrapperContacts.append(listOfContacts);

  if (contacts) {
    contacts.forEach(function (contact) {
      const contactItem = createContactForModal(contact);
      listOfContacts.append(contactItem);
    });
  };

  // Стилизация блока контактов
  setTimeout(setPaddingToContacrsWrap, 300);

  // Кнопка добавить клиента    
  const buttonAddContactElement = createButtonAddContactForModal();
  fieldsetContacts.append(wrapperContacts);
  fieldsetContacts.append(buttonAddContactElement);

  return {
    fieldsetContacts,
    buttonAddContactElement,
    wrapperContacts,
  };
};

// Создал элемент списка контактов с кнопкой "Удалить"
function createContactForModal(contact) {
  const contactItem = document.createElement('li');
  const wrapContactType = document.createElement('div');
  const buttonContactType = document.createElement('button');
  const listContactTypeDropdown = document.createElement('ul');
  const inputContactValue = document.createElement('input');
  const buttonContactDelete = document.createElement('button');
  const buttonContactDeleteIcon = document.createElement('span');

  contactItem.classList.add('modal-contacts__item');
  wrapContactType.classList.add('contacts-type');
  buttonContactType.classList.add('contact-type__button', 'btn');
  listContactTypeDropdown.classList.add('contact-type__list');
  inputContactValue.classList.add('input', 'contact-value', 'contact-value_border-right');
  inputContactValue.setAttribute('type', 'text');
  inputContactValue.setAttribute('placeholder', 'Введите данные контакта');
  buttonContactDelete.classList.add('delete-contact__btn', 'btn', 'blocked');
  buttonContactDeleteIcon.classList.add('delete-contact__icon');

  buttonContactType.textContent = 'Тип контакта';

  contactsTypes.forEach(function (contactsType) {
    const item = document.createElement('li');
    item.classList.add('contact-type__item');
    item.textContent = contactsType;
    listContactTypeDropdown.append(item);
  })

  if (contact) {
    buttonContactType.textContent = contact.type;
    inputContactValue.value = contact.value;
    buttonContactDelete.classList.remove('blocked');
  };

  buttonContactDelete.append(buttonContactDeleteIcon);

  wrapContactType.append(buttonContactType);
  wrapContactType.append(listContactTypeDropdown);

  contactItem.append(wrapContactType);
  contactItem.append(inputContactValue);
  contactItem.append(buttonContactDelete);

  // Вешаю на ipnut слушателя чтобы убрать стили сигнализации об ошибке
  inputContactValue.addEventListener('input', function () {
    inputContactValue.classList.remove('border-color_burnt-sienna');
  });

  return contactItem;
};

// Создал кнопку добавления контакта 
function createButtonAddContactForModal() {
  const buttonAddContact = document.createElement('button');
  const buttonAddContactIcon = document.createElement('span');
  const buttonAddContactTitle = document.createElement('span');

  buttonAddContact.classList.add('modal-addcontact__btn', 'btn', VISIBLE_CSS);
  buttonAddContactIcon.classList.add('modal-addcontact__icon');
  buttonAddContactTitle.classList.add('modal-addcontact__title');

  buttonAddContact.setAttribute('data-btn', 'contact-add');
  buttonAddContactTitle.textContent = 'Добавить контакт';

  buttonAddContact.append(buttonAddContactIcon);
  buttonAddContact.append(buttonAddContactTitle);

  return buttonAddContact;
}

// Создал блок с выводом ошибок и др. инфорации
function createErrorForModal() {
  const wrapperError = document.createElement('div');
  const spanError = document.createElement('span');

  wrapperError.classList.add('modal-error', 'blocked');
  spanError.classList.add('modal-error__text');

  wrapperError.classList.remove('blocked');

  wrapperError.append(spanError);

  return {
    wrapperError,
    spanError,
  };
};

// Создал блок кнопок модалки
function createButtonsForModal(submitTitle, smallTitle) {
  const wrapperButtons = document.createElement('div');
  const buttonSubmit = document.createElement('button');
  const buttonSubmitIcon = document.createElement('span');
  const buttonSubmitTitle = document.createElement('span');
  const buttonSmall = document.createElement('button');

  wrapperButtons.classList.add('modal-btns');
  buttonSubmit.classList.add('submit-btn', 'btn');
  buttonSubmitIcon.classList.add('submit-btn__icon');
  buttonSubmitTitle.classList.add('submit-btn__title');

  buttonSmall.classList.add('modal-delete-btn', 'btn');

  buttonSubmit.setAttribute('data-btn', 'submit');
  buttonSmall.setAttribute('data-btn', 'small');


  buttonSubmitTitle.textContent = submitTitle;
  buttonSmall.textContent = smallTitle;

  buttonSubmit.append(buttonSubmitIcon);
  buttonSubmit.append(buttonSubmitTitle);
  wrapperButtons.append(buttonSubmit);
  wrapperButtons.append(buttonSmall);

  return {
    wrapperButtons,
    buttonSubmit,
    buttonSmall,
  };
};

// Считаю количество контактов если 10 деактивируем кнопку Добавить контакт
function disabledButtonAddContact(buttonAddContact, wrapper) {
  const items = wrapper.querySelectorAll('.modal-contacts__item');
  if (items.length >= 10) {
    buttonAddContact.classList.remove(VISIBLE_CSS);
  } else {
    buttonAddContact.classList.add(VISIBLE_CSS);
  };
};

//Развернул дропдаун
function showDropDown(modalElement) {
  const dropdowns = modalElement.querySelectorAll('.contacts-type');

  dropdowns.forEach(function (dropdown) {
    setEventsOnDropdown(dropdown)
  });
};

// Добавление слушателей к элементам дропдауна
function setEventsOnDropdown(dropdown) {
  const buttonDropdown = dropdown.querySelector('.contact-type__button');
  const listDropdown = dropdown.querySelector('.contact-type__list');
  const itemsDropdown = listDropdown.querySelectorAll('.contact-type__item');

  // Отслеживаем клик на кнопке (открыть/закрыть список)
  buttonDropdown.addEventListener('click', function (event) {
    event.preventDefault();
    listDropdown.classList.toggle('contact-type__list_visible');
    buttonDropdown.classList.toggle('contact-type__button_rotate');
  });

  // Отслеживаем клик по элементам списка и присваивание значения кнопке
  itemsDropdown.forEach(function (item) {
    item.addEventListener('click', function (event) {
      event.stopPropagation();
      // Удаляю стили индикации об ошибке
      buttonDropdown.classList.remove('border-color_burnt-sienna');
      buttonDropdown.textContent = this.innerText;
      buttonDropdown.focus();
      hidenDropdown(listDropdown, buttonDropdown);
    });
  });

  // Клик снаружи дропдауна. Закрыть дропдаун
  document.addEventListener('click', function (event) {
    if (event.target !== buttonDropdown) {
      hidenDropdown(listDropdown, buttonDropdown);
    };
  });

  // Нажатие на Таб или Эскейп. Закрыть дропдаун
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Tab' || event.key === 'Escape') {
      hidenDropdown(listDropdown, buttonDropdown);
    };
  });
};

// В функции setEventsOnDropdown повторение кода - удаление свойст показа списка дропдауна
function hidenDropdown(listDropdown, buttonDropdown) {
  listDropdown.classList.remove('contact-type__list_visible');
  buttonDropdown.classList.remove('contact-type__button_rotate');
};

// Добавление события ввода данных в инпуты контактов
function checkValueInInputs(modalElement) {
  const contacts = modalElement.querySelectorAll('.modal-contacts__item');
  contacts.forEach(function (contact) {
    setEventsOnInput(contact);
  });
};

// В функции checkValueInInputs повторение кода - установка видимости кнопки "Удалить контакт"
function setEventsOnInput(element) {
  const buttonDeleteContact = element.querySelector('.delete-contact__btn');
  const inputContact = element.querySelector('.contact-value');

  element.addEventListener('input', function (event) {
    event.stopPropagation();
    if (inputContact.value) {
      buttonDeleteContact.classList.remove('blocked');
    } else {
      buttonDeleteContact.classList.add('blocked');
    };
  });
};

// Добавляем новый контакт клиенту
function addNewContact(buttonAddContact, wrapperContacts) {
  const listContacts = wrapperContacts.querySelector('.modal-contacts__list');
  buttonAddContact.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();

    const contactItem = createContactForModal('');
    listContacts.append(contactItem);

    // Стилизация блока контактов
    setPaddingToContacrsWrap();

    // Добавил новому элементу события для дропдауна
    setEventsOnDropdown(contactItem);

    // Добавил новому элементу событие на ввод данных
    setEventsOnInput(contactItem);

    // Добавил новому элементу событие на кнопку "Удалить контакт"
    setEventOnButtonDeleteContact(contactItem, buttonAddContact, wrapperContacts);

    disabledButtonAddContact(buttonAddContact, wrapperContacts);
  });
};

// Удаляем контакт по кнопке
function deleteContact(buttonAddContact, wrapperContacts) {
  const deleteButtons = wrapperContacts.querySelectorAll('.modal-contacts__item');

  deleteButtons.forEach(function (deleteButton) {
    setEventOnButtonDeleteContact(deleteButton, buttonAddContact, wrapperContacts);
  });
};

// Навешиваю событие клик на кнопку удаления контакта
function setEventOnButtonDeleteContact(element, buttonAddContact, wrapperContacts) {
  const deleteButton = element.querySelector('.delete-contact__btn');
  deleteButton.addEventListener('click', function () {
    element.remove();
    disabledButtonAddContact(buttonAddContact, wrapperContacts);
    // // Стилизация блока контактов
    setPaddingToContacrsWrap();
  });
};

// Получаю данные формы модального окна
function getValuesFromModal(modal) {
  let textError = '';
  const surnameElement = modal.querySelector('#surname');
  const surname = surnameElement.value.trim();
  if (!surname) {
    surnameElement.parentNode.classList.add('border-color_burnt-sienna');
    textError = 'Введите фамилию клиента';
  };

  const nameElement = modal.querySelector('#name');
  const name = nameElement.value.trim();
  if (!name) {
    nameElement.parentNode.classList.add('border-color_burnt-sienna');
    if (textError) {
      textError = textError + '<br>';
    }
    textError = textError + 'Введите имя клиента';
  };

  const lastNameElement = modal.querySelector('#lastname');
  const lastName = lastNameElement.value.trim();

  const contacts = [];
  const contactsItems = modal.querySelectorAll('.modal-contacts__item');

  contactsItems.forEach(function (contactsItem) {
    const typeElement = contactsItem.querySelector('.contact-type__button');
    const type = typeElement.innerText;
    if (type === 'Тип контакта') {
      typeElement.classList.add('border-color_burnt-sienna');
      if (textError) {
        textError = textError + '<br>';
      }
      textError = textError + 'Установите тип контакта';
    }

    const valueElement = contactsItem.querySelector('.contact-value');
    const value = valueElement.value.trim();
    if (!value) {
      valueElement.classList.add('border-color_burnt-sienna');
      if (textError) {
        textError = textError + '<br>';
      }
      textError = textError + 'Введите данные контакта';
    }

    const objContact = {
      type,
      value,
    };
    contacts.push(objContact);
  });

  return {
    name,
    surname,
    lastName,
    contacts,
    textError,
  };
};

// Установка/снятие disabled с полей формы
function setDisabledOnElementsOfForm(modal, disabledElements) {
  const modalInputs = modal.querySelectorAll('.modal__intup');
  const contactsItems = modal.querySelectorAll('.modal-contacts__item');
  const buttonAddContact = modal.querySelector('.modal-addcontact__btn');
  const buttonSubmit = modal.querySelector('.submit-btn');
  const buttonSmall = modal.querySelector('.modal-delete-btn');

  if (disabledElements) {
    modalInputs.forEach(function (modalInput) {
      modalInput.disabled = true;
    });

    contactsItems.forEach(function (contactsItem) {
      const typeElement = contactsItem.querySelector('.contact-type__button');
      const valueElement = contactsItem.querySelector('.contact-value');
      const buttonDeleteContact = contactsItem.querySelector('.delete-contact__btn');

      typeElement.disabled = true;
      valueElement.disabled = true;
      buttonDeleteContact.disabled = true;
    });

    buttonAddContact.disabled = true;
    buttonSubmit.disabled = true;
    buttonSmall.disabled = true;

  } else {
    modalInputs.forEach(function (modalInput) {
      modalInput.disabled = false;
    });

    contactsItems.forEach(function (contactsItem) {
      const typeElement = contactsItem.querySelector('.contact-type__button');
      const valueElement = contactsItem.querySelector('.contact-value');
      const buttonDeleteContact = contactsItem.querySelector('.delete-contact__btn');

      typeElement.disabled = false;
      valueElement.disabled = false;
      buttonDeleteContact.disabled = false;
    });

    buttonAddContact.disabled = false;
    buttonSubmit.disabled = false;
    buttonSmall.disabled = false;
  };
};

// Закрываю модалку  
function onClose(modal) {
  const wrapper = modal.querySelector('.modal__wrapper');
  modal.classList.remove(VISIBLE_CSS);
  wrapper.classList.remove(VISIBLE_CSS);
  const timeoutId = setTimeout(function () {
    modal.remove();
  }, DELAY_TIME);
  document.location.hash = '';
};

// Удаляю клиента
async function onDelete(clientId, modal) {
  // Удаляю из базы
  const response = await fetchDeleteClient(clientId);
  httpErrorHandler(response, modal);
};

// Добавляю нового клиента 
async function onSave(client, modal) {
  const response = await fetchAddClient(client);
  httpErrorHandler(response, modal);
};

// Обновляю данные клиента
async function onUpdate(сlient, clientId, modal) {
  const response = await fetchUpdateClient(сlient, clientId);
  httpErrorHandler(response, modal);
};

// Обработка HTTP ошибок 
async function httpErrorHandler(response, modal) {
  let info;
  const wrapperError = modal.querySelector('.modal-error');
  const spanError = wrapperError.querySelector('.modal-error__text');

  if (response.status === 200 || response.status === 201) {
    await updateClientsInTable();
    onClose(modal);
  } else {
    if (modalWindowStructure.type !== 'delete') {
      if (response.status === 500) {
        info = `Данные не сохранены. Ответ сервера - ${response.status}. Ошибка работы сервера.`;
      } else {
        switch (response.status) {
          case 404:
            info = 'Данные не сохранены. Ответ сервера - 404. Не удалось найти запрашиваемую страницую.';
            break;
          case 422:
            const errors = await response.json();
            errors.errors.forEach(function (error) {
              if (info) {
                info = info + ' <br> ' + error.message;
              } else {
                info = error.message;
              }
            });
            break;
          default:
            info = '"Что-то пошло не так..."';
            break;
        };
      };

      wrapperError.classList.remove('blocked');
      spanError.innerHTML = info;
    };
  };
};


// ========== Серверная часть
// Задержка для тестов
const delay = ms => {
  return new Promise(r => setTimeout(() => r(), ms));
};

// Читаем клиентов из базы
async function fetchGetClients() {
  await delay(DELAY_TIME); // установка задержки
  const response = await fetch(URI);
  const data = await response.json();

  return data;
};

// Ищем клиентов
async function fetchSearchClients(search) {
  await delay(DELAY_TIME); // установка задержки
  const url = `${URI}?search=${search}`;
  const pesponse = await fetch(url);
  const data = await pesponse.json();

  return data;
};

// Добавляем клиента в базу
async function fetchAddClient(obj) {
  await delay(DELAY_TIME); // установка задержки
  const response = await fetch(URI, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obj),
  });

  return response;
};

// Получаем клиента по его ID
async function fetchGetClientById(id) {
  await delay(DELAY_TIME); // установка задержки
  const response = await fetch(`${URI}/${id}`);
  const data = await response.json();

  return data;
};

// Обновляем данные клиента по ID
async function fetchUpdateClient(obj, id) {
  await delay(DELAY_TIME); // установка задержки
  const response = await fetch(`${URI}/${id}`, {
    method: "PATCH",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obj),
  });

  return response;
};

// Удаляем клиента по ID. Ничего не возвращает в body
async function fetchDeleteClient(id) {
  const response = await fetch(`${URI}/${id}`, {
    method: "DELETE",
  });

  return response;
};

// Добавление клиентов из базы данных в таблицу
async function updateClientsInTable() {
  // Заблокировал инпут поиска клиентов 
  const serchInput = document.querySelector('.search-form__input');
  serchInput.disabled = true;

  // Показал оверлей
  const tableBodyOverley = document.querySelector('.table-body__overlay');
  tableBodyOverley.classList.remove('blocked');

  // Записал данные о клинетах из базы в массив объекта
  clientsState.clients = await fetchGetClients();

  // Вставил данные в таблицу
  insertClientsData(clientsState);

  // Скрыл оверлей
  tableBodyOverley.classList.add('blocked');

  // Разблокировал инпут поиска клиентов
  serchInput.disabled = false;
};


// Создание списка найденных клиентов
function createListItems(clients, list, tableBody) {

  clients.forEach(function (client) {
    const listItem = document.createElement('li');
    listItem.classList.add('search__items');
    listItem.setAttribute('data-id', client.id);
    listItem.textContent = client.name + ' ' + client.surname;
    list.append(listItem);

    // Клик по списку
    listItem.addEventListener('click', function () {
      showClientInTable(this.dataset.id, tableBody);
      clearListOfSearch(list);
    });
  });

  list.classList.remove('blocked');

  return list;
};

// Установка фокуса на элемент списка поиска клиентов
function setFocusOnItem(focusedItem, itemElements) {
  if (focusedItem > itemElements.length - 1) {
    focusedItem = 0;
  };
  if (focusedItem < 0) {
    focusedItem = itemElements.length - 1
  };
  unfocusAllItems(itemElements);
  itemElements[focusedItem].classList.add('search__items_focused');

  return focusedItem;
};

// Снятие фокусировок с элементов списка поиска клиентов
function unfocusAllItems(itemElements) {
  itemElements.forEach(function (itemElement) {
    itemElement.classList.remove('search__items_focused');
  });
};

// Поиск клиента в таблице по id, подсвечивание и плавный скролл
function showClientInTable(clientId) {
  // Подсветил клиента
  const trOfClient = document.getElementById(clientId);
  trOfClient.classList.add('outline_medium-slate-blue');

  // Плавный скрол до найденного элемента
  trOfClient.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
};

// Очистка списка поиска 
function clearListOfSearch(list) {
  list.classList.add('blocked');
  list.innerHTML = '';
};

// Основная функция
document.addEventListener('DOMContentLoaded', function () {
  async function createApp() {
    const tableBody = document.querySelector('.table-body');
    const tableHead = document.querySelector('.table-head__row')

    // Показываю тултипы
    showTooltips();

    // Поиск по ФИО
    // Создаем список для вывода результатов поиска 
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-form__input');
    const listSearchedValues = document.createElement('ul');

    listSearchedValues.classList.add('search__list', 'blocked');
    searchForm.append(listSearchedValues);

    let timeoutId = null;
    let listItemsElements = null;
    let focusedItem = -1;

    searchInput.addEventListener('input', function () {
      const highlightedItems = tableBody.querySelectorAll('.table__row');
      highlightedItems.forEach(function (highlightedItem) {
        highlightedItem.classList.remove('outline_medium-slate-blue');
      });

      clearTimeout(timeoutId);
      timeoutId = setTimeout(function () { findContacts() }, DELAY_TIME);
    });

    // Ищу клиентов по введенным данным в input
    async function findContacts() {
      const inputValue = searchInput.value.trim();
      clearListOfSearch(listSearchedValues);

      if (inputValue) {
        const serchedClients = await fetchSearchClients(inputValue);
        if (serchedClients.length) {
          listItemsElements = createListItems(serchedClients, listSearchedValues, tableBody).querySelectorAll('.search__items');
        } else {
          listItemsElements = null;
        };
      } else {
        listItemsElements = null;
      };
    };

    await updateClientsInTable();

    // Установливаем обработчик событий на keydown
    document.addEventListener('keydown', function (event) {
      if (listItemsElements) {
        switch (event.key) {
          case 'Enter':
            event.preventDefault();
            showClientInTable(listItemsElements[focusedItem].dataset.id);
            clearListOfSearch(listSearchedValues);
            break;
          case 'ArrowDown':
            focusedItem++;
            focusedItem = setFocusOnItem(focusedItem, listItemsElements);
            break;
          case 'ArrowUp':
            focusedItem--;
            focusedItem = setFocusOnItem(focusedItem, listItemsElements);
            break;
          case 'Escape':
            clearListOfSearch(listSearchedValues);
            break;
        };
      };
    });

    // Сортировка данных в таблице 
    sortDataInTable(clientsState, tableHead);

    // Добавляем клиента
    const addClientBtn = document.querySelector('.add-client__btn');
    addClientBtn.addEventListener('click', function () {
      modalWindowStructure.type = 'new';
      createModalWindow('', modalWindowStructure);
    });

    // Если location.hash ссылка, открываем модальное
    if (document.location.hash) {
      const clientId = document.location.hash.split('_')[1];
      modalWindowStructure.type = 'change';
      const client = await fetchGetClientById(clientId);
      createModalWindow(client, modalWindowStructure);
    };
  };

  // Вставил данные из базы в таблицу
  createApp();

});

