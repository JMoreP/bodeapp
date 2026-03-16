import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import { Product } from '../types';
import { ProductModal } from './ProductModal';

interface InventoryProps {
    products: Product[];
    onAddProduct: (product: Product) => void;
    onEditProduct: (product: Product) => void;
    onDeleteProduct: (id: string) => void;
}

export const Inventory: React.FC<InventoryProps> = ({
    products,
    onAddProduct,
    onEditProduct,
    onDeleteProduct
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const filteredProducts = useMemo(() => {
        return products.filter(
            (p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.sku.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [products, searchQuery]);

    const handleAddNew = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleSave = (product: Product) => {
        if (editingProduct) {
            onEditProduct(product);
        } else {
            onAddProduct(product);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            onDeleteProduct(id);
        }
    };

    return (
        <div className="flex flex-col gap-6 h-full container mx-auto max-w-6xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#111418] dark:text-white flex items-center gap-2">
                        <Package className="text-primary" />
                        Inventory Management
                    </h2>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-1">
                        Add, edit, and manage your products.
                    </p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-content rounded-full font-medium hover:opacity-90 transition-opacity shadow-sm"
                >
                    <Plus size={20} />
                    Add Product
                </button>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-[#e0e0e0] dark:border-border-dark flex-1 flex flex-col overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[#e0e0e0] dark:border-border-dark">
                    <div className="flex w-full xl:w-96 items-stretch rounded-full h-10 border border-[#e0e0e0] dark:border-border-dark bg-background-light dark:bg-background-dark overflow-hidden focus-within:ring-2 focus-within:ring-primary transition-all">
                        <div className="text-text-secondary-light dark:text-text-secondary-dark flex items-center justify-center pl-3 pr-2">
                            <Search size={18} />
                        </div>
                        <input
                            className="flex w-full min-w-0 flex-1 resize-none bg-transparent text-[#111418] dark:text-white focus:outline-0 placeholder:text-text-secondary-light dark:placeholder:text-[#5c7252] text-sm"
                            placeholder="Search inventory..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#f0f2f4] dark:bg-[#1a2b16] sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark border-b border-[#e0e0e0] dark:border-border-dark">Product</th>
                                <th className="px-4 py-3 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark border-b border-[#e0e0e0] dark:border-border-dark">SKU</th>
                                <th className="px-4 py-3 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark border-b border-[#e0e0e0] dark:border-border-dark">Price (USD)</th>
                                <th className="px-4 py-3 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark border-b border-[#e0e0e0] dark:border-border-dark text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-12 text-center text-text-secondary-light dark:text-text-secondary-dark">
                                        <div className="flex flex-col items-center gap-2">
                                            <Package size={48} className="opacity-20" />
                                            <p>No products found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="border-b border-[#e0e0e0] dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium text-[#111418] dark:text-white">
                                                    {product.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                            {product.sku}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-[#111418] dark:text-white">
                                            ${product.priceUsd.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors"
                                                    title="Edit Product"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-1.5 rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/20 transition-colors"
                                                    title="Delete Product"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                editingProduct={editingProduct}
            />
        </div>
    );
};
