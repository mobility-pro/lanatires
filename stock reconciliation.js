let calculate_difference_quantity = frm => frm.doc.items.forEach(item => (item.quantity_difference)?
    frm.set_value('difference_quantity',  (frm.doc.difference_quantity||0) + flt(item.quantity_difference)):0);
frappe.ui.form.on('Stock Reconciliation Item', {
    quantity_difference: calculate_difference_quantity,
    item_code: calculate_difference_quantity
});