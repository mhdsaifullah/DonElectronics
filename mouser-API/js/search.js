document.getElementById('searchForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const apiKey = '8c6b9643-d11b-49fa-9175-e3ff62100c48'; // Your API key
    const keyword = document.getElementById('keyword').value;
    const partNumber = document.getElementById('partNumber').value;

    if (keyword) {
        searchByKeyword(apiKey, keyword);
    } else if (partNumber) {
        searchByPartNumber(apiKey, partNumber);
    } else {
        alert('Please enter either a keyword or part number to search.');
    }
});

let isManualSearch = false;  // Flag to track manual search

function searchByKeyword(apiKey, keyword) {

    showLoading(); // Show loading before fetching

    isManualSearch = true;   // Set flag to indicate manual search

    // Clear previous results (manual search only)
    const resultsTableBody = document.getElementById('results-body');
    resultsTableBody.innerHTML = ''; // Clear the table body

    const requestData = {
        SearchByKeywordRequest: {
            keyword: keyword,
            records: 0,
            startingRecord: 0,
            searchOptions: '',
            searchWithYourSignUpLanguage: ''
        }
    };

    fetch(`https://api.mouser.com/api/v1/search/keyword?apiKey=${apiKey}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
        .then(response => response.json())
        .then(data => displayResults(data))
        .then(data => hideLoading())
        .catch(error => {
            console.error('Error:', error);
            alert('Error fetching results.');
            hideLoading();
        });
}

function searchByPartNumber(apiKey, partNumber) {

    showLoading(); // Show loading before fetching

    isManualSearch = true;   // Set flag to indicate manual search

    // Clear previous results
    const resultsTableBody = document.getElementById('results-body');
    resultsTableBody.innerHTML = '';

    const requestData = {
        SearchByPartRequest: {
            mouserPartNumber: partNumber,
            partSearchOptions: ''
        }
    };

    fetch(`https://api.mouser.com/api/v1/search/partnumber?apiKey=${apiKey}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
        .then(response => response.json())
        .then(data => displayResults(data))
        .then(data => hideLoading())
        .catch(error => {
            console.error('Error:', error);
            alert('Error fetching results.');
            hideLoading();
        });
}


// Handle CSV file upload
document.getElementById('csvUpload').addEventListener('change', function (event) {

    const file = event.target.files[0];

    if (file && file.type === 'text/csv') {
        const reader = new FileReader();
        reader.onload = function (e) {

            const csvData = e.target.result;
            processCSV(csvData);

        };
        reader.readAsText(file);

    } else {

        alert('Please upload a valid CSV file.');
    }
});

// Add drag-and-drop functionality
const uploadContainer = document.querySelector('.upload-container');

uploadContainer.addEventListener('dragover', function (event) {
    event.preventDefault();
    uploadContainer.classList.add('dragover');
});

uploadContainer.addEventListener('dragleave', function () {
    uploadContainer.classList.remove('dragover');
});

uploadContainer.addEventListener('drop', function (event) {
    event.preventDefault();
    uploadContainer.classList.remove('dragover');

    const file = event.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
        const reader = new FileReader();
        reader.onload = function (e) {
            const csvData = e.target.result;
            processCSV(csvData);
        };
        reader.readAsText(file);
    } else {
        alert('Please upload a valid CSV file.');
    }
});

// Process the CSV file
function processCSV(csvData) {
    const lines = csvData.split('\n');

    isManualSearch = false;  // Reset flag for CSV search

    // Ensure there are rows in the CSV
    if (lines.length < 2) return;

    // Extract headers (first row)
    const headers = lines[0].split(',');

    // Find the index of the "Manufacturer Part Num" column dynamically
    const partNumColumnIndex = headers.findIndex(header => header.trim().toLowerCase() === 'manufacturer part num');

    if (partNumColumnIndex === -1) {
        console.error('Manufacturer Part Num column not found');
        return;
    }

    // Collect all part numbers
    const partNumbers = lines.slice(1).map(line => {
        const columns = line.split(',');
        return columns.length > partNumColumnIndex ? columns[partNumColumnIndex].trim() : null;
    }).filter(partNumber => partNumber); // Remove empty/null values

    // Perform all searches and wait for completion
    Promise.all(partNumbers.map(partNumber => searchByMultiplePartNumber('8c6b9643-d11b-49fa-9175-e3ff62100c48', partNumber)))
        .then(() => hideLoading()) // Hide loading after all searches
        .catch(error => {
            console.error('Error fetching results:', error);
            alert('Error fetching some results.');
            hideLoading();
        });
}

// Updated search function with return statement
function searchByMultiplePartNumber(apiKey, partNumber) {

    showLoading(); // Show loading before fetching

    isManualSearch = false;  // Reset flag for CSV search

    clearResults();
    const requestData = {
        SearchByPartRequest: {
            mouserPartNumber: partNumber,
            partSearchOptions: ''
        }
    };

    return fetch(`https://api.mouser.com/api/v1/search/partnumber?apiKey=${apiKey}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
        .then(response => response.json())
        .then(data => displayResults(data))
        .then(data => hideLoading())
        .catch(error => {
            console.error('Error with part number:', partNumber, error);
            hideLoading();
        });
}

// Display results without clearing previous content
function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    const totalResultsEl = document.getElementById('total-results');
    const resultsTableBody = document.getElementById('results-body');

    document.getElementById('clearResultsBtn').style.display = 'inline-block';

    // Show results container
    resultsDiv.style.display = 'block';

    // Toggle visibility of the total-results element based on search type
    totalResultsEl.style.display = isManualSearch ? 'block' : 'none';

    if (data.Errors && data.Errors.length > 0) {
        console.error('Error fetching part data:', data.Errors);
        return;
    }

    const results = data.SearchResults.Parts || [];

    // Display total number of results
    if (isManualSearch) {
        totalResultsEl.textContent = `Number Of Results: ${results.length}`;
    }

    if (results.length > 0) {
        results.forEach(part => {
            const row = document.createElement('tr');
            row.classList.add('result-row');

            // Create HTML dynamically
            row.innerHTML = `
                <td><img src="${part.ImagePath || 'https://www.mouser.co.uk/images/no-image.gif'}" alt="${part.ManufacturerPartNumber || 'No image available'}" class="result-image"></td>
                <td class="result-mouser-part">${part.MouserPartNumber}</td>
                <td class="result-manufacturer-part">${part.ManufacturerPartNumber}</td>
                <td class="result-description" style="font-size: smaller;">${part.Description}</td>
                <td class="result-availability">${part.Availability || 'N/A'}</td>
                <td class="result-pricing">${generatePriceDropdown(part)}</td>
            `;
            resultsTableBody.appendChild(row);
        });
    } else {
        console.warn(`No results found for part number: ${partNumber}`);
    }
}

// Helper function to generate dropdown HTML (unchanged)
function generatePriceDropdown(part) {
    if (part.PriceBreaks && part.PriceBreaks.length > 0) {
        const priceOptions = part.PriceBreaks.map(
            (priceBreak, index) =>
                `<option value="${priceBreak.Price}" data-quantity="${priceBreak.Quantity}" ${index === 0 ? 'selected' : ''}>
                    Quantity: ${priceBreak.Quantity}
                </option>`
        ).join('');

        return `
            <div class="pricing-container">
                <select class="price-dropdown" onchange="updatePrice(this)">
                    ${priceOptions}
                </select>
                <div class="selected-price">
                    Price: ${part.PriceBreaks[0].Price}
                </div>
            </div>
        `;
    }
    return 'N/A';
}

function updatePrice(selectElement) {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const price = selectedOption.value;
    const priceContainer = selectElement.nextElementSibling; // The price <div> next to the dropdown

    if (price) {
        priceContainer.innerHTML = `Price: ${price}`;
    } else {
        priceContainer.innerHTML = 'Price: ';
    }
}

function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

// Hide loading indicator function
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function clearResults() {
    const resultsTableBody = document.getElementById('results-body');
    const resultsDiv = document.getElementById('results');

    // Clear the table and hide the container
    resultsTableBody.innerHTML = '';
    resultsDiv.style.display = 'none';
}

function clearResultsBtn() {
    const resultsTableBody = document.getElementById('results-body');
    const resultsDiv = document.getElementById('results');
    const clearButton = document.getElementById('clearResultsBtn');

    // Clear the table and hide the container
    resultsTableBody.innerHTML = '';
    resultsDiv.style.display = 'none';
    clearButton.style.display = 'none';  // Hide the clear button again
}