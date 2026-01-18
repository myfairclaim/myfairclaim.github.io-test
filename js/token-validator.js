/**
 * MyFairClaim Token Validator
 * Version: 2.1 - AJAX Method (Compatible with existing HTML structure)
 * 
 * Validates access tokens by calling WordPress AJAX endpoint
 * Used by: CFG, IRG, IDG HTML tools on testing.myfairclaim.com
 * API: myfairclaim.com/staging/wp-admin/admin-ajax.php
 */

(function() {
    'use strict';
    
    console.log('🔒 MyFairClaim Token Validator v2.1 loaded');
    
    // Configuration
    const CONFIG = {
        AJAX_ENDPOINT: 'https://myfairclaim.com/staging/wp-admin/admin-ajax.php',
        ACTION: 'validate_token'
    };
    
    /**
     * Get token from URL parameter
     */
    function getTokenFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        console.log('Token from URL:', token ? token.substring(0, 20) + '...' : 'NONE');
        
        return token;
    }
    
    /**
     * Validate token via AJAX endpoint
     */
    function validateToken(token) {
        console.log('🔍 Validating token...');
        
        if (!token) {
            showAccessDenied('No access token provided. Please check your email for the correct link.');
            return;
        }
        
        // Loading screen is already showing by default
        console.log('Loading screen visible...');
        
        // Build AJAX URL
        const url = `${CONFIG.AJAX_ENDPOINT}?action=${CONFIG.ACTION}&token=${encodeURIComponent(token)}`;
        
        console.log('Calling AJAX endpoint:', url.substring(0, 100) + '...');
        
        // Make AJAX request
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit'
        })
        .then(response => {
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return response.json();
        })
        .then(data => {
            console.log('Validation response:', data);
            
            if (data.success && data.data && data.data.valid) {
                // Token is valid
                console.log('✅ Token valid!');
                console.log('Tier:', data.data.tier);
                console.log('Email:', data.data.customer_email);
                console.log('Expires:', data.data.expiration_date);
                console.log('Access count:', data.data.access_count);
                
                showToolContent();
            } else {
                // Token is invalid
                const message = data.data && data.data.message 
                    ? data.data.message 
                    : 'Invalid access token. Please check your email for the correct link.';
                
                console.log('❌ Token invalid:', message);
                showAccessDenied(message);
            }
        })
        .catch(error => {
            console.error('❌ Validation error:', error);
            showAccessDenied('Unable to validate access token. Please try again or contact support.');
        });
    }
    
    /**
     * Show access denied message
     */
    function showAccessDenied(message) {
        const loadingScreen = document.getElementById('loading-screen');
        const toolContent = document.getElementById('tool-content');
        
        console.log('Showing access denied message');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            loadingScreen.innerHTML = `
                <div style="text-align: center; font-family: 'Outfit', Arial, sans-serif; max-width: 500px; padding: 40px 20px;">
                    <div style="width: 80px; height: 80px; margin: 0 auto 24px; background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <svg xmlns="http://www.w3.org/2000/svg" style="width: 40px; height: 40px; color: #dc2626;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 style="color: #0f172a; font-size: 28px; font-weight: 700; margin-bottom: 16px;">Access Denied</h2>
                    <p style="color: #64748b; font-size: 16px; margin-bottom: 32px; line-height: 1.6;">${message}</p>
                    <a href="https://myfairclaim.com/pricing" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: transform 0.2s;">View Pricing & Purchase</a>
                </div>
            `;
        }
        
        if (toolContent) {
            toolContent.classList.add('hidden');
        }
    }
    
    /**
     * Show tool content
     */
    function showToolContent() {
        const loadingScreen = document.getElementById('loading-screen');
        const toolContent = document.getElementById('tool-content');
        
        console.log('Showing tool content...');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            console.log('✅ Loading screen hidden');
        }
        
        if (toolContent) {
            toolContent.classList.remove('hidden');
            console.log('✅ Tool content displayed');
        } else {
            console.error('❌ Tool content container not found!');
        }
    }
    
    /**
     * Initialize validator
     */
    function init() {
        console.log('🚀 Initializing token validator...');
        
        // Check if required elements exist
        const loadingScreen = document.getElementById('loading-screen');
        const toolContent = document.getElementById('tool-content');
        
        if (!loadingScreen || !toolContent) {
            console.error('❌ Required HTML elements not found!');
            console.error('Expected: <div id="loading-screen"> and <div id="tool-content">');
            return;
        }
        
        console.log('✅ HTML structure verified');
        
        // Get token and validate
        const token = getTokenFromURL();
        validateToken(token);
    }
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
