import React, { useState } from 'react';
import { Link, Mail, Copy, Share2, Check, UserPlus, X } from 'lucide-react';

const InviteFamilyMemberModal = ({ onClose }) => {
  const [inviteLink, setInviteLink] = useState('');
  const [email, setEmail] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [activeTab, setActiveTab] = useState('link');

  // Function to generate a dummy invite link
  const generateInviteLink = () => {
    const newLink = `https://familytree.app/join?code=${Math.random().toString(36).substring(2, 15)}`;
    setInviteLink(newLink);
    setIsCopied(false); // Reset copied status
  };

  // Function to simulate sending an email
  const sendInviteByEmail = async (e) => {
    e.preventDefault(); // Prevent default form submission
    if (!email) return; // Do nothing if email is empty

    console.log(`Sending invite to ${email}...`);
    setEmailSent(true); // Show success message
    setEmail(''); // Clear the email input
    setTimeout(() => setEmailSent(false), 3000); // Hide success message after 3 seconds
  };

  // Function to copy the invite link to clipboard
  const copyToClipboard = () => {
    const tempInput = document.createElement('input');
    tempInput.value = inviteLink;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      setIsCopied(true); // Indicate success
      setTimeout(() => setIsCopied(false), 2000); // Reset copied status after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Optionally, show a user-friendly message that copying failed
    }
    document.body.removeChild(tempInput);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center p-4 z-50 font-sans">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md mx-auto relative">
        {/* Header Section */}
        <div className="p-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 bg-white rounded-full p-2 transition-colors shadow"
            aria-label="Close modal"
          >
            <X size={24} /> {/* Using Lucide React X icon */}
          </button>
          
          <div className="flex flex-col items-center text-center">
            {/* Icon for the modal */}
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="text-white" size={28} /> {/* Using Lucide React UserPlus icon */}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Invite Family Members
            </h1>
            <p className="text-gray-500 text-sm max-w-xs">
              Collaborate on your shared family history by inviting relatives
            </p>
          </div>
        </div>

        {/* Tab Navigation Section */}
        <div className="flex px-6 gap-4"> {/* Added gap-4 for spacing between buttons */}
          <button
            onClick={() => setActiveTab('link')}
            // Conditional classes for active/inactive tab styling
            className={`flex-1 py-3 font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 ease-in-out
              ${activeTab === 'link' 
                ? 'bg-gradient-to-r from-primary-500 to-primary-700 text-white shadow-md rounded-t-xl' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-xl'
              }`}
          >
            <Link size={16} /> {/* Using Lucide React Link icon */}
            Share Link
          </button>
          <button
            onClick={() => setActiveTab('email')}
            // Conditional classes for active/inactive tab styling
            className={`flex-1 py-3 font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 ease-in-out
              ${activeTab === 'email' 
                ? 'bg-gradient-to-r from-primary-500 to-primary-700 text-white shadow-md rounded-t-xl' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-xl'
              }`}
          >
            <Mail size={16} /> {/* Using Lucide React Mail icon */}
            Send Email
          </button>
        </div>

        {/* Content Area - conditional based on active tab */}
        <div className="p-6 pt-4 border-t border-gray-100">
          {activeTab === 'link' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="invite-link" className="text-sm font-medium text-gray-700">Invitation Link</label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <input
                      id="invite-link"
                      type="text"
                      readOnly
                      value={inviteLink}
                      placeholder="Generate a link to share"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all pr-12"
                    />
                    {inviteLink && (
                      <button
                        onClick={copyToClipboard}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-600 hover:text-primary-700 transition-colors"
                        title="Copy to clipboard"
                        aria-label="Copy invitation link"
                      >
                        {isCopied ? <Check size={18} /> : <Copy size={18} />} {/* Using Lucide React Check/Copy icons */}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={generateInviteLink}
                    className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-all whitespace-nowrap text-sm"
                  >
                    Generate
                  </button>
                </div>
              </div>
              
              {/* Note about link expiration */}
              <div className="bg-primary-50 p-3 rounded-lg">
                <p className="text-xs text-primary-800">
                  <span className="font-medium">Note:</span> This link will expire in 7 days. Anyone with the link can request to join your family tree.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={sendInviteByEmail} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email-address" className="text-sm font-medium text-gray-700">Email Address</label>
                <input
                  id="email-address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter family member's email"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-all"
              >
                Send Invitation
              </button>
              
              {emailSent && (
                <div className="flex items-center justify-center p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                  <Check className="mr-2" /> {/* Using Lucide React Check icon */}
                  Invitation sent successfully!
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer Section */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 pt-0.5">
              {/* Info icon SVG - retained as a simple SVG for consistency/simplicity */}
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-800 mb-1">Invitation Process</h3>
              <p className="text-xs text-gray-600">
                You'll need to approve join requests from invited members before they can access your family tree.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteFamilyMemberModal;