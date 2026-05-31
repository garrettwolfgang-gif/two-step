const seedMatches = [
  { name: "Avery M.", email: "avery@example.com", age: 14, gender: "nonbinary", location: "A", color: "sage" },
  { name: "Riley T.", email: "riley@example.com", age: 17, gender: "women", location: "B", color: "gold" },
  { name: "Jordan P.", email: "jordan@example.com", age: 16, gender: "men", location: "A", color: "blue" },
  { name: "Sam K.", email: "sam@example.com", age: 13, gender: "women", location: "C", color: "clay" }
];

const photoInput = document.querySelector("#profilePhoto");
const photoPreview = document.querySelector("#photoPreview");
const summaryPhoto = document.querySelector("#summaryPhoto");
const defaultPhoto = "assets/default-cowboy-profile.png";
const displayName = document.querySelector("#displayName");
const trialLocation = document.querySelector("#trialLocation");
const userAge = document.querySelector("#userAge");
const userGender = document.querySelector("#userGender");
const minAge = document.querySelector("#minAge");
const maxAge = document.querySelector("#maxAge");
const genderPreference = document.querySelector("#genderPreference");
const searchInput = document.querySelector("#searchInput");
const locationFilter = document.querySelector("#locationFilter");
const authShell = document.querySelector("#authShell");
const appShell = document.querySelector("#appShell");
const authMessage = document.querySelector("#authMessage");
const signupForm = document.querySelector("#signupForm");
const signinForm = document.querySelector("#signinForm");
const signupName = document.querySelector("#signupName");
const signupEmail = document.querySelector("#signupEmail");
const signupPassword = document.querySelector("#signupPassword");
const signinEmail = document.querySelector("#signinEmail");
const signinPassword = document.querySelector("#signinPassword");
const sessionBadge = document.querySelector("#sessionBadge");
const signOutButton = document.querySelector("#signOutButton");
const seedUsersButton = document.querySelector("#seedUsersButton");
const resetUsersButton = document.querySelector("#resetUsersButton");
const testerList = document.querySelector("#testerList");
const invitesPanel = document.querySelector("#invitesPanel");
const dmPanel = document.querySelector("#dmPanel");
const inviteBadge = document.querySelector("#inviteBadge");

const usersKey = "twoStepTrialUsers";
const sessionKey = "twoStepCurrentUser";
const invitesKey = "twoStepDanceInvites";
const messagesKey = "twoStepMessages";
const demoMode = new URLSearchParams(window.location.search).get("demo") === "1";
let currentUser = null;
let deckIndex = 0;
const passedEmails = new Set();
let activeDmEmail = "";

const demoUsers = [
  {
    name: "Taylor",
    email: "taylor@test.local",
    password: "demo123",
    location: "A",
    minAge: 13,
    maxAge: 18,
    genderPreference: "any",
    age: 15,
    gender: "women",
    photo: ""
  },
  {
    name: "Morgan",
    email: "morgan@test.local",
    password: "demo123",
    location: "B",
    minAge: 15,
    maxAge: 18,
    genderPreference: "women",
    age: 17,
    gender: "men",
    photo: ""
  },
  {
    name: "Casey",
    email: "casey@test.local",
    password: "demo123",
    location: "C",
    minAge: 13,
    maxAge: 16,
    genderPreference: "nonbinary",
    age: 14,
    gender: "nonbinary",
    photo: ""
  }
];

const genderLabels = {
  any: "All genders",
  women: "Women",
  men: "Men",
  nonbinary: "Non-binary",
  female: "Female",
  male: "Male"
};

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getUsers() {
  return JSON.parse(localStorage.getItem(usersKey) || "[]");
}

function saveUsers(users) {
  localStorage.setItem(usersKey, JSON.stringify(users));
}

function saveCurrentUser(user) {
  currentUser = user;
  localStorage.setItem(sessionKey, user.email);
}

function getInvites() {
  return JSON.parse(localStorage.getItem(invitesKey) || "[]");
}

function saveInvites(invites) {
  localStorage.setItem(invitesKey, JSON.stringify(invites));
}

function getMessages() {
  return JSON.parse(localStorage.getItem(messagesKey) || "[]");
}

function saveMessages(messages) {
  localStorage.setItem(messagesKey, JSON.stringify(messages));
}

function unreadDmMessages() {
  if (!currentUser) return [];

  return getMessages().filter((message) => message.toEmail === currentUser.email && !message.read);
}

function updateNotificationBadge() {
  if (!currentUser) {
    inviteBadge.classList.add("is-hidden");
    inviteBadge.textContent = "0";
    return;
  }

  const unreadCount = unreadDmMessages().length;
  inviteBadge.textContent = String(unreadCount);
  inviteBadge.classList.toggle("is-hidden", unreadCount === 0);
}

function markDmRead(otherEmail) {
  if (!currentUser) return;

  const key = pairKey(currentUser.email, otherEmail);
  const messages = getMessages();
  let changed = false;

  messages.forEach((message) => {
    if (message.pair === key && message.toEmail === currentUser.email && !message.read) {
      message.read = true;
      changed = true;
    }
  });

  if (changed) saveMessages(messages);
}

function allPeople() {
  return [...seedMatches, ...getUsers()];
}

function personByEmail(email) {
  return allPeople().find((person) => person.email === email) || { name: email, email };
}

function pairKey(emailA, emailB) {
  return [emailA, emailB].sort().join("::");
}

function upsertDemoUsers() {
  const users = getUsers();
  demoUsers.forEach((demoUser) => {
    const index = users.findIndex((user) => user.email === demoUser.email);
    if (index === -1) {
      users.push(demoUser);
    } else {
      users[index] = { ...users[index], ...demoUser };
    }
  });
  saveUsers(users);
}

function normalizedAgeRange() {
  const min = Number(minAge.value);
  const max = Number(maxAge.value);

  return min <= max ? { min, max } : { min: max, max: min };
}

function searchableText(item) {
  return [
    item.name,
    `Location ${item.location}`,
    item.age,
    genderLabels[item.gender] || "All genders",
    ...(item.tags || [])
  ]
    .join(" ")
    .toLowerCase();
}

function genderPreferenceCategory(gender) {
  if (gender === "female") return "women";
  if (gender === "male") return "men";
  return gender;
}

function allMatches() {
  const signedUpUsers = getUsers()
    .filter((user) => !currentUser || user.email !== currentUser.email)
    .map((user) => ({
      name: user.name,
      email: user.email,
      age: user.age || user.minAge || 15,
      gender: user.gender || "any",
      location: user.location || "A",
      color: "clay",
      photo: user.photo || ""
    }));

  return [...seedMatches, ...signedUpUsers];
}

function matchesSearch(item) {
  const query = searchInput.value.trim().toLowerCase();
  const selectedLocation = locationFilter.value;

  return (selectedLocation === "any" || item.location === selectedLocation) && searchableText(item).includes(query);
}

function matchesPreferences(match) {
  const ages = normalizedAgeRange();
  const ageMatch = match.age >= ages.min && match.age <= ages.max;
  const genderMatch = genderPreference.value === "any" || match.gender === "any" || genderPreferenceCategory(match.gender) === genderPreference.value;

  return ageMatch && genderMatch;
}

function currentDeck() {
  return allMatches().filter((match) => matchesSearch(match) && matchesPreferences(match) && !passedEmails.has(match.email));
}

function resetDeckPosition() {
  deckIndex = 0;
}

function renderMatches() {
  const panel = document.querySelector("#matchesPanel");
  const visible = currentDeck();
  const match = visible[deckIndex];

  if (!match) {
    panel.innerHTML = `
      <article class="swipe-card empty-card">
        <h3>No more dancers in this deck.</h3>
        <p class="meta">Try changing filters or reset passed dancers.</p>
        <button class="primary-button" type="button" id="resetDeckButton">Reset passed dancers</button>
      </article>
    `;
    document.querySelector("#resetDeckButton").addEventListener("click", () => {
      passedEmails.clear();
      resetDeckPosition();
      renderMatches();
    });
    return;
  }

  panel.innerHTML = `
    <article class="swipe-card">
      <div class="swipe-photo ${match.color}">
        ${match.photo ? `<img src="${match.photo}" alt="">` : `<span>${initials(match.name)}</span>`}
      </div>
      <div class="swipe-details">
        <div>
          <h3>${match.name}</h3>
          <p class="meta">Age ${match.age} · ${genderLabels[match.gender] || "All genders"} · Location ${match.location}</p>
        </div>
        <p class="deck-count">${deckIndex + 1} of ${visible.length}</p>
      </div>
      <div class="swipe-actions">
        <button class="pass-button" type="button" id="passButton">Pass</button>
        <button class="primary-button invite-button" type="button" data-invite-email="${match.email}" data-invite-name="${match.name}">Invite to dance</button>
      </div>
    </article>
  `;

  document.querySelector("#passButton").addEventListener("click", () => {
    passedEmails.add(match.email);
    if (deckIndex >= currentDeck().length) deckIndex = 0;
    renderMatches();
  });
  panel.querySelector(".invite-button").addEventListener("click", (event) => {
    passedEmails.add(match.email);
    sendInvite(event.currentTarget.dataset.inviteEmail, event.currentTarget.dataset.inviteName);
  });
}

function renderTesterList() {
  const users = getUsers();

  testerList.innerHTML = users.map((user) => `
    <article class="tester-card">
      <div class="result-top">
        <span class="avatar clay">${initials(user.name)}</span>
        <div>
          <h3>${user.name}</h3>
          <p class="meta">${user.email} · Age ${user.age || user.minAge || 15} · Location ${user.location || "A"}</p>
        </div>
      </div>
      <button class="primary-button" type="button" data-switch-user="${user.email}">${currentUser && currentUser.email === user.email ? "Current user" : "Switch to user"}</button>
    </article>
  `).join("") || `<article class="tester-card"><h3>No trial users yet.</h3><p class="meta">Add demo users or create an account first.</p></article>`;

  testerList.querySelectorAll("[data-switch-user]").forEach((button) => {
    button.addEventListener("click", () => switchToUser(button.dataset.switchUser));
  });
}

function emptyState(message) {
  return `<article class="result-card"><h3>${message}</h3><p class="meta">Try widening the age range or clearing search.</p></article>`;
}

function sendInvite(toEmail, toName) {
  if (!currentUser) return;

  const invites = getInvites();
  const alreadySent = invites.some((invite) => invite.fromEmail === currentUser.email && invite.toEmail === toEmail);

  if (!alreadySent) {
    invites.push({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      fromEmail: currentUser.email,
      fromName: currentUser.name,
      toEmail,
      toName,
      createdAt: new Date().toLocaleString()
    });
    saveInvites(invites);
  }

  renderInvites();
  setPage("invites");
}

function inviteCard(invite, type) {
  const title = type === "received" ? `${invite.fromName} invited you to dance.` : `Invite sent to ${invite.toName}.`;
  const meta = type === "received" ? `From ${invite.fromEmail} · ${invite.createdAt}` : `To ${invite.toEmail} · ${invite.createdAt}`;
  const alreadyInvitedBack = type === "received" && getInvites().some((candidate) => candidate.fromEmail === currentUser.email && candidate.toEmail === invite.fromEmail);

  return `
    <article class="tester-card">
      <div>
        <h3>${title}</h3>
        <p class="meta">${meta}</p>
      </div>
      <div class="tag-row">
        <span class="tag">${type === "received" ? "Received" : "Sent"}</span>
        <span class="tag">Dance invite</span>
      </div>
      ${type === "received" ? `<button class="primary-button invite-back-button" type="button" data-invite-email="${invite.fromEmail}" data-invite-name="${invite.fromName}">${alreadyInvitedBack ? "Invited back" : "Invite back"}</button>` : ""}
    </article>
  `;
}

function mutualMatches() {
  if (!currentUser) return [];

  const invites = getInvites();
  const currentEmail = currentUser.email;
  const matchedEmails = new Set();

  invites.forEach((invite) => {
    const otherEmail = invite.fromEmail === currentEmail ? invite.toEmail : invite.toEmail === currentEmail ? invite.fromEmail : "";
    if (!otherEmail) return;

    const reverseInvite = invites.some((candidate) => candidate.fromEmail === otherEmail && candidate.toEmail === currentEmail);
    const forwardInvite = invites.some((candidate) => candidate.fromEmail === currentEmail && candidate.toEmail === otherEmail);
    if (reverseInvite && forwardInvite) matchedEmails.add(otherEmail);
  });

  return [...matchedEmails].map((email) => personByEmail(email));
}

function renderInvites() {
  if (!currentUser) {
    invitesPanel.innerHTML = `<article class="tester-card"><h3>Sign in to test invites.</h3></article>`;
    dmPanel.classList.add("is-hidden");
    updateNotificationBadge();
    return;
  }

  const invites = getInvites();
  const received = invites.filter((invite) => invite.toEmail === currentUser.email);
  const sent = invites.filter((invite) => invite.fromEmail === currentUser.email);
  const matches = mutualMatches();
  const unread = unreadDmMessages();

  invitesPanel.innerHTML = `
    <div class="invite-section">
      <h3>DM notifications</h3>
      ${unread.map((message) => `
        <article class="tester-card notification-card">
          <div>
            <h3>New DM from ${message.fromName}.</h3>
            <p class="meta">${message.text} · ${message.createdAt}</p>
          </div>
          <button class="primary-button dm-notification-button" type="button" data-dm-email="${message.fromEmail}">Open DM</button>
        </article>
      `).join("") || `<article class="tester-card"><p class="meta">No new DM notifications.</p></article>`}
    </div>
    <div class="invite-section">
      <h3>Matched</h3>
      ${matches.map((match) => `
        <article class="tester-card">
          <div class="result-top">
            <span class="avatar ${match.color || "clay"}">${initials(match.name)}</span>
            <div>
              <h3>You matched with ${match.name}.</h3>
              <p class="meta">Both of you invited each other to dance.</p>
            </div>
          </div>
          <button class="primary-button dm-open-button" type="button" data-dm-email="${match.email}">Open DM</button>
        </article>
      `).join("") || `<article class="tester-card"><p class="meta">No mutual matches yet. To test one, invite a demo user, switch to that user, and invite back.</p></article>`}
    </div>
    <div class="invite-section">
      <h3>Received</h3>
      ${received.map((invite) => inviteCard(invite, "received")).join("") || `<article class="tester-card"><p class="meta">No received invites yet. Switch to another user, send this account an invite, then come back.</p></article>`}
    </div>
    <div class="invite-section">
      <h3>Sent</h3>
      ${sent.map((invite) => inviteCard(invite, "sent")).join("") || `<article class="tester-card"><p class="meta">No sent invites yet. Go to Dance and tap Invite to dance.</p></article>`}
    </div>
  `;

  invitesPanel.querySelectorAll(".dm-open-button").forEach((button) => {
    button.addEventListener("click", () => openDm(button.dataset.dmEmail));
  });
  invitesPanel.querySelectorAll(".dm-notification-button").forEach((button) => {
    button.addEventListener("click", () => openDm(button.dataset.dmEmail));
  });
  invitesPanel.querySelectorAll(".invite-back-button").forEach((button) => {
    button.addEventListener("click", () => sendInvite(button.dataset.inviteEmail, button.dataset.inviteName));
  });

  if (activeDmEmail && matches.some((match) => match.email === activeDmEmail)) {
    renderDm();
  } else {
    activeDmEmail = "";
    dmPanel.classList.add("is-hidden");
  }

  updateNotificationBadge();
}

function renderDm() {
  if (!currentUser || !activeDmEmail) return;

  markDmRead(activeDmEmail);
  const otherPerson = personByEmail(activeDmEmail);
  const key = pairKey(currentUser.email, activeDmEmail);
  const thread = getMessages().filter((message) => message.pair === key);
  updateNotificationBadge();

  dmPanel.classList.remove("is-hidden");
  dmPanel.innerHTML = `
    <div class="dm-heading">
      <div>
        <p class="eyebrow">DM</p>
        <h3>${otherPerson.name}</h3>
      </div>
      <button class="ghost-button bordered-button" type="button" id="closeDmButton">Close</button>
    </div>
    <div class="message-list">
      ${thread.map((message) => `
        <div class="message-bubble ${message.fromEmail === currentUser.email ? "is-mine" : ""}">
          <strong>${message.fromName}</strong>
          <p>${message.text}</p>
          <span>${message.createdAt}</span>
        </div>
      `).join("") || `<p class="meta">No messages yet. Say hi and plan the dance.</p>`}
    </div>
    <form class="dm-form" id="dmForm">
      <input id="dmInput" type="text" maxlength="160" placeholder="Type a message">
      <button class="primary-button" type="submit">Send</button>
    </form>
  `;

  document.querySelector("#closeDmButton").addEventListener("click", () => {
    activeDmEmail = "";
    dmPanel.classList.add("is-hidden");
  });

  document.querySelector("#dmForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.querySelector("#dmInput");
    const text = input.value.trim();
    if (!text) return;

    const messages = getMessages();
    messages.push({
      pair: key,
      fromEmail: currentUser.email,
      fromName: currentUser.name,
      toEmail: activeDmEmail,
      text,
      createdAt: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      read: false
    });
    saveMessages(messages);
    input.value = "";
    renderDm();
  });
}

function openDm(email) {
  activeDmEmail = email;
  renderInvites();
}

function setPage(page) {
  if (!demoMode && (page === "testers" || page === "safety")) page = "profile";

  document.querySelectorAll(".page-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.pageTarget === page);
  });

  document.querySelectorAll(".app-page").forEach((section) => {
    section.classList.toggle("is-hidden", section.dataset.page !== page);
  });
}

function setupDemoMode() {
  document.querySelectorAll("[data-demo-only]").forEach((element) => {
    element.hidden = !demoMode;
  });
}

function updateSummary() {
  const ages = normalizedAgeRange();
  document.querySelector("#summaryName").textContent = displayName.value || "New dancer";
  document.querySelector("#summaryMeta").textContent = `Age ${userAge.value} · ${genderLabels[userGender.value]} · Looking for ${ages.min}-${ages.max} · ${genderLabels[genderPreference.value]} · Location ${trialLocation.value}`;
}

function showAuth(mode) {
  document.querySelectorAll(".auth-tab").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.authMode === mode);
  });
  signupForm.classList.toggle("is-hidden", mode !== "signup");
  signinForm.classList.toggle("is-hidden", mode !== "signin");
  authMessage.textContent = "";
}

function showApp() {
  authShell.classList.add("is-hidden");
  appShell.classList.remove("is-hidden");
  sessionBadge.textContent = currentUser ? currentUser.name : "Teen beta";
  renderTesterList();
  renderInvites();
}

function showLoggedOut() {
  appShell.classList.add("is-hidden");
  authShell.classList.remove("is-hidden");
  updateNotificationBadge();
  showAuth("signup");
}

function syncProfileFromUser(user) {
  displayName.value = user.name || "New dancer";
  trialLocation.value = user.location || "A";
  userAge.value = String(user.age || 13);
  userGender.value = user.gender === "women" ? "female" : user.gender === "men" ? "male" : user.gender === "any" ? "female" : user.gender || "female";
  minAge.value = String(user.minAge || 13);
  maxAge.value = String(user.maxAge || 18);
  genderPreference.value = user.genderPreference || "any";
  photoPreview.src = user.photo || defaultPhoto;
  summaryPhoto.src = user.photo || defaultPhoto;
}

function persistCurrentProfile() {
  if (!currentUser) return;

  const users = getUsers();
  const index = users.findIndex((user) => user.email === currentUser.email);
  if (index === -1) return;

  const ages = normalizedAgeRange();
  users[index] = {
    ...users[index],
    name: displayName.value || "New dancer",
    location: trialLocation.value,
    minAge: ages.min,
    maxAge: ages.max,
    genderPreference: genderPreference.value,
    age: Number(userAge.value),
    gender: userGender.value,
    photo: photoPreview.src.includes(defaultPhoto) ? "" : photoPreview.src
  };
  saveUsers(users);
  saveCurrentUser(users[index]);
  sessionBadge.textContent = currentUser.name;
  renderTesterList();
}

function switchToUser(email) {
  const user = getUsers().find((candidate) => candidate.email === email);
  if (!user) return;

  saveCurrentUser(user);
  passedEmails.clear();
  resetDeckPosition();
  syncProfileFromUser(user);
  updateSummary();
  renderMatches();
  renderTesterList();
  renderInvites();
  showApp();
}

document.querySelectorAll("[data-page-target]").forEach((button) => {
  button.addEventListener("click", () => setPage(button.dataset.pageTarget));
});

document.querySelectorAll(".auth-tab").forEach((button) => {
  button.addEventListener("click", () => showAuth(button.dataset.authMode));
});

signupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = signupEmail.value.trim().toLowerCase();
  const password = signupPassword.value;
  const name = signupName.value.trim() || "New dancer";
  const users = getUsers();

  if (!email || !password) {
    authMessage.textContent = "Add an email and password.";
    return;
  }

  if (users.some((user) => user.email === email)) {
    authMessage.textContent = "That email already has an account. Try signing in.";
    return;
  }

  const user = {
    name,
    email,
    password,
    location: "A",
    minAge: 13,
    maxAge: 18,
    genderPreference: "any",
    age: 13,
    gender: "female",
    photo: ""
  };

  users.push(user);
  saveUsers(users);
  saveCurrentUser(user);
  syncProfileFromUser(user);
  updateSummary();
  renderMatches();
  renderTesterList();
  renderInvites();
  showApp();
});

signinForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = signinEmail.value.trim().toLowerCase();
  const password = signinPassword.value;
  const user = getUsers().find((candidate) => candidate.email === email && candidate.password === password);

  if (!user) {
    authMessage.textContent = "No matching account found.";
    return;
  }

  saveCurrentUser(user);
  syncProfileFromUser(user);
  updateSummary();
  renderMatches();
  renderTesterList();
  renderInvites();
  showApp();
});

signOutButton.addEventListener("click", () => {
  currentUser = null;
  localStorage.removeItem(sessionKey);
  showLoggedOut();
});

seedUsersButton.addEventListener("click", () => {
  upsertDemoUsers();
  if (!currentUser) {
    switchToUser(demoUsers[0].email);
  }
  resetDeckPosition();
  renderMatches();
  renderTesterList();
});

resetUsersButton.addEventListener("click", () => {
  saveUsers([]);
  saveInvites([]);
  saveMessages([]);
  currentUser = null;
  activeDmEmail = "";
  localStorage.removeItem(sessionKey);
  photoPreview.src = defaultPhoto;
  summaryPhoto.src = defaultPhoto;
  renderMatches();
  renderTesterList();
  renderInvites();
  showLoggedOut();
});

[searchInput, locationFilter].forEach((control) => {
  control.addEventListener("input", () => {
    resetDeckPosition();
    renderMatches();
  });
});

[displayName, trialLocation, userAge, userGender, minAge, maxAge, genderPreference].forEach((control) => {
  control.addEventListener("input", () => {
    persistCurrentProfile();
    updateSummary();
    resetDeckPosition();
    renderMatches();
    renderInvites();
  });
});

photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    photoPreview.src = reader.result;
    summaryPhoto.src = reader.result;
    persistCurrentProfile();
    renderMatches();
    renderInvites();
  });
  reader.readAsDataURL(file);
});

document.querySelector("#removePhoto").addEventListener("click", () => {
  photoInput.value = "";
  photoPreview.src = defaultPhoto;
  summaryPhoto.src = defaultPhoto;
  persistCurrentProfile();
  renderMatches();
  renderInvites();
});

setupDemoMode();
renderMatches();
updateSummary();
renderTesterList();
renderInvites();

const savedSessionEmail = localStorage.getItem(sessionKey);
const savedUser = getUsers().find((user) => user.email === savedSessionEmail);
if (savedUser) {
  saveCurrentUser(savedUser);
  syncProfileFromUser(savedUser);
  updateSummary();
  renderMatches();
  renderInvites();
  showApp();
} else {
  showLoggedOut();
}
