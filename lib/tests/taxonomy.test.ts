/**
 * TAXONOMY UTILITY TESTS
 * 
 * Test suite for verifying taxonomy normalization helpers,
 * geographic lookups, and industry breadcrumb generation.
 */

import {
    INDUSTRY_TAXONOMY,
    GEOGRAPHIC_TAXONOMY,
    ROLE_TAXONOMY,
    normalizeIndustry,
    normalizeLocation,
    getIndustryBreadcrumb
} from '../utils/taxonomy';

/**
 * @testcase Taxonomy Data Integrity
 * @description Verifies that taxonomy objects contain expected top-level categories.
 */
const testTaxonomyDataIntegrity = () => {
    console.log("Running Taxonomy Data Integrity...");
    
    const expectedIndustries = ["TECHNOLOGY", "FINANCE", "HEALTHCARE", "MANUFACTURING", "EDUCATION", "HORECA"];
    const actualIndustries = Object.keys(INDUSTRY_TAXONOMY);
    const allPresent = expectedIndustries.every(i => actualIndustries.includes(i));
    
    if (allPresent && actualIndustries.length === expectedIndustries.length) {
        console.log("PASS: INDUSTRY_TAXONOMY contains all expected sectors.");
    } else {
        console.error("FAIL: INDUSTRY_TAXONOMY sectors mismatch.", actualIndustries);
    }

    // Geographic
    const provinces = Object.keys(GEOGRAPHIC_TAXONOMY.INDONESIA);
    if (provinces.includes("DKI_JAKARTA") && provinces.includes("JAWA_BARAT") && provinces.length > 20) {
        console.log("PASS: GEOGRAPHIC_TAXONOMY contains major provinces.");
    } else {
        console.error("FAIL: GEOGRAPHIC_TAXONOMY provinces incomplete.");
    }

    // Roles
    const roleCategories = Object.keys(ROLE_TAXONOMY);
    if (roleCategories.includes("EXECUTIVE") && roleCategories.includes("ENGINEERING")) {
        console.log("PASS: ROLE_TAXONOMY contains expected categories.");
    } else {
        console.error("FAIL: ROLE_TAXONOMY categories missing.");
    }
};

/**
 * @testcase normalizeIndustry Exact Match
 * @description Verifies that known industry keywords normalize correctly.
 */
const testNormalizeIndustryExact = () => {
    console.log("Running normalizeIndustry Exact Match...");
    
    const result = normalizeIndustry("TECHNOLOGY");
    if (result === "TECHNOLOGY") {
        console.log("PASS: 'TECHNOLOGY' normalizes to 'TECHNOLOGY'.");
    } else {
        console.error("FAIL: Expected 'TECHNOLOGY', got:", result);
    }
};

/**
 * @testcase normalizeIndustry Unknown Value
 * @description Verifies that unknown values return "OTHER".
 */
const testNormalizeIndustryUnknown = () => {
    console.log("Running normalizeIndustry Unknown Value...");
    
    const result = normalizeIndustry("SPACE_MINING");
    if (result === "OTHER") {
        console.log("PASS: Unknown industry returns 'OTHER'.");
    } else {
        console.error("FAIL: Expected 'OTHER', got:", result);
    }
};

/**
 * @testcase normalizeLocation City Lookup
 * @description Verifies that a known city name finds its province.
 */
const testNormalizeLocationCity = () => {
    console.log("Running normalizeLocation City Lookup...");
    
    const result = normalizeLocation("Jakarta Pusat");
    if (result.province === "DKI_JAKARTA" && result.city === "Jakarta Pusat") {
        console.log("PASS: 'Jakarta Pusat' maps to DKI_JAKARTA.");
    } else {
        console.error("FAIL: Location lookup incorrect.", result);
    }
};

/**
 * @testcase normalizeLocation Unknown City
 * @description Verifies that unknown locations return empty object.
 */
const testNormalizeLocationUnknown = () => {
    console.log("Running normalizeLocation Unknown City...");
    
    const result = normalizeLocation("Atlantis");
    if (!result.province && !result.city) {
        console.log("PASS: Unknown location returns empty object.");
    } else {
        console.error("FAIL: Expected empty object, got:", result);
    }
};

/**
 * @testcase getIndustryBreadcrumb Known Category
 * @description Verifies that breadcrumb returns [sector, category] pair.
 */
const testGetIndustryBreadcrumbKnown = () => {
    console.log("Running getIndustryBreadcrumb Known Category...");
    
    const result = getIndustryBreadcrumb("SOFTWARE_DEVELOPMENT");
    if (result.length === 2 && result[0] === "TECHNOLOGY" && result[1] === "SOFTWARE_DEVELOPMENT") {
        console.log("PASS: Breadcrumb for SOFTWARE_DEVELOPMENT correct.");
    } else {
        console.error("FAIL: Breadcrumb incorrect.", result);
    }
};

/**
 * @testcase getIndustryBreadcrumb Unknown Category
 * @description Verifies that unknown categories return ["OTHER"].
 */
const testGetIndustryBreadcrumbUnknown = () => {
    console.log("Running getIndustryBreadcrumb Unknown Category...");
    
    const result = getIndustryBreadcrumb("QUANTUM_PHYSICS");
    if (result.length === 1 && result[0] === "OTHER") {
        console.log("PASS: Unknown breadcrumb returns ['OTHER'].");
    } else {
        console.error("FAIL: Expected ['OTHER'], got:", result);
    }
};

/**
 * @testcase normalizeLocation Surabaya Lookup
 * @description Verifies a specific East Java city resolves correctly.
 */
const testNormalizeLocationSurabaya = () => {
    console.log("Running normalizeLocation Surabaya Lookup...");
    
    const result = normalizeLocation("Surabaya");
    if (result.province === "JAWA_TIMUR" && result.city === "Surabaya") {
        console.log("PASS: 'Surabaya' maps to JAWA_TIMUR.");
    } else {
        console.error("FAIL: Location lookup incorrect.", result);
    }
};

// Execute Test Suite
export const runTaxonomyTestSuite = () => {
    console.log("--- STARTING TAXONOMY TEST SUITE ---");
    testTaxonomyDataIntegrity();
    testNormalizeIndustryExact();
    testNormalizeIndustryUnknown();
    testNormalizeLocationCity();
    testNormalizeLocationUnknown();
    testGetIndustryBreadcrumbKnown();
    testGetIndustryBreadcrumbUnknown();
    testNormalizeLocationSurabaya();
    console.log("--- TEST SUITE COMPLETED ---");
};

// Auto-run if in development environment
if (process.env.NODE_ENV === 'development') {
    // runTaxonomyTestSuite();
}
