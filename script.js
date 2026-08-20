"use strict";

const productCatalog = [
  { id: "country-sourdough", name: "Country Sourdough", price: "$8-$10" },
  { id: "honey-oat", name: "Honey Oat", price: "$8-$9" },
  { id: "rosemary-focaccia", name: "Rosemary Sea Salt Focaccia", price: "$7-$12" },
  { id: "butter-croissants", name: "Butter Croissants", price: "$4-$5 each" },
  { id: "fruit-danishes", name: "Seasonal Fruit Danishes", price: "$4-$6 each" },
  { id: "morning-buns", name: "Morning Buns", price: "$4-$5 each" },
  { id: "celebration-cakes", name: "Celebration Cakes", price: "$35 and up" }
];

const storageKeys = {
  favorites: "northStarBakeryFavorites",
  contact: "northStarBakeryContact"
};

let favoriteIds = loadFavoriteIds();

function loadFavoriteIds() {
  try {
    const storedFavorites = JSON.parse(localStorage.getItem(storageKeys.favorites));
    return Array.isArray(storedFavorites) ? storedFavorites : [];
  } catch (error) {
    return [];
  }
}

function saveFavoriteIds() {
  localStorage.setItem(storageKeys.favorites, JSON.stringify(favoriteIds));
}

function getFavoriteProducts() {
  return productCatalog.filter((product) => favoriteIds.includes(product.id));
}

function toggleFavorite(productId) {
  favoriteIds = favoriteIds.includes(productId)
    ? favoriteIds.filter((id) => id !== productId)
    : [...favoriteIds, productId];
  saveFavoriteIds();
  renderFavorites();
}

function renderFavoriteButtons() {
  const options = document.querySelector("#favorite-options");
  if (!options) return;

  options.replaceChildren();
  productCatalog.forEach((product) => {
    const button = document.createElement("button");
    const isFavorite = favoriteIds.includes(product.id);
    button.type = "button";
    button.className = "favorite-button";
    button.dataset.productId = product.id;
    button.setAttribute("aria-pressed", String(isFavorite));
    button.innerHTML = `<span>${isFavorite ? "★" : "☆"} ${product.name}</span><span class="favorite-price">${product.price}</span>`;
    button.addEventListener("click", () => toggleFavorite(product.id));
    options.append(button);
  });
}

function renderFavorites() {
  const list = document.querySelector("#favorites-list");
  const status = document.querySelector("#favorites-status");
  const clearButton = document.querySelector("#clear-favorites");
  if (!list || !status || !clearButton) return;

  renderFavoriteButtons();
  const favorites = getFavoriteProducts();
  list.replaceChildren();

  if (favorites.length === 0) {
    status.textContent = "No favorites saved yet. Select an item above to start your list.";
    clearButton.hidden = true;
    return;
  }

  status.textContent = `${favorites.length} favorite${favorites.length === 1 ? "" : "s"} saved in this browser.`;
  favorites.forEach((product) => {
    const item = document.createElement("li");
    item.textContent = `${product.name} (${product.price})`;
    list.append(item);
  });
  clearButton.hidden = false;
}

function initializeFavorites() {
  const options = document.querySelector("#favorite-options");
  if (!options) return;

  document.querySelector("#clear-favorites").addEventListener("click", () => {
    favoriteIds = [];
    saveFavoriteIds();
    renderFavorites();
  });
  renderFavorites();
}

const validationRules = {
  name: (value) => value.trim().length >= 2 ? "" : "Enter your full name using at least 2 characters.",
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? "" : "Enter a valid email address, such as name@example.com.",
  "request-type": (value) => value ? "" : "Choose a request type.",
  "pickup-date": (value) => {
    if (!value) return "Choose a preferred pickup date.";
    const selectedDate = new Date(`${value}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today ? "" : "Choose today or a future pickup date.";
  },
  "item-details": (value) => value.trim().length >= 10 ? "" : "Describe the items you need using at least 10 characters."
};

function showFieldError(field, message) {
  const errorElement = document.querySelector(`#${field.id}-error`);
  if (!errorElement) return;
  errorElement.textContent = message;
  field.classList.toggle("input-error", Boolean(message));
  field.setAttribute("aria-invalid", String(Boolean(message)));
  field.setAttribute("aria-describedby", errorElement.id);
}

function validateField(field) {
  const rule = validationRules[field.id];
  if (!rule) return true;
  const message = rule(field.value);
  showFieldError(field, message);
  return message === "";
}

function saveContactDetails(form) {
  const contactDetails = {
    name: form.elements.name.value.trim(),
    email: form.elements.email.value.trim()
  };
  localStorage.setItem(storageKeys.contact, JSON.stringify(contactDetails));
}

function restoreContactDetails(form) {
  try {
    const contactDetails = JSON.parse(localStorage.getItem(storageKeys.contact));
    if (!contactDetails || typeof contactDetails !== "object") return;
    form.elements.name.value = contactDetails.name || "";
    form.elements.email.value = contactDetails.email || "";
  } catch (error) {
    localStorage.removeItem(storageKeys.contact);
  }
}

function initializeFormValidation() {
  const form = document.querySelector("#preorder-form");
  if (!form) return;

  restoreContactDetails(form);
  const fields = Object.keys(validationRules).map((id) => document.querySelector(`#${id}`));
  fields.forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") validateField(field);
      if (field.id === "name" || field.id === "email") saveContactDetails(form);
    });
    field.addEventListener("change", () => validateField(field));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const results = fields.map(validateField);
    const firstInvalidField = fields.find((field, index) => !results[index]);
    const status = document.querySelector("#form-status");

    if (firstInvalidField) {
      status.textContent = "Please correct the highlighted fields before submitting your request.";
      status.className = "form-status";
      firstInvalidField.focus();
      return;
    }

    saveContactDetails(form);
    status.textContent = "Your request is ready to send. North Star Bakery will confirm availability by email.";
    status.className = "form-status success";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initializeFavorites();
  initializeFormValidation();
});
