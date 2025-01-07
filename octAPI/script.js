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
                'Authorization': 'Bearer YOUR_NEXAR_API_TOKEN'
            },
            body: JSON.stringify({ query: gqlQuery })
        });
        
        const result = await response.json();
        displayResults(result.data.supSearch.results);
    }

    function displayResults(results) {
        const container = document.getElementById('results-container');
        container.innerHTML = '';
        results.forEach(item => {
            const div = document.createElement('div');
            div.className = 'item';
            div.innerHTML = `
                <strong>MPN:</strong> ${item.part.mpn} <br>
                <strong>Description:</strong> ${item.part.shortDescription} <br>
                <strong>Manufacturer:</strong> ${item.part.manufacturer.name} <br>
                <strong>Category:</strong> ${item.part.category.name} <br>
                <strong>Median Price (1000 units):</strong> ${item.part.medianPrice1000.price} ${item.part.medianPrice1000.currency} <br>
                <strong>Octopart URL:</strong> <a href="${item.part.octopartUrl}" target="_blank">${item.part.octopartUrl}</a>
            `;
            container.appendChild(div);
        });
    }
});
