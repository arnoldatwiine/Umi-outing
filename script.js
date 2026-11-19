const STORAGE_KEY = "familyResortContributors";

let contributors = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let editingId = null;

const form = document.getElementById("contributorForm");
const nameInput = document.getElementById("name");
const mainPaymentInput = document.getElementById("mainPayment");
const customPaymentInput = document.getElementById("customPayment");
const customPaymentGroup = document.getElementById("customPaymentGroup");
const otherContributionInput = document.getElementById("otherContribution");
const mealInput = document.getElementById("meal");

const table = document.getElementById("contributorsTable");
const searchInput = document.getElementById("searchInput");

const money = amount =>
  "UGX " + Number(amount || 0).toLocaleString("en-US");

function saveRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contributors));
}

mainPaymentInput.addEventListener("change", () => {
  customPaymentGroup.classList.toggle(
    "hidden",
    mainPaymentInput.value !== "other"
  );

  if (mainPaymentInput.value !== "other") {
    customPaymentInput.value = "";
  }
});

function getMainPayment() {
  if (mainPaymentInput.value === "other") {
    return Number(customPaymentInput.value);
  }

  return Number(mainPaymentInput.value);
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const mainPayment = getMainPayment();
  const otherContribution = Number(otherContributionInput.value || 0);
  const meal = mealInput.value;

  if (!name || !meal) {
    alert("Please complete all required fields.");
    return;
  }

  if (
    !Number.isFinite(mainPayment) ||
    !Number.isFinite(otherContribution) ||
    mainPayment < 0 ||
    otherContribution < 0
  ) {
    alert("Please enter valid payment amounts.");
    return;
  }

  if (
    mainPaymentInput.value === "other" &&
    customPaymentInput.value.trim() === ""
  ) {
    alert("Please enter the other main payment amount.");
    return;
  }

  if (editingId !== null) {
    const index = contributors.findIndex(
      person => person.id === editingId
    );

    if (index !== -1) {
      contributors[index] = {
        ...contributors[index],
        name,
        mainPayment,
        otherContribution,
        meal
      };
    }

    editingId = null;
    document.getElementById("submitButton").textContent = "Add Contributor";
    document.getElementById("cancelEdit").classList.add("hidden");

  } else {
    contributors.push({
      id: Date.now().toString() + Math.random().toString(16).slice(2),
      name,
      mainPayment,
      otherContribution,
      meal
    });
  }

  saveRecords();
  form.reset();
  customPaymentGroup.classList.add("hidden");
  otherContributionInput.value = "0";

  renderAll();
});

document.getElementById("cancelEdit").addEventListener("click", () => {
  editingId = null;
  form.reset();
  customPaymentGroup.classList.add("hidden");
  otherContributionInput.value = "0";

  document.getElementById("submitButton").textContent = "Add Contributor";
  document.getElementById("cancelEdit").classList.add("hidden");
});

function renderDashboard() {
  const total = contributors.length;

  const mainTotal = contributors.reduce(
    (sum, person) => sum + Number(person.mainPayment || 0),
    0
  );

  const otherTotal = contributors.reduce(
    (sum, person) => sum + Number(person.otherContribution || 0),
    0
  );

  document.getElementById("totalContributors").textContent = total;
  document.getElementById("mainPayments").textContent = money(mainTotal);
  document.getElementById("otherContributions").textContent = money(otherTotal);
  document.getElementById("grandTotal").textContent =
    money(mainTotal + otherTotal);
}

function renderMeals() {
  const meals = [
    "Lipwizard of buffet",
    "Chips + Pork",
    "Chips + Chicken",
    "Chips + Goat",
    "Fish + Chips"
  ];

  const summary = document.getElementById("mealSummary");
  summary.innerHTML = "";

  meals.forEach(meal => {
    const count = contributors.filter(
      person => person.meal === meal
    ).length;

    const card = document.createElement("div");
    card.className = "meal-card";

    const heading = document.createElement("h3");
    heading.textContent = meal;

    const number = document.createElement("strong");
    number.textContent = count;

    const caption = document.createElement("p");
    caption.textContent = count === 1 ? "Person" : "People";

    card.append(heading, number, caption);
    summary.appendChild(card);
  });
}

function renderTable() {
  table.innerHTML = "";

  const searchTerm = searchInput.value.toLowerCase().trim();

  const filtered = contributors.filter(person =>
    person.name.toLowerCase().includes(searchTerm)
  );

  document.getElementById("emptyMessage").style.display =
    filtered.length === 0 ? "block" : "none";

  filtered.forEach((person, index) => {
    const row = document.createElement("tr");

    const values = [
      index + 1,
      person.name,
      money(person.mainPayment),
      money(person.otherContribution),
      person.meal
    ];

    values.forEach(value => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });

    const actionCell = document.createElement("td");

    const editButton = document.createElement("button");
    editButton.className = "edit-btn";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => editContributor(person.id));

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteContributor(person.id));

    actionCell.append(editButton, deleteButton);
    row.appendChild(actionCell);

    table.appendChild(row);
  });
}

function editContributor(id) {
  const person = contributors.find(item => item.id === id);
  if (!person) return;

  editingId = id;

  nameInput.value = person.name;
  otherContributionInput.value = person.otherContribution;
  mealInput.value = person.meal;

  if ([35000, 30000, 0].includes(Number(person.mainPayment))) {
    mainPaymentInput.value = String(person.mainPayment);
    customPaymentGroup.classList.add("hidden");
    customPaymentInput.value = "";
  } else {
    mainPaymentInput.value = "other";
    customPaymentGroup.classList.remove("hidden");
    customPaymentInput.value = person.mainPayment;
  }

  document.getElementById("submitButton").textContent = "Update Contributor";
  document.getElementById("cancelEdit").classList.remove("hidden");

  document.getElementById("contributorForm").scrollIntoView({
    behavior: "smooth"
  });
}

function deleteContributor(id) {
  const person = contributors.find(item => item.id === id);
  if (!person) return;

  if (confirm("Delete " + person.name + " from the records?")) {
    contributors = contributors.filter(item => item.id !== id);

    if (editingId === id) {
      editingId = null;
      form.reset();
      customPaymentGroup.classList.add("hidden");
      document.getElementById("submitButton").textContent = "Add Contributor";
      document.getElementById("cancelEdit").classList.add("hidden");
    }

    saveRecords();
    renderAll();
  }
}

searchInput.addEventListener("input", renderTable);

function renderAll() {
  renderDashboard();
  renderMeals();
  renderTable();
}

document.getElementById("downloadCSV").addEventListener("click", () => {
  if (contributors.length === 0) {
    alert("There are no records to download.");
    return;
  }

  const rows = [
    ["Name", "Main Payment", "Other Contribution", "Meal"]
  ];

  contributors.forEach(person => {
    rows.push([
      person.name,
      person.mainPayment,
      person.otherContribution,
      person.meal
    ]);
  });

  const csv = rows.map(row =>
    row.map(value =>
      '"' + String(value).replace(/"/g, '""') + '"'
    ).join(",")
  ).join("\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  downloadFile(blob, "class-day-out-contributors.csv");
});

document.getElementById("backupJSON").addEventListener("click", () => {
  const blob = new Blob(
    [JSON.stringify(contributors, null, 2)],
    { type: "application/json" }
  );

  downloadFile(blob, "class-day-out-backup.json");
});

document.getElementById("restoreJSON").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const restored = JSON.parse(reader.result);

      if (
        !Array.isArray(restored) ||
        !restored.every(person =>
          person &&
          typeof person.name === "string" &&
          typeof person.meal === "string" &&
          Number.isFinite(Number(person.mainPayment)) &&
          Number.isFinite(Number(person.otherContribution))
        )
      ) {
        throw new Error("Invalid backup");
      }

      if (confirm("Restore this backup? Current records will be replaced.")) {
        contributors = restored.map(person => ({
          ...person,
          id: person.id || (
            Date.now().toString() + Math.random().toString(16).slice(2)
          )
        }));

        editingId = null;
        form.reset();
        customPaymentGroup.classList.add("hidden");
        otherContributionInput.value = "0";
        document.getElementById("submitButton").textContent = "Add Contributor";
        document.getElementById("cancelEdit").classList.add("hidden");

        saveRecords();
        renderAll();
        alert("Backup restored successfully.");
      }

    } catch (error) {
      alert("This backup file is invalid.");
    }

    event.target.value = "";
  };

  reader.readAsText(file);
});

function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

renderAll();