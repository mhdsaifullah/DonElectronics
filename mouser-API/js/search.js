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
        .then(data => displayResults(data, keyword))
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
        .then(data => displayResults(data, partNumber))
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
// Process the CSV file
let csvPartNumbers = []; // Global variable to store CSV part numbers

function processCSV(csvData) {
    const lines = csvData.split('\n');
    isManualSearch = false;  // Reset flag for CSV search

    if (lines.length < 2) return;

    const headers = lines[0].split(',');
    const partNumColumnIndex = headers.findIndex(header => header.trim().toLowerCase() === 'manf #');

    if (partNumColumnIndex === -1) {
        console.error('Manufacturer Part Num column not found');
        return;
    }

    csvPartNumbers = lines.slice(1).map(line => {
        const columns = line.split(',');
        return columns.length > partNumColumnIndex ? columns[partNumColumnIndex].trim() : null;
    }).filter(partNumber => partNumber);

    // Fetch part numbers using API and process results
    Promise.all(csvPartNumbers.map(partNumber => searchByMultiplePartNumber('8c6b9643-d11b-49fa-9175-e3ff62100c48', partNumber)))
        .then(() => {
            addLinePriceSumRow(); // Add Line Price sum row after all results are processed
            hideLoading();
        })
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
        .then(data => displayResults(data, partNumber))  // Pass partNumber here
        .then(data => hideLoading())
        .catch(error => {
            console.error('Error with part number:', partNumber, error);
            hideLoading();
        });
}

// Update the displayResults function to filter by CSV part numbers
function displayResults(data, searchedPartNumber) {
    const resultsDiv = document.getElementById('results');
    const totalResultsEl = document.getElementById('total-results');
    const resultsTableBody = document.getElementById('results-body');
    const resCSV = document.getElementById('resCSV');
    const downloadCSV = document.getElementById('downloadCSVBtn');

    document.getElementById('clearResultsBtn').style.display = 'inline-block';
    resultsDiv.style.display = 'block';

    // Toggle visibility of the total-results element based on search type
    totalResultsEl.style.display = isManualSearch ? 'block' : 'none';
    resCSV.style.display = isManualSearch ? 'none' : 'block';
    downloadCSV.style.display = isManualSearch ? 'none' : 'block';

    if (data.Errors && data.Errors.length > 0) {
        console.error('Error fetching part data:', data.Errors);
        return;
    }

    const results = data.SearchResults.Parts || [];

    let filteredResults = results;

    // Apply filtering only for CSV search (not for manual search)

    if (!isManualSearch) {

        // Filter based on CSV part numbers and additional conditions
        filteredResults = results.filter(part =>
            csvPartNumbers.includes(part.ManufacturerPartNumber) &&  // Exact match
            part.AvailabilityInStock &&                              // Availability is not null
            part.ImagePath                                           // ImagePath is not null
        ).slice(0, 1);  // Limit to one result


        if (filteredResults.length === 0) {
            filteredResults = results.filter(part =>
                csvPartNumbers.includes(part.ManufacturerPartNumber) // Exact match only
            ).slice(0, 1);  // Limit to one result
        }
    }

    // Display total number of results
    if (isManualSearch) {
        totalResultsEl.textContent = `Number Of Results: ${filteredResults.length}`;
        totalResultsEl.style.display = 'block';
        downloadCSVBtn
    }

    if (filteredResults.length > 0) {

        filteredResults.forEach(part => {
            const row = document.createElement('tr');
            row.classList.add('result-row');

            // Create HTML dynamically
            row.innerHTML = `
                <td><img src="${part.ImagePath || 'https://www.mouser.co.uk/images/no-image.gif'}" alt="${part.ManufacturerPartNumber || 'No image available'}" class="result-image"></td>
                <td class="result-mouser-part">${part.MouserPartNumber}</td>
                <td class="result-manufacturer-part">${part.ManufacturerPartNumber}</td>
                <td class="result-description" style="font-size: smaller;">${part.Description}</td>
                <td class="result-availability">${part.Availability || 'Out of Stock'}</td>
                <td class="result-pricing">${generatePriceDropdown(part)}</td>
            `;
            resultsTableBody.appendChild(row);
            const price = part.PriceBreaks && part.PriceBreaks.length > 0 ? part.PriceBreaks[0].Price : 'N/A'; // Modify this if the API response format is different
            updatePricesInTable(part.ManufacturerPartNumber, price);
        });
    } else {
        // Display 'No Part Number Found' message with ManufacturerPartNumber in the same format
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="https://www.mouser.co.uk/images/no-image.gif" alt="No image available" class="result-image"></td>
            <td class="result-mouser-part">N/A</td>
            <td class="result-manufacturer-part">${searchedPartNumber}</td>
            <td class="result-description">No part found in the results</td>
            <td class="result-availability">No Part Number Found</td>
            <td class="result-pricing">N/A</td>
        `;
        resultsTableBody.appendChild(row);
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


//CSV Upload

let headers = [];
let columnWidths = [];

document.getElementById('csvUpload').addEventListener('change', handleFile);

function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;
        displayCSV(content);
    };
    reader.readAsText(file);
}

function displayCSV(csv) {
    const rows = csv.trim().split(/\r?\n/).map(row => row.split(','));
    headers = ["#", ...rows[0]];  // Add Serial Number header

    const table = document.createElement('table');
    table.innerHTML = '';

    // Create table header
    const headerRow = document.createElement('tr');
    headers.forEach((header, index) => {
        const th = document.createElement('th');
        th.textContent = header.trim();
        th.classList.add('resizable');
        th.dataset.columnIndex = index;
        th.addEventListener('mousedown', initResize);
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Create table rows
    for (let i = 0; i < rows.length - 1; i++) { // Exclude headers from serial numbers
        const row = document.createElement('tr');

        // Add Serial Number column
        const serialTd = document.createElement('td');
        serialTd.textContent = i + 1;  // Serial number starts at 1
        serialTd.classList.add('serial-number');
        row.appendChild(serialTd);

        for (let j = 0; j < headers.length - 1; j++) {
            const td = document.createElement('td');
            const value = rows[i + 1][j] || "";  // Skip the first row (headers)
            if (headers[j + 1].toLowerCase().includes('comment')) {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'editable';
                input.value = value;
                td.appendChild(input);
            } else {
                td.textContent = value;
            }
            row.appendChild(td);
        }
        table.appendChild(row);
    }

    document.getElementById('csvTable').innerHTML = '';
    document.getElementById('csvTable').appendChild(table);
}

function initResize(e) {
    const th = e.target;
    const startX = e.clientX;
    const startWidth = th.offsetWidth;

    const onMouseMove = (moveEvent) => {
        const newWidth = startWidth + (moveEvent.clientX - startX);
        th.style.width = `${newWidth}px`;
        columnWidths[th.dataset.columnIndex] = newWidth;
        updateColumnWidths();
    };

    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

function updateColumnWidths() {
    const table = document.querySelector('table');
    const columns = table.querySelectorAll('th');
    columns.forEach((th, index) => {
        if (columnWidths[index]) {
            th.style.width = `${columnWidths[index]}px`;
        }
    });

    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        cells.forEach((cell, index) => {
            if (columnWidths[index]) {
                cell.style.width = `${columnWidths[index]}px`;
            }
        });
    });
}

function downloadCSV() {
    const rows = Array.from(document.querySelectorAll('#csvTable table tr'));
    const csvContent = rows.map((row, rowIndex) => {
        const cells = Array.from(row.cells).map((cell, cellIndex) => {
            // Get the text content from each cell or the input value
            const input = cell.querySelector('input');
            if (input) {
                return `"${input.value}"`; // If input element is present, use its value
            } else {
                return `"${cell.textContent.trim()}"`; // Otherwise, use the text content of the cell
            }
        }).join(','); // Join all the cells with commas

        return cells; // Return the row data
    }).join('\n'); // Join all rows with newlines

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'updated_data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


// Function to update the prices in the table
function updatePricesInTable(partNumber, price) {
    const table = document.querySelector('#csvTable table');
    if (!table) return;

    const rows = table.rows;
    let partNumberColumnIndex = -1;

    // Find the index of the "Manufacturer Part Num" column dynamically
    const headers = table.rows[0].cells;
    for (let j = 0; j < headers.length; j++) {
        if (headers[j].textContent.trim().toLowerCase() === 'manf #') {
            partNumberColumnIndex = j;
            break;
        }
    }

    if (partNumberColumnIndex === -1) {
        console.error('Manufacturer Part Num column not found');
        return; // If column is not found, exit the function
    }

    let quantityColumnIndex = -1;
    let linePriceColumnIndex = -1;

    // Find the indexes of the "Quantity" and "Line Price" columns dynamically
    for (let j = 0; j < headers.length; j++) {
        if (headers[j].textContent.trim().toLowerCase() === 'quantity') {
            quantityColumnIndex = j;
        }
        if (headers[j].textContent.trim().toLowerCase().startsWith('line price')) {
            linePriceColumnIndex = j;
        }
    }

    if (quantityColumnIndex === -1 || linePriceColumnIndex === -1) {
        console.error('Quantity or Line Price column not found');
        return; // Exit if either of these columns are missing
    }

    // Loop through all rows except the header row
    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].cells;
        const partNumberCell = cells[partNumberColumnIndex];

        // Check if the part number in the row matches the part number being processed
        if (partNumberCell.textContent.trim() === partNumber) {
            // Find the 'Unit Price' column
            let unitPriceCell = null;
            for (let j = 0; j < cells.length; j++) {
                const header = table.rows[0].cells[j].textContent.trim();
                if (header.toLowerCase().startsWith('unit price')) {
                    unitPriceCell = cells[j];
                    break;
                }
            }

            // If 'Unit Price' column exists, update it
            if (unitPriceCell) {
                unitPriceCell.textContent = price; // Update unit price

                // Get the "Quantity" value and calculate the "Line Price"
                const quantityCell = cells[quantityColumnIndex];
                const quantity = parseInt(quantityCell.textContent.trim(), 10);

                if (!isNaN(quantity) && price) {
                    const unitPrice = parseFloat(price.replace('$', '').trim()); // Remove dollar sign and parse
                    const linePrice = quantity * unitPrice; // Calculate Line Price

                    // Find the "Line Price" column and update it
                    const linePriceCell = cells[linePriceColumnIndex];
                    if (linePriceCell) {
                        linePriceCell.textContent = `$${linePrice.toFixed(2)}`; // Set the calculated Line Price
                    }
                }
            }
        }
    }
}


function addLinePriceSumRow() {
    const table = document.querySelector('#csvTable table');
    if (!table) return;

    const rows = table.rows;
    let linePriceColumnIndex = -1;
    let serialNumberColumnIndex = -1;

    // Find the index of the "Line Price" column and "Serial Number" column dynamically
    const headers = table.rows[0].cells;
    for (let j = 0; j < headers.length; j++) {
        if (headers[j].textContent.trim().toLowerCase().startsWith('line price')) {
            linePriceColumnIndex = j;
        }
        if (headers[j].textContent.trim().toLowerCase() === '#') {
            serialNumberColumnIndex = j;
        }
    }

    if (linePriceColumnIndex === -1) {
        console.error('Line Price column not found');
        return; // Exit if the "Line Price" column is not found
    }

    let totalLinePrice = 0;

    // Loop through all rows (starting from index 1 to skip the header row)
    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].cells;
        const linePriceCell = cells[linePriceColumnIndex];

        // If the "Line Price" cell contains a value, add it to the total
        if (linePriceCell && linePriceCell.textContent.trim()) {
            const linePriceText = linePriceCell.textContent.trim().replace('$', '').trim();
            const linePriceValue = parseFloat(linePriceText);

            if (!isNaN(linePriceValue)) {
                totalLinePrice += linePriceValue;
            }
        }
    }

    // Create a new row for the sum of the Line Price
    const sumRow = document.createElement('tr');
    sumRow.classList.add('sum-row');

    // Fill the new row with cells
    const rowData = [];
    for (let i = 0; i < headers.length; i++) {
        if (i === serialNumberColumnIndex) {
            rowData.push('<td><strong>Total</strong></td>');  // Total under Serial Number column
        } else if (i === linePriceColumnIndex) {
            rowData.push(`<td><strong>$${totalLinePrice.toFixed(2)}</strong></td>`);  // Total Line Price
        } else {
            rowData.push('<td>-</td>');  // For all other columns, add "-"
        }
    }

    // Append all columns to the sum row
    sumRow.innerHTML = rowData.join('');

    // Append the sum row to the table
    table.appendChild(sumRow);
}
