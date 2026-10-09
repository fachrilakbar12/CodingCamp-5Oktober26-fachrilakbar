/* ==========================================================
   Life Dashboard
   Sections: storage helpers, theme, clock and greeting,
   focus timer, tasks, quick links, startup.
   ========================================================== */

(function () {
  'use strict';

  /* ---------- Constants ---------- */

  var KEYS = {
    tasks: 'lifeDashboard.tasks',
    links: 'lifeDashboard.links',
    name: 'lifeDashboard.name',
    theme: 'lifeDashboard.theme'
  };

  var FOCUS_SECONDS = 25 * 60;

  var DEFAULT_LINKS = [
    { id: 'default-google', name: 'Google', url: 'https://www.google.com/' },
    { id: 'default-gmail', name: 'Gmail', url: 'https://mail.google.com/' },
    { id: 'default-calendar', name: 'Calendar', url: 'https://calendar.google.com/' }
  ];

  /* ---------- Storage helpers ---------- */

  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      /* Storage can be blocked or full. The app keeps working in memory. */
    }
  }

  function makeId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  /* ---------- Element references ---------- */

  var el = {
    root: document.documentElement,
    themeToggle: document.getElementById('theme-toggle'),
    date: document.getElementById('date'),
    clockMain: document.getElementById('clock-main'),
    clockSeconds: document.getElementById('clock-seconds'),
    greeting: document.getElementById('greeting'),
    nameForm: document.getElementById('name-form'),
    nameInput: document.getElementById('name-input'),
    timerDisplay: document.getElementById('timer-display'),
    timerStart: document.getElementById('timer-start'),
    timerStop: document.getElementById('timer-stop'),
    timerReset: document.getElementById('timer-reset'),
    timerStatus: document.getElementById('timer-status'),
    taskForm: document.getElementById('task-form'),
    taskInput: document.getElementById('task-input'),
    taskError: document.getElementById('task-error'),
    taskList: document.getElementById('task-list'),
    taskEmpty: document.getElementById('task-empty'),
    taskCount: document.getElementById('task-count'),
    linkForm: document.getElementById('link-form'),
    linkName: document.getElementById('link-name'),
    linkUrl: document.getElementById('link-url'),
    linkError: document.getElementById('link-error'),
    linkList: document.getElementById('link-list')
  };

  /* ---------- Light / dark mode ---------- */

  function applyTheme(theme) {
    el.root.setAttribute('data-theme', theme);
    var isDark = theme === 'dark';
    el.themeToggle.textContent = isDark ? 'Light mode' : 'Dark mode';
    el.themeToggle.setAttribute('aria-pressed', String(isDark));
  }

  function initTheme() {
    var stored = load(KEYS.theme, null);
    var prefersDark = window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(stored || (prefersDark ? 'dark' : 'light'));
  }

  el.themeToggle.addEventListener('click', function () {
    var next = el.root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    save(KEYS.theme, next);
  });

  /* ---------- Clock and greeting ---------- */

  var userName = '';

  function greetingForHour(hour) {
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 18) return 'Good afternoon';
    if (hour >= 18 && hour < 22) return 'Good evening';
    return 'Good night';
  }

  function renderGreeting(hour) {
    var text = greetingForHour(hour);
    el.greeting.textContent = userName ? text + ', ' + userName : text;
  }

  function renderClock() {
    var now = new Date();
    el.clockMain.textContent = pad(now.getHours()) + ':' + pad(now.getMinutes());
    el.clockSeconds.textContent = ':' + pad(now.getSeconds());
    el.date.textContent = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    renderGreeting(now.getHours());
  }

  function initName() {
    var stored = load(KEYS.name, '');
    userName = typeof stored === 'string' ? stored : '';
    el.nameInput.value = userName;
  }

  el.nameForm.addEventListener('submit', function (event) {
    event.preventDefault();
    userName = el.nameInput.value.trim().replace(/\s+/g, ' ');
    el.nameInput.value = userName;
    save(KEYS.name, userName);
    renderGreeting(new Date().getHours());
  });

  /* ---------- Focus timer ---------- */

  var remaining = FOCUS_SECONDS;
  var endTime = 0;
  var timerId = null;

  function formatTime(totalSeconds) {
    return pad(Math.floor(totalSeconds / 60)) + ':' + pad(totalSeconds % 60);
  }

  function renderTimer() {
    var text = formatTime(remaining);
    el.timerDisplay.textContent = text;
    document.title = timerId !== null ? text + ' - Focus' : 'Life Dashboard';
  }

  function setTimerButtons(running) {
    el.timerStart.disabled = running;
    el.timerStop.disabled = !running;
  }

  function syncRemaining() {
    remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
  }

  function stopTimer() {
    if (timerId === null) return;
    syncRemaining();
    clearInterval(timerId);
    timerId = null;
    setTimerButtons(false);
    renderTimer();
  }

  function tick() {
    syncRemaining();
    if (remaining === 0) {
      clearInterval(timerId);
      timerId = null;
      setTimerButtons(false);
      el.timerStatus.textContent = 'Session complete. Take a short break.';
    }
    renderTimer();
  }

  function startTimer() {
    if (timerId !== null) return;
    if (remaining === 0) remaining = FOCUS_SECONDS;
    endTime = Date.now() + remaining * 1000;
    timerId = setInterval(tick, 250);
    setTimerButtons(true);
    el.timerStatus.textContent = 'Stay with one thing until the timer ends.';
    renderTimer();
  }

  function resetTimer() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
    remaining = FOCUS_SECONDS;
    setTimerButtons(false);
    el.timerStatus.textContent = '25 minutes of focus. Ready when you are.';
    renderTimer();
  }

  el.timerStart.addEventListener('click', startTimer);
  el.timerStop.addEventListener('click', function () {
    stopTimer();
    el.timerStatus.textContent = 'Paused. Press Start to continue.';
  });
  el.timerReset.addEventListener('click', resetTimer);

  /* ---------- Tasks ---------- */

  var tasks = [];
  var editingId = null;

  function loadTasks() {
    var stored = load(KEYS.tasks, []);
    if (!Array.isArray(stored)) return [];
    return stored.filter(function (t) {
      return t && typeof t.id === 'string' && typeof t.text === 'string';
    }).map(function (t) {
      return { id: t.id, text: t.text, done: Boolean(t.done) };
    });
  }

  function normalizeText(text) {
    return text.trim().replace(/\s+/g, ' ');
  }

  function isDuplicate(text, ignoreId) {
    var key = normalizeText(text).toLowerCase();
    return tasks.some(function (t) {
      return t.id !== ignoreId && normalizeText(t.text).toLowerCase() === key;
    });
  }

  function persistTasks() {
    save(KEYS.tasks, tasks);
  }

  function button(label, className, onClick) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = className;
    b.textContent = label;
    b.addEventListener('click', onClick);
    return b;
  }

  function buildTaskItem(task) {
    var li = document.createElement('li');
    li.className = 'task-item' + (task.done ? ' is-done' : '');

    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', 'Mark "' + task.text + '" as done');
    checkbox.addEventListener('change', function () {
      task.done = checkbox.checked;
      persistTasks();
      renderTasks();
    });
    li.appendChild(checkbox);

    if (editingId === task.id) {
      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'task-edit';
      input.maxLength = 120;
      input.value = task.text;
      input.setAttribute('aria-label', 'Edit task');
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          commitEdit(task, input.value);
        } else if (event.key === 'Escape') {
          cancelEdit();
        }
      });
      li.appendChild(input);

      var actions = document.createElement('div');
      actions.className = 'task-actions';
      actions.appendChild(button('Save', 'btn btn-small', function () {
        commitEdit(task, input.value);
      }));
      actions.appendChild(button('Cancel', 'btn btn-small', cancelEdit));
      li.appendChild(actions);
    } else {
      var text = document.createElement('span');
      text.className = 'task-text';
      text.textContent = task.text;
      li.appendChild(text);

      var controls = document.createElement('div');
      controls.className = 'task-actions';
      controls.appendChild(button('Edit', 'btn btn-small', function () {
        editingId = task.id;
        el.taskError.textContent = '';
        renderTasks();
      }));
      controls.appendChild(button('Delete', 'btn btn-small danger', function () {
        tasks = tasks.filter(function (t) { return t.id !== task.id; });
        persistTasks();
        renderTasks();
      }));
      li.appendChild(controls);
    }

    return li;
  }

  function renderTasks() {
    el.taskList.textContent = '';
    tasks.forEach(function (task) {
      el.taskList.appendChild(buildTaskItem(task));
    });

    var open = tasks.filter(function (t) { return !t.done; }).length;
    el.taskEmpty.hidden = tasks.length > 0;
    el.taskCount.textContent = tasks.length === 0
      ? ''
      : open + ' of ' + tasks.length + ' left';

    if (editingId !== null) {
      var field = el.taskList.querySelector('.task-edit');
      if (field) {
        field.focus();
        field.setSelectionRange(field.value.length, field.value.length);
      }
    }
  }

  function commitEdit(task, value) {
    var text = normalizeText(value);
    if (!text) {
      el.taskError.textContent = 'A task cannot be empty. Type something or press Cancel.';
      return;
    }
    if (isDuplicate(text, task.id)) {
      el.taskError.textContent = 'You already have a task with that name.';
      return;
    }
    task.text = text;
    editingId = null;
    el.taskError.textContent = '';
    persistTasks();
    renderTasks();
  }

  function cancelEdit() {
    editingId = null;
    el.taskError.textContent = '';
    renderTasks();
  }

  el.taskForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var text = normalizeText(el.taskInput.value);

    if (!text) {
      el.taskError.textContent = 'Type a task before adding it.';
      return;
    }
    if (isDuplicate(text, null)) {
      el.taskError.textContent = 'You already have a task with that name.';
      return;
    }

    tasks.push({ id: makeId(), text: text, done: false });
    persistTasks();
    el.taskInput.value = '';
    el.taskError.textContent = '';
    renderTasks();
    el.taskInput.focus();
  });

  /* ---------- Quick links ---------- */

  var links = [];

  function loadLinks() {
    var stored = load(KEYS.links, null);
    if (!Array.isArray(stored)) return DEFAULT_LINKS.slice();
    return stored.filter(function (l) {
      return l && typeof l.id === 'string' &&
        typeof l.name === 'string' && typeof l.url === 'string';
    });
  }

  function persistLinks() {
    save(KEYS.links, links);
  }

  /* Returns a safe http(s) address, or null when the input is not usable. */
  function normalizeUrl(raw) {
    var value = raw.trim();
    if (!value) return null;
    if (!/^https?:\/\//i.test(value)) value = 'https://' + value;
    try {
      var url = new URL(value);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
      if (url.hostname.indexOf('.') === -1) return null;
      return url.href;
    } catch (err) {
      return null;
    }
  }

  function renderLinks() {
    el.linkList.textContent = '';
    links.forEach(function (link) {
      var li = document.createElement('li');
      li.className = 'link-item';

      var anchor = document.createElement('a');
      anchor.href = link.url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.textContent = link.name;
      li.appendChild(anchor);

      var remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'link-remove';
      remove.textContent = '\u00d7';
      remove.setAttribute('aria-label', 'Remove ' + link.name);
      remove.addEventListener('click', function () {
        links = links.filter(function (l) { return l.id !== link.id; });
        persistLinks();
        renderLinks();
      });
      li.appendChild(remove);

      el.linkList.appendChild(li);
    });
  }

  el.linkForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var name = el.linkName.value.trim();
    var url = normalizeUrl(el.linkUrl.value);

    if (!name) {
      el.linkError.textContent = 'Give the link a name.';
      return;
    }
    if (!url) {
      el.linkError.textContent = 'Enter a valid address, for example example.com.';
      return;
    }

    links.push({ id: makeId(), name: name, url: url });
    persistLinks();
    el.linkName.value = '';
    el.linkUrl.value = '';
    el.linkError.textContent = '';
    renderLinks();
    el.linkName.focus();
  });

  /* ---------- Startup ---------- */

  function init() {
    initTheme();
    initName();
    renderClock();
    setInterval(renderClock, 1000);

    renderTimer();

    tasks = loadTasks();
    renderTasks();

    links = loadLinks();
    renderLinks();
  }

  init();
})();
