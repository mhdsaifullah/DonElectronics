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
                'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjA5NzI5QTkyRDU0RDlERjIyRDQzMENBMjNDNkI4QjJFIiwidHlwIjoiYXQrand0In0.eyJuYmYiOjE3MzYyNTQwODEsImV4cCI6MTczNjM0MDQ4MSwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS5uZXhhci5jb20iLCJjbGllbnRfaWQiOiI5YWI0NWU1ZC1kZWVmLTQyMDMtYjgyYy1lY2NkYzVjY2NmNzQiLCJzdWIiOiJFNzg3NkI5MS0zRkIwLTRCQjgtODY0OC1DOTVBOTYzMDA1NzEiLCJhdXRoX3RpbWUiOjE3MzYyNDM3NDcsImlkcCI6ImxvY2FsIiwicHJpdmF0ZV9jbGFpbXNfaWQiOiI1NDlhYWQ3YS03M2IxLTRlZjktYTg0My1jMTg5NzhhMTYxMTAiLCJwcml2YXRlX2NsYWltc19zZWNyZXQiOiJmZGp6R1lDTGdEMXM0NTdIT2VEbGp3Um9PQ0s1UzEvSGZtMTI0eUxJN1ZVPSIsImp0aSI6IkI2MEY1MDQ3MDU4MDc5RUMwNjM1MjQyQzRERDkyNTQ0Iiwic2lkIjoiRjMyQUYyOUFBOUM0NTM1REVCQUVEMjkyOTNBRjkwRDMiLCJpYXQiOjE3MzYyNTQwODEsInNjb3BlIjpbIm9wZW5pZCIsInVzZXIuYWNjZXNzIiwicHJvZmlsZSIsImVtYWlsIiwidXNlci5kZXRhaWxzIiwic3VwcGx5LmRvbWFpbiIsImRlc2lnbi5kb21haW4iXSwiYW1yIjpbInB3ZCJdfQ.nqI-9W3mu7K00TcQMRX8pZBqoKNjsQarxmYehD5td_4clvQ9C7BRprBL1nuMDJCJIKNlNDGJfMBhsodZMuXO-NexC4F_DQ1Hxl9XzIa3XuOR3V9bFm2jxUk_qsE8F6hFvP1Oi_DllWTtEh38SYI1_Q9YgURYKaxr5J-meTeVOh5_u2DDFTB7kTQUSQ1Wnlqa7A43P75O31aRK6f45JRZTWolaUIoskNM7ObCVwqa4CzbbEDchCwBvZHuIP-dZ744IMfOHfa-_O8ZABXibyZcGDs_nsUjHmktgQfqywYByUwwMDqnUHdRdSX_S-_FVSXDzA3O6AcDZ2t3RpY4AMEfKg'
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