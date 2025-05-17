'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import FriendModal from '@/components/FriendModal';
import {
  IoChevronDown,
  IoChevronUp
} from 'react-icons/io5';
import {
  FiMoreHorizontal,
  FiMessageCircle,
  FiUserPlus,
  FiUserX,
  FiVolumeX,
  FiShare2,
  FiCalendar,
  FiLink,
  FiAlertCircle
} from 'react-icons/fi';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { OfficialBadge } from '@/components/OfficialBadge';

const API_HOST = api.defaults.baseURL?.replace(/\/api\/?$/, '') || '';
const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=5e17eb&color=fff';
const defaultBanner = 'https://images.unsplash.com/photo-1522199670076-2852f80289c3?fit=crop&w=1600&q=80';

const resolveImageUrl = (url?: string | null, fallback = ''): string =>
  url ? (url.startsWith('http') ? url : `${API_HOST}${url}`) : fallback;

export default function UserProfilePage() {
  const params = useParams();
  const username = params?.username as string;

  const [user, setUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [modalType, setModalType] = useState<'followers' | 'following' | 'mutual' | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showUnfollowOptions, setShowUnfollowOptions] = useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);

  const fetchUsers = async () => {
    try {
      const current = await api.get('/users/me');
      setCurrentUser(current.data);

      const target = await api.get(`/users/by-username/${username}`);
      setUser(target.data);
 


      const targetId = target.data.userID;

      const [followersRes, followingRes, mutualRes, currentUserFollowingRes] = await Promise.all([
        api.get(`/userfriends/followers/${targetId}`),
        api.get(`/userfriends/following/${targetId}`),
        api.get(`/userfriends/mutual/${targetId}`),
        api.get(`/userfriends/following/${current.data.userID}`)
      ]);

      const allFollowers = followersRes.data || [];
      const allFollowing = followingRes.data || [];
      const allMutuals = mutualRes.data || [];
      const currentUserFollowing = currentUserFollowingRes.data || [];

      setFollowers(allFollowers);
      setFollowing(allFollowing);
      setFriends(allMutuals);

      const isCurrentFollowing = allFollowers.some((f: any) => f.userID === current.data.userID);
      setIsFollowing(isCurrentFollowing);

      const isFollowAccepted = currentUserFollowing.some((f: any) => f.userID === targetId);
      setIsAccepted(isFollowAccepted);
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  useEffect(() => {
    if (username) fetchUsers();
  }, [username]);


  const handleFollow = async () => {
    if (!user || !currentUser) return;
    try {
      await api.post(`/userfriends/follow?followerId=${currentUser.userID}&followedId=${user.userID}`);
      await fetchUsers();
    } catch {
      alert('Failed to follow user.');
    }
  };

  const handleUnfollow = async () => {
    if (!user || !currentUser) return;
    try {
      await api.delete(`/userfriends/remove?followerId=${currentUser.userID}&followedId=${user.userID}`);
      setShowUnfollowOptions(false);
      await fetchUsers();
    } catch {
      alert('Failed to unfollow user.');
    }
  };

  const handleBlock = async () => {
    if (!user || !currentUser) return;
    try {
      await api.post('/userfriends/block', {
        blockerId: currentUser.userID,
        blockedId: user.userID
      });
      alert('User blocked.');
    } catch {
      alert('Failed to block user.');
    }
  };


  const isSelf = currentUser?.userID === user?.userID;
  const bannerUrl = resolveImageUrl(user?.coverImageUrl, defaultBanner);
  const profileImg = resolveImageUrl(user?.profilePictureUrl, defaultAvatar);
  const isPrivate = user?.isProfilePrivate && !isSelf && !isAccepted;

  return (
    <>
      <div className="text-white max-w-4xl mx-auto mt-4 rounded-xl overflow-visible shadow-xl border border-white/10 bg-black-100">
        {/* Banner */}
        <div className="h-48 w-full bg-cover bg-center relative" style={{ backgroundImage: `url(${bannerUrl})` }}>
          <div className="absolute bottom-0 left-4 translate-y-1/2">
            <img
              src={profileImg}
              alt="Avatar"
              className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover"
            />
          </div>
        </div>

        {/* Main Section */}
        <div className="p-6 pt-16 sm:pt-20 space-y-4">
        <div className="flex justify-between items-center">
          <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {user?.fullName}
            {user?.isOfficial ? (
              <OfficialBadge date={user?.verifiedDate} />
            ) : user?.isVerified ? (
              <VerifiedBadge date={user?.verifiedDate} />
            ) : null}
          </h2>

            <p className="text-sm text-gray-500">@{user?.username}</p>
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <FiCalendar size={14} />
              <span>
                {(() => {
                  if (!user?.registrationDate) return 'Unknown';
                  const raw = user.registrationDate;
      
                  const safe = raw.includes('.') ? raw.split('.')[0] + 'Z' : raw + 'Z';
                  const date = new Date(safe);
                 return !isNaN(date.getTime())
                  ? `Joined ${date.toLocaleString('en-US', { month: 'long', year: 'numeric' })}`
                  : 'Joined date unknown';
                })()}
              </span>

            </div>



          </div>


            {isSelf ? (
              <Link href="/settings" className="bg-purple-950 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm">
                Edit Profile
              </Link>
            ) : (
              <div className="flex gap-2 relative">
                <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full" title="Message">
                  <FiMessageCircle size={18} />
                </button>
                <div className="relative inline-block text-left">
                  <button
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full"
                    onClick={() => setShowActionsDropdown(prev => !prev)}
                    title="More options"
                  >
                    <FiMoreHorizontal size={18} />
                  </button>
                  {showActionsDropdown && (
                    <div className="absolute right-0 mt-2 w-64 z-50 rounded-xl bg-black-100 text-white shadow border border-white/10">
                      <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-left">
                        <FiUserPlus size={16} />
                        Add to Favorites
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-left">
                        <FiVolumeX size={16} />
                        Mute
                      </button>
                      <button onClick={handleBlock} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-red-400 text-left">
                        <FiUserX size={16} />
                        Block
                      </button>
                      <hr className="border-white/10" />
                      <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-left">
                        <FiShare2 size={16} />
                        Share profile
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-left">
                        <FiLink size={16} />
                        Copy link to profile
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-left">
                        <FiAlertCircle size={16} />
                        Report
                      </button>
                    </div>
                  )}
                </div>
                {isFollowing ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUnfollowOptions(prev => !prev)}
                      className="bg-purple-900 hover:bg-purple-950 px-4 py-2 rounded-lg text-sm flex items-center gap-1"
                    >
                      Following
                      {showUnfollowOptions ? <IoChevronUp size={14} /> : <IoChevronDown size={14} />}
                    </button>
                    {showUnfollowOptions && (
                      <div className="absolute right-0 mt-2 bg-black-100 text-sm rounded-xl p-3 w-60 border border-white/10 shadow z-50">
                        <p className="text-xs text-white/70 mb-2">
                          Are you sure? You’ll need to request again if the profile is private.
                        </p>
                        <div className="flex gap-2">
                          <button onClick={handleUnfollow} className="bg-purple-900 hover:bg-purple-950 px-3 py-1 rounded w-full">
                            Unfollow
                          </button>
                          <button onClick={() => setShowUnfollowOptions(false)} className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded w-full">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button onClick={handleFollow} className="bg-purple-900 hover:bg-purple-950 px-4 py-2 rounded-lg text-sm">
                    Follow
                  </button>
                )}
              </div>
            )}
          </div>

          {isPrivate ? (
            <div className="text-center text-white/50 italic mt-10">This profile is private.</div>
          ) : (
            <>
              <div className="flex gap-6 mt-2 text-sm text-gray-300">
                <span className="cursor-pointer hover:text-purple-400" onClick={() => { setModalType('followers'); setShowModal(true); }}>
                  <strong>{followers.length}</strong> Followers
                </span>
                <span className="cursor-pointer hover:text-purple-400" onClick={() => { setModalType('following'); setShowModal(true); }}>
                  <strong>{following.length}</strong> Following
                </span>
                <span className="cursor-pointer hover:text-purple-400" onClick={() => { setModalType('mutual'); setShowModal(true); }}>
                  <strong>{friends.length}</strong> Friends
                </span>
              </div>

              {/* Bio */}
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold mb-1">Bio</h3>
                <p className="text-sm text-white/80">{user?.bio || 'This user hasn’t written a bio yet.'}</p>
              </div>

              {/* About */}
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold mb-1">About</h3>
                <p className="text-sm text-white/80">{user?.about || 'Interests, goals, achievements — coming soon...'}</p>
              </div>
              
            </>
          )}
        </div>
      </div>

      {showModal && modalType && (
        <FriendModal
          title={modalType.charAt(0).toUpperCase() + modalType.slice(1)}
          type={modalType}
          userIds={
            modalType === 'followers' ? followers :
            modalType === 'following' ? following :
            friends
          }
          currentUserId={currentUser?.userID}
          onClose={() => {
            setModalType(null);
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}
