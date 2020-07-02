# -*- coding: utf-8 -*-

from odoo import api, fields, models, _
from odoo.exceptions import UserError, ValidationError, Warning

class AccountMove(models.Model) :
    _inherit = 'account.move'
    
    def post(self) :
        for record in self.filtered(lambda r: r.company_id.country_id == self.env.ref('base.pe', False)) :
            if record.pos_order_ids.ids and record.partner_id.vat :
                if len(record.partner_id.vat) == 11 :
                    diario = self.env['account.journal'].search([('company_id','in',record.company_id.ids),
                                                                 ('type','=','sale'),
                                                                 ('l10n_latam_use_documents','!=',False),
                                                                 ('l10n_latam_document_type_id','=',self.env.ref('mouse_einvoice_base.pe_01').id)], limit=1)
                    if diario :
                        record.einvoice_journal_id = diario
                        record.partner_id.l10n_latam_identification_type_id = self.env.ref('l10n_pe.it_RUC')
                else :
                    diario = self.env['account.journal'].search([('company_id','in',record.company_id.ids),
                                                                 ('type','=','sale'),
                                                                 ('l10n_latam_use_documents','!=',False),
                                                                 ('l10n_latam_document_type_id','=',self.env.ref('mouse_einvoice_base.pe_03').id)], limit=1)
                    if diario :
                        record.einvoice_journal_id = diario
                        record.partner_id.l10n_latam_identification_type_id = self.env.ref('l10n_pe.it_DNI')
        res = super(AccountMove, self).post()
        return res
