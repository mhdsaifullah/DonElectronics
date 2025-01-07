document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', function() {
        const partNumber = document.getElementById('part-number').value;
        fetchPartData(partNumber);
    });

    async function fetchPartData(partNumber) {
        const gqlQuery = `
            query Search($search: String!, $start: Int) {
                supSearch(q: $search, limit: 100, start: $start) {
                    hits
                    results {
                        part {
                            mpn
                            shortDescription
                            manufacturer {
                                name
                            }
                            specs {
                                attribute {
                                    shortname
                                }
                                value
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
            body: JSON.stringify({ query: gqlQuery, variables: { search: partNumber, start: 0 } })
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
                <strong>Manufacturer:</strong> ${item.part.manufacturer.name}
            `;
            container.appendChild(div);
        });
    }
});
