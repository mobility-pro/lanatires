frappe.ui.form.on("Delivery Note", {
    onload: function(frm) {
        if (frm.is_new()) {
            frm.clear_table('delivery_expenses');
        }
    },
	refresh(frm) {
		frm.set_query("cash_account", "delivery_expenses", () => {
			return {
				filters: {
					account_type: ["in",["Bank","Cash"]],
					company: frm.doc.company,
					is_group: 0
				}
			};
		});
		frm.set_query("expense_account", "delivery_expenses", () => {
			return {
				filters: {
					root_type: "Expense",
					company: frm.doc.company,
					is_group: 0
				}
			};
		});
	}
});

frappe.ui.form.on('Delivery Note Item', {
	production_year: function(frm, cdt, cdn) {
	   let row = locals[cdt][cdn];
	   frappe.db.get_value('Batch', {'production_year': row.production_year, 'item': row.item_code}, 'name', function(value) {
	       frappe.model.set_value(row.doctype, row.name, 'batch_no', value.name);
	   });
	},
	batch_no: function(frm,cdt,cdn){
	    let d = locals[cdt][cdn];
        frappe.call({
				method: "erpnext.stock.doctype.stock_reconciliation.stock_reconciliation.get_stock_balance_for",
				args: {
					item_code: d.item_code,
					warehouse: d.warehouse,
					posting_date: frm.doc.posting_date,
					posting_time: frm.doc.posting_time,
					batch_no: d.batch_no
				},
				callback: function(r) {
				    
        		console.log(r.message.qty)
					frappe.model.set_value(cdt, cdn, "actual_batch_qty", r.message.qty);
    				}
			});	
	},
	discount_percentage_custom: function(frm, cdt, cdn) {
	    $.each(frm.doc.items || [], function(i, row) {
	        row.discount_rate = 0;
	        row.discount_amount_custom = 0;
	    });

	    frm.events.update_additional_discount(frm);
	},
	
	discount_amount_custom: function(frm, cdt, cdn) {
	    frm.events.update_additional_discount(frm);
	},
	
	discount_rate: function(frm, cdt, cdn) {
	    $.each(frm.doc.items || [], function(i, row) {
	        row.discount_amount_custom = 0;
	    });
	    frm.events.update_additional_discount(frm);
	},
	
	qty: function(frm) {
	    frm.events.update_additional_discount(frm);
	},
	
	rate: function(frm) {
	    frm.events.update_additional_discount(frm);
	}
});

frappe.ui.form.on("Delivery Note", {
    update_additional_discount: function(frm) {
        frm.doc.discount_amount = 0;
        frm.doc.apply_discount_on = 'Net Total';
        
        $.each(frm.doc.items || [], function(i, row) {
            if (row.discount_percentage_custom) {
    	        row.discount_amount_custom = 0;
    	        row.discount_rate = (row.rate * row.discount_percentage_custom) / 100;
    	        row.discount_amount_custom = (row.discount_rate * row.qty);
            }
    	    
    	    if (row.discount_rate && !row.discount_percentage_custom) {
    	        row.discount_amount_custom = row.discount_rate * row.qty;
    	    }
    	    
            frm.doc.discount_amount += row.discount_amount_custom;
            if (frm.doc.discount_amount) {
                frm.doc.cost_center = row.cost_center;
            }
        });
        
        frm.refresh_fields();
    },
    
    additional_discount_percentage: function(frm) {
        $.each(frm.doc.items || [], function(i, row) {
            row.discount_amount_custom = (row.amount * frm.doc.additional_discount_percentage) / 100;
        });
        frm.refresh_fields('items');
    },
    
    discount_amount: function(frm) {
        $.each(frm.doc.items || [], function(i, row) {
            row.discount_amount_custom = (row.amount * frm.doc.discount_amount) / frm.doc.net_total;
        });
        frm.refresh_fields('items');
    }
});

frappe.ui.form.on('Delivery Note', {
	before_save: function(frm){
			frappe.db.get_doc("Customer Group", frm.doc.customer_group)
				.then((doc) => {
					frm.set_value({
						"branch": doc.branch
					});
				});
	}
});