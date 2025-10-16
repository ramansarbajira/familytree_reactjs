import React from 'react';
import { useUser } from '../Contexts/UserContext';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../Components/Layout';
import AssociatedFamilyTree from '../Components/FamilyTree/AssociatedFamilyTree';
import { useLanguage } from '../Contexts/LanguageContext';
import LanguageSwitcher from '../Components/LanguageSwitcher';

const AssociatedFamilyTreePage = () => {
  const { code, userId } = useParams();
  const { userInfo } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  
  // Determine if this is userId-based or familyCode-based routing
  const isUserIdBased = location.pathname.includes('/associated-family-tree-user/');
  const displayTitle = isUserIdBased 
    ? `Associated Family Trees for User: ${userId}`
    : `Associated Family Tree: ${code}`;

  return (
    <Layout>
      <div className="p-4 md:p-8">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">{displayTitle}</h2>
            {isUserIdBased && (
              <p className="text-gray-600 text-sm">
                Showing all connected family trees
              </p>
            )}
          </div>
          <LanguageSwitcher />
        </div>
        
        <AssociatedFamilyTree 
          familyCode={!isUserIdBased ? code : null} 
          userId={isUserIdBased ? userId : null}
        />
        
        <div className="mt-6 flex gap-3">
          <button 
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors" 
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          {userInfo?.familyCode && (
            <button 
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors" 
              onClick={() => navigate('/family-tree') }
            >
              My Birth Family Tree
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AssociatedFamilyTreePage;