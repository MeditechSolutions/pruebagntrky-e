odoo.define('sh_pos_secondary.screens', function(require) {
    "use strict";
   
    //var gui = require('point_of_sale.gui');
    var models = require('point_of_sale.models');
    //var core = require('web.core');
    var PosBaseWidget = require('point_of_sale.BaseWidget');
    var DB = require('point_of_sale.DB');
    //var concurrency = require('web.concurrency');
    //var utils = require('web.utils');
    //var field_utils = require('web.field_utils');
    
    //var Mutex = concurrency.Mutex;
    //var round_di = utils.round_decimals;
    //var round_pr = utils.round_precision;
    //var QWeb = core.qweb;
    //var _t = core._t;
    
    var SuperDB = DB.prototype;
    var SuperPosBaseWidget = PosBaseWidget.prototype;
    
    models.load_models({
       model: 'res.currency',
       fields: ['name','symbol','position','rounding','rate'],
       loaded: function(self, currencies){
           self.currency = currencies[0];
           if (self.currency.rounding > 0 && self.currency.rounding < 1) {
               self.currency.decimals = Math.ceil(Math.log(1.0 / self.currency.rounding) / Math.log(10));
           } else {
               self.currency.decimals = 0;
           }
    
           self.company_currency = currencies[1];
           self.db.add_currencies(currencies);
       },
     
    });
    models.load_fields('product.pricelist',['currency_id']);
    
    DB.include({
       init: function(options) {
           this._super(options);
           this.currencies = [];
           this.currency_by_id = {};
       },
    
       add_currencies: function(currencies) {
           if (!currencies instanceof Array) {
               currencies = [currencies];
           }
           for (var i = 0, len = currencies.length; i < len; i++) {
               
               var currency = currencies[i];
               this.currencies.push(currency);
               this.currency_by_id[currency.id] = currency
           
           }
       },
     
    });
    
    PosBaseWidget.include({
       convert_currency: function(from_currency, currency, amount){
               if (parseFloat(currency.rate) > 0.0 && parseFloat(from_currency.rate) > 0.0){
                   amount = parseFloat(amount) * (parseFloat(currency.rate)/parseFloat(from_currency.rate))
                   return amount
               }else{
                   return amount
               }
               
           },
    
        format_currency: function(amount,precision){
           var currency_id = this.pos.get_order().pricelist.currency_id[0]
           var currency = this.pos.db.currency_by_id[currency_id]
           
           var from_currency_id = this.pos.config.currency_id[0]
           var from_currency = this.pos.db.currency_by_id[from_currency_id]
           
           amount = this.convert_currency(from_currency, currency,amount)
           amount = this.format_currency_no_symbol(amount,precision);
           
           if (currency.position === 'after') {
               return amount + ' ' + (currency.symbol || '');
           } else {
               return (currency.symbol || '') + ' ' + amount;
           }
       },
       format_currency_no_symbol: function(amount, precision) {
           var currency_id = this.pos.get_order().pricelist.currency_id[0]
           
           var currency = this.pos.db.currency_by_id[currency_id]
           var decimals = currency.decimals || 2;
    
           if (precision && this.pos.dp[precision] !== undefined) {
               decimals = this.pos.dp[precision];
           }
    
           if (typeof amount === 'number') {
               amount = round_di(amount,decimals).toFixed(decimals);
               amount = field_utils.format.float(round_di(amount, decimals), {digits: [69, decimals]});
           }
    
           return amount;
       },
       
    });
    
    //DB = DB.extend({
    //    init: function(options) {
    //        SuperPosModel.init.call(this, options);
    //        this.currencies = [];
    //        this.currency_by_id = {};
    //    },
    //});
    //
    //DB.include({
    //    add_currencies: function(currencies) {
    //        if (!currencies instanceof Array) {
    //            currencies = [currencies];
    //        }
    //        for (var i = 0; i < currencies.length; i++) {
    //            var currency = currencies[i];
    //            this.currencies.push(currency);
    //            this.currency_by_id[currency.id] = currency;
    //        }
    //    },
    //});
    //
    //models.load_models({
    //    model: 'res.currency',
    //    fields: ['name', 'symbol', 'position', 'rounding', 'rate'],
    //    loaded: function(self, currencies) {
    //        self.currency = currencies[0];
    //        if (self.currency.rounding > 0 && self.currency.rounding < 1) {
    //            self.currency.decimals = Math.ceil(Math.log(1.0 / self.currency.rounding) / Math.log(10));
    //        } else {
    //            self.currency.decimals = 0;
    //        }
    //        self.company_currency = currencies[1];
    //        self.db.add_currencies(currencies);
    //    },
    //});
    //
    //models.load_fields('product.pricelist',['currency_id']);
    //
    //PosBaseWidget = PosBaseWidget.extend({
    //    convert_currency: function(from_currency, currency, amount) {
    //        if (parseFloat(currency.rate) > 0.0 && parseFloat(from_currency.rate) > 0.0) {
    //            amount = parseFloat(amount) * (parseFloat(currency.rate) / parseFloat(from_currency.rate));
    //        }
    //        return amount;
    //    },
    //    format_currency_no_symbol: function(amount, precision) {
    //        var currency_id = this.pos.get_order().pricelist.currency_id[0];
    //        var currency = this.pos.db.currency_by_id[currency_id];
    //        if (this.pos && this.pos.currency) {
    //            this.pos.currency = currency;
    //        }
    //        var amount = SuperPosBaseWidget.format_currency_no_symbol.call(this, amount, precision);
    //        return amount;
    //    },
    //    format_currency: function(amount, precision) {
    //        var currency_id = this.pos.get_order().pricelist.currency_id[0];
    //        var currency = this.pos.db.currency_by_id[currency_id];
    //        var from_currency_id = this.pos.config.currency_id[0];
    //        var from_currency = this.pos.db.currency_by_id[from_currency_id];
    //        if (this.pos && this.pos.currency) {
    //            this.pos.currency = currency;
    //        }
    //        amount = this.convert_currency(from_currency, currency, amount);
    //        amount = SuperPosBaseWidget.format_currency.call(this, amount, precision);
    //        return amount;
    //    },
    //});
});