import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Product } from '../types';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Product) => void;
    editingProduct?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, editingProduct }) => {
    const [name, setName] = useState('');
    const [sku, setSku] = useState('');
    const [priceUsd, setPriceUsd] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (editingProduct) {
                setName(editingProduct.name);
                setSku(editingProduct.sku);
                setPriceUsd(editingProduct.priceUsd.toString());
            } else {
                setName('');
                setSku('');
                setPriceUsd('');
            }
            setError('');
        }
    }, [isOpen, editingProduct]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim() || !sku.trim() || !priceUsd.trim()) {
            setError('Name, SKU, and Price are required fields.');
            return;
        }

        const parsedPrice = parseFloat(priceUsd);
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            setError('Please enter a valid price.');
            return;
        }

        const product: Product = {
            id: editingProduct ? editingProduct.id : Date.now().toString(),
            name: name.trim(),
            sku: sku.trim(),
            priceUsd: parsedPrice,
            quantity: editingProduct ? editingProduct.quantity : 0,
        };

        onSave(product);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b border-[#e0e0e0] dark:border-border-dark">
                    <h2 className="text-xl font-bold text-[#111418] dark:text-white">
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-text-secondary-light hover:text-[#111418] dark:text-text-secondary-dark dark:hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-[#111418] dark:text-white">Product Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Wireless Mouse"
                            className="w-full h-10 px-3 rounded-lg border border-[#e0e0e0] dark:border-border-dark bg-transparent text-[#111418] dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-[#111418] dark:text-white">SKU</label>
                        <input
                            type="text"
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            placeholder="e.g. WM-001"
                            className="w-full h-10 px-3 rounded-lg border border-[#e0e0e0] dark:border-border-dark bg-transparent text-[#111418] dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-[#111418] dark:text-white">Price (USD)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark">$</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={priceUsd}
                                onChange={(e) => setPriceUsd(e.target.value)}
                                placeholder="0.00"
                                className="w-full h-10 pl-8 pr-3 rounded-lg border border-[#e0e0e0] dark:border-border-dark bg-transparent text-[#111418] dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg font-medium text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg font-medium bg-primary text-primary-content hover:opacity-90 transition-opacity"
                        >
                            {editingProduct ? 'Save Changes' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
