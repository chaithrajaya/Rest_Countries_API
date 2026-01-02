const countryListDiv = document.getElementById("country-list");
const searchInput = document.getElementById("search-input");
const regionFilter = document.getElementById("region-filter");
const sortFilter = document.getElementById("sort-filter");
const resetBtn = document.getElementById("resetFilters");
const darkModeToggle = document.getElementById("darkModeToggle");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageInfo = document.getElementById("pageInfo");

const detailsModal = document.getElementById("detailsModal");
const closeDetails = document.querySelector(".close-details");

const detailsFlag = document.getElementById("detailsFlag");
const detailsName = document.getElementById("detailsName");
const detailsCode = document.getElementById("detailsCode"); // NEW
const detailsCapital = document.getElementById("detailsCapital");
const detailsRegion = document.getElementById("detailsRegion");
const detailsPopulation = document.getElementById("detailsPopulation");
const detailsLanguages = document.getElementById("detailsLanguages");
const detailsCurrencies = document.getElementById("detailsCurrencies");

let allCountries = [];
let filteredCountries = [];
let currentPage = 1;
const itemsPerPage = 10;

// Load all countries from API
async function loadAllCountries() {
    const res = await fetch(
        "https://restcountries.com/v3.1/all?fields=name,capital,region,cca2,flags,population,languages,currencies"
    );
    allCountries = await res.json();

    allCountries.sort((a, b) => a.name.common.localeCompare(b.name.common));
    filteredCountries = [...allCountries];
    renderPage();
}

// Apply filters & search
function applyFilters() {
    const searchText = searchInput.value.toLowerCase();
    const region = regionFilter.value;
    const sortBy = sortFilter.value;

    filteredCountries = allCountries.filter(country => {
        const nameMatch = country.name.common.toLowerCase().includes(searchText);
        const capitalMatch = country.capital?.[0]?.toLowerCase().includes(searchText);
        const codeMatch = country.cca2.toLowerCase().includes(searchText);

        if (searchText && !(nameMatch || capitalMatch || codeMatch)) return false;
        if (region && country.region !== region) return false;

        return true;
    });

    // Sorting
    filteredCountries.sort((a, b) => {
        switch (sortBy) {
            case "az": return a.name.common.localeCompare(b.name.common);
            case "za": return b.name.common.localeCompare(a.name.common);
            case "pop-asc": return a.population - b.population;
            case "pop-desc": return b.population - a.population;
            default: return 0;
        }
    });

    currentPage = 1;
    renderPage();
}

// Render current page
function renderPage() {
    countryListDiv.innerHTML = "";
    const start = (currentPage - 1) * itemsPerPage;
    const pageItems = filteredCountries.slice(start, start + itemsPerPage);

    if (pageItems.length === 0) {
        countryListDiv.innerHTML = "<p>No countries found</p>";
        pageInfo.textContent = "";
        return;
    }

    pageItems.forEach(country => {
        const card = document.createElement("div");
        card.className = "country-card";
        card.innerHTML = `
            <h3>${country.name.common}</h3>
            <p>Capital: ${country.capital?.[0] || "N/A"}</p>
            <p>Region: ${country.region}</p>
            <p>Population: ${country.population.toLocaleString()}</p>
            <p>Code: ${country.cca2}</p>
            <img src="${country.flags.png}">
        `;

        card.onclick = () => {
            detailsModal.style.display = "block";
            detailsFlag.src = country.flags.png;
            detailsName.textContent = country.name.common;
            detailsCode.textContent = country.cca2;  
            detailsCapital.textContent = country.capital?.[0] || "N/A";
            detailsRegion.textContent = country.region;
            detailsPopulation.textContent = country.population.toLocaleString();
            detailsLanguages.textContent = country.languages ? Object.values(country.languages).join(", ") : "N/A";
            detailsCurrencies.textContent = country.currencies ? Object.keys(country.currencies).join(", ") : "N/A";
        };

        countryListDiv.appendChild(card);
    });

    const totalPages = Math.ceil(filteredCountries.length / itemsPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

// Pagination
prevBtn.onclick = () => { if(currentPage>1){currentPage--;renderPage();} };
nextBtn.onclick = () => { if(currentPage<Math.ceil(filteredCountries.length/itemsPerPage)){currentPage++;renderPage();} };

// Event listeners
searchInput.oninput = applyFilters;
regionFilter.onchange = applyFilters;
sortFilter.onchange = applyFilters;
resetBtn.onclick = () => {
    searchInput.value = "";
    regionFilter.value = "";
    sortFilter.value = "";
    applyFilters();
};
darkModeToggle.onclick = () => document.body.classList.toggle("dark");
closeDetails.onclick = () => detailsModal.style.display = "none";

document.addEventListener("DOMContentLoaded", loadAllCountries);
