class PropertyDetailViewer {
    constructor() {
        this.property = null;
        this.init();
    }

    async init() {
        await this.loadProperty();
        this.setupEventListeners();
    }

    async loadProperty() {
        try {
            // Get property ID from URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const propertyId = urlParams.get('id');
            
            if (!propertyId) {
                this.showError('No property ID provided');
                return;
            }

            // Load all properties and find the specific one
            const response = await fetch('data.json');
            const properties = await response.json();
            this.property = properties.find(p => p.id == propertyId);

            if (!this.property) {
                this.showError('Property not found');
                return;
            }

            this.renderProperty();
        } catch (error) {
            console.error('Error loading property:', error);
            this.showError('Error loading property details');
        }
    }

    setupEventListeners() {
        // Modal functionality
        const modal = document.getElementById('photoModal');
        const closeBtn = document.querySelector('.close');

        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };

        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    }

    renderProperty() {
        const container = document.getElementById('property-detail');
        
        container.innerHTML = `
            <div class="property-header">
                <h1 class="property-title">${this.property.title}</h1>
                <div class="property-location">
                    <i class="fas fa-map-marker-alt"></i> ${this.property.region}, ${this.property.cityName}
                </div>
                
                <div class="property-stats">
                    <div class="stat-item">
                        <div class="stat-value">${this.formatPrice(this.property.price)}</div>
                        <div class="stat-label">Starting Price</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${this.property.newParam?.totalUnits || 'N/A'}</div>
                        <div class="stat-label">Total Units</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${this.property.newParam?.handoverTime ? new Date(this.property.newParam.handoverTime).toLocaleDateString() : 'TBD'}</div>
                        <div class="stat-label">Handover Date</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${this.property.propertyType.join(', ')}</div>
                        <div class="stat-label">Property Type</div>
                    </div>
                </div>
                
                <div class="property-description">
                    ${this.property.description}
                </div>
            </div>

            <div class="content-grid">
                <div class="main-content">
                    <div class="section">
                        <h2 class="section-title">
                            <i class="fas fa-images"></i>
                            Photo Gallery
                        </h2>
                        <div class="photo-gallery">
                            ${this.property.photos.map((photo, index) => `
                                <div class="photo-item" onclick="openPhotoModal('${photo}')">
                                    <img src="${photo}" alt="Property Photo ${index + 1}" onerror="this.style.display='none'">
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="section">
                        <h2 class="section-title">
                            <i class="fas fa-home"></i>
                            Available Units
                        </h2>
                        <div class="units-grid">
                            ${this.renderUnits()}
                        </div>
                    </div>
                </div>

                <div class="sidebar">
                    <div class="section">
                        <h2 class="section-title">
                            <i class="fas fa-building"></i>
                            Developer
                        </h2>
                        <div class="developer-info">
                            <div class="developer-logo">
                                ${this.property.developerLogo ? 
                                    `<img src="${this.property.developerLogo}" alt="${this.property.developer}" onerror="this.parentElement.innerHTML='${this.property.developer.charAt(0)}'">` : 
                                    this.property.developer.charAt(0)
                                }
                            </div>
                            <div class="developer-name">${this.property.developer}</div>
                            <div class="contact-info">
                                <div class="contact-item">
                                    <i class="fas fa-user"></i>
                                    <span>${this.property.agent.name}</span>
                                </div>
                                <div class="contact-item">
                                    <i class="fas fa-phone"></i>
                                    <span>${this.property.agent.phone}</span>
                                </div>
                                <div class="contact-item">
                                    <i class="fas fa-envelope"></i>
                                    <span>${this.property.agent.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <h2 class="section-title">
                            <i class="fas fa-list"></i>
                            Amenities
                        </h2>
                        <div class="amenities-list">
                            ${this.property.amenities.map(amenity => `
                                <div class="amenity-item">${amenity}</div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="section">
                        <h2 class="section-title">
                            <i class="fas fa-credit-card"></i>
                            Payment Plan
                        </h2>
                        <div class="payment-plan">
                            ${this.renderPaymentPlan()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderUnits() {
        if (!this.property.newParam?.floorPlan || this.property.newParam.floorPlan.length === 0) {
            return '<p style="color: #b0b0b0; text-align: center;">No unit details available</p>';
        }

        return this.property.newParam.floorPlan.map(unit => `
            <div class="unit-card">
                <div class="unit-header">
                    <div class="unit-type">${unit.name}</div>
                    <div class="unit-area">${unit.area} sq ft</div>
                </div>
                
                <div class="unit-details">
                    <div class="detail-item">
                        <i class="fas fa-ruler-combined"></i>
                        <span>${unit.area} sq ft</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-bed"></i>
                        <span>${this.extractBedrooms(unit.name)}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-calendar"></i>
                        <span>${this.property.newParam?.handoverTime ? new Date(this.property.newParam.handoverTime).toLocaleDateString() : 'TBD'}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-tag"></i>
                        <span>${unit.price || 'Price on request'}</span>
                    </div>
                </div>

                ${unit.imgUrl && unit.imgUrl.length > 0 ? `
                    <div class="floor-plan-container">
                        <img src="${unit.imgUrl[0]}" alt="${unit.name} Floor Plan" class="floor-plan-img" onerror="this.style.display='none'">
                        <div class="floor-plan-overlay">
                            <button class="overlay-btn" onclick="calculateROIForUnit('${this.property.id}', '${unit.id}', '${unit.name}', ${unit.price || this.property.price})">
                                <i class="fas fa-calculator"></i>
                                Calculate ROI
                            </button>
                            <button class="overlay-btn secondary" onclick="generatePDFForUnit('${this.property.id}', '${unit.id}', '${unit.name}', ${unit.price || this.property.price})">
                                <i class="fas fa-file-pdf"></i>
                                Generate PDF
                            </button>
                        </div>
                    </div>
                ` : ''}

                <button class="select-unit-btn" onclick="selectUnit('${this.property.id}', '${unit.id}', '${unit.name}')">
                    <i class="fas fa-check"></i> Select This Unit
                </button>
            </div>
        `).join('');
    }

    renderPaymentPlan() {
        if (!this.property.newParam?.paymentPlan) {
            return '<p style="color: #b0b0b0; text-align: center;">Payment plan not available</p>';
        }

        try {
            const paymentPlan = JSON.parse(this.property.newParam.paymentPlan);
            const steps = [
                { label: 'Booking', percentage: paymentPlan.one || 0 },
                { label: 'Construction', percentage: paymentPlan.two || 0 },
                { label: 'Handover', percentage: paymentPlan.three || 0 },
                { label: 'Post Handover', percentage: paymentPlan.four || 0 }
            ];

            return steps.map(step => `
                <div class="payment-step">
                    <span class="payment-label">${step.label}</span>
                    <span class="payment-percentage">${step.percentage}%</span>
                </div>
            `).join('');
        } catch (error) {
            return '<p style="color: #b0b0b0; text-align: center;">Payment plan details not available</p>';
        }
    }

    extractBedrooms(unitName) {
        const match = unitName.match(/(\d+)/);
        return match ? `${match[1]} BR` : unitName;
    }

    formatPrice(price) {
        if (!price) return 'Price on request';
        if (price >= 1000000) {
            return `AED ${(price / 1000000).toFixed(1)}M`;
        } else if (price >= 1000) {
            return `AED ${(price / 1000).toFixed(0)}K`;
        } else {
            return `AED ${price}`;
        }
    }

    showError(message) {
        document.getElementById('property-detail').innerHTML = `
            <div style="text-align: center; padding: 50px; color: #ff6b6b;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <h2>${message}</h2>
                <a href="index.html" class="back-button" style="margin-top: 20px;">
                    <i class="fas fa-arrow-left"></i>
                    Back to Properties
                </a>
            </div>
        `;
    }
}

// Global functions
function openPhotoModal(photoUrl) {
    const modal = document.getElementById('photoModal');
    const modalImg = document.getElementById('modalImage');
    modalImg.src = photoUrl;
    modal.style.display = 'block';
}

function selectUnit(propertyId, unitId, unitName) {
    const property = window.propertyDetailViewer?.property;
    const unit = property?.newParam?.floorPlan?.find(u => u.id === unitId);
    const unitPrice = unit?.price || property?.price;
    
    const message = `
🏠 **Unit Selected for Client**

**Property:** ${property?.title || propertyId}
**Unit:** ${unitName} (${unitId})
**Price:** ${unitPrice ? `AED ${parseInt(unitPrice).toLocaleString()}` : 'Price on request'}

**Next Steps:**
1. Contact the developer/agent
2. Go to ROI Calculator
3. Create PDF report for client

**Agent Contact:**
- Phone: ${property?.agent?.phone || 'N/A'}
- Email: ${property?.agent?.email || 'N/A'}

**Quick Actions:**
- Calculate ROI for this unit
- Generate investment report
- Schedule viewing
    `;

    const action = confirm(message + '\n\nWould you like to go to the ROI Calculator?');
    
    if (action) {
        // Pass property data to ROI calculator
        const params = new URLSearchParams({
            propertyId: propertyId,
            unitId: unitId,
            unitName: unitName,
            price: unitPrice || property?.price || 1000000
        });
        window.location.href = `roi-calculator.html?${params.toString()}`;
    }
}

// Global functions for floor plan hover actions
function calculateROIForUnit(propertyId, unitId, unitName, price) {
    // Navigate to ROI calculator with unit data
    const params = new URLSearchParams({
        propertyId: propertyId,
        unitId: unitId,
        unitName: unitName,
        price: price || 1000000
    });
    window.location.href = `roi-calculator.html?${params.toString()}`;
}

function generatePDFForUnit(propertyId, unitId, unitName, price) {
    // Create a temporary ROI calculation for PDF generation
    const property = window.propertyDetailViewer?.property;
    const unit = property?.newParam?.floorPlan?.find(u => u.id === unitId);
    
    // Default ROI parameters
    const defaultParams = {
        propertyPrice: price || 1000000,
        downPayment: 20,
        annualAppreciation: 8,
        rentalYield: 6,
        holdingPeriod: 5,
        serviceCharge: 12000
    };

    // Calculate ROI
    const downPayment = defaultParams.propertyPrice * (defaultParams.downPayment / 100);
    const futureValue = defaultParams.propertyPrice * Math.pow(1 + (defaultParams.annualAppreciation / 100), defaultParams.holdingPeriod);
    const capitalGain = futureValue - defaultParams.propertyPrice;
    const annualRentalIncome = defaultParams.propertyPrice * (defaultParams.rentalYield / 100);
    const totalRentalIncome = annualRentalIncome * defaultParams.holdingPeriod;
    const totalServiceCharges = defaultParams.serviceCharge * defaultParams.holdingPeriod;
    const netRentalIncome = totalRentalIncome - totalServiceCharges;
    const totalReturn = capitalGain + netRentalIncome;
    const totalROI = (totalReturn / downPayment) * 100;
    const annualizedROI = Math.pow(1 + (totalROI / 100), 1 / defaultParams.holdingPeriod) - 1;

    // Create PDF content
    const pdfContent = `
        <html>
        <head>
            <title>Investment Analysis Report - ${unitName}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { text-align: center; margin-bottom: 30px; }
                .section { margin-bottom: 25px; }
                .section h2 { color: #4facfe; border-bottom: 2px solid #4facfe; padding-bottom: 5px; }
                .property-info { background: #f0f8ff; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
                .property-title { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 10px; }
                .property-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .detail-item { background: #fff; padding: 10px; border-radius: 5px; border-left: 4px solid #4facfe; }
                .detail-label { font-weight: bold; color: #666; font-size: 12px; }
                .detail-value { font-size: 16px; color: #333; margin-top: 5px; }
                .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                .input-item { background: #f5f5f5; padding: 15px; border-radius: 8px; }
                .input-label { font-weight: bold; color: #333; margin-bottom: 5px; }
                .input-value { font-size: 18px; color: #4facfe; }
                .result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .result-item { background: #e8f4fd; padding: 20px; border-radius: 10px; text-align: center; }
                .result-label { font-weight: bold; color: #333; margin-bottom: 10px; }
                .result-value { font-size: 24px; color: #4facfe; font-weight: bold; }
                .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Investment Analysis Report</h1>
                <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="property-info">
                <div class="property-title">${property?.title || 'Property'}</div>
                <div class="property-details">
                    <div class="detail-item">
                        <div class="detail-label">Unit Type</div>
                        <div class="detail-value">${unitName}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Location</div>
                        <div class="detail-value">${property?.region}, ${property?.cityName}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Developer</div>
                        <div class="detail-value">${property?.developer}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Handover Date</div>
                        <div class="detail-value">${property?.newParam?.handoverTime ? new Date(property.newParam.handoverTime).toLocaleDateString() : 'TBD'}</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>Investment Parameters</h2>
                <div class="input-grid">
                    <div class="input-item">
                        <div class="input-label">Property Price</div>
                        <div class="input-value">AED ${parseInt(defaultParams.propertyPrice).toLocaleString()}</div>
                    </div>
                    <div class="input-item">
                        <div class="input-label">Down Payment</div>
                        <div class="input-value">${defaultParams.downPayment}%</div>
                    </div>
                    <div class="input-item">
                        <div class="input-label">Annual Appreciation</div>
                        <div class="input-value">${defaultParams.annualAppreciation}%</div>
                    </div>
                    <div class="input-item">
                        <div class="input-label">Rental Yield</div>
                        <div class="input-value">${defaultParams.rentalYield}%</div>
                    </div>
                    <div class="input-item">
                        <div class="input-label">Holding Period</div>
                        <div class="input-value">${defaultParams.holdingPeriod} Years</div>
                    </div>
                    <div class="input-item">
                        <div class="input-label">Annual Service Charge</div>
                        <div class="input-value">AED ${parseInt(defaultParams.serviceCharge).toLocaleString()}</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>Investment Analysis</h2>
                <div class="result-grid">
                    <div class="result-item">
                        <div class="result-label">Initial Investment</div>
                        <div class="result-value">AED ${(downPayment / 1000).toFixed(0)}K</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Future Property Value</div>
                        <div class="result-value">AED ${(futureValue / 1000000).toFixed(1)}M</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Total Rental Income</div>
                        <div class="result-value">AED ${(netRentalIncome / 1000).toFixed(0)}K</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Total ROI</div>
                        <div class="result-value">${totalROI.toFixed(1)}%</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Annualized ROI</div>
                        <div class="result-value">${(annualizedROI * 100).toFixed(1)}%%</div>
                    </div>
                </div>
            </div>

            <div class="footer">
                <p>This report was generated by the Dubai Off-Plan Properties Broker Portal</p>
                <p>For more information, contact your broker or visit our portal</p>
            </div>
        </body>
        </html>
    `;

    // Create a new window with the PDF content
    const printWindow = window.open('', '_blank');
    printWindow.document.write(pdfContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = function() {
        printWindow.print();
        printWindow.close();
    };

    // Show success message
    alert(`PDF report generated for ${unitName}!\n\nThe print dialog will open automatically.\nYou can save as PDF from the print dialog.`);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.propertyDetailViewer = new PropertyDetailViewer();
});
