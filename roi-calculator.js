class ROICalculator {
    constructor() {
        this.init();
    }

    init() {
        this.loadPropertyData();
        this.setupEventListeners();
        this.calculateROI(); // Initial calculation
    }

    loadPropertyData() {
        // Get property data from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const propertyId = urlParams.get('propertyId');
        const unitId = urlParams.get('unitId');
        const unitName = urlParams.get('unitName');
        const price = urlParams.get('price');

        if (price) {
            document.getElementById('propertyPrice').value = price;
        }

        if (propertyId && unitName) {
            // Update page title to show property context
            document.title = `ROI Calculator - ${unitName}`;
            
            // Add property context to the header
            const header = document.querySelector('.header p');
            if (header) {
                header.innerHTML = `Calculate potential returns for <strong>${unitName}</strong> investment`;
            }
        }
    }

    setupEventListeners() {
        // Range slider event listeners
        const downPaymentSlider = document.getElementById('downPayment');
        const appreciationSlider = document.getElementById('annualAppreciation');
        const rentalSlider = document.getElementById('rentalYield');

        downPaymentSlider.addEventListener('input', (e) => {
            document.getElementById('downPaymentValue').textContent = e.target.value + '%';
            this.calculateROI();
        });

        appreciationSlider.addEventListener('input', (e) => {
            document.getElementById('appreciationValue').textContent = e.target.value + '%';
            this.calculateROI();
        });

        rentalSlider.addEventListener('input', (e) => {
            document.getElementById('rentalValue').textContent = e.target.value + '%';
            this.calculateROI();
        });

        // Input field event listeners
        const inputs = ['propertyPrice', 'serviceCharge'];
        inputs.forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                this.calculateROI();
            });
        });

        // Select event listener
        document.getElementById('holdingPeriod').addEventListener('change', () => {
            this.calculateROI();
        });
    }

    calculateROI() {
        const propertyPrice = parseFloat(document.getElementById('propertyPrice').value) || 0;
        const downPaymentPercent = parseFloat(document.getElementById('downPayment').value) || 20;
        const annualAppreciation = parseFloat(document.getElementById('annualAppreciation').value) || 8;
        const rentalYield = parseFloat(document.getElementById('rentalYield').value) || 6;
        const holdingPeriod = parseFloat(document.getElementById('holdingPeriod').value) || 5;
        const serviceCharge = parseFloat(document.getElementById('serviceCharge').value) || 0;

        // Calculations
        const downPayment = propertyPrice * (downPaymentPercent / 100);
        const futureValue = propertyPrice * Math.pow(1 + (annualAppreciation / 100), holdingPeriod);
        const capitalGain = futureValue - propertyPrice;
        
        const annualRentalIncome = propertyPrice * (rentalYield / 100);
        const totalRentalIncome = annualRentalIncome * holdingPeriod;
        const totalServiceCharges = serviceCharge * holdingPeriod;
        const netRentalIncome = totalRentalIncome - totalServiceCharges;
        
        const totalReturn = capitalGain + netRentalIncome;
        const totalROI = (totalReturn / downPayment) * 100;
        const annualizedROI = Math.pow(1 + (totalROI / 100), 1 / holdingPeriod) - 1;

        // Update results
        this.updateResults({
            initialInvestment: downPayment,
            futureValue: futureValue,
            totalRental: netRentalIncome,
            totalROI: totalROI,
            annualizedROI: annualizedROI * 100,
            capitalGain: capitalGain,
            capitalGainPercent: (capitalGain / totalReturn) * 100,
            rentalPercent: (netRentalIncome / totalReturn) * 100
        });
    }

    updateResults(results) {
        document.getElementById('initialInvestment').textContent = this.formatCurrency(results.initialInvestment);
        document.getElementById('futureValue').textContent = this.formatCurrency(results.futureValue);
        document.getElementById('totalRental').textContent = this.formatCurrency(results.totalRental);
        document.getElementById('totalROI').textContent = results.totalROI.toFixed(1) + '%';
        document.getElementById('annualizedROI').textContent = results.annualizedROI.toFixed(1) + '%';

        // Update chart
        document.getElementById('capitalGainPercent').textContent = results.capitalGainPercent.toFixed(1) + '%';
        document.getElementById('rentalPercent').textContent = results.rentalPercent.toFixed(1) + '%';

        // Update chart bars
        const capitalGainBar = document.getElementById('capitalGainBar');
        const rentalBar = document.getElementById('rentalBar');
        
        capitalGainBar.style.width = Math.min(results.capitalGainPercent, 100) + '%';
        rentalBar.style.width = Math.min(results.rentalPercent, 100) + '%';
    }

    formatCurrency(amount) {
        if (amount >= 1000000) {
            return `AED ${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `AED ${(amount / 1000).toFixed(0)}K`;
        } else {
            return `AED ${amount.toFixed(0)}`;
        }
    }
}

// Global functions
function calculateROI() {
    // This is handled by the class automatically
}

function generatePDF() {
    const propertyPrice = document.getElementById('propertyPrice').value;
    const downPayment = document.getElementById('downPayment').value;
    const annualAppreciation = document.getElementById('annualAppreciation').value;
    const rentalYield = document.getElementById('rentalYield').value;
    const holdingPeriod = document.getElementById('holdingPeriod').value;
    const serviceCharge = document.getElementById('serviceCharge').value;

    const initialInvestment = document.getElementById('initialInvestment').textContent;
    const futureValue = document.getElementById('futureValue').textContent;
    const totalRental = document.getElementById('totalRental').textContent;
    const totalROI = document.getElementById('totalROI').textContent;
    const annualizedROI = document.getElementById('annualizedROI').textContent;

    // Create PDF content
    const pdfContent = `
        <html>
        <head>
            <title>Investment Analysis Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { text-align: center; margin-bottom: 30px; }
                .section { margin-bottom: 25px; }
                .section h2 { color: #4facfe; border-bottom: 2px solid #4facfe; padding-bottom: 5px; }
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

            <div class="section">
                <h2>Investment Parameters</h2>
                <div class="input-grid">
                    <div class="input-item">
                        <div class="input-label">Property Price</div>
                        <div class="input-value">AED ${parseInt(propertyPrice).toLocaleString()}</div>
                    </div>
                    <div class="input-item">
                        <div class="input-label">Down Payment</div>
                        <div class="input-value">${downPayment}%</div>
                    </div>
                    <div class="input-item">
                        <div class="input-label">Annual Appreciation</div>
                        <div class="input-value">${annualAppreciation}%</div>
                    </div>
                    <div class="input-item">
                        <div class="input-label">Rental Yield</div>
                        <div class="input-value">${rentalYield}%</div>
                    </div>
                    <div class="input-item">
                        <div class="input-label">Holding Period</div>
                        <div class="input-value">${holdingPeriod} Years</div>
                    </div>
                    <div class="input-item">
                        <div class="input-label">Annual Service Charge</div>
                        <div class="input-value">AED ${parseInt(serviceCharge).toLocaleString()}</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>Investment Analysis</h2>
                <div class="result-grid">
                    <div class="result-item">
                        <div class="result-label">Initial Investment</div>
                        <div class="result-value">${initialInvestment}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Future Property Value</div>
                        <div class="result-value">${futureValue}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Total Rental Income</div>
                        <div class="result-value">${totalRental}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Total ROI</div>
                        <div class="result-value">${totalROI}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Annualized ROI</div>
                        <div class="result-value">${annualizedROI}</div>
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
    alert('PDF report generated! The print dialog will open automatically.\n\nYou can save as PDF from the print dialog.');
}

function contactAgent() {
    const message = `
📞 **Contact Agent**

**Available Contact Methods:**
- Phone: +971585177272
- Email: mohannad@sartawiproperties.com

**Best Times to Call:**
- Sunday - Thursday: 9:00 AM - 6:00 PM (GST)
- Friday: 10:00 AM - 2:00 PM (GST)

**What to Prepare:**
- Client investment budget
- Preferred locations
- Timeline for investment
- Any specific requirements

**Next Steps:**
1. Schedule a consultation call
2. Discuss client requirements
3. Arrange property viewings
4. Begin investment process
    `;

    alert(message);
}

function scheduleViewing() {
    const message = `
📅 **Schedule Property Viewing**

**Viewing Options:**
- Virtual Tour (Available immediately)
- Site Visit (By appointment)
- Show Unit Visit (Subject to availability)

**Required Information:**
- Client name and contact details
- Preferred viewing date/time
- Number of attendees
- Specific units of interest

**Contact Details:**
- Phone: +971585177272
- Email: mohannad@sartawiproperties.com

**Viewing Process:**
1. Confirm availability
2. Provide property details
3. Arrange transportation if needed
4. Conduct viewing with agent
5. Follow-up with investment proposal
    `;

    alert(message);
}

// Initialize the calculator
document.addEventListener('DOMContentLoaded', () => {
    new ROICalculator();
});
