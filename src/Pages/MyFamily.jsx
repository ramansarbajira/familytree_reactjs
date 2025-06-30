import React, { useState, useEffect } from 'react';
import Layout from '../Components/Layout';
import FamilyView from '../Components/FamilyView';
import NoFamilyView from '../Components/NoFamilyView';
import { useNavigate } from 'react-router-dom';
import CreateFamilyModal from '../Components/CreateFamilyModal';
import { UserProvider, useUser } from '../Contexts/UserContext';
import FamilyOverView from '../Components/FamilyOverView';
import { FiLoader } from 'react-icons/fi';

const FamilyHubPage = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const { userInfo, userLoading, refetchUserInfo } = useUser();
  const [activeTab, setActiveTab] = useState('myFamily');
  const [familyData, setFamilyData] = useState(null);
  const [isCreateFamilyModalOpen, setIsCreateFamilyModalOpen] = useState(false);
  const [isJoinFamilyModalOpen, setIsJoinFamilyModalOpen] = useState(false);
  const [totalMembers, setTotalMembers] = useState(0);
  const [males, setMales] = useState(0);
  const [females, setFemales] = useState(0);
  const [averageAge, setAverageAge] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken) {
          setToken(storedToken);
      }
  }, []);

  useEffect(() => {
    let ignore = false; // prevent race condition

    const fetchFamilyData = async () => {
      if (!userInfo?.familyCode || userLoading){ setLoading(false); return; }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/family/code/${userInfo.familyCode}`,
          {
            headers: { accept: 'application/json' },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch family data');
        const data = await response.json();

        if (!ignore) {
          setFamilyData(data);
          setTotalMembers(data.totalMembers ?? 12);
          setMales(data.males ?? 5);
          setFemales(data.females ?? 7);
          setAverageAge(data.averageAge ?? 28.3);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) {
          setError('Failed to load family data.');
          setFamilyData(null);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchFamilyData();

    return () => {
      ignore = true;
    };
  }, [userInfo?.familyCode, userLoading]);

  const handleCreateFamily = () => {
    setIsCreateFamilyModalOpen(true);
  };

  const handleJoinFamily = () => {
    setIsJoinFamilyModalOpen(true);
  };

  const handleManageMembers = () => {
    navigate('/my-family-member');
  };

  const handleManageEvent = () => {
    navigate('/events');
  };

  const handleManageGifts = () => {
    navigate('/gifts-memories');
  };

  const handleEditFamily = () => {
    setIsEditModalOpen(true);
  };
  
  const handleShareFamilyCode = () => {
    if (familyData?.familyCode) {
      navigator.clipboard.writeText(familyData.familyCode)
        .then(() => {
          setShowCopyMessage(true);
          setTimeout(() => setShowCopyMessage(false), 2000);
        })
        .catch(() => {
          alert('Copy failed!');
        });
    }
  };

  const handleFamilyCreated = (newFamilyDetails) => {
    const updatedFamily = {
      ...familyData,
      ...newFamilyDetails,
      familyPhotoUrl: newFamilyDetails.familyPhoto
        ? familyData?.familyPhotoUrl
        : familyData?.familyPhotoUrl || null,
      updatedAt: new Date().toISOString(),
    };

    setFamilyData(updatedFamily);
    setIsCreateFamilyModalOpen(false);
    setIsEditModalOpen(false);
  };


  if (loading) {
    return (
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center py-20">
                <FiLoader className="text-6xl text-primary-600 animate-spin mb-4" />
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">Loading Data...</h2>
                <p className="text-gray-500">Please wait while we fetching data.</p>
            </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="min-h-screen flex items-center justify-center text-red-600">
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {familyData ? (
          <>
            <FamilyView
              familyData={familyData}
              totalMembers={totalMembers}
              males={males}
              females={females}
              averageAge={averageAge}
              onManageMembers={handleManageMembers}
              onManageEvents={handleManageEvent}
              onManageGifts={handleManageGifts}
              onEditFamily={handleEditFamily}
              onShareFamilyCode={handleShareFamilyCode}
            />

            <FamilyOverView 
              familyCode={userInfo?.familyCode} 
              token={token} 
            />
            
          </>
        ) : (
          <NoFamilyView onCreateFamily={handleCreateFamily} onJoinFamily={handleJoinFamily} />
        )}
        </div>
      </div>

      <CreateFamilyModal
        isOpen={isCreateFamilyModalOpen}
        onClose={() => setIsCreateFamilyModalOpen(false)}
        onFamilyCreated={handleFamilyCreated}
        token={token}
      />

      {isEditModalOpen && (
        <CreateFamilyModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onFamilyCreated={handleFamilyCreated}
          token={token}
          mode="edit"
          initialData={familyData}
        />
      )}

      {isEditModalOpen && (
        <CreateFamilyModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onFamilyCreated={handleFamilyCreated}
          token={token}
          mode="edit"
          initialData={familyData}
        />
      )}

      {showCopyMessage && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#4BB543',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '8px',
          boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          Copied to clipboard!
        </div>
      )}
    </Layout>
  );
};

export default FamilyHubPage;
