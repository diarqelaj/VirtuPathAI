'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';

const API_HOST = api.defaults.baseURL?.replace(/\/api\/?$/, '') || '';
const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=5e17eb&color=fff';
const defaultBanner = 'https://images.unsplash.com/photo-1522199670076-2852f80289c3?fit=crop&w=1600&q=80';

export default function UserProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const current = await api.get('/users/me');
        setCurrentUser(current.data);

        const target = await api.get(`/users/${id}`);
        setUser(target.data);

        const followRes = await api.get(`/userfriends/isfollowing?followerId=${current.data.userID}&followedId=${id}`);
        setIsFollowing(followRes.data === true);

        const [followers, following, friends] = await Promise.all([
          api.get(`/userfriends/followers/${id}`),
          api.get(`/userfriends/following/${id}`),
          api.get(`/userfriends/mutual/${id}`)
        ]);

        setFollowersCount(followers.data.length);
        setFollowingCount(following.data.length);
        setFriendsCount(friends.data.length);
      } catch (err) {
        console.error(err);
      }
    };

    if (id) fetchUsers();
  }, [id]);

  const handleFollow = async () => {
    try {
      await api.post(`/userfriends/follow?followerId=${currentUser.userID}&followedId=${id}`);
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
    } catch {
      alert('Failed to follow user.');
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

  if (!user) {
    return <div className="text-white text-center mt-20">Loading profile...</div>;
  }

  const isSelf = currentUser?.userID === user.userID;
  const bannerUrl = user.coverImageUrl?.startsWith('http') ? user.coverImageUrl : user.coverImageUrl ? API_HOST + user.coverImageUrl : defaultBanner;
  const profileImg = user.profilePictureUrl?.startsWith('http') ? user.profilePictureUrl : user.profilePictureUrl ? API_HOST + user.profilePictureUrl : defaultAvatar;
  const isPrivate = user.isProfilePrivate && !isSelf;

  return (
    <div className="text-white max-w-4xl mx-auto mt-4 rounded-xl overflow-hidden shadow-xl border border-white/10 bg-black-100">
      {/* Banner */}
      <div className="h-48 w-full bg-cover bg-center relative" style={{ backgroundImage: `url(${bannerUrl})` }}>
        <div className="absolute bottom-0 left-0 p-4">
          <Image
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
            <h2 className="text-2xl font-bold">{user.fullName}</h2>
            <p className="text-sm text-gray-400">Joined {new Date(user.registrationDate).toLocaleDateString()}</p>
          </div>

          {isSelf ? (
            <Link href="/settings/security" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm">
              Edit Profile
            </Link>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleFollow} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm">
                {isFollowing ? 'Following' : 'Follow'}
              </button>
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
              <span><strong>{followersCount}</strong> Followers</span>
              <span><strong>{followingCount}</strong> Following</span>
              <span><strong>{friendsCount}</strong> Friends</span>
            </div>

            {/* Bio */}
            <div>
              <h3 className="text-lg font-semibold">Bio</h3>
              <p className="text-sm text-white/80">{user.bio || "This user hasn’t written a bio yet."}</p>
            </div>

            {/* About */}
            <div>
              <h3 className="text-lg font-semibold">About</h3>
              <p className="text-sm text-white/80">{user.about || "Interests, goals, achievements — coming soon..."}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
