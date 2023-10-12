frappe.ui.form.on('Packing List', {
	calculate_total_quantity: frm => {
	    let total_quantity = flt(0.0);
	    frm.doc.items.forEach(item => {
	        if(item.qty) {
                total_quantity += flt(item.qty);
	        }
	    });
	    frm.set_value('total_quantity', total_quantity);
	}
});

frappe.ui.form.on('Packing List Item', {
	qty: function(frm) {
	    frm.trigger('calculate_total_quantity');
	},
	item_code: function(frm) {
	    frm.trigger('calculate_total_quantity');
	}
});

frappe.ui.form.on('Packing List', {
	before_save: function(frm) {
	    frm.trigger('calculate_total_quantity');
	}
});

frappe.ui.form.on("Packing List", "onload", function(frm) {
    frm.set_query("purchase_invoice", function() {
        return {
            filters: {
                supplier: frm.doc.supplier,
 				docstatus:["!=", 2]
            }
        };
    });
});

frappe.ui.form.on("Packing List", {
   before_save: function(frm, cdt, cdn) {
        if (frm.doc.purchase_invoice) {
            $.each(frm.doc.items || [], function(i, row) {
                frappe.model.set_value(row.doctype, row.name, 'purchase_invoice', frm.doc.purchase_invoice);
            });
        }   
    }
});

frappe.ui.form.on("Packing List", "validate", function(frm){
        $.each(frm.doc.items, function(idx, item){
            if(item.cntr_no.length != 0 && item.cntr_no.length != 11) {
            msgprint(__('Please enter a valid container no consisting of 11 characters for item (' + item.item_code + ')'));
            validated = false;
            
        }
  });
});