const Invoice = require('../models/invoiceModel');

const createInvoice = async (invoiceData) => {
    try {
        const invoice = new Invoice(invoiceData);
        return await invoice.save();
    } catch (error) {
        throw new Error('Error creating invoice: ' + error.message);
    }
};

const getInvoiceById = async (id) => {
    try {
        return await Invoice.findById(id);
    } catch (error) {
        throw new Error('Error fetching invoice: ' + error.message);
    }
};

const getAllInvoices = async () => {
    try {
        return await Invoice.find();
    } catch (error) {
        throw new Error('Error fetching invoices: ' + error.message);
    }
};

module.exports = { createInvoice, getInvoiceById, getAllInvoices };