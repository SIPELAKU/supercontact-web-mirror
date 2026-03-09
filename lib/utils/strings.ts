// Simple localization utility - no external dependencies

type Language = 'en' | 'id';

interface LocalizedStringsType {
    [key: string]: string;
}

interface StringsData {
    en: LocalizedStringsType;
    id: LocalizedStringsType;
}

class SimpleLocalizedStrings {
    private data: StringsData;
    private currentLanguage: Language = 'id';

    constructor(data: StringsData) {
        this.data = data;
    }

    setLanguage(lang: Language) {
        this.currentLanguage = lang;
    }

    getLanguage(): Language {
        return this.currentLanguage;
    }

    getString(key: string): string {
        return this.data[this.currentLanguage]?.[key] || this.data['en']?.[key] || key;
    }

    // Format string with placeholders like {0}, {1}, etc.
    formatString(str: string, ...values: any[]): string {
        return str.replace(/{(\d+)}/g, (match, index) => {
            return typeof values[index] !== 'undefined' ? String(values[index]) : match;
        });
    }

    // Allow direct property access
    [key: string]: any;
}

// Create proxy to allow direct property access like strings.home
function createLocalizedStrings(data: StringsData): SimpleLocalizedStrings & LocalizedStringsType {
    const instance = new SimpleLocalizedStrings(data);

    return new Proxy(instance, {
        get(target, prop: string) {
            if (prop in target) {
                return (target as any)[prop];
            }
            return target.getString(prop);
        }
    }) as SimpleLocalizedStrings & LocalizedStringsType;
}

export const strings = createLocalizedStrings({
    en: {
        home: "Home",
        product: "Product",
        price: "Price",
        solution: "Solution",
        company: "Company",
        login: "Login",
        sign_in: "Sign In",
        try_now: "Try Now",
        language: "Language",
        dark_mode: "Dark Mode",
        light_mode: "Light Mode",
        // Features Page
        features_subtitle: "Discover the power of SmartSales with our cutting-edge features and tools.",
        safety_title: "Safety",
        safety_desc: "Your safety is our priority. We analyze thousands of calls daily to detect potential fraud and spam callers. Our main goal is to keep you safe by blocking malicious numbers.",
        caller_id_title: "Caller ID",
        caller_id_desc: "You have the right to know who is contacting you! With the Caller ID feature, you can immediately identify unknown callers not in your contacts.",
        multi_platform_title: "Multi-Platform",
        multi_platform_desc: "SmartSales is compatible with personal computers and mobile phones. Visit web.SmartSales.com to learn more.\n\nVisit web.SmartSales.com to search.",
        sms_protection_title: "SMS Spam Protection",
        sms_protection_desc: "Do you want to know who is calling you when your phone is busy or turned off? Did you know that you can also listen to voicemail messages left by callers? Open the app now, configure call forwarding settings, and start taking advantage of the features we offer you.",
        privacy_title: "Data Privacy & Security",
        privacy_desc: "Protecting the privacy of our users is paramount to SmartSales; we uphold the highest level of technical and operational compliance measures under GDPR benchmarks. That's why we've developed a dedicated Privacy Management Center so you have full control over your profile and privacy preferences, where you can easily manage visibility settings, change tags and profile appearances, delete or remove your contact profile listings, and much more.",
        chat_title: "Chat",
        chat_desc: "Use SmartSales Chat for an incredible chat experience! With SmartSales Chat feature, you can chat with enhanced privacy.",

        // Feature: Price Page
        price_title: "Pricing Plans",
        price_subtitle: "All plans include 40+ advanced tools and features to boost your product.\nChoose the best plan to fit your needs.",

        // Pricing Tabs
        price_tab_crm: "Customer Relationship Management",
        price_tab_omni: "Omnichannel",
        price_tab_cc: "Call Center",

        // Plan Cards
        plan_month: "/month",

        // Plan 1: Free Trial
        plan_1_title: "Free Trial",
        plan_1_desc: "Try SmartSales for free with limited features.",
        plan_1_price: "Free",
        plan_1_feat_1: "Up to 100 contacts (hard limit)",
        plan_1_feat_2: "1–2 users per account",
        plan_1_feat_3: "Basic CRM features",
        plan_1_feat_4: "No Data Intelligence access",
        plan_1_feat_5: "No payment & billing system",

        // Plan 2: Enterprise
        plan_2_title: "Exclusive",
        plan_2_desc: "Unlock full power with a customized CRM solution",
        plan_2_price: "Contact Us",
        plan_2_tag: "Recommended",
        plan_2_feat_1: "Unlimited contacts & users",
        plan_2_feat_2: "Full Data Intelligence access",
        plan_2_feat_3: "Custom workflows & automation",
        plan_2_feat_4: "Payment & billing integration",
        plan_2_feat_5: "Dedicated support & onboarding",
        plan_2_date: "/ per contract",
        plan_1_note: "Note:\nQuota will be freed when data is deleted",

        // Trial CTA
        trial_title: "Still unsure? Start with the Free Plan now!",
        trial_subtitle: "Enjoy SmartSales basic features with no time limits and no financial commitment.",
        trial_button: "Start Now",
        trial_wa_interest_msg: "Hi, I'm interested in the free plan",

        // FAQ
        faq_title: "FAQ's",
        faq_subtitle: "Let us help answer the most common questions.",
        faq_q1: "What is the premium package?",
        faq_a1: "The premium package offers exclusive features such as ad-free experience, caller ID details, and more.",
        faq_q2: "Can I change plans?",
        faq_a2: "Yes, you can upgrade or downgrade your plan at any time from your account settings.",
        faq_q3: "Can I buy the premium package via other platforms?",
        faq_a3: "Currently, subscription is available through our website and mobile app.",
        faq_q4: "Can I cancel my subscription anytime?",
        faq_a4: "Yes, you can cancel your subscription at any time. Your benefits will continue until the end of the billing period.",
        faq_q5: "What should I do if I want to ask something?",
        faq_a5: "You can contact our support team via the help center or email us directly.",
        faq_q6: "What is a Verified Business Profile?",
        faq_a6: "A Verified Business Profile allows businesses to display their authentic identity to callers.",

        // Business Page
        business_title: "SmartSales for Business",
        business_subtitle: "Excel in competition with verification services and business profiles to take your business a step further.",
        start_now_button: "Start Now",

        // Solutions
        spam_check_title: "Spam Check",
        spam_check_desc1: "Find out if your customer calls are spam or not by searching their phone numbers. Ensure audience reliability with Spam Check.",
        spam_check_desc2: "Offering support in various fields such as IT firms, customer service, real estate, banks, credit services, e-commerce, insurance, and many more.",

        user_verification_title: "User Verification",
        user_verification_desc1: "Ensures the validity of customer names and your family name information. With user verification services, business fraud risk can be minimized.",
        user_verification_desc2: "This service also supports Banking, Credit Services, E-Commerce, Educational Institutions, and many more.",

        // Web Page
        // Company Page
        company_hero_title: "Your Strategic Partner in Digital Transformation",
        company_hero_desc: "Solvera Indonesia is an innovative information technology company. We are your strategic partner in navigating the digital era, providing innovative technology solutions and expert consultation for sustainable business growth.",
        company_contact_btn: "Contact Us",

        company_vision_title: "We believe technology is the key to your business growth.",
        company_vision_subtitle: "Solvera helps businesses adapt and thrive in the digital era with innovative solutions and effective implementation.",
        company_vis_label: "VISION",
        company_vis_text: "Realizing inclusive and collaborative digital transformation to drive B2B economic growth and open new opportunities for mutual success. We are committed to providing technology solutions that empower businesses and communities through strategic partnerships.",
        company_mis_label: "MISSION",
        company_mis_text: "Building a sustainable digital future in Indonesia as a reliable and innovative technology partner. We are committed to supporting strong and sustainable business growth, and creating meaningful employment opportunities through integrated technology solutions.",

        company_help_title: "Still need help?",
        company_help_subtitle: "Our specialists are always happy to help.\nContact us during standard business hours or email us 24/7 and we'll get back to you.",
        company_btn_community: "Visit Our Community",
        company_btn_contact: "Contact Us",


        // Hero Section
        hero_title: "CRM, Chat & Call Center App to boost sales and business service",
        hero_subtitle: "SmartSales integrates full-funnel customer journey through omnichannel and CRM in one platform for maximum interaction, easy management, and rapid growth.",
        whatsapp_sales_button: "Whatsapp Sales",
        hero_card_total_sales: "Total Sales",
        hero_card_last_6_months: "Last Six Months",
        hero_card_congrats: "Congratulations",
        hero_card_best_seller: "Best seller of the month",
        hero_card_target: "of target",
        hero_card_view_sales: "View Sales",
        wa_interest_msg: "Hi, I'm interested in the product {0}",

        // Web Login / Auth
        web_welcome_title: "Welcome to SmartSales!",
        web_welcome_subtitle: "Please sign-in to your account and start the adventure",
        email_placeholder: "Email",
        password_placeholder: "Password",
        remember_me: "Remember Me",
        forgot_password_link: "Forgot Password?",
        login_button: "Login",
        new_on_platform: "New on our platform?",
        create_account_link: "Create an account",
        or_divider: "or",
        login_with_google: "Login With Google",

        // Forgot Password
        forgot_password_title: "Forgot Password",
        forgot_password_subtitle: "Enter your email and we'll send you instructions to reset your password",
        enter_email_placeholder: "Enter your email",
        send_reset_link_button: "Send Reset Link",
        back_to_login: "Back to login",

        // Reset Password
        reset_password_title: "Reset Password",
        reset_password_subtitle: "Your new password must be different from previously used passwords",
        new_password_placeholder: "New Password",
        confirm_password_placeholder: "Confirm Password",
        set_new_password_button: "Set New Password",


        // Productivity Section
        productivity_title: "One Application For All Your Productivity Needs",
        productivity_subtitle: "SmartSales integrates CRM, Omnichannel, and Deal management into one omnichannel platform. One application for interaction, Management, and growth.",
        prod_omnichannel: "Omnichannel Management",
        prod_omnichannel_desc: "Centralize all channels so that customers will easily understand and fall in love with.",
        prod_campaign: "Campaign Marketing",
        prod_campaign_desc: "Send updates to the market quickly, including new services and features.",
        prod_pipeline: "Sales Pipeline",
        prod_pipeline_desc: "Move your product quickly without having to learn unnecessary features.",
        prod_deal: "Deal Management",
        prod_deal_desc: "Just change the status and see your deal closed with success.",
        prod_ticketing: "Ticketing",
        prod_ticketing_desc: "A simple-to-follow flow with lots of references.",
        prod_cs: "Customer Service",
        prod_cs_desc: "An easy-to-follow doc with lots of references.",

        // Trusted By Section
        trusted_by_title: "Trusted By 1000+ Businesses in Indonesia",
        trusted_by_subtitle: "How SmartSales helps business engineering to find profit, efficiency, and continuous growth.",
        testimonial_1_text: "Handle a consistent and open customer experience to get loyal customers.",
        testimonial_1_author: "Sarah Johnson",
        testimonial_1_role: "Founder of Levi's",
        testimonial_2_text: "This tool deals with work in sumure work. The color, the design, the layout are exactly what we want. The whole package. Excellent work.",
        testimonial_2_author: "Eugene Moore",
        testimonial_2_role: "Chief at Airbnb",
        testimonial_3_text: "At the moment the components have been carefully constructed with the constraints of Interface Foam.",
        testimonial_3_author: "Eve Smith",
        testimonial_3_role: "Founder of Continental",

        // FAQ Section
        faq_section_title: "Frequently Asked Questions",
        faq_section_subtitle: "Browse through these FAQs to find answers to commonly asked questions.",
        faq_q1_text: "What is Omnichannel?",
        faq_a1_text: "Omnichannel is an integration of different communication channels to provide a consistent customer experience.",
        faq_q2_text: "How does the SmartSales application work?",
        faq_a2_text: "SmartSales integrates various communication channels into a single platform for efficient management.",
        faq_q3_text: "Who can use the SmartSales application?",
        faq_a3_text: "Businesses of all sizes, from startups to large enterprises, can use SmartSales.",
        faq_q4_text: "Does SmartSales guarantee security?",
        faq_a4_text: "Yes, we prioritize data security and comply with industry standards.",

        // CTA Section / Work Together
        work_together_title: "Lets work together",
        work_together_subtitle: "Any question or remark? Just write us a message!",
        contact_card_title: "Let's contact with us",
        contact_card_desc: "Share your ideas or requirement with our experts.",
        contact_card_footer: "Looking for more custom work on you business and need anything? Contact us We'd love to help you and provide best solution regardless of requirement complexity.",
        share_ideas_title: "Share your ideas",
        input_full_name: "Full Name",
        input_email_address: "Email Address",
        input_message: "Message",
        send_inquiry: "Send Inquiry",

        // Product Menu
        product_menu_crm: "CRM Application",
        product_menu_omnichannel: "Omnichannel App",
        product_menu_wa: "Whatsapp API",

        pm_crm_sales: "CRM Sales",
        pm_crm_sales_desc: "Automate sales cycle from prospect to deal.",
        pm_crm_services: "CRM Services",
        pm_crm_services_desc: "Accelerate service and improve customer experience.",
        pm_crm_canvassing: "CRM Canvassing",
        pm_crm_canvassing_desc: "Identify potential areas and track customer visits directly.",

        pm_omni_omni: "Omnichannel",
        pm_omni_omni_desc: "One platform to manage chats from various channels.",
        pm_omni_ig: "Instagram API",
        pm_omni_ig_desc: "Accelerate service and improve customer experience.",
        pm_omni_ticket: "Ticket Integration",
        pm_omni_ticket_desc: "Identify potential areas and track customer visits directly.",

        pm_wa_api: "Whatsapp API",
        pm_wa_api_desc: "Optimize interaction with Whatsapp Business API.",
        pm_wa_ads: "Whatsapp Ads",
        pm_wa_ads_desc: "Boost sales on Whatsapp easily.",
        pm_wa_blast: "Whatsapp Blast",
        pm_wa_blast_desc: "Reach thousands of customers automatically.",

        // CRM Sales Page
        crm_sales_hero_badge: "CRM Sales",
        crm_sales_hero_title: "Close More Deals with Sales Automation",
        crm_sales_hero_desc: "Change how your team works. SmartSales CRM Sales automates your entire sales cycle—from managing new prospects to the negotiation stage and closing—in one smart platform.",
        crm_sales_btn_trial: "Start Free Trial",
        crm_sales_btn_demo: "Watch Demo",
        crm_sales_pipeline_title: "Sales Pipeline",
        crm_sales_pipeline_subtitle: "Q3 Target: 85% Achieved",
        crm_sales_card_new_prospects: "NEW PROSPECTS",
        crm_sales_card_negotiation: "NEGOTIATION",
        crm_sales_card_won: "WON",
        crm_sales_follow_up: "Follow up tomorrow",
        crm_sales_closed_won: "Closed Won!",

        crm_sales_features_badge: "CRM SALES FEATURES",
        crm_sales_features_title: "Everything you need to sell faster",
        crm_sales_features_subtitle: "Automate the sales cycle from prospect to successful sale recorded.",
        crm_sales_feat_1_title: "Visual Pipeline Management",
        crm_sales_feat_1_desc: "Monitor prospect movements in real-time. With the Kanban pipeline view, see exactly where prospects are: new, negotiation, or closing.",
        crm_sales_feat_2_title: "Smart Prospect Management",
        crm_sales_feat_2_desc: "Keep all contacts and history in one place. Use custom tags to prioritize the highest potential prospects.",
        crm_sales_feat_3_title: "Task Automation & Follow-Up",
        crm_sales_feat_3_desc: "Schedule tasks for the sales team and set automatic reminders. Ensure no sales opportunities are missed because they were forgotten.",
        crm_sales_feat_4_title: "Analytics & Sales Targets",
        crm_sales_feat_4_desc: "Monitor team performance with real-time reports. Track total sales and conversion rates directly from your intuitive dashboard.",

        crm_sales_why_title: "Why Choose SmartSales CRM Sales?",
        crm_sales_why_subtitle: "Stop wasting time on administrative tasks. Give your team the tools they need to focus on one thing: hitting sales targets.",
        crm_sales_why_list_1_title: "Focus on Sales, Not Admin",
        crm_sales_why_list_1_desc: "Reduce time spent on manual data entry. Let the system manage the workflow.",
        crm_sales_why_list_2_title: "Seamless Team Collaboration",
        crm_sales_why_list_2_desc: "All team members have access to the same data, ensuring consistent communication.",
        crm_sales_why_list_3_title: "Data-Driven Decisions",
        crm_sales_why_list_3_desc: "Identify the most effective strategies based on accurate performance reports.",

        crm_sales_perf_title: "This Month's Performance Summary",
        crm_sales_perf_revenue: "Total Revenue",
        crm_sales_perf_converted: "Converted Prospects",
        crm_sales_perf_win_loss: "Win/Loss Ratio",

        crm_sales_cta_title: "Elevate your business service standards today.",
        crm_sales_cta_desc: "Your customers deserve the best response. Try SmartSales CRM Services now and experience the difference.",
        crm_sales_cta_btn: "Try CRM Services Free",

        crm_services_badge: "CRM Services",
        crm_services_title: "Accelerate Service & Enhance Customer Experience",
        crm_services_desc: "Provide exceptional service without friction. Turn every complaint, question, and interaction into a five-star experience with SmartSales' centralized ticketing system.",
        crm_services_btn_demo: "See How It Works",
        crm_services_dashboard: "Support Dashboard",
        crm_services_sla_target: "Target SLA: 98% Achieved",
        crm_services_all_channels: "All Channels",
        crm_services_new_ticket: "NEW TICKETS",
        crm_services_in_progress: "IN PROGRESS",
        crm_services_resolved: "RESOLVED",

        crm_services_features_badge: "CRM SERVICES FEATURES",
        crm_services_features_title: "Resolve Customer Issues in a Flash",
        crm_services_features_subtitle: "Equipped with cutting-edge tools to help your Customer Service (CS) team respond faster, more accurately, and friendlier.",
        crm_services_feat_1_title: "Centralized Ticketing System",
        crm_services_feat_1_desc: "Convert all interactions from WhatsApp, Instagram, and Email into tickets. Track status and conversation history from a single page without missing anything.",
        crm_services_feat_2_title: "Automated Routing",
        crm_services_feat_2_desc: "Automatically route customer tickets to the most appropriate agent based on their expertise, current shift, or workload.",
        crm_services_feat_3_title: "Smart SLA & Escalation",
        crm_services_feat_3_desc: "Set maximum response time limits (SLA). If a ticket remains unanswered, the system will send an alert or automatically forward it to a supervisor.",
        crm_services_feat_4_title: "Quick Replies",
        crm_services_feat_4_desc: "Resolve frequently asked questions (FAQs) in one click using pre-prepared reply templates, saving your agents' time.",

        crm_services_why_title: "Turn Disappointed Customers into Loyal Ones",
        crm_services_why_subtitle: "Good customer service is your best marketing. SmartSales CRM Services is designed to ensure your team works more productively with less stress.",
        crm_services_why_list_1_title: "Much Faster Response",
        crm_services_why_list_1_desc: "One screen for all platforms eliminates wasted time from opening and closing different apps.",
        crm_services_why_list_2_title: "Increased Customer Satisfaction",
        crm_services_why_list_2_desc: "Greet customers by name and know their previous complaint history without asking them to repeat the story.",
        crm_services_why_list_3_title: "Monitor Agent Performance (CS)",
        crm_services_why_list_3_desc: "Get accurate metrics like average response time, daily ticket volume, and customer satisfaction (CSAT).",

        crm_services_perf_title: "Customer Service Performance",
        crm_services_perf_csat: "Customer Satisfaction (CSAT)",
        crm_services_perf_response: "Average Response",
        crm_services_perf_tickets: "Tickets Resolved",

        crm_services_cta_title: "Ready to Provide the Best Customer Service?",
        crm_services_cta_desc: "Join hundreds of CS teams that have switched to SmartSales CRM Services. Start your free evaluation today.",
        crm_services_cta_btn: "Try CRM Services Free",

        omni_hero_badge: "Omnichannel App",
        omni_hero_title: "One Inbox for All Customer Messages",
        omni_hero_desc: "Stop switching between tabs. Manage WhatsApp, Instagram DM, and other channels in one unified platform. Turn conversations into service or sales tickets with just one click.",
        omni_hero_btn_trial: "Start Free Trial",
        omni_hero_btn_demo: "Watch Demo",

        omni_integ_badge: "OMNICHANNEL APP",
        omni_integ_title: "Full Integration Without Platform Boundaries",
        omni_integ_subtitle: "Be present on the platforms your customers use. Answer faster, gather context, and increase sales conversions.",
        omni_integ_feat1_title: "One Inbox (Omnichannel)",
        omni_integ_feat1_desc: "Manage chats from various channels on a single screen. No need to log into multiple apps to respond to your customers professionally.",
        omni_integ_feat2_title: "Instagram & WhatsApp API Integration",
        omni_integ_feat2_desc: "Reply to Instagram Direct Messages (DM), comments, and official WhatsApp Business messages directly from the SmartSales dashboard in real-time.",
        omni_integ_feat3_title: "Ticket Creation Integration",
        omni_integ_feat3_desc: "Convert complaint messages or prospect inquiries into customer support tickets or sales pipelines automatically, right from the chat panel.",

        omni_collab_title: "Team Collaboration Made Easier and More Efficient",
        omni_collab_subtitle: "Empower your team to respond without overlapping. See who is currently replying to a customer and escalate complex issues to a supervisor.",
        omni_collab_list1_title: "Allocate Chats to Specific Agents",
        omni_collab_list1_desc: "Distribute incoming messages to the right CS or Sales agent automatically (Routing) or manually.",
        omni_collab_list2_title: "Save Conversation History",
        omni_collab_list2_desc: "Don't make customers repeat their stories. All agents can view previous conversation history.",
        omni_collab_list3_title: "Automated Replies (Auto-Reply)",
        omni_collab_list3_desc: "Greet customers instantly even outside working hours. Use templates to answer FAQs with one click.",

        omni_cta_title: "Don't keep your customers waiting.",
        omni_cta_desc: "Centralize all your business communications today. Faster response means happier customers and higher sales.",
        omni_cta_btn: "Try Omnichannel Free",

        // Solution Menu
        sol_menu_industry: "Industry",
        sol_menu_roles: "Roles",

        // Industry Items
        sol_ind_edu: "Education",
        sol_ind_edu_desc: "Manage school management.",
        sol_ind_finance: "Finance",
        sol_ind_finance_desc: "Manage customers easily.",
        sol_ind_health: "Healthcare",
        sol_ind_health_desc: "Manage clinic/hospital management.",
        sol_ind_travel: "Tour & Travel",
        sol_ind_travel_desc: "Easily manage travel agents.",
        sol_ind_hotel: "Hospitality",
        sol_ind_hotel_desc: "Accelerate customer reservations.",
        sol_ind_logistics: "Logistics",
        sol_ind_logistics_desc: "Consolidate delivery reports.",
        sol_ind_fmcg: "FMCG",
        sol_ind_fmcg_desc: "Simplify sales processes.",
        sol_ind_retail: "Retail",
        sol_ind_retail_desc: "Manage inventory recording.",
        sol_ind_it: "Information Technology",
        sol_ind_it_desc: "Customer data synchronization.",
        sol_ind_outsourcing: "Outsourcing",
        sol_ind_outsourcing_desc: "Manage customer interactions.",

        // Roles Items
        sol_role_sales: "Sales",
        sol_role_sales_desc: "Track item sales.",
        sol_role_cs: "Customer Service",
        sol_role_cs_desc: "Manage customer service.",
        sol_role_marketing: "Marketing",
        sol_role_marketing_desc: "Manage product marketing.",
        sol_role_hr: "Human Resource",
        sol_role_hr_desc: "Easily manage employee feedback.",
        sol_role_ops: "Operational",
        sol_role_ops_desc: "Automate operational processes.",

        // Footer Section
        footer_desc: "Manage leads, monitor customer interactions, and boost sales in a smarter, faster, and more integrated way with SmartSales.",
        footer_newsletter_label: "Subscribe to newsletter",
        footer_newsletter_placeholder: "Your email",
        footer_subscribe_btn: "Subscribe",
        footer_col_sales: "SmartSales",
        footer_col_help: "Need Help?",
        footer_col_download: "Download our app",
        footer_new_badge: "New",
        footer_kb: "Knowledge Base",
        footer_guides: "Setup Guides",
        footer_templates: "Templates",
        footer_integrations: "Integrations",
        footer_copyright: "© 2026, SmartSales",
    },
    id: {
        home: "Beranda",
        product: "Produk",
        price: "Harga",
        solution: "Solusi",
        SmartSales_web: "SmartSales web",
        login: "Masuk",
        sign_in: "Masuk",
        try_now: "Coba Sekarang",
        language: "Bahasa",
        dark_mode: "Mode Gelap",
        light_mode: "Mode Terang",
        // Halaman Fitur
        features_subtitle: "Temukan kehebatan SmartSales dengan fitur dan alat canggih kami.",
        safety_title: "Keamanan",
        safety_desc: "Keamanan Anda adalah prioritas kami. Kami menganalisis ribuan panggilan setiap hari untuk mendeteksi potensi penipuan dan penelepon spam. Tujuan utama kami adalah menjaga keamanan Anda dengan memblokir nomor berbahaya.",
        caller_id_title: "ID Penelepon",
        caller_id_desc: "Anda berhak tahu siapa yang menghubungi Anda! Dengan fitur ID Penelepon, Anda dapat segera mengidentifikasi penelepon tak dikenal yang tidak ada di kontak Anda.",
        multi_platform_title: "Multi-Platform",
        multi_platform_desc: "SmartSales kompatibel dengan komputer pribadi dan ponsel. Kunjungi web.SmartSales.com untuk mempelajari lebih lanjut.\n\nKunjungi web.SmartSales.com untuk mencari.",
        sms_protection_title: "Perlindungan Spam SMS",
        sms_protection_desc: "Ingin tahu siapa yang menelepon Anda saat ponsel sibuk atau mati? Tahukah Anda bahwa Anda juga dapat mendengarkan pesan suara yang ditinggalkan penelepon? Buka aplikasinya sekarang, atur pengaturan penerusan panggilan, dan mulai manfaatkan fitur yang kami tawarkan.",
        privacy_title: "Privasi & Keamanan Data",
        privacy_desc: "Melindungi privasi pengguna kami adalah hal terpenting bagi SmartSales; kami menjunjung tinggi tingkat kepatuhan teknis dan operasional tertinggi di bawah tolok ukur GDPR. Itulah sebabnya kami mengembangkan Pusat Manajemen Privasi khusus agar Anda memiliki kendali penuh atas profil dan preferensi privasi Anda, di mana Anda dapat dengan mudah mengelola pengaturan visibilitas, mengubah tag dan tampilan profil, menghapus atau menghilangkan daftar profil kontak Anda, dan banyak lagi.",
        chat_title: "Obrolan",
        chat_desc: "Gunakan Obrolan SmartSales untuk pengalaman mengobrol yang luar biasa! Dengan fitur Obrolan SmartSales, Anda dapat mengobrol dengan privasi yang lebih baik.",

        // Feature: Price Page
        price_title: "Paket Harga",
        price_subtitle: "Semua paket mencakup 40+ alat dan fitur canggih untuk meningkatkan produk Anda.\nPilih paket terbaik sesuai kebutuhan Anda.",

        // Pricing Tabs
        price_tab_crm: "Customer Relationship Management",
        price_tab_omni: "Omnichannel",
        price_tab_cc: "Call Center",

        // Plan Cards
        plan_month: "/bulan",

        // Plan 1: Free Trial
        plan_1_title: "Free Trial",
        plan_1_desc: "Mulai gunakan SmartSales secara gratis dengan batasan penggunaan.",
        plan_1_price: "0",
        plan_1_feat_1: "Hingga 100 kontak (batas maksimum)",
        plan_1_feat_2: "1–2 pengguna per akun",
        plan_1_feat_3: "Fitur CRM dasar",
        plan_1_feat_4: "Tanpa akses Data Intelligence",
        plan_1_feat_5: "Tanpa sistem pembayaran & billing",

        // Plan 2: Enterprise
        plan_2_title: "Exclusive",
        plan_2_desc: "Maksimalkan potensi bisnis Anda dengan solusi CRM yang dapat dikustomisasi.",
        plan_2_price: "Hubungi Kami",
        plan_2_feat_1: "Kontak & pengguna tanpa batas",
        plan_2_feat_2: "Akses penuh ke Data Intelligence",
        plan_2_feat_3: "Workflow & automasi kustom",
        plan_2_feat_4: "Integrasi pembayaran & billing",
        plan_2_feat_5: "Dukungan & onboarding khusus",
        plan_2_date: "/ sesuai kontrak",
        plan_1_note: "Catatan:\nKuota akan bertambah kembali setelah data dihapus",

        // Trial CTA
        trial_title: "Masih ragu? Mulai dengan paket Gratis Sekarang!",
        trial_subtitle: "Nikmati fitur dasar SmartSales tanpa batasan waktu dan tanpa komitmen finansial",
        trial_button: "Mulai Sekarang",
        trial_wa_interest_msg: "Halo, saya tertarik dengan paket free trial",

        // FAQ
        faq_title: "FAQ",
        faq_subtitle: "Biarkan kami membantu menjawab pertanyaan yang paling umum.",
        faq_q1: "Apa itu paket premium?",
        faq_a1: "Paket premium menawarkan fitur eksklusif seperti pengalaman bebas iklan, detail ID penelepon, dan banyak lagi.",
        faq_q2: "Bisakah saya mengubah paket?",
        faq_a2: "Ya, Anda dapat menaikkan atau menurunkan paket Anda kapan saja dari pengaturan akun.",
        faq_q3: "Bisakah saya membeli paket premium lewat platform lain?",
        faq_a3: "Saat ini, langganan tersedia melalui situs web dan aplikasi seluler kami.",
        faq_q4: "Bisakah saya membatalkan langganan kapan saja?",
        faq_a4: "Ya, Anda dapat membatalkan langganan kapan saja. Manfaat Anda akan berlanjut hingga akhir periode penagihan.",
        faq_q5: "Apa yang harus saya lakukan jika ingin menanyakan sesuatu?",
        faq_a5: "Anda dapat menghubungi tim dukungan kami melalui pusat bantuan atau email kami secara langsung.",
        faq_q6: "Apa itu Profil Bisnis Terverifikasi?",
        faq_a6: "Profil Bisnis Terverifikasi memungkinkan bisnis untuk menampilkan identitas asli mereka kepada penelpon.",

        // Halaman Bisnis
        business_title: "SmartSales for Business",
        business_subtitle: "Unggul dalam persaingan dengan layanan verifikasi dan profil bisnis serta buat bisnis Anda selangkah lebih maju.",
        start_now_button: "Start Now",

        // Solusi
        spam_check_title: "Pengecekan Spam",
        spam_check_desc1: "Cari tahu apakah panggilan pelanggan Anda adalah spam atau bukan dengan mencari nomor telepon mereka. Pastikan realibilitas audiens dengan Pengecekan Spam.",
        spam_check_desc2: "menawarkan dukungan dalam berbagai bidang seperti firma IT, layanan pelanggan, real estate, bank, layanan kredit, e-commerce, asuransi dan masih banyak lagi",

        user_verification_title: "Verifikasi Pengguna",
        user_verification_desc1: "Memastikan validitas nama pelanggan dan informasi nama keluarga Anda. Dengan layanan verifikasi pengguna, risiko penipuan bisnis dapat diminimalkan.",
        user_verification_desc2: "Layanan ini juga mendukung Perbankan, Layanan Kredit, E-Commerce, Institusi Pendidikan dan masih banyak lagi.",

        // Halaman Web
        // Halaman Perusahaan
        company_hero_title: "Mitra Strategis Anda Dalam Transformasi Digital",
        company_hero_desc: "Solvera Indonesia adalah perusahaan inovatif di bidang teknologi informasi. Kami adalah mitra strategis Anda dalam mengarungi era digital, menyediakan solusi teknologi inovatif dan konsultasi ahli untuk pertumbuhan bisnis yang berkelanjutan.",
        company_contact_btn: "Hubungi Kami",

        company_vision_title: "Kami yakin teknologi adalah kunci pertumbuhan bisnis Anda.",
        company_vision_subtitle: "Solvera membantu bisnis beradaptasi dan berkembang di era digital dengan solusi inovatif dan implementasi yang efektif.",
        company_vis_label: "VISI",
        company_vis_text: "Mewujudkan transformasi digital yang inklusif dan kolaboratif untuk mendorong pertumbuhan ekonomi B2B dan membuka peluang baru bagi kesuksesan bersama. Kami berkomitmen menyediakan solusi teknologi yang memberdayakan bisnis dan komunitas melalui kemitraan strategis.",
        company_mis_label: "MISI",
        company_mis_text: "Membangun masa depan digital yang berkelanjutan di Indonesia sebagai mitra teknologi yang andal dan inovatif. Kami berkomitmen mendukung pertumbuhan bisnis yang kuat dan berkelanjutan, serta menciptakan peluang kerja yang berarti melalui solusi teknologi terintegrasi.",

        company_help_title: "Masih butuh bantuan?",
        company_help_subtitle: "Spesialis kami selalu senang membantu.\nHubungi kami selama jam kerja standar atau kirim email kepada kami 24/7 dan kami akan menghubungi Anda kembali.",
        company_btn_community: "Kunjungi Komunitas Kami",
        company_btn_contact: "Hubungi Kami",

        // Hero Section
        hero_title: "Aplikasi CRM, Chat & Call Center untuk tingkatkan penjualan dan pelayanan bisnis",
        hero_subtitle: "SmartSales mengintegrasikan full-funnel customer journey melalui omnichannel dan CRM dalam satu platform untuk interaksi maksimal, pengelolaan mudah, dan pertumbuhan cepat.",
        whatsapp_sales_button: "Whatsapp Sales",
        hero_card_total_sales: "Total Penjualan",
        hero_card_last_6_months: "Enam Bulan Terakhir",
        hero_card_congrats: "Selamat",
        hero_card_best_seller: "Penjual terbaik bulan ini",
        hero_card_target: "dari target",
        hero_card_view_sales: "Lihat Penjualan",
        wa_interest_msg: "Halo, saya tertarik dengan product {0}",

        // Web Login / Auth
        web_welcome_title: "Selamat Datang di SmartSales!",
        web_welcome_subtitle: "Silakan masuk ke akun Anda dan mulai petualangan",
        email_placeholder: "Email",
        password_placeholder: "Kata Sandi",
        remember_me: "Ingat Saya",
        forgot_password_link: "Lupa Kata Sandi?",
        login_button: "Masuk",
        new_on_platform: "Baru di platform kami?",
        create_account_link: "Buat akun",
        or_divider: "atau",
        login_with_google: "Masuk Dengan Google",

        // Lupa Kata Sandi
        forgot_password_title: "Lupa Kata Sandi",
        forgot_password_subtitle: "Masukkan email Anda dan kami akan mengirimkan instruksi untuk mengatur ulang kata sandi Anda",
        enter_email_placeholder: "Masukkan email Anda",
        send_reset_link_button: "Kirim Tautan Reset",
        back_to_login: "Kembali ke masuk",

        // Atur Ulang Kata Sandi
        reset_password_title: "Atur Ulang Kata Sandi",
        reset_password_subtitle: "Kata sandi baru Anda harus berbeda dari kata sandi yang digunakan sebelumnya",
        new_password_placeholder: "Kata Sandi Baru",
        confirm_password_placeholder: "Konfirmasi Kata Sandi",
        set_new_password_button: "Atur Kata Sandi Baru",


        // Productivity Section
        productivity_title: "Satu Aplikasi Untuk Semua Kebutuhan Produktivitas Anda",
        productivity_subtitle: "SmartSales mengintegrasikan CRM, Omnichannel, dan Deal yang mendukung produktivitas bisnis Anda. Hasilkan interaksi dan konversi fitur untuk mendukung kinerja Anda dan perusahaan.",
        prod_omnichannel: "Manajemen Omnichannel",
        prod_omnichannel_desc: "Sentralisasi semua channel agar pelanggan dengan mudah mengerti dan jatuh cinta.",
        prod_campaign: "Campaign Marketing",
        prod_campaign_desc: "Kirim update ke pasar dengan cepat, termasuk layanan dan fitur baru.",
        prod_pipeline: "Sales Pipeline",
        prod_pipeline_desc: "Gerakkan produk Anda dengan cepat tanpa harus mempelajari fitur yang tidak perlu.",
        prod_deal: "Manajemen deal",
        prod_deal_desc: "Hanya ubah status dan lihat deal Anda closed with success.",
        prod_ticketing: "Ticketing",
        prod_ticketing_desc: "Alur simple-to-follow dengan banyak referensi.",
        prod_cs: "Customer Service",
        prod_cs_desc: "Dokumen easy-to-follow dengan banyak referensi.",

        // Trusted By Section
        trusted_by_title: "Dipercaya Oleh 1000+ Bisnis di Indonesia",
        trusted_by_subtitle: "Bagaimana SmartSales membantu bisnis teknik untuk menemukan profit, efisiensi waktu, dan kekuatan batasan",
        testimonial_1_text: "Menangani pengalaman pelanggan yang konsisten dan terbuka untuk mendapatkan pelanggan setia.",
        testimonial_1_author: "Sarah Johnson",
        testimonial_1_role: "Pendiri Levi's",
        testimonial_2_text: "Alat ini menangani pekerjaan di sumure work. Warna, desain, layout persis seperti yang kita inginkan. Paket lengkap. Kerja bagus.",
        testimonial_2_author: "Eugene Moore",
        testimonial_2_role: "Chief di Airbnb",
        testimonial_3_text: "Saat ini komponen telah dikonstruksi dengan hati-hati dengan batasan Interface Foam.",
        testimonial_3_author: "Eve Smith",
        testimonial_3_role: "Pendiri Continental",

        // FAQ Section
        faq_section_title: "Pertanyaan yang Sering Ditanyakan",
        faq_section_subtitle: "Telusuri FAQ ini untuk menemukan jawaban atas pertanyaan yang sering diajukan.",
        faq_q1_text: "Apa itu Omnichannel?",
        faq_a1_text: "Omnichannel adalah integrasi antara saluran komunikasi yang berbeda untuk memberikan pengalaman yang konsisten kepada pelanggan.",
        faq_q2_text: "Bagaimana cara aplikasi SmartSales bekerja?",
        faq_a2_text: "SmartSales mengintegrasikan berbagai saluran komunikasi ke dalam satu platform untuk pengelolaan yang efisien.",
        faq_q3_text: "Siapa saja yang bisa menggunakan aplikasi SmartSales?",
        faq_a3_text: "Bisnis dari semua ukuran, dari startup hingga perusahaan besar, dapat menggunakan SmartSales.",
        faq_q4_text: "Apakah SmartSales terjamin keamanannya?",
        faq_a4_text: "Ya, kami memprioritaskan keamanan data dan mematuhi standar industri.",

        // CTA Section / Work Together
        work_together_title: "Mari bekerja sama",
        work_together_subtitle: "Ada pertanyaan atau saran? Cukup kirimkan pesan kepada kami",
        contact_card_title: "Hubungi kami",
        contact_card_desc: "Bagikan ide atau kebutuhan Anda dengan pakar kami.",
        contact_card_footer: "Mencari pekerjaan khusus lainnya untuk bisnis Anda atau membutuhkan sesuatu? Hubungi kami. Kami akan senang membantu Anda dan memberikan solusi terbaik tanpa memandang kompleksitas kebutuhan Anda.",
        share_ideas_title: "Bagikan ide Anda",
        input_full_name: "Nama Lengkap",
        input_email_address: "Alamat Email",
        input_message: "Pesan",
        send_inquiry: "Kirim Pertanyaan",

        // Product Menu
        product_menu_crm: "Aplikasi CRM",
        product_menu_omnichannel: "Aplikasi Omnichannel",
        product_menu_wa: "Whatsapp API",

        pm_crm_sales: "CRM Sales",
        pm_crm_sales_desc: "Otomatisasi siklus penjualan mulai prospek hingga penjualan",
        pm_crm_services: "CRM Services",
        pm_crm_services_desc: "Percepat pelayanan dan tingkatkan pengalaman pelanggan lebih baik.",
        pm_crm_canvassing: "CRM Canvassing",
        pm_crm_canvassing_desc: "Identifikasi wilayah potensial, dan pantau kunjungan pelanggan secara langsung.",

        pm_omni_omni: "Omnichannel",
        pm_omni_omni_desc: "Satu platform untuk kelola chat dari berbagai saluran",
        pm_omni_ig: "Instagram API",
        pm_omni_ig_desc: "Percepat pelayanan dan tingkatkan pengalaman pelanggan lebih baik.",
        pm_omni_ticket: "Ticket Creation Integration",
        pm_omni_ticket_desc: "Identifikasi wilayah potensial, dan pantau kunjungan pelanggan secara langsung.",

        pm_wa_api: "Whatsapp API",
        pm_wa_api_desc: "Optimalkan interaksi dengan Whatsapp Business API",
        pm_wa_ads: "Whatsapp Ads",
        pm_wa_ads_desc: "Tingkatkan penjualan di Whatsapp lebih mudah",
        pm_wa_blast: "Whatsapp Blast",
        pm_wa_blast_desc: "Jangkau ribuan pelanggan secara otomatis",

        // CRM Sales Page
        crm_sales_hero_badge: "CRM Sales",
        crm_sales_hero_title: "Tutup Lebih Banyak Deal dengan Otomatisasi Penjualan",
        crm_sales_hero_desc: "Ubah cara tim Anda bekerja. SmartSales CRM Sales mengotomatiskan seluruh siklus penjualan Anda—dari mengelola prospek baru hingga tahap negosiasi dan closing—dalam satu platform yang cerdas.",
        crm_sales_btn_trial: "Mulai Uji Coba Gratis",
        crm_sales_btn_demo: "Tonton Demo",
        crm_sales_pipeline_title: "Sales Pipeline",
        crm_sales_pipeline_subtitle: "Q3 Target: 85% Achieved",
        crm_sales_card_new_prospects: "PROSPEK BARU ({0})",
        crm_sales_card_negotiation: "NEGOSIASI ({0})",
        crm_sales_card_won: "BERHASIL ({0})",
        crm_sales_follow_up: "Follow up besok",
        crm_sales_closed_won: "Closed Won!",

        crm_sales_features_badge: "FITUR CRM SALES",
        crm_sales_features_title: "Semua yang Anda butuhkan untuk jualan lebih cepat",
        crm_sales_features_subtitle: "Otomatisasi siklus penjualan mulai dari prospek hingga penjualan berhasil dicatat.",
        crm_sales_feat_1_title: "Manajemen Pipeline Visual",
        crm_sales_feat_1_desc: "Pantau pergerakan prospek secara real-time. Dengan tampilan pipeline Kanban, lihat jelas mana prospek baru, negosiasi, atau closing.",
        crm_sales_feat_2_title: "Manajemen Prospek Cerdas",
        crm_sales_feat_2_desc: "Simpan seluruh kontak dan riwayat dalam satu tempat. Gunakan custom tags untuk memprioritaskan prospek paling potensial.",
        crm_sales_feat_3_title: "Otomatisasi Tugas & Follow-Up",
        crm_sales_feat_3_desc: "Jadwalkan tugas untuk tim sales dan atur pengingat otomatis. Pastikan tidak ada peluang penjualan yang terabaikan karena lupa.",
        crm_sales_feat_4_title: "Analitik & Target Penjualan",
        crm_sales_feat_4_desc: "Pantau performa tim dengan laporan real-time. Lacak total penjualan dan rasio konversi langsung dari dasbor intuitif Anda.",

        crm_sales_why_title: "Mengapa Memilih SmartSales CRM Sales?",
        crm_sales_why_subtitle: "Berhenti membuang waktu untuk urusan administratif. Berikan tim Anda alat yang mereka butuhkan untuk fokus pada satu hal: mencapai target penjualan.",
        crm_sales_why_list_1_title: "Fokus pada Penjualan, Bukan Admin",
        crm_sales_why_list_1_desc: "Kurangi waktu untuk data entry manual. Biarkan sistem yang mengatur alur kerjanya.",
        crm_sales_why_list_2_title: "Kolaborasi Tim yang Mulus",
        crm_sales_why_list_2_desc: "Semua anggota tim memiliki akses ke data yang sama, memastikan komunikasi konsisten.",
        crm_sales_why_list_3_title: "Keputusan Berbasis Data",
        crm_sales_why_list_3_desc: "Identifikasi strategi paling efektif berdasarkan laporan kinerja yang akurat.",

        crm_sales_perf_title: "Ringkasan Performa Bulan Ini",
        crm_sales_perf_revenue: "Total Pendapatan",
        crm_sales_perf_converted: "Prospek Dikonversi",
        crm_sales_perf_win_loss: "Rasio Win/Loss",

        crm_sales_cta_title: "Tingkatkan standar pelayanan bisnis Anda hari ini.",
        crm_sales_cta_desc: "Pelanggan Anda pantas mendapatkan respons terbaik. Coba SmartSales CRM Services sekarang dan rasakan bedanya.",
        crm_sales_cta_btn: "Coba CRM Services Gratis",

        crm_services_badge: "CRM Services",
        crm_services_title: "Percepat Pelayanan & Tingkatkan Pengalaman Pelanggan",
        crm_services_desc: "Berikan layanan yang luar biasa tanpa hambatan. Ubah setiap keluhan, pertanyaan, dan interaksi menjadi pengalaman bintang lima dengan sistem ticketing terpusat dari SmartSales.",
        crm_services_btn_demo: "Lihat Cara Kerjanya",
        crm_services_dashboard: "Support Dashboard",
        crm_services_sla_target: "Target SLA: 98% Tercapai",
        crm_services_all_channels: "Semua Channel",
        crm_services_new_ticket: "TIKET BARU",
        crm_services_in_progress: "SEDANG DIPROSES",
        crm_services_resolved: "SELESAI",

        crm_services_features_badge: "FITUR CRM SERVICES",
        crm_services_features_title: "Selesaikan Masalah Pelanggan dalam Sekejap",
        crm_services_features_subtitle: "Dilengkapi alat mutakhir untuk membantu tim Customer Service (CS) Anda merespons lebih cepat, akurat, dan ramah.",
        crm_services_feat_1_title: "Sistem Tiket Terpusat",
        crm_services_feat_1_desc: "Ubah semua interaksi dari WhatsApp, Instagram, dan Email menjadi tiket. Lacak status dan histori percakapan dari satu halaman tanpa ada yang terlewat.",
        crm_services_feat_2_title: "Distribusi Otomatis (Routing)",
        crm_services_feat_2_desc: "Teruskan tiket pelanggan secara otomatis ke agen yang paling tepat berdasarkan keahlian, shift kerja, atau beban tugas mereka saat itu.",
        crm_services_feat_3_title: "SLA & Eskalasi Cerdas",
        crm_services_feat_3_desc: "Tetapkan batas waktu respons maksimum (SLA). Jika tiket belum dijawab, sistem akan mengirim peringatan atau meneruskannya ke supervisor secara otomatis.",
        crm_services_feat_4_title: "Balasan Cepat (Quick Replies)",
        crm_services_feat_4_desc: "Selesaikan pertanyaan berulang (FAQ) dalam satu klik menggunakan templat balasan yang sudah disiapkan sebelumnya, menghemat waktu agen Anda.",

        crm_services_why_title: "Ubah Pelanggan Kecewa Menjadi Pelanggan Setia",
        crm_services_why_subtitle: "Layanan pelanggan yang baik adalah marketing terbaik Anda. SmartSales CRM Services didesain untuk memastikan tim Anda bekerja lebih produktif dengan stres yang lebih sedikit.",
        crm_services_why_list_1_title: "Respons Jauh Lebih Cepat",
        crm_services_why_list_1_desc: "Satu layar untuk semua platform menghilangkan waktu terbuang akibat membuka tutup aplikasi berbeda.",
        crm_services_why_list_2_title: "Kepuasan Pelanggan Meningkat",
        crm_services_why_list_2_desc: "Sapa pelanggan dengan nama mereka dan ketahui riwayat keluhan sebelumnya tanpa perlu meminta mereka mengulang cerita.",
        crm_services_why_list_3_title: "Pantau Kinerja Agen (CS)",
        crm_services_why_list_3_desc: "Dapatkan metrik akurat seperti rata-rata waktu respons, volume tiket harian, dan kepuasan pelanggan (CSAT).",

        crm_services_perf_title: "Performa Layanan Pelanggan",
        crm_services_perf_csat: "Customer Satisfaction (CSAT)",
        crm_services_perf_response: "Rata-rata Respons",
        crm_services_perf_tickets: "Tiket Selesai",

        crm_services_cta_title: "Siap Memberikan Layanan Pelanggan Terbaik?",
        crm_services_cta_desc: "Bergabunglah dengan ratusan tim CS yang telah beralih ke SmartSales CRM Services. Mulai evaluasi gratis Anda hari ini.",
        crm_services_cta_btn: "Coba CRM Services Gratis",

        omni_hero_badge: "Aplikasi Omnichannel",
        omni_hero_title: "Satu Kotak Masuk untuk Semua Pesan Pelanggan",
        omni_hero_desc: "Berhenti berpindah antar tab. Kelola WhatsApp, Instagram DM, dan saluran lainnya dalam satu platform terpadu. Ubah percakapan menjadi tiket layanan atau penjualan hanya dengan satu klik.",
        omni_hero_btn_trial: "Mulai Uji Coba Gratis",
        omni_hero_btn_demo: "Tonton Demo",

        omni_integ_badge: "APLIKASI OMNICHANNEL",
        omni_integ_title: "Integrasi Penuh Tanpa Batasan Platform",
        omni_integ_subtitle: "Hadir di platform tempat pelanggan Anda berada. Jawab lebih cepat, kumpulkan konteks, dan tingkatkan konversi penjualan.",
        omni_integ_feat1_title: "Satu Kotak Masuk (Omnichannel)",
        omni_integ_feat1_desc: "Kelola obrolan (chat) dari berbagai saluran dalam satu layar. Tidak perlu lagi login ke banyak aplikasi untuk merespons pelanggan Anda secara profesional.",
        omni_integ_feat2_title: "Integrasi Instagram & WhatsApp API",
        omni_integ_feat2_desc: "Balas Direct Message (DM) Instagram, komentar, dan pesan WhatsApp Business resmi langsung dari dasbor SmartSales secara real-time.",
        omni_integ_feat3_title: "Ticket Creation Integration",
        omni_integ_feat3_desc: "Ubah pesan keluhan atau pertanyaan prospek menjadi tiket dukungan pelanggan (support ticket) atau pipeline sales secara otomatis langsung dari panel obrolan.",

        omni_collab_title: "Kolaborasi Tim Jadi Lebih Mudah dan Efisien",
        omni_collab_subtitle: "Berikan wewenang kepada tim Anda untuk merespons tanpa tumpang tindih. Lihat siapa yang sedang membalas pelanggan dan eskalasikan masalah kompleks ke supervisor.",
        omni_collab_list1_title: "Alokasi Chat ke Agen Spesifik",
        omni_collab_list1_desc: "Distribusikan pesan masuk ke agen CS atau Sales yang tepat secara otomatis (Routing) atau manual.",
        omni_collab_list2_title: "Simpan Riwayat Percakapan",
        omni_collab_list2_desc: "Jangan biarkan pelanggan mengulang ceritanya. Semua agen bisa melihat history percakapan sebelumnya.",
        omni_collab_list3_title: "Balasan Otomatis (Auto-Reply)",
        omni_collab_list3_desc: "Sapa pelanggan seketika meskipun di luar jam kerja. Gunakan template untuk menjawab FAQ dengan satu klik.",

        omni_cta_title: "Jangan biarkan pelanggan Anda menunggu.",
        omni_cta_desc: "Pusatkan semua komunikasi bisnis Anda hari ini. Respons lebih cepat berarti pelanggan yang lebih bahagia dan penjualan yang lebih tinggi.",
        omni_cta_btn: "Coba Omnichannel Gratis",

        // Solution Menu
        sol_menu_industry: "Industri",
        sol_menu_roles: "Roles",

        // Industry Items
        sol_ind_edu: "Pendidikan",
        sol_ind_edu_desc: "Kelola manajemen sekolah",
        sol_ind_finance: "Keuangan",
        sol_ind_finance_desc: "Kelola nasabah dengan mudah",
        sol_ind_health: "Kesehatan",
        sol_ind_health_desc: "Atur manajemen klinik/rumah sakit",
        sol_ind_travel: "Tour & Travel",
        sol_ind_travel_desc: "Mudahkan kelola agen travel",
        sol_ind_hotel: "Perhotelan",
        sol_ind_hotel_desc: "Percepat reservasi pelanggan",
        sol_ind_logistics: "Logistik",
        sol_ind_logistics_desc: "Konsolidasi laporan pengiriman",
        sol_ind_fmcg: "FMCG",
        sol_ind_fmcg_desc: "Sederhanakan proses penjualan",
        sol_ind_retail: "Ritel",
        sol_ind_retail_desc: "Kelola pencatatan inventaris",
        sol_ind_it: "Teknologi Informasi",
        sol_ind_it_desc: "Sinkronasi data pelanggan",
        sol_ind_outsourcing: "Outsourcing",
        sol_ind_outsourcing_desc: "Kelola interaksi pelanggan",

        // Roles Items
        sol_role_sales: "Sales",
        sol_role_sales_desc: "Lacak penjualan barang",
        sol_role_cs: "Customer Service",
        sol_role_cs_desc: "Kelola pelayanan pelanggan",
        sol_role_marketing: "Marketing",
        sol_role_marketing_desc: "Atur pemasaran produk",
        sol_role_hr: "Human Resource",
        sol_role_hr_desc: "Mudah kelola feedback karyawan",
        sol_role_ops: "Operasional",
        sol_role_ops_desc: "Otomatiskan proses operasional",

        // Footer Section
        footer_desc: "Kelola prospek, pantau interaksi pelanggan, dan tingkatkan penjualan dengan cara yang lebih cerdas, cepat, dan terintegrasi bersama SmartSales.",
        footer_newsletter_label: "Berlangganan buletin",
        footer_newsletter_placeholder: "Email Anda",
        footer_subscribe_btn: "Berlangganan",
        footer_col_sales: "SmartSales",
        footer_col_help: "Butuh Bantuan?",
        footer_col_download: "Unduh aplikasi kami",
        footer_new_badge: "Baru",
        footer_kb: "Basis Pengetahuan",
        footer_guides: "Panduan Pengaturan",
        footer_templates: "Templat",
        footer_integrations: "Integrasi",
        footer_copyright: "© 2026, SmartSales",
    }
});
