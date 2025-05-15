'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import FriendModal from '@/components/FriendModal';

const API_HOST = api.defaults.baseURL?.replace(/\/api\/?$/, '') || '';
const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=5e17eb&color=fff';
const defaultBanner = 'https://images.unsplash.com/photo-1522199670076-2852f80289c3?fit=crop&w=1600&q=80';

const resolveImageUrl = (url?: string | null, fallback = ''): string =>
  url ? (url.startsWith('http') ? url : `${API_HOST}${url}`) : fallback;

export default function UserProfilePage() {
  const params = useParams();
  const id = params?.id as string;

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

  const fetchUsers = async () => {
    try {
      const current = await api.get('/users/me');
      setCurrentUser(current.data);

      const target = await api.get(`/users/${id}`);
      setUser(target.data);

      const [followersRes, followingRes, mutualRes, currentUserFollowingRes] = await Promise.all([
        api.get(`/userfriends/followers/${id}`),
        api.get(`/userfriends/following/${id}`),
        api.get(`/userfriends/mutual/${id}`),
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

      const isFollowAccepted = currentUserFollowing.some((f: any) => f.userID === parseInt(id));
      setIsAccepted(isFollowAccepted);
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  useEffect(() => {
    if (id) fetchUsers();
  }, [id]);

  const handleFollow = async () => {
    try {
      await api.post(`/userfriends/follow?followerId=${currentUser.userID}&followedId=${id}`);
      await fetchUsers();
    } catch {
      alert('Failed to follow user.');
    }
  };

  const handleUnfollow = async () => {
    try {
      await api.delete(`/userfriends/remove?followerId=${currentUser.userID}&followedId=${id}`);
      setShowUnfollowOptions(false);
      await fetchUsers();
    } catch {
      alert('Failed to unfollow user.');
    }
  };

  const handleBlock = async () => {
    try {
      await api.post('/userfriends/block', {
        blockerId: currentUser.userID,
        blockedId: parseInt(id),
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
      <div className="text-white max-w-4xl mx-auto mt-4 rounded-xl overflow-hidden shadow-xl border border-white/10 bg-black-100">
        {/* Banner */}
        <div className="h-48 w-full bg-cover bg-center relative" style={{ backgroundImage: `url(${bannerUrl})` }}>
          <div className="absolute bottom-0 left-0 p-4">
            <img
              src={profileImg}
              alt="Avatar"
              width={80}
              height={80}
              className="rounded-full border-4 border-white shadow-md object-cover"
            />
          </div>
        </div>

        {/* Main Section */}
        <div className="p-6 pt-10 sm:pt-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{user?.fullName}</h2>
              <p className="text-sm text-gray-400">Joined {new Date(user?.registrationDate).toLocaleDateString()}</p>
            </div>

            {isSelf ? (
              <Link href="/settings" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm">
                Edit Profile
              </Link>
            ) : (
              <div className="flex gap-2">
                {isFollowing ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUnfollowOptions((prev) => !prev)}
                      className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg text-sm text-white"
                    >
                      Following ⌄
                    </button>

                    {showUnfollowOptions && (
                      <div className="absolute right-0 mt-2 bg-zinc-800 text-white text-sm rounded shadow-lg p-3 w-60 border border-white/10 z-50">
                        <p className="text-xs text-white/70 mb-2">
                          Are you sure? You’ll need to request again if the profile is private.
                        </p>
                        <div className="flex gap-2">
                          <button onClick={handleUnfollow} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm w-full">
                            Unfollow
                          </button>
                          <button onClick={() => setShowUnfollowOptions(false)} className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-sm w-full">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button onClick={handleFollow} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm text-white">
                    Follow
                  </button>
                )}

                <button onClick={handleBlock} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm">
                  Block
                </button>
              </div>
            )}
          </div>

          {isPrivate ? (
            <div className="text-center text-white/50 italic mt-10">
              This profile is private.
            </div>
          ) : (
            <>
              {/* Stats */}
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
              <div>
                <h3 className="text-lg font-semibold">Bio</h3>
                <p className="text-sm text-white/80">{user?.bio || 'This user hasn’t written a bio yet.'}</p>
              </div>

              {/* About */}
              <div>
                <h3 className="text-lg font-semibold">About</h3>
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
            modalType === 'followers'
              ? followers
              : modalType === 'following'
              ? following
              : friends
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
