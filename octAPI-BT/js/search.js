document.addEventListener('DOMContentLoaded', function() {
	const searchButton = document.getElementById('manualSearchButton');
	searchButton.addEventListener('click', function(event) {
		event.preventDefault(); // Prevent form submission
		
		const partNumberInput = document.getElementById('partNumber');
        const partNumber = partNumberInput.value.trim();

        if (!partNumber) {
            // Show validation message
            const errorMessage = document.getElementById('error-message');
            errorMessage.textContent = 'Part number is required!';
            errorMessage.style.display = 'block';
            return; // Exit early if partNumber is empty
        }

        // Hide error message if input is valid
        const errorMessage = document.getElementById('error-message');
        errorMessage.style.display = 'none';
		
		fetchPartData(partNumber);
	});

	let isManualSearch = false; // Flag to track manual search

	async function fetchPartData(partNumber) {
		showLoading(); // Show loading before fetching
		isManualSearch = true; // Set flag to indicate manual search
		const resultsTableBody = document.getElementById('results-body');
		resultsTableBody.innerHTML = '';
		const gqlQuery = `
            query partSearch {
                supSearch(
                    q: "${partNumber}",
                    currency: "GBP",
                    country: "GB",
                    start: 0,
                    inStockOnly: true,
                    limit: 1
                ) {
                    hits
                    results {
                        part {
                            id
                            name
                            mpn
                            shortDescription
                            octopartUrl
                            images {
                                url
                            }
                            manufacturer {
                                name
                                homepageUrl
                            }
                            category {
                                id
                                name
                            }
                            sellers {
                                country
                                company {
                                    id
                                    name
                                    homepageUrl
                                }
                                offers {
                                    sku
                                    inventoryLevel
                                    moq
                                    clickUrl
                                    updated
                                    prices {
                                        quantity
                                        price
                                        currency
                                        convertedPrice
                                        convertedCurrency
                                    }
                                }
                            }
                            medianPrice1000 {
                                quantity
                                currency
                                price
                            }
                            similarParts {
                                name
                                octopartUrl
                                mpn
                            }
                        }
                    }
                }
            }
        `;

		const response = await fetch('https://api.nexar.com/graphql', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjA5NzI5QTkyRDU0RDlERjIyRDQzMENBMjNDNkI4QjJFIiwidHlwIjoiYXQrand0In0.eyJuYmYiOjE3MzcxMDM2ODMsImV4cCI6MTczNzE5MDA4MywiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS5uZXhhci5jb20iLCJjbGllbnRfaWQiOiI5YWI0NWU1ZC1kZWVmLTQyMDMtYjgyYy1lY2NkYzVjY2NmNzQiLCJzdWIiOiJFNzg3NkI5MS0zRkIwLTRCQjgtODY0OC1DOTVBOTYzMDA1NzEiLCJhdXRoX3RpbWUiOjE3MzcxMDMwNTQsImlkcCI6ImxvY2FsIiwicHJpdmF0ZV9jbGFpbXNfaWQiOiIxMDIzMTIzYi1jZjMwLTRmMTAtOGJlZi0wMTUwZjYzNTJjYTAiLCJwcml2YXRlX2NsYWltc19zZWNyZXQiOiJ6bVdxWVcvdmJPTjhacEUvZGZCN2N0d0NYZkZDZVcyQ0lTZEczRzRsNnE0PSIsImp0aSI6IkRCMDA5RUM3MzVGRDQ4MDQ3MkZGNTg1MUYxQjY5NTJDIiwic2lkIjoiRkIxNjMzNTU1M0RGNTkwNDVBMjNGNjg2REExNEM0MTciLCJpYXQiOjE3MzcxMDM2ODMsInNjb3BlIjpbIm9wZW5pZCIsInVzZXIuYWNjZXNzIiwicHJvZmlsZSIsImVtYWlsIiwidXNlci5kZXRhaWxzIiwic3VwcGx5LmRvbWFpbiIsImRlc2lnbi5kb21haW4iXSwiYW1yIjpbInB3ZCJdfQ.DB4N7q66YIHhE_ElZjxZwDaHcx3aOo0i1_BtsxXXJuXl6HDyIuaVRLZVsH0R5vhvivnfyAKyEVc_Z-NSeX7KxFLxLOTqItWWXcXnu3WgFJOfvUX2Jj_qDAXS7E0X3w3m6oN9lVjKNgDBe7UB3o5bflkmMsn7fW26slvDji5KAWCx9kbrHCoIoIODm-C9cBZKn8P_xrlPMTsrVPoEhwMgu84RBZlQ0AE24MM0YjN-BdbgmrP2BD_FI0DacFYa0QPIZhGxFjYPLS7pyXrEarP4BdkseJH3CtEb1FD_cLqh1NeVXxSN4PGbZhNaZNp2Lx6iTgS-73g4SOW4Z2pM-6wFMw'
			},
			body: JSON.stringify({
				query: gqlQuery
			})
		});

		const result = await response.json();
		displayResults(result.data.supSearch, partNumber);
		hideLoading();
	}

function displayResults(searchResults, partNumber) {
    const resultsDiv = document.getElementById('results');
    const totalResultsEl = document.getElementById('total-results');
    const resultsTableBody = document.getElementById('results-body');
    const resCSV = document.getElementById('resCSV');
    const downloadCSV = document.getElementById('downloadCSVBtn');
    const tableWrapper = document.querySelector('.table-wrapper');

    document.getElementById('clearResultsBtn').style.display = 'inline-block';
    resultsDiv.style.display = 'block';

    // Toggle visibility of the total-results element based on search type
    totalResultsEl.style.display = isManualSearch ? 'none' : 'none'; // totalResultsEl.style.display = isManualSearch ? 'block' : 'none';
    resCSV.style.display = isManualSearch ? 'none' : 'block';
    downloadCSV.style.display = isManualSearch ? 'none' : 'block';

    const totalHits = searchResults.hits;
    if (isManualSearch) {
        totalResultsEl.textContent = `Number Of Results: ${totalHits}`;
        totalResultsEl.style.display = 'block';
    }

    // Clear previous results
    resultsTableBody.innerHTML = '';

    if (!searchResults || searchResults.hits === 0 || !searchResults.results) {
        // Display message for no results
        const noResultsRow = document.createElement('tr');
        noResultsRow.innerHTML = '<td colspan="6"><strong>No part found</strong></td>';
        resultsTableBody.appendChild(noResultsRow);
        return;
    }

    // Display part details before the table starts
    searchResults.results.forEach(item => {
        const partDetailsDiv = document.createElement('div');
        partDetailsDiv.innerHTML = `
            <div style="padding: 10px; border: 1px solid #ddd; margin-bottom: 10px;">
                <table style="width: 100%;">
                    <tr>
                        <td style="width: 120px; vertical-align: top;">
                            ${item.part.images[0] ? `<img src="${item.part.images[0].url}" alt="${item.part.name}" style="max-width: 100px;">` : 'No image available'}
                        </td>
                        <td style="vertical-align: top;">
                            <strong>MPN:</strong> ${item.part.mpn || 'N/A'} <br>
                            <strong>Description:</strong> ${item.part.shortDescription || 'N/A'} <br>
                            <strong>Manufacturer:</strong> ${item.part.manufacturer.name || 'N/A'} <br>
                            <strong>Median Price (1000 units):</strong> ${item.part.medianPrice1000 ? item.part.medianPrice1000.price : 'N/A'} ${item.part.medianPrice1000 ? item.part.medianPrice1000.currency : ''} <br>
                            <strong>Octopart URL:</strong> <a href="${item.part.octopartUrl}" target="_blank">Octopart</a>
                        </td>
                    </tr>
                </table>
            </div>
        `;
        resultsDiv.insertBefore(partDetailsDiv, tableWrapper);

        // Display seller data in table rows
        item.part.sellers.forEach(seller => {
            if (['GB', 'US', 'PL'].includes(seller.country)) {
                seller.offers.forEach(offer => {
                    const sellerRow = document.createElement('tr');
                    sellerRow.classList.add('result-seller-row');
                    sellerRow.innerHTML = `
                        <td>${seller.company.name || 'N/A'}</td>
                        <td>${seller.country || 'N/A'}</td>
                        <td><a href="${seller.company.homepageUrl || '#'}" target="_blank">${seller.company.homepageUrl || 'N/A'}</a></td>
                        <td>${offer.inventoryLevel || 'N/A'}</td>
                        <td>${offer.prices && offer.prices.length > 0 ? offer.prices[0].price : 'N/A'} ${offer.prices && offer.prices.length > 0 ? offer.prices[0].currency : ''}</td>
                        <td><a href="${offer.clickUrl || '#'}" target="_blank">Buy</a></td>
                    `;
                    resultsTableBody.appendChild(sellerRow);
                });
            }
        });
    });
}





	function showLoading() {
		document.getElementById('loading').style.display = 'flex';
	}

	function hideLoading() {
		document.getElementById('loading').style.display = 'none';
	}

	function clearResultsBtn() {
		const resultsTableBody = document.getElementById('results-body');
		const resultsDiv = document.getElementById('results');
		const clearButton = document.getElementById('clearResultsBtn');

		// Clear the table and hide the container
		resultsTableBody.innerHTML = '';
		resultsDiv.style.display = 'none';
		clearButton.style.display = 'none'; // Hide the clear button again
	}
});
