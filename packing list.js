frappe.ui.form.on('Packing List', {
    calculate_total_quantity: frm => frm.set_value('total_quantity', frm.doc.items.reduce((total, item) => total + (item.qty || 0), 0)),
    before_save: frm => frm.trigger('calculate_total_quantity') && frm.doc.items.forEach(item => frappe.model.set_value(item.doctype, item.name, 'purchase_invoice', frm.doc.purchase_invoice)),
    onload: frm => frm.set_query("purchase_invoice", () => ({ filters: { supplier: frm.doc.supplier, docstatus: ["!=", 2] } })),
    validate: frm => frm.doc.items.forEach(item => item.cntr_no.length !== 11 && frappe.msgprint(__('Invalid container number (11 characters required) for item: ' + item.item_code)) && (validated = false))
});

frappe.ui.form.on('Packing List Item', {
    qty: frm => frm.trigger('calculate_total_quantity'),
    item_code: frm => frm.trigger('calculate_total_quantity'),
});