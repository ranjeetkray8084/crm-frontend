import React, { useState, useEffect } from 'react';
import { useProperties } from '../../../../core/hooks/useProperties';
import { motion } from 'framer-motion';
import { UserPlus, Loader2 } from 'lucide-react'; // Optional icon

const initialForm = {
  propertyName: '',
  type: 'Residential',
  bhk: '',
  unit: '',
  floor: '',
  sizeValue: '',
  sizeUnit: 'sqft',
  status: 'AVAILABLE_FOR_SALE',
  price: '',
  sector: '',
  location: '',
  source: 'Social Media',
  referenceName: '',
  ownerName: '',
  ownerContact: '',
};

const AddPropertyForm = () => {
  const [form, setForm] = useState(initialForm);
  const [showReference, setShowReference] = useState(false);
  const [isBroker, setIsBroker] = useState(false);
  const [disableBhk, setDisableBhk] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user info from localStorage (same as AddLeadForm)
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const companyId = parseInt(localStorage.getItem('companyId'), 10);
  const userId = user.userId || user.id;
  const userRole = user.role;

  // Use the useProperties hook (same pattern as useLeads)
  const { createProperty } = useProperties(companyId, userId, userRole);

  useEffect(() => {
    toggleBhkField(form.type);
    toggleSourceFields(form.source);
  }, [form.type, form.source]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleBhkField = (type) => {
    const disable = ['Office', 'Retail', 'Plot'].includes(type);
    setDisableBhk(disable);
    if (disable) {
      setForm((prev) => ({ ...prev, bhk: '' }));
    }
  };

  const toggleSourceFields = (source) => {
    setShowReference(source === 'Reference');
    setIsBroker(source === 'Broker');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.source === 'Reference' && !form.referenceName.trim()) {
      alert('Please enter the reference name');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      propertyName: form.propertyName,
      type: form.type,
      bhk: disableBhk ? '' : form.bhk,
      // Backend expects size as string; combine value + unit
      size: form.sizeValue ? `${form.sizeValue} ${form.sizeUnit}` : '',
      unitDetails: form.unit || '',
      floor: form.floor || '',
      location: form.location || '',
      status: form.status,
      price: form.price ? Number(form.price) : null,
      sector: form.sector,
      source: form.source,
      referenceName: form.source === 'Reference' ? (form.referenceName || '') : '',
      ownerName: form.ownerName,
      ownerContact: form.ownerContact,
      createdBy: { userId },
    };

    try {
      const result = await createProperty(payload);

      if (result.success) {
        setForm(initialForm);
      } else {
        // Error already shown by executeApiCall in useProperties
      }
    } catch (err) {
      // Error already handled by executeApiCall
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriceLabel = () =>
    ['Office', 'Retail'].includes(form.type) ? 'Lease Amount' : 'Price';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto mt-4 md:mt-10 bg-white rounded-xl shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-green-600 text-white py-4 px-6 flex items-center gap-3">
        <UserPlus className="w-5 h-5" />
        <h2 className="text-lg font-semibold">Add New Property</h2>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 bg-white"
      >
        {/* Property Name */}
        <div>
          <label className="block mb-1 font-medium">Property Name *</label>
          <input
            name="propertyName"
            value={form.propertyName}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block mb-1 font-medium">Type *</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option>Residential</option>
            <option>Retail</option>
            <option>Office</option>
            <option>Plot</option>
          </select>
        </div>

        {/* BHK */}
        <div>
          <label className="block mb-1 font-medium">BHK</label>
          <input
            name="bhk"
            value={form.bhk}
            onChange={handleChange}
            disabled={disableBhk}
            required={!disableBhk}
            placeholder="e.g. 2BHK"
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Unit */}
        <div>
          <label className="block mb-1 font-medium">Unit</label>
          <input
            name="unit"
            value={form.unit}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Floor */}
        <div>
          <label className="block mb-1 font-medium">Floor</label>
          <input
            name="floor"
            value={form.floor}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Size */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <label className="block mb-1 font-medium">Size</label>
            <input
              type="number"
              name="sizeValue"
              value={form.sizeValue}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="w-full sm:w-32">
            <label className="block mb-1 font-medium">Unit</label>
            <select
              name="sizeUnit"
              value={form.sizeUnit}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="sqft">sqft</option>
              <option value="sqyd">sqyd</option>
            </select>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block mb-1 font-medium">Status *</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="AVAILABLE_FOR_SALE">Available for Sale</option>
            <option value="AVAILABLE_FOR_RENT">Available for Rent</option>
            <option value="RENT_OUT">Rented Out</option>
            <option value="SOLD_OUT">Sold Out</option>
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="block mb-1 font-medium">{getPriceLabel()}</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Sector */}
        <div>
          <label className="block mb-1 font-medium">Sector *</label>
          <input
            name="sector"
            value={form.sector}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block mb-1 font-medium">Location</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Source */}
        <div>
          <label className="block mb-1 font-medium">Source *</label>
          <select
            name="source"
            value={form.source}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option>Social Media</option>
            <option>Cold Call</option>
            <option>Project Call</option>
            <option>Reference</option>
            <option>Broker</option>
          </select>
        </div>

        {/* Reference Name */}
        {showReference && (
          <div>
            <label className="block mb-1 font-medium">Reference Name</label>
            <input
              name="referenceName"
              value={form.referenceName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        )}

        {/* Owner / Broker */}
        <div>
          <label className="block mb-1 font-medium">
            {isBroker ? 'Broker Name' : 'Owner Name'}
          </label>
          <input
            name="ownerName"
            value={form.ownerName}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">
            {isBroker ? 'Broker Contact' : 'Owner Contact'}
          </label>
          <input
            name="ownerContact"
            value={form.ownerContact}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

    

        {/* Buttons */}
        <div className="md:col-span-2 flex flex-col-reverse sm:flex-row justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => setForm(initialForm)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded w-full sm:w-auto"
          >
            Cancel
          </button>
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={!isSubmitting ? { scale: 1.02 } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            className="bg-green-600 hover:bg-green-700 disabled:hover:bg-green-600 text-white px-4 py-2 rounded w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Property'
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default AddPropertyForm;
