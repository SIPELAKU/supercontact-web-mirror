/**
 * STRINGS / LOCALIZATION UTILITY TESTS
 * 
 * Test suite for verifying the SimpleLocalizedStrings wrapper
 * including language switching, fallback to English, and formatString.
 */

import { strings } from '../utils/strings';

/**
 * @testcase Default Language is Indonesian
 * @description Verifies that the default language is set to 'id'.
 */
const testDefaultLanguage = () => {
    console.log("Running Default Language is Indonesian...");
    
    const lang = strings.getLanguage();
    if (lang === 'id') {
        console.log("PASS: Default language is 'id'.");
    } else {
        console.error("FAIL: Expected 'id', got:", lang);
    }
};

/**
 * @testcase Indonesian Strings Resolving
 * @description Verifies that key lookups resolve to the Indonesian translation.
 */
const testIndonesianStrings = () => {
    console.log("Running Indonesian Strings Resolving...");
    
    strings.setLanguage('id');
    
    // Direct proxy access
    const home = strings.home;
    if (home === "Beranda") {
        console.log("PASS: strings.home returns 'Beranda' in id.");
    } else {
        console.error("FAIL: Expected 'Beranda', got:", home);
    }
    
    const login = strings.login;
    if (login === "Masuk") {
        console.log("PASS: strings.login returns 'Masuk' in id.");
    } else {
        console.error("FAIL: Expected 'Masuk', got:", login);
    }
};

/**
 * @testcase English Strings Resolving
 * @description Verifies that switching to 'en' returns English translations.
 */
const testEnglishStrings = () => {
    console.log("Running English Strings Resolving...");
    
    strings.setLanguage('en');
    
    const home = strings.home;
    if (home === "Home") {
        console.log("PASS: strings.home returns 'Home' in en.");
    } else {
        console.error("FAIL: Expected 'Home', got:", home);
    }

    const login = strings.login;
    if (login === "Login") {
        console.log("PASS: strings.login returns 'Login' in en.");
    } else {
        console.error("FAIL: Expected 'Login', got:", login);
    }
    
    // Reset back to Indonesian
    strings.setLanguage('id');
};

/**
 * @testcase Language Switching
 * @description Verifies that setLanguage properly toggles between languages.
 */
const testLanguageSwitching = () => {
    console.log("Running Language Switching...");
    
    strings.setLanguage('en');
    const enProduct = strings.product;
    
    strings.setLanguage('id');
    const idProduct = strings.product;
    
    if (enProduct === "Product" && idProduct === "Produk") {
        console.log("PASS: Language switch works correctly.");
    } else {
        console.error("FAIL: Language switch broken. en:", enProduct, "id:", idProduct);
    }
};

/**
 * @testcase formatString Placeholder Replacement
 * @description Verifies that {0}, {1}, etc. are properly replaced.
 */
const testFormatString = () => {
    console.log("Running formatString Placeholder Replacement...");
    
    const template = "Hello {0}, you have {1} messages";
    const result = strings.formatString(template, "John", 5);
    
    if (result === "Hello John, you have 5 messages") {
        console.log("PASS: formatString replaces placeholders correctly.");
    } else {
        console.error("FAIL: Expected formatted string, got:", result);
    }
};

/**
 * @testcase getString Fallback
 * @description Verifies that getString falls back to English and then to the key itself.
 */
const testGetStringFallback = () => {
    console.log("Running getString Fallback...");
    
    strings.setLanguage('id');
    
    // Test a key that doesn't exist returns the key itself
    const missing = strings.getString('non_existent_key_xyz');
    if (missing === 'non_existent_key_xyz') {
        console.log("PASS: Missing key returns the key name as fallback.");
    } else {
        console.error("FAIL: Expected key as fallback, got:", missing);
    }
    
    // Reset
    strings.setLanguage('id');
};

/**
 * @testcase Key Consistency Between Languages
 * @description Verifies that critical keys exist in both en and id.
 */
const testKeyConsistency = () => {
    console.log("Running Key Consistency Between Languages...");
    
    const criticalKeys = ['home', 'product', 'price', 'login', 'sign_in', 'hero_title'];
    
    let allConsistent = true;
    for (const key of criticalKeys) {
        strings.setLanguage('en');
        const en = strings.getString(key);
        strings.setLanguage('id');
        const id = strings.getString(key);
        
        // Both should resolve to a non-key value
        if (en === key || id === key) {
            console.error(`FAIL: Key '${key}' missing in one language. en: "${en}", id: "${id}"`);
            allConsistent = false;
        }
    }
    
    if (allConsistent) {
        console.log("PASS: All critical keys present in both languages.");
    }
    
    // Reset
    strings.setLanguage('id');
};

// Execute Test Suite
export const runStringsTestSuite = () => {
    console.log("--- STARTING STRINGS / LOCALIZATION TEST SUITE ---");
    testDefaultLanguage();
    testIndonesianStrings();
    testEnglishStrings();
    testLanguageSwitching();
    testFormatString();
    testGetStringFallback();
    testKeyConsistency();
    console.log("--- TEST SUITE COMPLETED ---");
};

// Auto-run if in development environment
if (process.env.NODE_ENV === 'development') {
    // runStringsTestSuite();
}
