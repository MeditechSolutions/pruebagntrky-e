# -*- coding: utf-8 -*-

from odoo import api, fields, models, _
from odoo.exceptions import UserError, ValidationError, Warning

class AccountMove(models.Model) :
    _inherit = 'account.move'
    
    def post(self) :
        for record in self.filtered(lambda r: r.company_id.country_id == self.env.ref('base.pe')) :
            if record.pos_order_ids.ids :
                vat = record.partner_id.vat
                if vat and vat != vat.strip() :
                    record.partner_id.vat = vat.strip()
                if not vat :
                    record.partner_id.vat = '11111111'
                if len(record.partner_id.vat) == 11 :
                    record.partner_id.l10n_latam_identification_type_id = self.env.ref('l10n_latam_base.it_vat')
                    diario = self.env['account.journal'].search([('company_id','in',record.company_id.ids),
                                                                 ('type','=','sale'),
                                                                 ('l10n_latam_use_documents','!=',False),
                                                                 ('l10n_latam_document_type_id','=',self.env.ref('mouse_einvoice_base.pe_01').id)], limit=1)
                    if diario :
                        record.einvoice_journal_id = diario
                else :
                    if len(record.partner_id.vat) == 8 :
                        record.partner_id.l10n_latam_identification_type_id = self.env.ref('l10n_pe.it_DNI')
                    else :
                        record.partner_id.l10n_latam_identification_type_id = self.env.ref('l10n_latam_base.it_fid')
                    diario = self.env['account.journal'].search([('company_id','in',record.company_id.ids),
                                                                 ('type','=','sale'),
                                                                 ('l10n_latam_use_documents','!=',False),
                                                                 ('l10n_latam_document_type_id','=',self.env.ref('mouse_einvoice_base.pe_03').id)], limit=1)
                    if diario :
                        record.einvoice_journal_id = diario
        res = super(AccountMove, self).post()
        return res
