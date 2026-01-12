/**
 * MyFairClaim Token Validator
 * Version 2.0 - Updated for WordPress API
 */

class MFCTokenValidator {
    constructor(apiEndpoint) {
        this.apiEndpoint = apiEndpoint || 'https://myfairclaim.com/staging/wp-json/mfc/v1/validate-token';
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
            // Updated to use GET with URL parameter
            const response = await fetch(this.apiEndpoint + '?token=' + encodeURIComponent(this.token), {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (response.ok && data.valid) {
