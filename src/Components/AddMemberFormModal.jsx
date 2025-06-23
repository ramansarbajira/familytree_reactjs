import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi'; // Import close icon

const AddMemberFormModal = ({ isOpen, onClose, onAddMember }) => {
  const initialFormData = {
    email: '',
    countryCode: '+91', // Default for India
    mobile: '',
    password: '', // Consider if this is truly needed for 'member' or 'user' creation
    firstName: '',
    lastName: '',
    profile: '', // Could be a short bio
    gender: '',
    dob: '', // YYYY-MM-DD format
    maritalStatus: '',
    spouseName: '',
    childrenNames: '', // Comma separated
    fatherName: '',
    motherName: '',
    religionId: '', // Would typically be a dropdown fetching from API
    languageId: '', // Would typically be a dropdown fetching from API
    caste: '',
    gothramId: '', // Would typically be a dropdown fetching from API
    kuladevata: '',
    region: '',
    hobbies: '',
    likesDislikes: '',
    favoriteFoods: '',
    contactNumber: '', // Redundant with mobile? Keeping as per payload
    countryId: 91, // Default for India
    address: '',
    bio: '', // Another bio field, consolidating with 'profile' or keeping separate as per payload
    familyCode: 'FAM' + Math.floor(10000 + Math.random() * 90000), // Auto-generate simple one
  };

  const [formData, setFormData] = useState(initialFormData);

  // Reset form when modal opens if it was previously closed
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.mobile) {
      alert('Please fill in required fields: First Name, Last Name, Email, and Mobile.');
      return;
    }
    
    // Convert childrenNames from string to array for easier handling if needed later
    const payload = {
      ...formData,
      childrenNames: formData.childrenNames.split(',').map(name => name.trim()).filter(name => name),
      // Potentially convert religionId, languageId, gothramId to numbers if they are strictly numbers
      religionId: formData.religionId ? parseInt(formData.religionId) : null,
      languageId: formData.languageId ? parseInt(formData.languageId) : null,
      gothramId: formData.gothramId ? parseInt(formData.gothramId) : null,
    };


    console.log('New member data:', payload);
    onAddMember(payload); // Pass data up to parent
    onClose(); // Close modal after submission
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-100 opacity-100 transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Add New Family Member</h2>
          <button
            onClick={onClose}
            className="bg-unset p-2 text-black rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Section: Personal Information */}
          <div className="md:col-span-2 text-lg font-semibold text-gray-700 mb-2 mt-4 border-b pb-2">Personal Information</div>
          <div className="flex flex-col">
            <label htmlFor="firstName" className="text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
            <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange}
              className="p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 transition-colors" required />
          </div>
          <div className="flex flex-col">
            <label htmlFor="lastName" className="text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
            <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange}
              className="p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 transition-colors" required />
          </div>
          <div className="flex flex-col">
            <label htmlFor="gender" className="text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select id="gender" name="gender" value={formData.gender} onChange={handleChange}
              className="p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 transition-colors">
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="dob" className="text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input type="date" id="dob" name="dob" value={formData.dob} onChange={handleChange}
              className="p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 transition-colors" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="maritalStatus" className="text-sm font-medium text-gray-700 mb-1">Marital Status</label>
            <select id="maritalStatus" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}
              className="p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 transition-colors">
              <option value="">Select Status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </div>
          {formData.maritalStatus === 'married' && (
            <div className="flex flex-col">
              <label htmlFor="spouseName" className="text-sm font-medium text-gray-700 mb-1">Spouse Name</label>
              <input type="text" id="spouseName" name="spouseName" value={formData.spouseName} onChange={handleChange}
                className="p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 transition-colors" />
            </div>
          )}
          <div className="flex flex-col md:col-span-2">
            <label htmlFor="childrenNames" className="text-sm font-medium text-gray-700 mb-1">Children Names (Comma-separated)</label>
            <input type="text" id="childrenNames" name="childrenNames" value={formData.childrenNames} onChange={handleChange}
              className="p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 transition-colors" />
          </div>

          {/* Section: Contact Information */}
          <div className="md:col-span-2 text-lg font-semibold text-gray-700 mb-2 mt-6 border-b pb-2">Contact Information</div>
          <div className="flex flex-col">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange}
              className="p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 transition-colors" required />
          </div>
          <div className="flex flex-col">
            <label htmlFor="mobile" className="text-sm font-medium text-gray-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
            <div className="flex">
              <input type="text" name="countryCode" value={formData.countryCode} onChange={handleChange} readOnly // Making it read-only for +91
                className="p-2 border border-gray-300 rounded-l-md bg-gray-100 w-16 text-center focus:outline-none" />
              <input type="tel" id="mobile" name="mobile" value={formData.mobile} onChange={handleChange}
                className="flex-1 p-2 border border-gray-300 rounded-r-md focus:ring-primary-500 focus:border-primary-500 transition-colors" required />
            </div>
          </div>
          <div className="flex flex-col">
            <label htmlFor="contactNumber" className="text-sm font-medium text-gray-700 mb-1">Alternative Contact Number</label>
            <input type="tel" id="contactNumber" name="contactNumber" value={formData.contactNumber} onChange={handleChange}
              className="p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 transition-colors" />
          </div>
          <div className="flex flex-col md:col-span-2">
            <label htmlFor="address" className="text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea id="address" name="address" value={formData.address} onChange={handleChange} rows="2"
              className="p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 transition-colors"></textarea>
          </div>
          {/* Password field - consider if truly necessary for "adding a family member" vs "user" */}
          <div className="flex flex-col md:col-span-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1">Password (for account access, if applicable)</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange}
              className="p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 transition-colors" />
            <p className="text-xs text-gray-500 mt-1">
              *Only set if this member will have a separate login account.
            </p>
          </div>


          {/* Section: Family & Cultural Details */}
          <div className="md:col-span-2 text-lg font-semibold text-gray-700 mb-2 mt-6 border-b pb-2">Family & Cultural Details</div>
          <div className="flex flex-col">
            <label htmlFor="fatherName" className="text-sm font-medium text-gray-700 mb-1">Father's Name</label>
            <input type="text" id="fatherName" name="fatherName" value={formData.fatherName} onChange={handleChange}
              className="p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 transition-colors" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="motherName" className="text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
            <input type="text" id="motherName" name="motherName" value={formData.motherName} onChange={handleChange}
              className="p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 transition-colors" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="religionId" className="text-sm font-medium text-gray-700 mb-1">Religion ID</label>
            <input type="number" id="religionId" name="religionId" value={formData.religionId} onChange={handleChange}
              className="p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 transition-colors" placeholder="e.g., 1 for Hinduism" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="languageId" className="text-sm font-medium text-gray-700 mb-1">Language ID</label>
            <input type="number" id="languageId" name="languageId" value={formData.languageId} onChange={handleChange}
              className="p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 transition-colors" placeholder="e.g., 1 for Tamil" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="caste" className="text-sm font-medium text-gray-700 mb-1">Caste</label>
            <input type="text" id="caste" name="caste" value={formData.caste} onChange={handleChange}
              className="p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 transition-colors" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="gothramId" className="text-sm font-medium text-gray-700 mb-1">Gothram ID</label>
            <input type="number" id="gothramId" name="gothramId" value={formData.gothramId} onChange={handleChange}
              className="p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 transition-colors" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="kuladevata" className="text-sm font-medium text-gray-700 mb-1">Kuladevata</label>
            <input type="text" id="kuladevata" name="kuladevata" value={formData.kuladevata} onChange={handleChange}
              className="p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 transition-colors" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="region" className="text-sm font-medium text-gray-700 mb-1">Region</label>
            <input type="text" id="region" name="region" value={formData.region} onChange={handleChange}
              className="p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 transition-colors" />
          </div>

          {/* Section: Other Details */}
          <div className="md:col-span-2 text-lg font-semibold text-gray-700 mb-2 mt-6 border-b pb-2">Other Details</div>
          <div className="flex flex-col md:col-span-2">
            <label htmlFor="profile" className="text-sm font-medium text-gray-700 mb-1">Profile / Bio</label>
            <textarea id="profile" name="profile" value={formData.profile} onChange={handleChange} rows="3"
              className="p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="A short introduction or background about the member."></textarea>
          </div>
          <div className="flex flex-col md:col-span-2">
            <label htmlFor="bio" className="text-sm font-medium text-gray-700 mb-1">Additional Bio</label>
            <textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows="3"
              className="p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="Any other relevant details."></textarea>
          </div>
          <div className="flex flex-col md:col-span-2">
            <label htmlFor="hobbies" className="text-sm font-medium text-gray-700 mb-1">Hobbies</label>
            <textarea id="hobbies" name="hobbies" value={formData.hobbies} onChange={handleChange} rows="2"
              className="p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 transition-colors"></textarea>
          </div>
          <div className="flex flex-col md:col-span-2">
            <label htmlFor="likesDislikes" className="text-sm font-medium text-gray-700 mb-1">Likes & Dislikes</label>
            <textarea id="likesDislikes" name="likesDislikes" value={formData.likesDislikes} onChange={handleChange} rows="2"
              className="p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 transition-colors"></textarea>
          </div>
          <div className="flex flex-col md:col-span-2">
            <label htmlFor="favoriteFoods" className="text-sm font-medium text-gray-700 mb-1">Favorite Foods</label>
            <textarea id="favoriteFoods" name="favoriteFoods" value={formData.favoriteFoods} onChange={handleChange} rows="2"
              className="p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 transition-colors"></textarea>
          </div>

          {/* Family Code (read-only for display) */}
          <div className="flex flex-col md:col-span-2">
            <label htmlFor="familyCode" className="text-sm font-medium text-gray-700 mb-1">Family Code</label>
            <input type="text" id="familyCode" name="familyCode" value={formData.familyCode} readOnly
              className="p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none" />
            <p className="text-xs text-gray-500 mt-1">This code is auto-generated for your family. (Can be made editable if required)</p>
          </div>

          {/* Form Actions */}
          <div className="md:col-span-2 flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-md transition-colors font-medium"
            >
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberFormModal;