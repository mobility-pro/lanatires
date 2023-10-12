var object = {
    "onload": (frm = cur_frm) => {
        frm.set_query("account_paid_from", {filters: {account_type: frm.doc.entry_type,is_group:0,account_currency: 'SAR'} });
        frm.set_query("expense_account", {filters: {account_type: ["Not In", "Cash, Bank"],is_group:0, account_currency: 'SAR'} });
        frm.set_query("charge_account", {filters: {root_type: "Expense", is_group:0, account_currency: 'SAR'} });
        frm.set_query("tax_account", {filters: {account_type: "Tax", is_group:0, account_currency: 'SAR'} });
    },
    "validate": frm => {
        const error = { title: __('Error'), indicator: 'red' };

        if (frm.doc.distribute_expense_by && frm.doc.expense_amount !== frm.doc.total_distributed_expense_amount) {
            error.message = __('Expense Amount does not match Total Distributed Expense Amount (' + flt(frm.doc.expense_amount - frm.doc.total_distributed_expense_amount) + ')');
        } else if (frm.doc.vendor_name && frm.doc.vendor_tax_id.length !== 15 && frm.doc.vendor_tax_id.length !== 0) {
            error.message = __('Please enter a valid Tax ID consisting of 15 characters');
        }

        if (error.message) {
            frappe.msgprint(error);
            frappe.validated = false;
        }
    }
};

['paid_amount','charge_amount','expense_tax_amount',"charge_tax_amount"].forEach( elem =>
  object[elem] = (frm = cur_frm) => frm.set_value("expense_amount", flt(frm.doc.paid_amount - frm.doc.charge_amount - frm.doc.expense_tax_amount -  frm.doc.charge_tax_amount) ) 
);

["charge_amount","tax_rate"].forEach( elem =>{
  var old = function(){};
  if(object[elem])  old = object[elem];
  object[elem] = frm => old() && frm.set_value("charge_tax_amount", flt(frm.doc.charge_amount * frm.doc.tax_rate) / 100);
});


["paid_amount","charge_amount","charge_tax_amount","tax_rate"].forEach( elem =>{
  var old = function(){};
  if(object[elem])  old = object[elem];
  object[elem] = frm => old() && frm.set_value("expense_tax_amount", frm.doc.taxes_and_charges_type === 'Taxes Only Included' || frm.doc.taxes_and_charges_type === 'Taxable Charges and Taxes Included' && !frm.doc.set_tax_amount_manually
        ? flt((frm.doc.paid_amount - frm.doc.charge_amount - frm.doc.charge_tax_amount) * frm.doc.tax_rate / (100 + frm.doc.tax_rate)) : 0);
});

["expense_amount","branch"].forEach( elem =>{
  var old = function(){};
  if(object[elem])  old = object[elem];
  object[elem] = frm => {
    old();
    let total_distributed_expense_amount = flt(0.0);
    if(frm.doc.dimensions){
        frm.doc.dimensions.forEach(dimension => {
            if(dimension.expense_amount) {
                total_distributed_expense_amount += flt(dimension.expense_amount);
            }
        });
    }
    frm.set_value('total_distributed_expense_amount', total_distributed_expense_amount);
  };
});


frappe.ui.form.on("Expense Entry", object);