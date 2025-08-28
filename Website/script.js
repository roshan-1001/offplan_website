let propertyViewer;

class PropertyViewer {
    constructor() {
        this.properties = [];
        this.filteredProperties = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.filters = {
            search: '',
            region: '',
            type: '',
            developer: '',
            maxPrice: 50000000,
            bedrooms: ''
        };
        this.sortBy = 'title';
        
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.setupEventListeners();
            this.updateStats();
            this.populateFilters();
            this.renderPopularDevelopers();
            this.renderFeaturedProperties();
            this.renderProperties();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Failed to initialize the application');
        }
    }

    async loadData() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.properties = await response.json();
            this.filteredProperties = [...this.properties];
            console.log(`Loaded ${this.properties.length} properties`);
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Error loading properties. Please check if data.json is available.');
            throw error;
        }
    }

    showError(message) {
        const propertiesContainer = document.getElementById('properties-container');
        const developersGrid = document.getElementById('developers-grid');
        
        if (propertiesContainer) {
            propertiesContainer.innerHTML = `<div class="no-results">${message}</div>`;
        }
        if (developersGrid) {
            developersGrid.innerHTML = `<div class="no-results">${message}</div>`;
        }
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('search-title');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.applyFilters();
            });
        }

        // Filter dropdowns
        const filterElements = ['filter-region', 'filter-type', 'filter-developer', 'filter-bedrooms', 'sort-by'];
        filterElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', (e) => {
                    if (id === 'sort-by') {
                        this.sortBy = e.target.value;
                    } else {
                        this.filters[id.replace('filter-', '')] = e.target.value;
                    }
                    this.applyFilters();
                });
            }
        });

        // Price range slider
        const priceRange = document.getElementById('price-range');
        if (priceRange) {
            priceRange.addEventListener('input', (e) => {
                this.filters.maxPrice = parseInt(e.target.value);
                this.updatePriceDisplay();
                this.applyFilters();
            });
        }

        // Pagination
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderProperties();
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const maxPages = Math.ceil(this.filteredProperties.length / this.itemsPerPage);
                if (this.currentPage < maxPages) {
                    this.currentPage++;
                    this.renderProperties();
                }
            });
        }
    }

    updateStats() {
        const totalProperties = this.properties.length;
        const filteredCount = this.filteredProperties.length;
        const regions = new Set(this.properties.map(p => p.region).filter(Boolean)).size;
        const avgPrice = Math.round(this.properties.reduce((sum, p) => sum + p.price, 0) / totalProperties);
        const developers = new Set(this.properties.map(p => p.developer).filter(Boolean)).size;

        // Update main stats
        const statElements = {
            'total-properties': filteredCount,
            'total-regions': regions,
            'avg-price': this.formatPrice(avgPrice),
            'total-developers': developers,
            'filtered-count': filteredCount,
            'avg-price-display': this.formatPrice(avgPrice)
        };

        Object.entries(statElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });

        // Update price range display
        const minPrice = Math.min(...this.properties.map(p => p.price));
        const maxPrice = Math.max(...this.properties.map(p => p.price));
        const priceRangeElement = document.getElementById('price-range-display');
        if (priceRangeElement) {
            priceRangeElement.textContent = `${this.formatPrice(minPrice)} - ${this.formatPrice(maxPrice)}`;
        }
        
        this.updatePriceDisplay();
    }

    updatePriceDisplay() {
        const priceDisplay = document.getElementById('price-display');
        if (priceDisplay) {
            const minPrice = Math.min(...this.properties.map(p => p.price));
            const maxPrice = this.filters.maxPrice;
            priceDisplay.textContent = `AED ${this.formatPrice(minPrice)} - AED ${this.formatPrice(maxPrice)}`;
        }
    }

    populateFilters() {
        // Populate regions
        const regions = [...new Set(this.properties.map(p => p.region).filter(Boolean))].sort();
        this.populateSelect('filter-region', regions);

        // Populate types
        const types = [...new Set(this.properties.map(p => p.type).filter(Boolean))].sort();
        this.populateSelect('filter-type', types);

        // Populate developers
        const developers = [...new Set(this.properties.map(p => p.developer).filter(Boolean))].sort();
        this.populateSelect('filter-developer', developers);
    }

    populateSelect(selectId, options) {
        const select = document.getElementById(selectId);
        if (!select) return;

        // Keep the first option (usually "All")
        const firstOption = select.firstElementChild;
        select.innerHTML = '';
        if (firstOption) {
            select.appendChild(firstOption);
        }

        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
    }

    renderPopularDevelopers() {
        console.log('Rendering popular developers...');
        
        // Count properties by developer
        const developerCounts = {};
        const developerLogos = {};
        this.properties.forEach(property => {
            if (property.developer) {
                developerCounts[property.developer] = (developerCounts[property.developer] || 0) + 1;
                // Store the first logo found for each developer
                if (property.developerLogo && !developerLogos[property.developer]) {
                    developerLogos[property.developer] = property.developerLogo;
                }
            }
        });

        // Sort developers by property count and get top 8
        const popularDevelopers = Object.entries(developerCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8);

        const developersGrid = document.getElementById('developers-grid');
        if (!developersGrid) {
            console.error('Developers grid element not found');
            return;
        }
        
        if (popularDevelopers.length === 0) {
            developersGrid.innerHTML = '<div class="no-results">No developer data available</div>';
            return;
        }

        const developersHTML = popularDevelopers.map(([developer, count]) => {
            const avgPrice = Math.round(
                this.properties
                    .filter(p => p.developer === developer)
                    .reduce((sum, p) => sum + p.price, 0) / count
            );

            const logo = developerLogos[developer];
            const logoHTML = logo ? 
                `<img src="${logo}" alt="${developer}" class="developer-logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` :
                '';

            return `
                <div class="developer-card" onclick="filterByDeveloper('${developer}')">
                    <div class="developer-logo">
                        ${logoHTML}
                        <div class="developer-logo-fallback" style="${logo ? 'display: none;' : 'display: flex;'}">
                            ${developer.charAt(0)}
                        </div>
                    </div>
                    <div class="developer-name">${developer}</div>
                    <div class="developer-stats">
                        <span class="developer-count">${count}</span> properties • 
                        Avg: ${this.formatPrice(avgPrice)}
                    </div>
                </div>
            `;
        }).join('');

        developersGrid.innerHTML = developersHTML;
        console.log('Popular developers rendered successfully');
    }

    renderFeaturedProperties() {
        console.log('Rendering featured properties...');
        
        // Select 3 properties with the highest prices as "featured"
        const featuredProperties = [...this.properties]
            .sort((a, b) => b.price - a.price)
            .slice(0, 3);

        const featuredGrid = document.getElementById('featured-properties');
        if (!featuredGrid) {
            console.error('Featured properties grid element not found');
            return;
        }

        if (featuredProperties.length === 0) {
            featuredGrid.innerHTML = '<div class="no-results">No featured properties available</div>';
            return;
        }

        const featuredHTML = featuredProperties.map(property => {
            const logo = property.developerLogo;
            const logoHTML = logo ? 
                `<img src="${logo}" alt="${property.developer}" class="developer-logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` :
                '';

            // Enhanced property information
            const handoverDate = property.newParam?.handoverTime || 'TBA';
            // Format handover date to show only month and year
            const formatHandoverDate = (dateString) => {
                if (dateString === 'TBA') return 'TBA';
                try {
                    const date = new Date(dateString);
                    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                } catch {
                    return dateString;
                }
            };

            return `
                <div class="property-card featured-card" onclick="viewPropertyDetails('${property.id}')">
                    <div class="property-image">
                        <img src="${property.photos[0] || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                             alt="${property.title}" 
                             onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                        <div class="featured-badge">
                            <i class="fas fa-star"></i> Featured
                        </div>
                        <div class="property-price">
                            ${this.formatPrice(property.price)}
                        </div>
                    </div>
                    <div class="property-content">
                        <div class="developer-logo-container">
                            ${logoHTML}
                            <div class="developer-logo-fallback" style="${logo ? 'display: none;' : 'display: flex;'}">
                                ${property.developer.charAt(0)}
                            </div>
                            <span class="developer-name">${property.developer}</span>
                        </div>
                        <h3 class="property-title">${property.title}</h3>
                        <p class="property-location">
                            <i class="fas fa-map-marker-alt"></i> ${property.region}
                        </p>
                        
                        <!-- Key Property Information -->
                        <div class="property-key-info">
                            <div class="info-row">
                                <span class="info-item">
                                    <i class="fas fa-calendar-alt"></i> ${formatHandoverDate(handoverDate)}
                                </span>
                            </div>
                            <div class="info-row">
                                <span class="info-item">
                                    <i class="fas fa-bed"></i> ${property.newParam?.bedroomMin || 'N/A'}-${property.newParam?.bedroomMax || 'N/A'} BR
                                </span>
                                <span class="info-item">
                                    <i class="fas fa-ruler-combined"></i> ${property.newParam?.minSize || 'N/A'}-${property.newParam?.maxSize || 'N/A'} sqft
                                </span>
                            </div>
                        </div>

                        <!-- Property Features -->
                        <div class="property-features">
                            ${property.amenities && property.amenities.length > 0 ? 
                                property.amenities.slice(0, 3).map(amenity => 
                                    `<span class="feature-tag">${amenity}</span>`
                                ).join('') : 
                                '<span class="feature-tag">Premium Location</span><span class="feature-tag">Modern Design</span>'
                            }
                        </div>

                        <!-- Call to Action -->
                        <div class="property-cta">
                            <button class="view-details-btn">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        featuredGrid.innerHTML = featuredHTML;
        console.log('Featured properties rendered successfully');
    }

    applyFilters() {
        this.filteredProperties = this.properties.filter(property => {
            // Search filter
            if (this.filters.search) {
                const searchTerm = this.filters.search.toLowerCase();
                const matchesSearch = 
                    property.title.toLowerCase().includes(searchTerm) ||
                    property.developer.toLowerCase().includes(searchTerm) ||
                    property.region.toLowerCase().includes(searchTerm);
                if (!matchesSearch) return false;
            }

            // Region filter
            if (this.filters.region && property.region !== this.filters.region) {
                return false;
            }

            // Type filter
            if (this.filters.type && property.type !== this.filters.type) {
                return false;
            }

            // Developer filter
            if (this.filters.developer && property.developer !== this.filters.developer) {
                return false;
            }

            // Price filter
            if (property.price > this.filters.maxPrice) {
                return false;
            }

            // Bedrooms filter
            if (this.filters.bedrooms !== '') {
                const minBedrooms = parseInt(this.filters.bedrooms);
                const propertyBedrooms = property.newParam?.bedroomMin || 0;
                if (propertyBedrooms < minBedrooms) {
                    return false;
                }
            }

            return true;
        });

        // Sort properties
        this.sortProperties();

        // Reset to first page
        this.currentPage = 1;

        // Update display
        this.updateStats();
        this.renderProperties();
    }

    sortProperties() {
        this.filteredProperties.sort((a, b) => {
            switch (this.sortBy) {
                case 'price':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'handover':
                    const aHandover = a.newParam?.handoverTime || '';
                    const bHandover = b.newParam?.handoverTime || '';
                    return aHandover.localeCompare(bHandover);
                default:
                    return a.title.localeCompare(b.title);
            }
        });
    }

    renderProperties() {
        const container = document.getElementById('properties-container');
        if (!container) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageProperties = this.filteredProperties.slice(startIndex, endIndex);

        if (pageProperties.length === 0) {
            container.innerHTML = '<div class="no-results">No properties found matching your criteria.</div>';
            return;
        }

        const propertiesHTML = pageProperties.map(property => {
            const logo = property.developerLogo;
            const logoHTML = logo ? 
                `<img src="${logo}" alt="${property.developer}" class="developer-logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` :
                '';

            // Enhanced property information
            const handoverDate = property.newParam?.handoverTime || 'TBA';
            // Format handover date to show only month and year
            const formatHandoverDate = (dateString) => {
                if (dateString === 'TBA') return 'TBA';
                try {
                    const date = new Date(dateString);
                    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                } catch {
                    return dateString;
                }
            };
            
            return `
                <div class="property-card" onclick="viewPropertyDetails('${property.id}')">
                    <div class="property-image">
                        <img src="${property.photos[0] || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                             alt="${property.title}" 
                             onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                        <div class="property-price">
                            ${this.formatPrice(property.price)}
                        </div>
                    </div>
                    <div class="property-content">
                        <div class="developer-logo-container">
                            ${logoHTML}
                            <div class="developer-logo-fallback" style="${logo ? 'display: none;' : 'display: flex;'}">
                                ${property.developer.charAt(0)}
                            </div>
                            <span class="developer-name">${property.developer}</span>
                        </div>
                        <h3 class="property-title">${property.title}</h3>
                        <p class="property-location">
                            <i class="fas fa-map-marker-alt"></i> ${property.region}
                        </p>
                        
                        <!-- Key Property Information -->
                        <div class="property-key-info">
                            <div class="info-row">
                                <span class="info-item">
                                    <i class="fas fa-calendar-alt"></i> ${formatHandoverDate(handoverDate)}
                                </span>
                            </div>
                            <div class="info-row">
                                <span class="info-item">
                                    <i class="fas fa-bed"></i> ${property.newParam?.bedroomMin || 'N/A'}-${property.newParam?.bedroomMax || 'N/A'} BR
                                </span>
                                <span class="info-item">
                                    <i class="fas fa-ruler-combined"></i> ${property.newParam?.minSize || 'N/A'}-${property.newParam?.maxSize || 'N/A'} sqft
                                </span>
                            </div>
                        </div>

                        <!-- Property Features -->
                        <div class="property-features">
                            ${property.amenities && property.amenities.length > 0 ? 
                                property.amenities.slice(0, 3).map(amenity => 
                                    `<span class="feature-tag">${amenity}</span>`
                                ).join('') : 
                                '<span class="feature-tag">Premium Location</span><span class="feature-tag">Modern Design</span>'
                            }
                        </div>

                        <!-- Call to Action -->
                        <div class="property-cta">
                            <button class="view-details-btn">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Wrap properties in grid container
        container.innerHTML = `
            <div class="section-header">
                <h2><i class="fas fa-building"></i> All Properties</h2>
                <p>Browse our complete collection of off-plan properties</p>
            </div>
            <div class="properties-grid">
                ${propertiesHTML}
            </div>
        `;
        this.updatePagination();
    }

    updatePagination() {
        const pagination = document.getElementById('pagination');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        const pageInfo = document.getElementById('page-info');

        if (!pagination || !prevBtn || !nextBtn || !pageInfo) return;

        const totalPages = Math.ceil(this.filteredProperties.length / this.itemsPerPage);

        if (totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        }

        pagination.style.display = 'flex';
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === totalPages;
        
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, this.filteredProperties.length);
        pageInfo.textContent = `Page ${this.currentPage} of ${totalPages} (${startItem}-${endItem} of ${this.filteredProperties.length})`;
    }

    formatPrice(price) {
        if (price >= 1000000) {
            return `AED ${(price / 1000000).toFixed(1)}M`;
        } else if (price >= 1000) {
            return `AED ${(price / 1000).toFixed(0)}K`;
        } else {
            return `AED ${price}`;
        }
    }
}

// Global functions
function viewPropertyDetails(propertyId) {
    window.location.href = `property-detail.html?id=${propertyId}`;
}

function filterByDeveloper(developer) {
    const developerSelect = document.getElementById('filter-developer');
    if (developerSelect) {
        developerSelect.value = developer;
        developerSelect.dispatchEvent(new Event('change'));
        
        // Scroll to properties section
        const propertiesContainer = document.getElementById('properties-container');
        if (propertiesContainer) {
            propertiesContainer.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing PropertyViewer...');
    propertyViewer = new PropertyViewer();
});
