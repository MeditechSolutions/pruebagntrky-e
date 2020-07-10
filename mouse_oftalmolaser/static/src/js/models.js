odoo.define('mouse_oftalmolaser.models', function (require) {
    "use strict";
    
    var pos_model = require("point_of_sale.models");
    var SuperPosModel = pos_model.PosModel.prototype;
    var SuperOrder = pos_model.Order.prototype;
    var rpc = require('web.rpc');
    //var screens = require('point_of_sale.screens');
    //var core = require('web.core');
    //var qweb = core.qweb;
    //var session = require('web.session');
    
    pos_model.PosModel = pos_model.PosModel.extend({
        _flush_orders: function(orders, options) {
            var self = this;
            var result, data;
            result = data = SuperPosModel._flush_orders.call(this, orders, options);
            _.each(orders, function(order) {
                if (order.to_invoice) {
                    data.then(function(order_server_id) {
                        rpc.query({
                            model: 'pos.order',
                            method: 'invoice_data_get',
                            //args:[order_server_id, ['account_move']]
                            args: [order_server_id],
                        }).then(function(result_dict) {
                            if (result_dict.length) {
                                let invoice = result_dict[0].account_move;
                                console.log(JSON.stringify(result_dict));
                                self.get_order().invoice_id = invoice[1];
                            }
                        }).catch(function(error) {
                            return result;
                        })
                    });
                }
            });
            return result;
        },
    });
    
    pos_model.Order = pos_model.Order.extend({
        export_for_printing: function() {
            var self = this;
            var receipt = SuperOrder.export_for_printing.call(this);
            if (self.invoice_id) {
                var invoice_id = self.invoice_id;
                receipt.invoice_id = invoice_id;
            }
            return receipt;
        },
    });
    
    //screens.ReceiptScreenWidget.include({
    //    export_for_printing: function () {
    //        var receipt = this._super();
    //        receipt.partner = this.get('client');
    //        receipt.order = this.pos.get_order();
    //        var order = rpc.query({
    //            model: 'pos.order',
    //            method: 'search_read',
    //            domain: [['pos_reference','=',receipt.order['name']], ['company_id','=',session.user_context.allowed_company_ids[0]]],
    //            fields: ['account_move'],
    //        });
    //        if (order.length > 0 && order[0]['account_move']) {
    //            receipt.invoice_id = order[0]['account_move'][0];
    //            receipt.invoice = rpc.query({
    //                model: 'account.move',
    //                method: 'search_read',
    //                domain: [['id','=',receipt.invoice_id]],
    //                fields: ['partner_id', 'l10n_latam_document_type_id', 'number', 'amount_tax', 'amount_untaxed', 'amount_total'],
    //            })[0];
    //            var partner = rpc.query({
    //                model: 'res.partner',
    //                method: 'search_read',
    //                domain: [['id','=',receipt.invoice['partner_id'][0]]],
    //                fields: ['l10n_latam_identification_type_id', 'name', 'registration_name', 'vat', 'commercial_name'],
    //            })[0];
    //            receipt.partner.registration_name = partner['registration_name'];
    //            receipt.partner.registration_name = partner['commercial_name'];
    //            receipt.partner.identification_code = partner['l10n_latam_identification_type_id'] ? partner['l10n_latam_identification_type_id'][1].split(' ')[0] : '';
    //            var document_type = rpc.query({
    //                model: 'l10n_latam.document.type',
    //                method: 'search_read',
    //                domain: [['id','=',receipt.invoice['l10n_latam_document_type_id'][0]]],
    //                fields: ['code'],
    //            });
    //            receipt.invoice.document_code = document_type ? document_type[0]['code'] : '';
    //        }
    //        return receipt;
    //    }
    //})
});
