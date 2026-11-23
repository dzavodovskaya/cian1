const app = document.getElementById('app');
const backButton = document.getElementById('backButton');
const caption = document.getElementById('topbarCaption');
const METRIKA_COUNTER_ID = 99999999;
let lastScreenEvent = '';

function reachGoal(name, params = {}) {
  const payload = { ...params, counterId: METRIKA_COUNTER_ID };
  window.__metrikaGoals = window.__metrikaGoals || [];
  window.__metrikaGoals.push({ name, params: payload, at: new Date().toISOString() });
  console.info('[Metrika stub]', name, payload);
  if (typeof window.ym === 'function') window.ym(METRIKA_COUNTER_ID, 'reachGoal', name, payload);
}

function reachScreenGoal(name, params = {}) {
  const key = `${name}:${JSON.stringify(params)}`;
  if (key !== lastScreenEvent) {
    lastScreenEvent = key;
    reachGoal(name, params);
  }
}

const initialState = {
  view: 'entry',
  step: 1,
  source: 'property',
  propertySelected: true,
  propertyIndex: 0,
  loanAmount: 8400000,
  loanTerm: 20,
  maxRate: 13,
  fullName: 'Даша Заводовская',
  phone: '+7 999 123-45-67',
  email: 'dasha@example.ru',
  purchaseTiming: '',
  propertyOption: '',
  consultant: '',
  employment: '',
  income: '',
  hasLoans: '',
  loanPayment: '',
  hasSubsidizedMortgage: '',
  adults: '1',
  childrenYears: '',
  security: 'none',
  callTime: '',
  requiredConsent: false,
  marketingConsent: false,
  errors: [],
};

let state = { ...initialState };

const propertySources = {
  property: {
    title: 'Из карточки квартиры',
    caption: 'Сумма уже рассчитана для выбранной квартиры',
    amount: 8400000,
  },
  calculator: {
    title: 'Из ипотечного калькулятора',
    caption: 'Подставим ваш последний расчёт',
    amount: 7200000,
  },
  search: {
    title: 'Из поиска',
    caption: 'Поможем понять доступный бюджет',
    amount: '',
  },
};

const properties = [
  { complex: 'ЖК «Северный берег»', title: '2-комн. квартира, 54 м²', meta: 'Москва, 12 минут до метро', price: 12000000, loan: 8400000 },
  { complex: 'ЖК «Речной квартал»', title: '1-комн. квартира, 41 м²', meta: 'Москва, 8 минут до метро', price: 9650000, loan: 6700000 },
];

const banks = [
  { name: 'Сбербанк', mark: 'СБ', rate: 12.4, familyRate: 6.2, limit: 1.03 },
  { name: 'ВТБ', mark: 'ВТБ', rate: 12.7, familyRate: 6.4, limit: 0.98 },
  { name: 'Т-Банк', mark: 'Т', rate: 13.2, familyRate: 6.7, limit: 0.91 },
];

function money(value) {
  const number = Math.round(Number(value) || 0);
  return `${new Intl.NumberFormat('ru-RU').format(number)} ₽`;
}

function numberValue(value) {
  return Number(String(value || '').replace(/[^\d]/g, '')) || 0;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  }[character]));
}

function familyPotential() {
  const currentYear = new Date().getFullYear();
  const years = String(state.childrenYears)
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((year) => year >= 2000 && year <= currentYear);
  return years.some((year) => currentYear - year <= 6);
}

function field(label, name, options = {}) {
  const value = escapeHtml(state[name] ?? '');
  const error = state.errors.includes(name) ? options.error || 'Проверьте это поле' : '';
  return `<label class="field ${error ? 'has-error' : ''}">
    <span class="field-label">${label}</span>
    <input class="field-control" data-field="${name}" type="${options.type || 'text'}" value="${value}" ${options.readonly ? 'readonly' : ''} ${options.placeholder ? `placeholder="${options.placeholder}"` : ''} ${options.inputmode ? `inputmode="${options.inputmode}"` : ''} />
    <span class="field-error" role="alert">${error}</span>
  </label>`;
}

function selectField(label, name, values, placeholder = 'Выберите вариант') {
  const error = state.errors.includes(name) ? 'has-error' : '';
  const options = [`<option value="">${placeholder}</option>`, ...values.map((item) => `<option value="${item.value}" ${state[name] === item.value ? 'selected' : ''}>${item.label}</option>`)].join('');
  return `<label class="field ${error}"><span class="field-label">${label}</span><select class="field-control" data-field="${name}">${options}</select><span class="field-error" role="alert">Выберите вариант</span></label>`;
}

function cardChoice(group, value, title, subtitle = '') {
  const selected = state[group] === value;
  return `<button class="choice-card ${selected ? 'is-selected' : ''} ${state.errors.includes(group) ? 'is-invalid' : ''}" type="button" data-select-group="${group}" data-select-value="${value}"><strong>${title}</strong>${subtitle ? `<span>${subtitle}</span>` : ''}</button>`;
}

function chip(group, value, label) {
  return `<button type="button" class="chip ${String(state[group]) === String(value) ? 'is-selected' : ''}" data-select-group="${group}" data-select-value="${value}">${label}</button>`;
}

function renderEntry() {
  reachScreenGoal('mortgage_entry_view', { step: 'entry', source: state.source, property_selected: state.propertySelected });
  const property = properties[state.propertyIndex];
  caption.textContent = 'Ипотека';
  backButton.hidden = true;
  app.innerHTML = `<div class="content content--bottom">
    <h1>Возьмите ипотеку онлайн</h1>
    <p class="lead">Отправим вашу заявку во все банки и получим предварительный ответ за 5 минут</p>
    ${state.propertySelected ? `<div class="hero-card">
      <div class="property-photo"><span class="residential-sun" aria-hidden="true"></span><span class="residential-building residential-building--back" aria-hidden="true"></span><span class="residential-building residential-building--side" aria-hidden="true"></span><span class="residential-building residential-building--front" aria-hidden="true"></span><span class="residential-ground" aria-hidden="true"></span><span class="property-label">${property.complex}</span></div>
      <p class="property-title">${property.title}</p>
      <span class="property-meta">${property.meta}</span>
      <div class="property-price">${money(property.price)}</div>
    </div>
    <div class="alternative-property"><p class="field-label">Другой вариант</p><button class="property-choice-card" type="button" data-action="change-property" aria-label="Выбрать квартиру в ЖК Речной квартал"><span class="property-photo property-photo--compact"><span class="residential-sun" aria-hidden="true"></span><span class="residential-building residential-building--back" aria-hidden="true"></span><span class="residential-building residential-building--side" aria-hidden="true"></span><span class="residential-building residential-building--front" aria-hidden="true"></span><span class="residential-ground" aria-hidden="true"></span><span class="property-label">${properties[(state.propertyIndex + 1) % properties.length].complex}</span></span><span class="property-choice-info"><strong>${properties[(state.propertyIndex + 1) % properties.length].title}</strong><span>${properties[(state.propertyIndex + 1) % properties.length].meta}</span><b>${money(properties[(state.propertyIndex + 1) % properties.length].price)}</b></span></button></div>
    <div class="object-actions"><button class="search-button" type="button" data-action="return-search"><span class="magnifier" aria-hidden="true"></span><span>К поиску жилья</span></button><button class="text-button" type="button" data-action="continue-without">Продолжить без квартиры</button></div>` : `<div class="no-property"><div class="no-property-mark">⌕</div><h2>Можно продолжить без квартиры</h2><p>Сначала покажем подходящую сумму ипотеки, а объект выберете позже.</p><button class="text-button" type="button" data-action="change-property">Выбрать квартиру</button></div>`}
    <div class="button-row"><button class="button button--primary button--full" type="button" data-action="start">Дальше</button></div>
  </div>`;
}

function renderStep() {
  reachScreenGoal('mortgage_step_view', { step: state.step });
  caption.textContent = 'Анкета';
  backButton.hidden = false;
  const progress = Math.round((state.step / 8) * 100);
  const body = stepContent();
  app.innerHTML = `<div class="content content--bottom">
    <div class="progress-wrap"><div class="progress-label"><span>Вопрос ${state.step} из 8</span><span>${progress}%</span></div><div class="progress" role="progressbar" aria-valuemin="1" aria-valuemax="8" aria-valuenow="${state.step}"><span style="width:${progress}%"></span></div></div>
    ${state.errors.length ? '<div class="form-error" role="alert">Заполните отмеченные поля, чтобы продолжить.</div>' : ''}
    ${body}
    <div class="button-row"><button class="button button--primary button--full" type="button" data-action="continue">${state.step === 8 ? 'Отправить в банки' : 'Продолжить'}</button></div>
  </div>`;
}

function stepContent() {
  switch (state.step) {
    case 1:
      return `<h1 class="step-title">Какая ипотека нужна?</h1><p class="step-subtitle">Сумма подставлена из ${propertySources[state.source].title.toLowerCase()}. Её можно изменить.</p>
        ${field('Сумма кредита', 'loanAmount', { type: 'text', inputmode: 'numeric', placeholder: 'Например, 8 400 000', error: 'Укажите сумму кредита' })}
        <div class="field"><span class="field-label">Срок кредита</span><div class="chips">${[10, 15, 20, 25, 30].map((term) => chip('loanTerm', term, `${term} лет`)).join('')}</div></div>
        ${field('Максимальная ставка, на которую вы рассчитываете', 'maxRate', { type: 'text', inputmode: 'numeric', placeholder: 'Например, 13', error: 'Укажите ставку' })}`;
    case 2:
      return `<h1 class="step-title">Оставим контакты</h1><p class="step-subtitle">Чтобы сохранить заявку и связать вас с экспертом, если понадобится помощь.</p>
        ${field('Полное имя', 'fullName', { placeholder: 'Имя и фамилия', error: 'Укажите имя и фамилию' })}
        ${field('Телефон', 'phone', { readonly: true })}
        ${field('Почта', 'email', { type: 'email', placeholder: 'name@example.ru', error: 'Проверьте адрес почты' })}`;
    case 3:
      return `<h1 class="step-title">Когда планируете покупку?</h1><p class="step-subtitle">Это помогает подобрать условия без лишних вопросов.</p>
        <div class="selection-stack">${cardChoice('purchaseTiming', 'month', 'В течение месяца')}${cardChoice('purchaseTiming', '1-3', 'Через 1–3 месяца')}${cardChoice('purchaseTiming', '3-6', 'Через 3–6 месяцев')}${cardChoice('purchaseTiming', 'exploring', 'Пока просто изучаю')}</div>
        <p class="field-label">Есть объект для покупки?</p><div class="selection-stack">${cardChoice('propertyOption', 'have', 'Да, уже выбрал(а) объект')}${cardChoice('propertyOption', 'searching', 'Нет, пока выбираю')}${cardChoice('propertyOption', 'budget', 'Хочу сначала понять бюджет')}</div>
        <div class="conditional ${state.propertyOption === 'searching' ? 'is-visible' : ''}"><p class="field-label">Нужна помощь с подбором новостройки?</p><div class="chips">${chip('consultant', 'yes', 'Да, нужна')}${chip('consultant', 'no', 'Нет, справлюсь')}</div></div>`;
    case 4:
      return `<h1 class="step-title">Как вы зарабатываете?</h1><p class="step-subtitle">Достаточно выбрать тип занятости — справки пока не нужны.</p><div class="selection-stack">${cardChoice('employment', 'official', 'Официально устроен(а)', 'Работаю по трудовому договору')}${cardChoice('employment', 'self-employed', 'Самозанятый(ая)', 'Работаю на себя и плачу НПД')}</div><div class="note"><span class="note-mark">✓</span><span>Данные нужны только для предварительной оценки. Банк уточнит их при оформлении.</span></div>`;
    case 5:
      return `<h1 class="step-title">Какой у вас доход?</h1><p class="step-subtitle">Укажите средний доход в месяц после налогов.</p><div class="chips">${[100000, 150000, 200000, 300000].map((sum) => chip('income', sum, money(sum).replace(' ₽', ''))).join('')}</div>${field('Доход в месяц', 'income', { type: 'text', inputmode: 'numeric', placeholder: 'Например, 180 000', error: 'Укажите доход больше нуля' })}`;
    case 6:
      return `<h1 class="step-title">Есть действующие кредиты?</h1><p class="step-subtitle">Учтём ежемесячные платежи, чтобы не предложить неподходящую сумму.</p><div class="selection-stack">${cardChoice('hasLoans', 'no', 'Нет, кредитов нет')}${cardChoice('hasLoans', 'yes', 'Да, есть кредиты')}</div><div class="conditional ${state.hasLoans === 'yes' ? 'is-visible' : ''}">${field('Общий платёж по кредитам в месяц', 'loanPayment', { type: 'text', inputmode: 'numeric', placeholder: 'Например, 25 000', error: 'Укажите ежемесячный платёж' })}</div><p class="field-label">Есть действующая льготная ипотека?</p><div class="chips">${chip('hasSubsidizedMortgage', 'no', 'Нет')}${chip('hasSubsidizedMortgage', 'yes', 'Да')}</div>`;
    case 7:
      return `<h1 class="step-title">Расскажите о семье</h1><p class="step-subtitle">Проверим, может ли вам предварительно подойти семейная ипотека.</p>${field('Сколько взрослых будет в сделке', 'adults', { type: 'text', inputmode: 'numeric', error: 'Укажите количество взрослых' })}${field('Годы рождения детей через запятую', 'childrenYears', { type: 'text', inputmode: 'numeric', placeholder: 'Например, 2019, 2023' })}<div class="note"><span class="note-mark">⌁</span><span>${familyPotential() ? '<strong>Возможно, вам подойдёт семейная ипотека.</strong> Условия и право на льготу окончательно проверит банк.' : 'Если есть дети, укажите годы рождения. Так мы сможем подсказать подходящую программу.'}</span></div>`;
    case 8:
      return `<h1 class="step-title">Последние детали</h1><p class="step-subtitle">Это повышает точность предварительной оценки.</p><p class="field-label">Что поможет обеспечить кредит?</p><div class="selection-stack">${cardChoice('security', 'none', 'Ничего из перечисленного')}${cardChoice('security', 'guarantor', 'Есть поручитель')}${cardChoice('security', 'collateral', 'Есть недвижимость в залог')}</div>${selectField('Когда удобно поговорить с ипотечным экспертом', 'callTime', [{ value: 'Сегодня, 19:00–21:00', label: 'Сегодня, 19:00–21:00' }, { value: 'Завтра, 10:00–12:00', label: 'Завтра, 10:00–12:00' }, { value: 'Завтра, 18:00–20:00', label: 'Завтра, 18:00–20:00' }, { value: 'Послезавтра, 12:00–14:00', label: 'Послезавтра, 12:00–14:00' }], 'Выберите время')}
        <label class="checkbox"><input data-field="requiredConsent" type="checkbox" ${state.requiredConsent ? 'checked' : ''} /><span>Нажимая «Отправить в банки», принимаю условия обработки данных для предварительной оценки и связи по заявке.</span></label>
        <label class="checkbox"><input data-field="marketingConsent" type="checkbox" ${state.marketingConsent ? 'checked' : ''} /><span>Хочу получать полезные предложения от Циана и партнёров.</span></label>`;
    default:
      return '';
  }
}

function captureInputs() {
  app.querySelectorAll('[data-field]').forEach((input) => {
    const key = input.dataset.field;
    state[key] = input.type === 'checkbox' ? input.checked : input.value;
  });
}

function validateStep() {
  const errors = [];
  if (state.step === 1) {
    state.loanAmount = numberValue(state.loanAmount);
    state.maxRate = numberValue(state.maxRate);
    if (!state.loanAmount || state.loanAmount < 300000) errors.push('loanAmount');
    if (!state.maxRate || state.maxRate > 30) errors.push('maxRate');
  }
  if (state.step === 2) {
    if (state.fullName.trim().split(/\s+/).length < 2) errors.push('fullName');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) errors.push('email');
  }
  if (state.step === 3) {
    if (!state.purchaseTiming) errors.push('purchaseTiming');
    if (!state.propertyOption) errors.push('propertyOption');
  }
  if (state.step === 4 && !state.employment) errors.push('employment');
  if (state.step === 5) {
    state.income = numberValue(state.income);
    if (!state.income) errors.push('income');
  }
  if (state.step === 6) {
    if (!state.hasLoans) errors.push('hasLoans');
    if (!state.hasSubsidizedMortgage) errors.push('hasSubsidizedMortgage');
    state.loanPayment = numberValue(state.loanPayment);
    if (state.hasLoans === 'yes' && !state.loanPayment) errors.push('loanPayment');
  }
  if (state.step === 7 && (!numberValue(state.adults) || numberValue(state.adults) > 6)) errors.push('adults');
  if (state.step === 8) {
    if (!state.callTime) errors.push('callTime');
    if (!state.requiredConsent) errors.push('requiredConsent');
  }
  state.errors = errors;
  return errors.length === 0;
}

function calculatePayment(amount, rate, years) {
  const monthlyRate = rate / 100 / 12;
  const months = years * 12;
  return amount * (monthlyRate * ((1 + monthlyRate) ** months)) / (((1 + monthlyRate) ** months) - 1);
}

function calculateMaxLoan(payment, rate, years) {
  const monthlyRate = rate / 100 / 12;
  const months = years * 12;
  return payment * ((1 - (1 + monthlyRate) ** -months) / monthlyRate);
}

function getOffers() {
  const income = Number(state.income) || 0;
  const currentPayment = state.hasLoans === 'yes' ? Number(state.loanPayment) || 0 : 0;
  let share = state.employment === 'official' ? .47 : .41;
  if (state.security !== 'none') share += .04;
  if (state.hasSubsidizedMortgage === 'yes') share -= .03;
  const available = Math.max(0, income * share - currentPayment);
  const isFamily = familyPotential();
  return banks.map((bank) => {
    const rate = isFamily ? bank.familyRate : bank.rate;
    const monthly = calculatePayment(state.loanAmount, rate, state.loanTerm);
    const cap = available * bank.limit;
    const approved = monthly <= cap && cap > 10000;
    return {
      ...bank,
      rate,
      monthly,
      overpayment: monthly * state.loanTerm * 12 - state.loanAmount,
      approved,
      cap,
      family: isFamily,
    };
  });
}

function renderLoading() {
  reachScreenGoal('mortgage_bank_request_started', { step: 8, loan_amount: state.loanAmount });
  caption.textContent = 'Проверяем';
  backButton.hidden = true;
  app.innerHTML = `<div class="loading"><div class="loader" aria-label="Загружаем предложения"></div><h1>Ищем подходящие предложения</h1><p class="lead">Сравниваем условия Сбербанка, ВТБ и Т-Банка</p><p class="hint">Это займёт несколько секунд</p></div>`;
  window.setTimeout(() => { state.view = 'results'; render(); }, 1300);
}

function renderResults() {
  const offers = getOffers();
  const approvedCount = offers.filter((offer) => offer.approved).length;
  reachScreenGoal('mortgage_results_view', { step: 'results', approved_count: approvedCount });
  caption.textContent = 'Предложения';
  backButton.hidden = false;
  const suggestedAmount = Math.max(500000, Math.floor(Math.min(...offers.map((offer) => calculateMaxLoan(offer.cap, offer.rate, state.loanTerm))) / 100000) * 100000);
  app.innerHTML = `<div class="content content--bottom">
    <p class="eyebrow">Предварительный результат</p>
    <h1>${approvedCount ? `Нашли ${approvedCount} ${approvedCount === 1 ? 'предложение' : 'предложения'}` : 'Пока нет подходящих предложений'}</h1>
    <p class="result-intro">Решение предварительное: банк проверит документы и данные перед выдачей кредита.</p>
    ${offers.map((offer) => `<article class="result-card ${offer.approved ? 'result-card--approved' : 'result-card--declined'}"><div class="bank-row"><div class="bank-mark">${offer.mark}</div><div class="bank-name">${offer.name}</div><div class="status ${offer.approved ? 'status--approved' : 'status--declined'}">${offer.approved ? 'Одобрил' : 'Не одобрил'}</div></div>${offer.approved ? `<div class="offer-grid"><div class="offer-item">Ставка<strong>${offer.rate.toFixed(1).replace('.', ',')}%</strong></div><div class="offer-item">Срок<strong>${state.loanTerm} лет</strong></div><div class="offer-item">Платёж в месяц<strong>${money(offer.monthly)}</strong></div><div class="offer-item">Переплата<strong>${money(offer.overpayment)}</strong></div></div>${offer.family ? '<p class="result-reason">В расчёте учтена возможная семейная программа. Банк проверит право на неё отдельно.</p>' : ''}` : `<p class="result-reason">При текущих доходах и обязательствах расчётный платёж выше комфортного для банка.</p>`}</article>`).join('')}
    ${!approvedCount ? `<div class="safety-card"><h2>Можно повысить шансы</h2><p>Попробуйте уменьшить сумму до ${money(suggestedAmount)} или добавьте обеспечение кредита.</p></div>` : ''}
    <div class="button-row">${!approvedCount ? '<button type="button" class="button button--primary button--full" data-action="retry">Выбрать меньшую сумму</button>' : ''}<button type="button" class="button ${approvedCount ? 'button--primary' : 'button--secondary'} button--full" data-action="expert">${approvedCount ? 'Получить помощь эксперта' : 'Обсудить варианты с экспертом'}</button><button type="button" class="button button--secondary button--full" data-action="edit">Изменить анкету</button></div>
  </div>`;
}

function renderSuccess() {
  reachScreenGoal('mortgage_expert_success_view', { step: 'success', call_time: state.callTime });
  caption.textContent = 'Готово';
  backButton.hidden = true;
  app.innerHTML = `<div class="content success"><div class="success-mark">✓</div><h1>Заявка сохранена</h1><p>Ипотечный эксперт партнёра позвонит вам <strong>${escapeHtml(state.callTime)}</strong>, поможет сравнить предложения и объяснит следующий шаг.</p><div class="button-row"><button class="button button--primary button--full" type="button" data-action="restart">Вернуться к поиску жилья</button></div></div>`;
}

function render() {
  if (state.view === 'entry') renderEntry();
  if (state.view === 'form') renderStep();
  if (state.view === 'loading') renderLoading();
  if (state.view === 'results') renderResults();
  if (state.view === 'success') renderSuccess();
}

function startForm() {
  reachGoal('mortgage_start_form_click', { step: 'entry', property_selected: state.propertySelected });
  state.loanAmount = state.propertySelected ? properties[state.propertyIndex].loan : '';
  state.step = 1;
  state.errors = [];
  state.view = 'form';
  render();
}

app.addEventListener('click', (event) => {
  const sourceButton = event.target.closest('[data-source]');
  if (sourceButton) {
    state.source = sourceButton.dataset.source;
    render();
    return;
  }
  const selectButton = event.target.closest('[data-select-group]');
  if (selectButton) {
    captureInputs();
    state[selectButton.dataset.selectGroup] = selectButton.dataset.selectValue;
    state.errors = [];
    render();
    return;
  }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (!action) return;
  captureInputs();
  if (action === 'start') startForm();
  if (action === 'change-property') { reachGoal('mortgage_property_changed', { step: 'entry' }); state.propertyIndex = (state.propertyIndex + 1) % properties.length; state.propertySelected = true; state.source = 'property'; render(); }
  if (action === 'return-search') { reachGoal('mortgage_search_return_click', { step: 'entry' }); state.propertySelected = false; state.source = 'search'; render(); }
  if (action === 'continue-without') { reachGoal('mortgage_continue_without_property', { step: 'entry' }); state.propertySelected = false; state.source = 'search'; startForm(); }
  if (action === 'continue') {
    if (!validateStep()) { render(); return; }
    reachGoal('mortgage_step_completed', { step: state.step });
    if (state.step < 8) { state.step += 1; state.errors = []; render(); }
    else { reachGoal('mortgage_submit_click', { step: 8, loan_amount: state.loanAmount }); state.view = 'loading'; render(); }
  }
  if (action === 'retry') {
    const offers = getOffers();
    const maxAmount = Math.max(500000, Math.floor(Math.min(...offers.map((offer) => calculateMaxLoan(offer.cap, offer.rate, state.loanTerm))) / 100000) * 100000);
    reachGoal('mortgage_retry_with_lower_amount', { step: 'results', previous_loan_amount: state.loanAmount, suggested_loan_amount: maxAmount });
    state.loanAmount = Math.min(Math.floor(state.loanAmount * .85 / 100000) * 100000, maxAmount);
    state.step = 1; state.errors = []; state.view = 'form'; render();
  }
  if (action === 'edit') { state.step = 1; state.errors = []; state.view = 'form'; render(); }
  if (action === 'expert') { reachGoal('mortgage_expert_request', { step: 'results', call_time: state.callTime }); state.view = 'success'; render(); }
  if (action === 'restart') { state = { ...initialState }; render(); }
});

backButton.addEventListener('click', () => {
  if (state.view === 'form') {
    captureInputs();
    if (state.step > 1) state.step -= 1;
    else state.view = 'entry';
  } else if (state.view === 'results') {
    state.view = 'form'; state.step = 8;
  }
  state.errors = [];
  render();
});

render();
