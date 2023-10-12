frappe.ui.form.on('Purchase Invoice', {
    refresh(frm) {
        frm.doc.bill_date = frm.doc.posting_date
    }, 
    posting_date: function(frm, cdt, cdn) {
        frm.doc.bill_date = frm.doc.posting_date
    }
});


frappe.ui.form.on("Purchase Invoice", "validate", async function(frm){
    await frappe.db.get_doc("Accounts Settings", "Accounts Settings").then((doc)=>{
        if(new Date(doc.acc_frozen_upto) > new Date(frm.doc.posting_date)){
            frappe.throw("accounts are frozen till date " + doc.acc_frozen_upto + " change the doc date to be after this Date");
            frappe.validated = false;
        }
    })
});
