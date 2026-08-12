import { BlogArticle } from './types';
import caraMenghitungLeadsYangHilang from './cara-menghitung-leads-yang-hilang';
import leadRoutingAdalah from './lead-routing-adalah';
import checklistAuditKebocoranLeads from './checklist-audit-kebocoran-leads';
import slaFollowUpLeads from './sla-follow-up-leads';
import mqlVsSql from './mql-vs-sql';
import spreadsheetVsCrmSalesMarketing from './spreadsheet-vs-crm-sales-marketing';
import integrasiWhatsappBusinessCrm from './integrasi-whatsapp-business-crm';
import templateLaporanRoiCampaign from './template-laporan-roi-campaign';
import kesalahanUmumIntegrasiSalesMarketing from './kesalahan-umum-integrasi-sales-marketing';
import caraMigrasiDariSpreadsheetKeCrm from './cara-migrasi-dari-spreadsheet-ke-crm';

export const blogArticles: BlogArticle[] = [
    caraMenghitungLeadsYangHilang,
    leadRoutingAdalah,
    checklistAuditKebocoranLeads,
    slaFollowUpLeads,
    mqlVsSql,
    spreadsheetVsCrmSalesMarketing,
    integrasiWhatsappBusinessCrm,
    templateLaporanRoiCampaign,
    kesalahanUmumIntegrasiSalesMarketing,
    caraMigrasiDariSpreadsheetKeCrm,
];

export function getArticleBySlug(slug: string): BlogArticle | undefined {
    return blogArticles.find((a) => a.slug === slug);
}
