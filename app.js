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
const createPairButton = document.querySelector("#createPairButton");
const checkinAllButton = document.querySelector("#checkinAllButton");
const seedUsersButton = document.querySelector("#seedUsersButton");
const resetUsersButton = document.querySelector("#resetUsersButton");
const testerList = document.querySelector("#testerList");
const invitesPanel = document.querySelector("#invitesPanel");
const dmPanel = document.querySelector("#dmPanel");
const inviteBadge = document.querySelector("#inviteBadge");
const checkinForm = document.querySelector("#checkinForm");
const eventSelect = document.querySelector("#eventSelect");
const guardianConsent = document.querySelector("#guardianConsent");
const conductAgree = document.querySelector("#conductAgree");
const schoolEligibility = document.querySelector("#schoolEligibility");
const checkoutButton = document.querySelector("#checkoutButton");
const checkinStatus = document.querySelector("#checkinStatus");

const usersKey = "twoStepTrialUsers";
const sessionKey = "twoStepCurrentUser";
const invitesKey = "twoStepDanceInvites";
const messagesKey = "twoStepMessages";
const checkinsKey = "twoStepEventCheckins";
const reportsKey = "twoStepReports";
const blocksKey = "twoStepBlocks";
const urlParams = new URLSearchParams(window.location.search);
const demoMode = urlParams.get("demo") === "1";
const demoUserEmail = demoMode ? urlParams.get("user") : "";
const supabaseConfig = window.TWO_STEP_SUPABASE || {};
const supabaseClient = window.supabase && supabaseConfig.url && supabaseConfig.anonKey
  ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey)
  : null;
const reportReasons = [
  "Harassment or bullying",
  "Unsafe behavior",
  "Pressure to meet or dance",
  "Inappropriate messages",
  "Fake profile",
  "Underage or school ID concern",
  "Spam or scam",
  "Other"
];
let currentUser = null;
let deckIndex = 0;
const passedEmails = new Set();
let activeDmEmail = "";
let reportPanelOpen = false;
let lastSyncSignature = "";
let remoteSyncStarted = false;
let remoteWritePaused = false;

const trialEvents = [
  { id: "anytime-trial", name: "Anytime Trial Check-In", location: "A", active: true, time: "Open any time for beta testing" },
  { id: "location-a-friday", name: "Location A Friday Dance", location: "A", active: true, time: "Tonight 7:00-10:00 PM" },
  { id: "location-b-saturday", name: "Location B Saturday Dance", location: "B", active: true, time: "Saturday 6:30-9:30 PM" },
  { id: "location-c-closed", name: "Location C Practice", location: "C", active: false, time: "Closed for trial" }
];

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

const betaTestUsers = [
  {
    name: "Test Dancer A",
    email: "test-a@twostep.local",
    password: "demo123",
    location: "A",
    minAge: 13,
    maxAge: 18,
    genderPreference: "any",
    age: 15,
    gender: "female",
    photo: ""
  },
  {
    name: "Test Dancer B",
    email: "test-b@twostep.local",
    password: "demo123",
    location: "A",
    minAge: 13,
    maxAge: 18,
    genderPreference: "any",
    age: 16,
    gender: "male",
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
  pushProfilesToSupabase(users);
}

function saveCurrentUser(user) {
  currentUser = user;
  sessionStorage.setItem(sessionKey, user.email);
  localStorage.removeItem(sessionKey);
}

function clearCurrentSession() {
  currentUser = null;
  sessionStorage.removeItem(sessionKey);
  localStorage.removeItem(sessionKey);
}

function getInvites() {
  return JSON.parse(localStorage.getItem(invitesKey) || "[]");
}

function saveInvites(invites) {
  localStorage.setItem(invitesKey, JSON.stringify(invites));
  pushInvitesToSupabase(invites);
}

function getMessages() {
  return JSON.parse(localStorage.getItem(messagesKey) || "[]");
}

function saveMessages(messages) {
  const normalized = messages.map((message) => ({
    ...message,
    id: message.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }));
  localStorage.setItem(messagesKey, JSON.stringify(normalized));
  pushMessagesToSupabase(normalized);
}

function getCheckins() {
  return JSON.parse(localStorage.getItem(checkinsKey) || "[]");
}

function saveCheckins(checkins) {
  localStorage.setItem(checkinsKey, JSON.stringify(checkins));
  pushCheckinsToSupabase(checkins);
}

function getReports() {
  return JSON.parse(localStorage.getItem(reportsKey) || "[]");
}

function saveReports(reports) {
  localStorage.setItem(reportsKey, JSON.stringify(reports));
  pushReportsToSupabase(reports);
}

function getBlocks() {
  return JSON.parse(localStorage.getItem(blocksKey) || "[]");
}

function saveBlocks(blocks) {
  localStorage.setItem(blocksKey, JSON.stringify(blocks));
  pushBlocksToSupabase(blocks);
}

function isBlocked(email) {
  if (!currentUser) return false;

  return getBlocks().some((block) =>
    (block.blockerEmail === currentUser.email && block.blockedEmail === email) ||
    (block.blockerEmail === email && block.blockedEmail === currentUser.email)
  );
}

function profileToRow(user) {
  return {
    email: user.email,
    name: user.name || "New dancer",
    password: user.password || "",
    location: user.location || "A",
    min_age: user.minAge || 13,
    max_age: user.maxAge || 18,
    gender_preference: user.genderPreference || "any",
    age: user.age || 13,
    gender: user.gender || "female",
    photo: user.photo || "",
    updated_at: new Date().toISOString()
  };
}

function profileFromRow(row) {
  return {
    name: row.name,
    email: row.email,
    password: row.password || "",
    location: row.location || "A",
    minAge: row.min_age || 13,
    maxAge: row.max_age || 18,
    genderPreference: row.gender_preference || "any",
    age: row.age || 13,
    gender: row.gender || "female",
    photo: row.photo || ""
  };
}

function checkinToRow(checkin) {
  return {
    email: checkin.email,
    name: checkin.name,
    event_id: checkin.eventId,
    checked_in_at: checkin.checkedInAt,
    safety: checkin.safety || {},
    updated_at: new Date().toISOString()
  };
}

function checkinFromRow(row) {
  return {
    email: row.email,
    name: row.name,
    eventId: row.event_id,
    checkedInAt: row.checked_in_at,
    safety: row.safety || {}
  };
}

function inviteToRow(invite) {
  return {
    id: invite.id,
    from_email: invite.fromEmail,
    from_name: invite.fromName,
    to_email: invite.toEmail,
    to_name: invite.toName,
    event_id: invite.eventId || "",
    event_name: invite.eventName || "",
    created_at_text: invite.createdAt || ""
  };
}

function inviteFromRow(row) {
  return {
    id: row.id,
    fromEmail: row.from_email,
    fromName: row.from_name,
    toEmail: row.to_email,
    toName: row.to_name,
    eventId: row.event_id || "",
    eventName: row.event_name || "",
    createdAt: row.created_at_text || ""
  };
}

function messageToRow(message) {
  return {
    id: message.id,
    pair: message.pair,
    event_id: message.eventId || "",
    event_name: message.eventName || "",
    from_email: message.fromEmail,
    from_name: message.fromName,
    to_email: message.toEmail,
    text: message.text,
    created_at_text: message.createdAt || "",
    read: Boolean(message.read)
  };
}

function messageFromRow(row) {
  return {
    id: row.id,
    pair: row.pair,
    eventId: row.event_id || "",
    eventName: row.event_name || "",
    fromEmail: row.from_email,
    fromName: row.from_name,
    toEmail: row.to_email,
    text: row.text,
    createdAt: row.created_at_text || "",
    read: Boolean(row.read)
  };
}

function reportToRow(report) {
  return {
    id: report.id,
    reporter_email: report.reporterEmail,
    reported_email: report.reportedEmail,
    reason: report.reason,
    notes: report.notes || ""
  };
}

function reportFromRow(row) {
  return {
    id: row.id,
    reporterEmail: row.reporter_email,
    reportedEmail: row.reported_email,
    reason: row.reason,
    notes: row.notes || ""
  };
}

function blockToRow(block) {
  return {
    blocker_email: block.blockerEmail,
    blocked_email: block.blockedEmail
  };
}

function blockFromRow(row) {
  return {
    blockerEmail: row.blocker_email,
    blockedEmail: row.blocked_email
  };
}

async function pushProfilesToSupabase(users) {
  if (!supabaseClient || remoteWritePaused || !users.length) return;
  await supabaseClient.from("two_step_profiles").upsert(users.map(profileToRow), { onConflict: "email" });
}

async function pushCheckinsToSupabase(checkins) {
  if (!supabaseClient || remoteWritePaused || !checkins.length) return;
  await supabaseClient.from("two_step_checkins").upsert(checkins.map(checkinToRow), { onConflict: "email" });
}

async function pushInvitesToSupabase(invites) {
  if (!supabaseClient || remoteWritePaused || !invites.length) return;
  await supabaseClient.from("two_step_invites").upsert(invites.map(inviteToRow), { onConflict: "id" });
}

async function pushMessagesToSupabase(messages) {
  if (!supabaseClient || remoteWritePaused || !messages.length) return;
  await supabaseClient.from("two_step_messages").upsert(messages.map(messageToRow), { onConflict: "id" });
}

async function pushReportsToSupabase(reports) {
  if (!supabaseClient || remoteWritePaused || !reports.length) return;
  await supabaseClient.from("two_step_reports").upsert(reports.map(reportToRow), { onConflict: "id" });
}

async function pushBlocksToSupabase(blocks) {
  if (!supabaseClient || remoteWritePaused || !blocks.length) return;
  await supabaseClient.from("two_step_blocks").upsert(blocks.map(blockToRow), { onConflict: "blocker_email,blocked_email" });
}

async function pullSupabaseState() {
  if (!supabaseClient) return false;

  const [profiles, checkins, invites, messages, reports, blocks] = await Promise.all([
    supabaseClient.from("two_step_profiles").select("*"),
    supabaseClient.from("two_step_checkins").select("*"),
    supabaseClient.from("two_step_invites").select("*"),
    supabaseClient.from("two_step_messages").select("*").order("created_at", { ascending: true }),
    supabaseClient.from("two_step_reports").select("*"),
    supabaseClient.from("two_step_blocks").select("*")
  ]);

  if (profiles.error || checkins.error || invites.error || messages.error || reports.error || blocks.error) return false;

  remoteWritePaused = true;
  if (profiles.data.length) localStorage.setItem(usersKey, JSON.stringify(profiles.data.map(profileFromRow)));
  if (checkins.data.length) localStorage.setItem(checkinsKey, JSON.stringify(checkins.data.map(checkinFromRow)));
  if (invites.data.length) localStorage.setItem(invitesKey, JSON.stringify(invites.data.map(inviteFromRow)));
  if (messages.data.length) localStorage.setItem(messagesKey, JSON.stringify(messages.data.map(messageFromRow)));
  if (reports.data.length) localStorage.setItem(reportsKey, JSON.stringify(reports.data.map(reportFromRow)));
  if (blocks.data.length) localStorage.setItem(blocksKey, JSON.stringify(blocks.data.map(blockFromRow)));
  remoteWritePaused = false;

  return true;
}

async function startSupabaseSync() {
  if (!supabaseClient || remoteSyncStarted) return;
  remoteSyncStarted = true;

  const pulled = await pullSupabaseState();
  if (pulled) {
    await Promise.all([
      pushProfilesToSupabase(getUsers()),
      pushCheckinsToSupabase(getCheckins()),
      pushInvitesToSupabase(getInvites()),
      pushMessagesToSupabase(getMessages()),
      pushReportsToSupabase(getReports()),
      pushBlocksToSupabase(getBlocks())
    ]);
    refreshSharedState();
    lastSyncSignature = syncSignature();
  }

  supabaseClient.channel("two-step-beta-sync")
    .on("postgres_changes", { event: "*", schema: "public", table: "two_step_profiles" }, () => syncSupabaseAndRefresh())
    .on("postgres_changes", { event: "*", schema: "public", table: "two_step_checkins" }, () => syncSupabaseAndRefresh())
    .on("postgres_changes", { event: "*", schema: "public", table: "two_step_invites" }, () => syncSupabaseAndRefresh())
    .on("postgres_changes", { event: "*", schema: "public", table: "two_step_messages" }, () => syncSupabaseAndRefresh())
    .on("postgres_changes", { event: "*", schema: "public", table: "two_step_reports" }, () => syncSupabaseAndRefresh())
    .on("postgres_changes", { event: "*", schema: "public", table: "two_step_blocks" }, () => syncSupabaseAndRefresh())
    .subscribe();

  setInterval(syncSupabaseAndRefresh, 4000);
}

async function syncSupabaseAndRefresh() {
  const pulled = await pullSupabaseState();
  if (!pulled) return;

  refreshSharedState();
  lastSyncSignature = syncSignature();
}

async function deleteSupabaseCheckin(email) {
  if (!supabaseClient || remoteWritePaused) return;
  await supabaseClient.from("two_step_checkins").delete().eq("email", email);
}

async function clearSupabaseBetaData() {
  if (!supabaseClient || remoteWritePaused) return;

  await Promise.all([
    supabaseClient.from("two_step_messages").delete().neq("id", ""),
    supabaseClient.from("two_step_invites").delete().neq("id", ""),
    supabaseClient.from("two_step_checkins").delete().neq("email", ""),
    supabaseClient.from("two_step_profiles").delete().neq("email", ""),
    supabaseClient.from("two_step_reports").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
    supabaseClient.from("two_step_blocks").delete().neq("blocker_email", "")
  ]);
}

function eventById(eventId) {
  return trialEvents.find((event) => event.id === eventId);
}

function activeCheckinFor(email) {
  const checkin = getCheckins().find((item) => item.email === email);
  if (!checkin) return null;

  const event = eventById(checkin.eventId);
  return event && event.active ? { ...checkin, event } : null;
}

function currentCheckin() {
  return currentUser ? activeCheckinFor(currentUser.email) : null;
}

function canInteractWith(email) {
  const mine = currentCheckin();
  const theirs = activeCheckinFor(email);
  return Boolean(mine && theirs && mine.eventId === theirs.eventId && !isBlocked(email));
}

function buildCheckin(user, eventId = "anytime-trial") {
  return {
    email: user.email,
    name: user.name,
    eventId,
    checkedInAt: new Date().toLocaleString(),
    safety: {
      guardian: true,
      conduct: true,
      schoolEligibility: true
    }
  };
}

function syncSignature() {
  return [
    localStorage.getItem(invitesKey) || "[]",
    localStorage.getItem(messagesKey) || "[]",
    localStorage.getItem(usersKey) || "[]",
    localStorage.getItem(checkinsKey) || "[]",
    localStorage.getItem(reportsKey) || "[]",
    localStorage.getItem(blocksKey) || "[]"
  ].join("|");
}

function refreshSharedState() {
  if (!currentUser) return;

  const updatedCurrentUser = getUsers().find((user) => user.email === currentUser.email);
  if (updatedCurrentUser) {
    currentUser = updatedCurrentUser;
    sessionBadge.textContent = currentUser.name;
  }

  renderMatches();
  renderTesterList();
  renderInvites();
  renderCheckin();
}

function syncSharedState(force = false) {
  const nextSignature = syncSignature();
  if (!force && nextSignature === lastSyncSignature) return;

  lastSyncSignature = nextSignature;
  refreshSharedState();
}

function unreadDmMessages() {
  if (!currentUser) return [];
  const checkin = currentCheckin();
  if (!checkin) return [];

  return getMessages().filter((message) => message.toEmail === currentUser.email && message.eventId === checkin.eventId && !message.read);
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
  upsertUsers(demoUsers);
}

function upsertUsers(nextUsers) {
  const users = getUsers();
  nextUsers.forEach((nextUser) => {
    const index = users.findIndex((user) => user.email === nextUser.email);
    if (index === -1) {
      users.push(nextUser);
    } else {
      users[index] = { ...users[index], ...nextUser };
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
  const checkin = currentCheckin();
  if (!checkin) return [];

  const signedUpUsers = getUsers()
    .filter((user) => !currentUser || user.email !== currentUser.email)
    .filter((user) => canInteractWith(user.email))
    .map((user) => ({
      name: user.name,
      email: user.email,
      age: user.age || user.minAge || 15,
      gender: user.gender || "any",
      location: user.location || "A",
      color: "clay",
      photo: user.photo || ""
    }));

  return signedUpUsers;
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
  const checkin = currentCheckin();

  if (!checkin) {
    panel.innerHTML = `
      <article class="swipe-card empty-card">
        <h3>Check in before dancing.</h3>
        <p class="meta">The Dance deck opens only during an active event check-in.</p>
        <button class="primary-button" type="button" id="goCheckinButton">Go to check in</button>
      </article>
    `;
    document.querySelector("#goCheckinButton").addEventListener("click", () => setPage("checkin"));
    return;
  }

  const visible = currentDeck();
  const match = visible[deckIndex];

  if (!match) {
    panel.innerHTML = `
      <article class="swipe-card empty-card">
        <h3>No more dancers in this deck.</h3>
        <p class="meta">Only dancers checked into ${checkin.event.name} appear here.</p>
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
      <div class="tester-actions inline-actions">
        <button class="primary-button" type="button" data-switch-user="${user.email}">${currentUser && currentUser.email === user.email ? "Current user" : "Switch to user"}</button>
        <a class="ghost-button bordered-button" href="?demo=1&user=${encodeURIComponent(user.email)}" target="_blank" rel="noopener">Open in new tab</a>
      </div>
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
  const checkin = currentCheckin();

  if (!checkin || !canInteractWith(toEmail)) {
    setPage("checkin");
    renderCheckin("Both dancers must be checked into the same active event before invites.");
    return;
  }

  const invites = getInvites();
  const alreadySent = invites.some((invite) => invite.fromEmail === currentUser.email && invite.toEmail === toEmail && invite.eventId === checkin.eventId);

  if (!alreadySent) {
    invites.push({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      fromEmail: currentUser.email,
      fromName: currentUser.name,
      toEmail,
      toName,
      eventId: checkin.eventId,
      eventName: checkin.event.name,
      createdAt: new Date().toLocaleString()
    });
    saveInvites(invites);
  }

  renderInvites();
  setPage("invites");
}

function inviteCard(invite, type) {
  const title = type === "received" ? `${invite.fromName} invited you to dance.` : `Invite sent to ${invite.toName}.`;
  const meta = type === "received" ? `From ${invite.fromEmail} · ${invite.eventName || "Trial event"} · ${invite.createdAt}` : `To ${invite.toEmail} · ${invite.eventName || "Trial event"} · ${invite.createdAt}`;
  const checkin = currentCheckin();
  const canInviteBack = type === "received" && checkin && invite.eventId === checkin.eventId && canInteractWith(invite.fromEmail);
  const alreadyInvitedBack = canInviteBack && getInvites().some((candidate) => candidate.fromEmail === currentUser.email && candidate.toEmail === invite.fromEmail && candidate.eventId === invite.eventId);

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
      ${type === "received" ? `<button class="primary-button invite-back-button" type="button" data-invite-email="${invite.fromEmail}" data-invite-name="${invite.fromName}" ${canInviteBack ? "" : "disabled"}>${alreadyInvitedBack ? "Invited back" : "Invite back"}</button>` : ""}
    </article>
  `;
}

function mutualMatches() {
  if (!currentUser) return [];

  const invites = getInvites();
  const currentEmail = currentUser.email;
  const checkin = currentCheckin();
  if (!checkin) return [];

  const matchedEmails = new Set();

  invites.forEach((invite) => {
    if (invite.eventId !== checkin.eventId) return;
    const otherEmail = invite.fromEmail === currentEmail ? invite.toEmail : invite.toEmail === currentEmail ? invite.fromEmail : "";
    if (!otherEmail) return;

    const reverseInvite = invites.some((candidate) => candidate.fromEmail === otherEmail && candidate.toEmail === currentEmail && candidate.eventId === checkin.eventId);
    const forwardInvite = invites.some((candidate) => candidate.fromEmail === currentEmail && candidate.toEmail === otherEmail && candidate.eventId === checkin.eventId);
    if (reverseInvite && forwardInvite && canInteractWith(otherEmail)) matchedEmails.add(otherEmail);
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

  const checkin = currentCheckin();
  if (!checkin) {
    invitesPanel.innerHTML = `
      <article class="tester-card">
        <h3>Check in to view event invites.</h3>
        <p class="meta">Dance invites, matches, and DMs are locked outside active event time.</p>
        <button class="primary-button" type="button" id="goInvitesCheckinButton">Go to check in</button>
      </article>
    `;
    dmPanel.classList.add("is-hidden");
    document.querySelector("#goInvitesCheckinButton").addEventListener("click", () => setPage("checkin"));
    updateNotificationBadge();
    return;
  }

  const invites = getInvites();
  const received = invites.filter((invite) => invite.toEmail === currentUser.email && invite.eventId === checkin.eventId);
  const sent = invites.filter((invite) => invite.fromEmail === currentUser.email && invite.eventId === checkin.eventId);
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
              <p class="meta">Both of you invited each other at ${checkin ? checkin.event.name : "this event"}.</p>
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
  const checkin = currentCheckin();
  const canSendDm = checkin && canInteractWith(activeDmEmail);

  markDmRead(activeDmEmail);
  const otherPerson = personByEmail(activeDmEmail);
  const key = pairKey(currentUser.email, activeDmEmail);
  const thread = getMessages().filter((message) => message.pair === key && (!message.eventId || (checkin && message.eventId === checkin.eventId)));
  updateNotificationBadge();

  dmPanel.classList.remove("is-hidden");
  dmPanel.innerHTML = `
    <div class="dm-heading">
      <div>
        <p class="eyebrow">DM</p>
        <h3>${otherPerson.name}</h3>
      </div>
      <div class="dm-tools">
        <button class="ghost-button bordered-button" type="button" id="reportDmButton">Report</button>
        <button class="ghost-button bordered-button" type="button" id="blockDmButton">Block</button>
        <button class="ghost-button bordered-button" type="button" id="closeDmButton">Close</button>
      </div>
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
    ${canSendDm ? "" : `<div class="notice"><strong>DM paused</strong><p>You both need to be checked into the same active event to send messages.</p></div>`}
    <form class="dm-form" id="dmForm">
      <input id="dmInput" type="text" maxlength="160" placeholder="Type a message">
      <button class="primary-button" type="submit" ${canSendDm ? "" : "disabled"}>Send</button>
    </form>
    ${reportPanelOpen ? `
      <form class="report-form" id="reportForm">
        <div>
          <p class="eyebrow">Report ${otherPerson.name}</p>
          <h3>What happened?</h3>
        </div>
        <label>
          Reason
          <select id="reportReason" required>
            <option value="" selected disabled>Choose a reason</option>
            ${reportReasons.map((reason) => `<option value="${reason}">${reason}</option>`).join("")}
          </select>
        </label>
        <label>
          Details
          <textarea id="reportDetails" maxlength="500" rows="4" placeholder="Write what happened. Include where, when, and anything that would help review it."></textarea>
        </label>
        <div class="report-actions">
          <button class="ghost-button bordered-button" type="button" id="cancelReportButton">Cancel</button>
          <button class="primary-button" type="submit">Submit report</button>
        </div>
      </form>
    ` : ""}
  `;

  document.querySelector("#closeDmButton").addEventListener("click", () => {
    activeDmEmail = "";
    dmPanel.classList.add("is-hidden");
  });

  document.querySelector("#reportDmButton").addEventListener("click", () => reportUser(activeDmEmail));
  document.querySelector("#blockDmButton").addEventListener("click", () => blockUser(activeDmEmail));
  document.querySelector("#reportForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    submitReport(activeDmEmail);
  });
  document.querySelector("#cancelReportButton")?.addEventListener("click", () => {
    reportPanelOpen = false;
    renderDm();
  });

  document.querySelector("#dmForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.querySelector("#dmInput");
    const text = input.value.trim();
    if (!text || !canSendDm) return;

    const messages = getMessages();
    messages.push({
      pair: key,
      eventId: checkin.eventId,
      eventName: checkin.event.name,
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
  reportPanelOpen = false;
  renderInvites();
}

function reportUser(email) {
  if (!currentUser || !email) return;

  reportPanelOpen = true;
  renderDm();
}

function submitReport(email) {
  if (!currentUser || !email) return;

  const reason = document.querySelector("#reportReason")?.value;
  const details = document.querySelector("#reportDetails")?.value.trim() || "";
  if (!reason) return;

  const reports = getReports();
  reports.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    reporterEmail: currentUser.email,
    reportedEmail: email,
    reason,
    notes: `${details || "No extra details provided."} Reported from DM at ${new Date().toLocaleString()}`
  });
  saveReports(reports);
  reportPanelOpen = false;
  renderDm();
}

function blockUser(email) {
  if (!currentUser || !email) return;

  const blocks = getBlocks();
  const alreadyBlocked = blocks.some((block) => block.blockerEmail === currentUser.email && block.blockedEmail === email);
  if (!alreadyBlocked) {
    blocks.push({ blockerEmail: currentUser.email, blockedEmail: email });
    saveBlocks(blocks);
  }

  activeDmEmail = "";
  passedEmails.add(email);
  renderMatches();
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

function renderCheckin(message = "") {
  if (!eventSelect || !checkinStatus) return;

  eventSelect.innerHTML = trialEvents.map((event) => `
    <option value="${event.id}">${event.name} · Location ${event.location} · ${event.active ? event.time : "Closed"}</option>
  `).join("");

  const checkin = currentCheckin();
  if (checkin) {
    eventSelect.value = checkin.eventId;
    checkinStatus.innerHTML = `
      <strong>Checked in to ${checkin.event.name}</strong>
      <p>Dance deck, invites, and DMs are open for dancers checked into this same active event.</p>
    `;
    checkinStatus.classList.add("is-ok");
    return;
  }

  checkinStatus.innerHTML = `
    <strong>Not checked in</strong>
    <p>${message || "Choose an active event and complete the safety checks before using the Dance deck."}</p>
  `;
  checkinStatus.classList.remove("is-ok");
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
  renderCheckin();
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
  clearCurrentSession();
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

createPairButton.addEventListener("click", () => {
  upsertUsers(betaTestUsers);
  switchToUser(betaTestUsers[0].email);
  setPage("testers");
});

checkinAllButton.addEventListener("click", () => {
  const allUsers = getUsers();
  saveCheckins(allUsers.map((user) => buildCheckin(user)));
  passedEmails.clear();
  resetDeckPosition();
  renderCheckin();
  renderMatches();
  renderTesterList();
  renderInvites();
});

checkinForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!currentUser) return;

  const selectedEvent = eventById(eventSelect.value);
  const age = Number(userAge.value);

  if (!selectedEvent || !selectedEvent.active) {
    renderCheckin("That event is not currently open for check-in.");
    return;
  }

  if (age < 13 || age > 18) {
    renderCheckin("This teen beta only allows ages 13-18.");
    return;
  }

  if (!guardianConsent.checked || !conductAgree.checked || !schoolEligibility.checked) {
    renderCheckin("Complete every safety check before checking in.");
    return;
  }

  const checkins = getCheckins().filter((checkin) => checkin.email !== currentUser.email);
  checkins.push(buildCheckin(currentUser, selectedEvent.id));
  saveCheckins(checkins);
  passedEmails.clear();
  resetDeckPosition();
  renderCheckin();
  renderMatches();
  renderInvites();
  setPage("matches");
});

checkoutButton.addEventListener("click", () => {
  if (!currentUser) return;

  saveCheckins(getCheckins().filter((checkin) => checkin.email !== currentUser.email));
  deleteSupabaseCheckin(currentUser.email);
  activeDmEmail = "";
  passedEmails.clear();
  resetDeckPosition();
  renderCheckin();
  renderMatches();
  renderInvites();
  setPage("checkin");
});

resetUsersButton.addEventListener("click", () => {
  saveUsers([]);
  saveInvites([]);
  saveMessages([]);
  saveCheckins([]);
  saveReports([]);
  saveBlocks([]);
  clearSupabaseBetaData();
  clearCurrentSession();
  activeDmEmail = "";
  photoPreview.src = defaultPhoto;
  summaryPhoto.src = defaultPhoto;
  renderCheckin();
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
    renderCheckin();
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

window.addEventListener("storage", (event) => {
  if ([usersKey, invitesKey, messagesKey, checkinsKey, reportsKey, blocksKey].includes(event.key)) {
    syncSharedState(true);
  }
});

setInterval(() => syncSharedState(), 1200);

setupDemoMode();
renderCheckin();
renderMatches();
updateSummary();
renderTesterList();
renderInvites();
lastSyncSignature = syncSignature();

localStorage.removeItem(sessionKey);
const savedSessionEmail = sessionStorage.getItem(sessionKey);
const savedUser = getUsers().find((user) => user.email === demoUserEmail) || getUsers().find((user) => user.email === savedSessionEmail);
if (savedUser) {
  saveCurrentUser(savedUser);
  syncProfileFromUser(savedUser);
  updateSummary();
  renderCheckin();
  renderMatches();
  renderInvites();
  showApp();
} else {
  showLoggedOut();
}

startSupabaseSync();
