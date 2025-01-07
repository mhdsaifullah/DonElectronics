document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', function() {
        const partNumber = document.getElementById('part-number').value;
        fetchPartData(partNumber);
    });

    async function fetchPartData(partNumber) {
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
                'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjA5NzI5QTkyRDU0RDlERjIyRDQzMENBMjNDNkI4QjJFIiwidHlwIjoiYXQrand0In0.eyJuYmYiOjE3MzYyNjIyNDIsImV4cCI6MTczNjM0ODY0MiwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS5uZXhhci5jb20iLCJjbGllbnRfaWQiOiI5YWI0NWU1ZC1kZWVmLTQyMDMtYjgyYy1lY2NkYzVjY2NmNzQiLCJzdWIiOiJFNzg3NkI5MS0zRkIwLTRCQjgtODY0OC1DOTVBOTYzMDA1NzEiLCJhdXRoX3RpbWUiOjE3MzYyNDM3NDcsImlkcCI6ImxvY2FsIiwicHJpdmF0ZV9jbGFpbXNfaWQiOiI5MzlkZTQ2MC04ODkwLTRiNDgtYTBlMy1hZDY5MmIyZTRiNjgiLCJwcml2YXRlX2NsYWltc19zZWNyZXQiOiJxdUszWkIwbFkwQk9EbDFJalR5VEpERFFQNHdrQlVDaHRzWTV0eE9OVmQ4PSIsImp0aSI6IjYzRThCQTIzNTlBMzdFNzhBMTNFNzZFN0ZBRkE2NTAwIiwic2lkIjoiRjMyQUYyOUFBOUM0NTM1REVCQUVEMjkyOTNBRjkwRDMiLCJpYXQiOjE3MzYyNjIyNDIsInNjb3BlIjpbIm9wZW5pZCIsInVzZXIuYWNjZXNzIiwicHJvZmlsZSIsImVtYWlsIiwidXNlci5kZXRhaWxzIiwic3VwcGx5LmRvbWFpbiIsImRlc2lnbi5kb21haW4iXSwiYW1yIjpbInB3ZCJdfQ.dcBFYA7C2rdMfHQOYqTexGDx7pe4pdipH3SkiDYW3EltmnioGVYf_83bmAfH5w6xuWv_QYl5dSQHDlYolfrRAOVsvML1STZsnNrvVyQphYPzdMZYij2MkDoov0UBlBMFDQjSJhghR_3hDYvj5V1K6rtJQfYjwZZ6m51xk4xrV1jqh-HQ49AC8cYG2QsDpG12jTWpyMhRMsLigvO6rwwvOl6iAq_-SnXk1AeuGLyDhltQ3Vw5BQCRF-D3B1W7DjUKSjQzMHQ0STe4TxBGqFysDrF7O3ps-mXZtjwCUClE-_pg3tTsrAHS3fpNOijd0viBPV6rCm8cvRxdTb3ke7179w'
            },
            body: JSON.stringify({ query: gqlQuery })
        });
        
        const result = await response.json();
        displayResults(result.data.supSearch.results);
    }

    function displayResults(results) {
		const container = document.getElementById('results-container');
		container.innerHTML = '';  // Clear previous results
		results.forEach(item => {
			const div = document.createElement('div');
			div.className = 'item';
			div.innerHTML = `
				<strong>MPN:</strong> ${item.part.mpn || 'N/A'} <br>
				<strong>Description:</strong> ${item.part.shortDescription || 'N/A'} <br>
				<strong>Manufacturer:</strong> ${item.part.manufacturer.name || 'N/A'} <br>
				<strong>Category:</strong> ${item.part.category.name || 'N/A'} <br>
				<strong>Median Price (1000 units):</strong> ${item.part.medianPrice1000 ? item.part.medianPrice1000.price : 'N/A'} ${item.part.medianPrice1000 ? item.part.medianPrice1000.currency : ''} <br>
				<strong>Octopart URL:</strong> <a href="${item.part.octopartUrl}" target="_blank">${item.part.octopartUrl}</a> <br>
				<strong>Image:</strong> ${item.part.images[0] ? `<img src="${item.part.images[0].url}" alt="${item.part.name}" style="max-width: 100px;">` : 'No image available'} <br>
				<strong>Sellers:</strong> ${item.part.sellers.map(seller => `
					${seller.company.name || 'N/A'} (${seller.country || 'N/A'}) - <a href="${seller.company.homepageUrl || '#'}" target="_blank">${seller.company.homepageUrl || 'N/A'}</a>
					Offers: ${seller.offers.map(offer => `
						SKU: ${offer.sku || 'N/A'}, Inventory: ${offer.inventoryLevel || 'N/A'}, MOQ: ${offer.moq || 'N/A'}, Price: ${offer.prices && offer.prices.length > 0 ? offer.prices[0].price : 'N/A'} ${offer.prices && offer.prices.length > 0 ? offer.prices[0].currency : ''}, <a href="${offer.clickUrl || '#'}" target="_blank">Buy</a> <br>
					`).join('')} <br>
				`).join('')}
				<hr>
			`;
			container.appendChild(div);
		});
	}		
});
