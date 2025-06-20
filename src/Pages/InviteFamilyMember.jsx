import React, { useState } from 'react';
import Layout from '../Components/Layout';
import { FiLink, FiMail, FiCopy, FiShare2, FiCheck, FiUserPlus } from 'react-icons/fi';

const InviteFamilyMember = () => {
  const [inviteLink, setInviteLink] = useState('');
  const [email, setEmail] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const generateInviteLink = () => {
    const newLink = `https://yourfamilytree.com/join?code=${Math.random().toString(36).substring(2, 15)}&familyId=YOUR_FAMILY_ID`;
    setInviteLink(newLink);
    setIsCopied(false);
  };

  const sendInviteByEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      alert('Please enter a valid email address.');
      return;
    }

    console.log(`Sending invite to ${email}...`);
    setEmailSent(true);
    setEmail('');
    setTimeout(() => setEmailSent(false), 3000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4 md:p-6 min-h-screen">
        {/* Hero Section */}
        <div className="mb-8 text-center"> {/* Reduced mb- from 10 to 8 */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full shadow-lg mb-4"> {/* Changed to primary-600 */}
            <FiUserPlus className="text-primary" size={28} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"> {/* Reduced mb- from 3 to 2 */}
            Grow Your Family Tree
          </h1>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Invite relatives to join and collaborate on your shared family history.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-secondary-600 to-secondary-700 p-5 text-secondary"> {/* Changed to primary gradient, reduced p- from 6 to 5 */}
            <h2 className="text-xl font-bold flex items-center">
              <FiShare2 className="mr-2" size={24} />
              Invitation Options
            </h2>
            <p className="opacity-90 text-sm mt-1">Choose how you'd like to invite family members</p> {/* Added text-sm */}
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-6"> {/* Reduced p- from md:p-8, reduced space-y from 8 to 6 */}
            {/* Link Invitation Section */}
            <div className="space-y-3"> {/* Reduced space-y from 4 to 3 */}
              <div className="flex items-center mb-1"> {/* Added mb-1 to snug icon to next element */}
                <div className="flex items-center justify-center w-9 h-9 bg-primary-100 rounded-full mr-3"> {/* Reduced w/h from 10 to 9, mr- from 4 to 3 */}
                  <FiLink className="text-primary-600" size={17} /> {/* Reduced size from 18 to 17 */}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Shareable Link</h3>
                  <p className="text-xs text-gray-500">Generate a unique invitation link</p> {/* Reduced text-sm to text-xs */}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2"> {/* Reduced gap from 3 to 2 */}
                <div className="flex-grow relative">
                  <input
                    type="text"
                    readOnly
                    value={inviteLink}
                    placeholder="No link generated yet"
                    className="w-full pl-4 pr-12 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                  />
                  {inviteLink && (
                    <button
                      onClick={copyToClipboard}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-600 hover:text-primary-700"
                      title="Copy to clipboard"
                    >
                      {isCopied ? <FiCheck size={18} /> : <FiCopy size={18} />}
                    </button>
                  )}
                </div>
                <button
                  onClick={generateInviteLink}
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-all whitespace-nowrap flex-shrink-0 text-sm" // Reduced px- from 6 to 5, added text-sm
                >
                  Generate Link
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-4"> {/* Adjusted margin for divider */}
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-sm text-gray-500">OR</span>
              </div>
            </div>

            {/* Email Invitation Section */}
            <div className="space-y-3"> {/* Reduced space-y from 4 to 3 */}
              <div className="flex items-center mb-1"> {/* Added mb-1 */}
                <div className="flex items-center justify-center w-9 h-9 bg-primary-100 rounded-full mr-3"> {/* Changed to primary-100, reduced w/h from 10 to 9, mr- from 4 to 3 */}
                  <FiMail className="text-primary-600" size={17} /> {/* Changed to primary-600, reduced size from 18 to 17 */}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Email Invitation</h3>
                  <p className="text-xs text-gray-500">Send directly to their inbox</p> {/* Reduced text-sm to text-xs */}
                </div>
              </div>
              
              <form onSubmit={sendInviteByEmail} className="flex flex-col sm:flex-row gap-2"> {/* Reduced gap from 3 to 2 */}
                <div className="flex-grow relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="family.member@example.com"
                    className="w-full pl-4 pr-12 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-all whitespace-nowrap flex-shrink-0 text-sm" // Changed to primary, reduced px- from 6 to 5, added text-sm
                >
                  Send Email
                </button>
              </form>
              
              {emailSent && (
                <div className="flex items-center justify-center p-2 bg-green-50 text-green-700 rounded-lg text-sm mt-2"> {/* Reduced p- from 3 to 2, added text-sm */}
                  <FiCheck className="mr-2" />
                  Invitation sent successfully!
                </div>
              )}
            </div>
          </div>

          {/* Card Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-800">How invitations work</h3>
                <div className="mt-1 text-xs text-gray-600"> {/* Reduced text-sm to text-xs */}
                  <p>Invited members will receive a link to request access. You'll need to approve their request before they can join your family tree.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InviteFamilyMember;