import React, { useState, useEffect, useRef } from 'react';
import { User, Post } from '../types';
import { Language, translations } from '../translations';

interface ForumProps {
  user: User;
  language: Language;
}

const Forum: React.FC<ForumProps> = ({ user, language }) => {
  const t = translations[language];
  const [newPostContent, setNewPostContent] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{type: 'image' | 'video', url: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initialPosts: Post[] = [
      {
        id: '1',
        authorName: 'Kuldeep Negi',
        authorAvatar: 'https://i.pravatar.cc/150?u=kuldeep',
        content: 'No one concerned about environmental issues in our ward? The park maintenance is at an all-time low. We need immediate municipal intervention. #CivicDuty',
        tag: 'Local Issues',
        date: '2 hours ago',
        likes: 24,
        comments: 12,
      },
      {
        id: '2',
        authorName: 'Priya Sharma',
        authorAvatar: 'https://i.pravatar.cc/150?u=priya',
        content: 'Proposed 3 new bills for urban healthcare today. Your voice matters! Let me know your thoughts on the proposed clinic expansions.',
        tag: 'Policy Debate',
        date: '4 hours ago',
        likes: 56,
        comments: 8,
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=1000&auto=format&fit=crop' }
        ]
      },
    ];

    const savedPosts = localStorage.getItem('accountable_forum_posts');
    setPosts(savedPosts ? JSON.parse(savedPosts) : initialPosts);
  }, []);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const type = file.type.startsWith('video') ? 'video' : 'image';
        setSelectedMedia(prev => [...prev, { type, url }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() && selectedMedia.length === 0) return;

    setIsPosting(true);
    const newPost: Post = {
      id: Date.now().toString(),
      authorName: user.name,
      authorAvatar: user.avatar,
      content: newPostContent,
      tag: 'General',
      date: 'Just now',
      likes: 0,
      comments: 0,
      media: selectedMedia.length > 0 ? selectedMedia : undefined
    };

    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('accountable_forum_posts', JSON.stringify(updatedPosts));
    setNewPostContent('');
    setSelectedMedia([]);
    setTimeout(() => setIsPosting(false), 300);
  };

  const handleLike = (id: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 };
      }
      return p;
    }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div className="flex gap-4">
            <img src={user.avatar} className="w-12 h-12 rounded-full border border-slate-100 shrink-0" alt="" />
            <div className="flex-1">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Start a community discussion..."
                className="w-full bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 border-none outline-none resize-none min-h-[100px] font-medium text-sm transition focus:ring-2 focus:ring-orange-500/20"
              />
              
              {selectedMedia.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {selectedMedia.map((m, i) => (
                    <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200">
                      <img src={m.url} className="w-full h-full object-cover" alt="" />
                      <button type="button" onClick={() => setSelectedMedia(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-rose-500 transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex gap-2">
              <input type="file" hidden ref={fileInputRef} onChange={handleMediaUpload} />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-orange-600 rounded-xl transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </button>
            </div>
            <button
              type="submit"
              disabled={(!newPostContent.trim() && selectedMedia.length === 0) || isPosting}
              className="px-8 py-2.5 bg-orange-500 text-white font-black rounded-xl hover:bg-orange-600 transition disabled:opacity-50 shadow-lg shadow-orange-500/20 text-sm"
            >
              {isPosting ? 'Posting...' : 'Share with Community'}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:border-orange-100 dark:hover:border-orange-900/50 transition">
            <div className="flex items-start gap-4">
              <img src={post.authorAvatar} className="w-10 h-10 rounded-full border border-slate-100 shrink-0" alt="" />
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white leading-none">{post.authorName}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{post.date}</p>
                  </div>
                  <span className="px-3 py-1 bg-orange-50 dark:bg-orange-900/30 text-[9px] font-black text-orange-600 dark:text-orange-400 rounded-lg uppercase tracking-wider">
                    {post.tag}
                  </span>
                </div>
                
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">
                  {post.content}
                </p>

                {post.media && (
                  <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                    <img src={post.media[0].url} className="w-full h-auto object-cover max-h-96" alt="" />
                  </div>
                )}

                <div className="flex items-center gap-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 text-xs font-bold transition ${post.isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                  >
                    <svg className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    {post.likes}
                  </button>
                  <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-orange-600 transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    {post.comments} Comments
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forum;