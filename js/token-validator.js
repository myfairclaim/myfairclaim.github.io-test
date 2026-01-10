/**
 * MyFairClaim Token Validator
 * Version 1.0
 */

class MFCTokenValidator {
    constructor(apiEndpoint) {
        this.apiEndpoint = apiEndpoint || 'https://www.myfairclaim.com/wp-json/mfc/v1/validate-token';
        this.token = this.getTokenFromURL();
        this.customerData = null;
    }
    
    getTokenFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('token');
    }
    
    async validate() {
        if (!this.token) {
            this.showAccessDenied('No access token provided. Please use the link from your confirmation email.');
            return false;
        }
        
        if (!/^MFC_[a-f0-9]{64}$/.test(this.token)) {
            this.showAccessDenied('Invalid token format.');
            return false;
        }
        
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: this.token })
            });
            
            const data = await response.json();
            
            if (response.ok && data.valid) {
                this.customerData = data.customerData;
                this.showToolContent();
                this.prePopulateFields();
                
                if (data.daysRemaining !== null && data.daysRemaining <= 30) {
                    this.showExpirationWarning(data.daysRemaining, data.expiresOn);
                }
                
                return true;
            } else {
                if (data.reason === 'expired') {
                    this.showExpiredMessage(data.expiredOn);
                } else {
                    this.showAccessDenied('Invalid or revoked access token.');
                }
                return false;
            }
            
        } catch (error) {
            console.error('Token validation error:', error);
            this.showAccessDenied('Unable to verify access. Please contact support at 877-503-3247.');
            return false;
        }
    }
    
    showToolContent() {
        const loadingScreen = document.getElementById('loading-screen');
        const toolContent = document.getElementById('tool-content');
        
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (toolContent) {
            toolContent.classList.remove('hidden');
            toolContent.style.display = 'block';
        }
    }
    
    showAccessDenied(message) {
        document.body.innerHTML = `
            <div style="max-width: 600px; margin: 100px auto; padding: 40px; text-align: center; font-family: 'Outfit', Arial, sans-serif;">
                <div style="font-size: 64px; margin-bottom: 20px;">🔒</div>
                <h1 style="color: #E84545; margin-bottom: 20px; font-size: 32px;">Access Denied</h1>
                <p style="color: #666; font-size: 18px; margin-bottom: 30px;">${message}</p>
                <a href="https://www.myfairclaim.com/pricing" 
                   style="display: inline-block; background: #2C5F7C; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    View Pricing & Purchase
                </a>
            </div>
        `;
    }
    
    showExpiredMessage(expiredOn) {
        const expiredDate = new Date(expiredOn).toLocaleDateString();
        document.body.innerHTML = `
            <div style="max-width: 600px; margin: 100px auto; padding: 40px; text-align: center; font-family: 'Outfit', Arial, sans-serif;">
                <div style="font-size: 64px; margin-bottom: 20px;">⏰</div>
                <h1 style="color: #FFA500; margin-bottom: 20px;">Access Expired</h1>
                <p style="color: #666; font-size: 18px;">Your access expired on ${expiredDate}.</p>
                <a href="https://www.myfairclaim.com/extend-access" 
                   style="display: inline-block; background: #2C5F7C; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">
                    Extend Access
                </a>
            </div>
        `;
    }
    
    showExpirationWarning(daysRemaining, expiresOn) {
        const expireDate = new Date(expiresOn).toLocaleDateString();
        const banner = document.createElement('div');
        banner.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; background: linear-gradient(135deg, #FFA500, #FF8C00); color: white; padding: 15px; text-align: center; z-index: 10000;';
        banner.innerHTML = `
            <strong>⚠️ Access Expiring Soon!</strong> 
            Your access expires in <strong>${daysRemaining} days</strong> (${expireDate}).
            <a href="https://www.myfairclaim.com/extend-access" style="color: white; text-decoration: underline; margin-left: 15px; font-weight: bold;">
                Extend for 90 More Days →
            </a>
        `;
        document.body.insertBefore(banner, document.body.firstChild);
    }
    
    prePopulateFields() {
        if (!this.customerData) return;
        
        const fieldMap = {
            'customerName': this.customerData.name,
            'customerEmail': this.customerData.email,
            'customerPhone': this.customerData.phone,
            'vin': this.customerData.vin,
            'vehicleYear': this.customerData.vehicleYear,
            'vehicleMake': this.customerData.vehicleMake,
            'vehicleModel': this.customerData.vehicleModel,
            'mileage': this.customerData.mileage,
            'accidentDate': this.customerData.accidentDate,
            'insuranceCompany': this.customerData.insuranceCompany,
            'claimNumber': this.customerData.claimNumber,
            'repairCost': this.customerData.repairCost,
            'estimatedDV': this.customerData.estimatedDV,
            'stateCode': this.customerData.stateCode
        };
        
        for (const [fieldId, value] of Object.entries(fieldMap)) {
            if (value) {
                const field = document.getElementById(fieldId) || document.querySelector(`[name="${fieldId}"]`);
                if (field) {
                    field.value = value;
                    field.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const validator = new MFCTokenValidator();
    await validator.validate();
});
