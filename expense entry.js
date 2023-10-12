frappe.ui.form.on("Expense Entry", "onload", function(frm) {
    frm.set_query("account_paid_from", function() {
        return {
            filters: {
                account_type: frm.doc.entry_type,
                is_group:0,
                account_currency: 'SAR'
            }
        };
    });
});

/////////
frappe.ui.form.on("Expense Entry", "onload", function(frm) {
    frm.set_query("expense_account", function() {
        return {
            filters: {
                is_group:0,
                account_currency: 'SAR'
            }
        };
    });
});

/////////
frappe.ui.form.on("Expense Entry", "onload", function(frm) {
    frm.set_query("charge_account", function() {
        return {
            filters: {
                root_type: "Expense",
                is_group:0,
                account_currency: 'SAR'
            }
        };
    });
});

/////////
frappe.ui.form.on("Expense Entry", "onload", function(frm) {
    frm.set_query("tax_account", function() {
        return {
            filters: {
                account_type: "Tax",
                is_group:0,
                account_currency: 'SAR'
            }
        };
    });
});

/////////
frappe.ui.form.on("Expense Entry", "paid_amount", function(frm) {
    calculate_expense_amount(frm);
});

frappe.ui.form.on("Expense Entry", "charge_amount", function(frm) {
    calculate_expense_amount(frm);
});

frappe.ui.form.on("Expense Entry", "expense_tax_amount", function(frm) {
    calculate_expense_amount(frm);
});

frappe.ui.form.on("Expense Entry", "charge_tax_amount", function(frm) {
    calculate_expense_amount(frm);
});

var calculate_expense_amount = function(frm) {
    var expense_amount = flt(frm.doc.paid_amount) - flt(frm.doc.charge_amount) - flt(frm.doc.expense_tax_amount) - flt(frm.doc.charge_tax_amount);
    frm.set_value("expense_amount", expense_amount);
};

//////////
frappe.ui.form.on("Expense Entry", "charge_amount", function(frm) {
    if(frm.doc.taxes_and_charges_type && !frm.doc.set_tax_amount_manually)
    calculate_charge_tax_amount(frm);
});

frappe.ui.form.on("Expense Entry", "tax_rate", function(frm) {
    if(frm.doc.taxes_and_charges_type && !frm.doc.set_tax_amount_manually)
    calculate_charge_tax_amount(frm);
});

var calculate_charge_tax_amount = function(frm) {
    var charge_tax_amount = flt(frm.doc.charge_amount) * flt(frm.doc.tax_rate) / 100 ;
    frm.set_value("charge_tax_amount", charge_tax_amount);
};

/////////
frappe.ui.form.on("Expense Entry", "paid_amount", function(frm) {
    if(frm.doc.taxes_and_charges_type=='Taxes Only Included' || frm.doc.taxes_and_charges_type=='Taxable Charges and Taxes Included' && !frm.doc.set_tax_amount_manually)
    calculate_expense_tax_amount(frm);
});

frappe.ui.form.on("Expense Entry", "charge_amount", function(frm) {
    if(frm.doc.taxes_and_charges_type=='Taxes Only Included' || frm.doc.taxes_and_charges_type=='Taxable Charges and Taxes Included' && !frm.doc.set_tax_amount_manually)
    calculate_expense_tax_amount(frm);
});
frappe.ui.form.on("Expense Entry", "charge_tax_amount", function(frm) {
    if(frm.doc.taxes_and_charges_type=='Taxes Only Included' || frm.doc.taxes_and_charges_type=='Taxable Charges and Taxes Included' && !frm.doc.set_tax_amount_manually)
    calculate_expense_tax_amount(frm);
});

frappe.ui.form.on("Expense Entry", "tax_rate", function(frm) {
    if(frm.doc.taxes_and_charges_type=='Taxes Only Included' || frm.doc.taxes_and_charges_type=='Taxable Charges and Taxes Included' && !frm.doc.set_tax_amount_manually)
    calculate_expense_tax_amount(frm);
});

var calculate_expense_tax_amount = function(frm) {
    var expense_tax_amount = (flt(frm.doc.paid_amount) - flt(frm.doc.charge_amount) - flt(frm.doc.charge_tax_amount)) * (flt(frm.doc.tax_rate)/100) / (1 + flt(frm.doc.tax_rate)/100);
    frm.set_value("expense_tax_amount", expense_tax_amount);
};

/////////
frappe.ui.form.on('Expense Entry', {
    calculate_distributed_expense: frm => {
        let total_distributed_expense_amount = flt(0.0);
        frm.doc.dimensions.forEach(dimension => {
            if(dimension.expense_amount) {
                total_distributed_expense_amount += flt(dimension.expense_amount);
            }
        });
        frm.set_value('total_distributed_expense_amount', total_distributed_expense_amount);
    }
});

frappe.ui.form.on('Expense Entry Dimension', {
    expense_amount: function(frm) {
        frm.trigger('calculate_distributed_expense');
    },
    branch: function(frm) {
        frm.trigger('calculate_distributed_expense');
    }
});

/////////
//frappe.ui.form.on('Expense Entry', {
//  calculate_distributed_charge: frm => {
//      let total_distributed_charge_amount = flt(0.0);
//      frm.doc.dimensions.forEach(dimension => {
//          if(dimension.charge_amount) {
//                total_distributed_charge_amount += flt(dimension.charge_amount);
//          }
//      });
//      frm.set_value('total_distributed_charge_amount', total_distributed_charge_amount);
//  }
//});

//frappe.ui.form.on('Expense Entry Dimension', {
//  charge_amount: function(frm) {
//      frm.trigger('calculate_distributed_charge');
//  },
//  branch: function(frm) {
//      frm.trigger('calculate_distributed_charge');
//  }
//});

///////
frappe.ui.form.on('Expense Entry', 'validate', function(frm) {
    if (frm.doc.distribute_expense_by && frm.doc.expense_amount != frm.doc.total_distributed_expense_amount){
        frappe.msgprint({
            title: __('Error'),
            indicator: 'red',
            message: __('There is a difference between Expense Amount and Total Distributed Expense Amount (' + flt(flt(frm.doc.expense_amount) - flt(frm.doc.total_distributed_expense_amount)) + ')' )
            
        });
        frappe.validated = false;
        
    }
    
});

//////
frappe.ui.form.on('Expense Entry', 'validate', function(frm) {
if (frm.doc.vendor_name && frm.doc.vendor_tax_id.length != 15 && frm.doc.vendor_tax_id.length != 0){
    frappe.msgprint({
    title: __('Error'),
    indicator: 'red',
    message: __('Please enter a valid Tax ID consisting of 15 characters')
});
    frappe.validated = false;
}
});
////////