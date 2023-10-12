frappe.ui.form.on('Purchase Invoice', {
    refresh(frm) {
        frm.doc.bill_date = frm.doc.posting_date
    }, 
    posting_date: function(frm, cdt, cdn) {
        frm.doc.bill_date = frm.doc.posting_date
    }
});