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

function searchByKeyword(apiKey, keyword) {
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
        .catch(error => console.error('Error:', error));
}

function searchByPartNumber(apiKey, partNumber) {
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
        .catch(error => console.error('Error:', error));
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

function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    const totalResultsEl = document.getElementById('total-results');
    const resultsTableBody = document.getElementById('results-body');

    // Clear previous results
    totalResultsEl.textContent = '';
    resultsTableBody.innerHTML = '';

    if (data.Errors && data.Errors.length > 0) {
        resultsDiv.style.display = 'none'; // Hide the results div
        alert('Error fetching results.');
        return;
    }

    const totalResults = data.SearchResults.NumberOfResult || 0;
    const results = data.SearchResults.Parts || [];

    if (totalResults > 0) {
        resultsDiv.style.display = 'block'; // Show the results div
        totalResultsEl.textContent = `Total Results: ${totalResults}`;

        results.forEach(part => {
            const row = document.createElement('tr');
            row.classList.add('result-row');

            // Create HTML dynamically
            row.innerHTML = `
                <td><img src="${part.ImagePath || 'https://www.mouser.co.uk/images/no-image.gif'}" alt="${part.ManufacturerPartNumber || 'No image available'}" class="result-image"></td>
                <td class="result-mouser-part">${part.MouserPartNumber}</td>
                <td class="result-manufacturer-part">${part.ManufacturerPartNumber}</td>
                <td class="result-description">${part.Description}</td>
                <td class="result-availability">${part.Availability || 'N/A'}</td>
                <td class="result-pricing">${generatePriceDropdown(part)}</td>
            `;
            resultsTableBody.appendChild(row);
        });
    } else {
        resultsDiv.style.display = 'none'; // Hide the results div
        alert('No results found.');
    }
}

// Helper function to generate dropdown HTML
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
