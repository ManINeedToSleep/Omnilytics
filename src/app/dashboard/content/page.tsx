/**
 * @fileoverview Content creation and management page.
 * Allows users to create, schedule, and manage social media posts across connected platforms.
 * Features a multi-column layout with a creation form and a live preview pane.
 * Connects to:
 *   - src/app/dashboard/layout.tsx (implicitly, via route)
 *   - Potentially state management for posts (e.g., Zustand store)
 *   - Components for form elements, platform selection, preview, etc. (to be created/imported)
 */
'use client';

import { useState } from 'react';
// Import necessary icons
import { 
  Upload, 
  Calendar, 
  Send, 
  Save, 
  Instagram, 
  Youtube, 
  Linkedin, 
  Twitter, // Using Twitter icon for X for now
  // Facebook // Remove unused Facebook icon
} from 'lucide-react';
import { platformColors } from '@/lib/mockData'; // Import platform colors

// Platform definitions for selection
const platforms = [
  { id: 'instagram', label: 'Instagram', Icon: Instagram, color: platformColors.Instagram },
  { id: 'youtube', label: 'YouTube', Icon: Youtube, color: platformColors.YouTube },
  { id: 'linkedin', label: 'LinkedIn', Icon: Linkedin, color: platformColors.LinkedIn },
  { id: 'twitter', label: 'X', Icon: Twitter, color: platformColors.Twitter },
];

export default function ContentPage() {
  // State for form inputs (add more as needed)
  const [postContent, setPostContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isScheduling, setIsScheduling] = useState(false); // State for scheduling toggle
  // const [scheduledDateTime, setScheduledDateTime] = useState<string>(''); // Remove unused state
  
  // State for view toggle (Create, Scheduled, Drafts)
  const [activeView, setActiveView] = useState<'create' | 'scheduled' | 'drafts'>('create');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Content</h1>

      {/* View Toggle Buttons - Styled as Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          <button
            onClick={() => setActiveView('create')}
            className={`whitespace-nowrap px-1 py-3 border-b-2 text-sm font-medium transition-colors duration-150
              ${activeView === 'create'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
              }`}
          >
            Create Post
          </button>
          <button
            onClick={() => setActiveView('scheduled')}
             className={`whitespace-nowrap px-1 py-3 border-b-2 text-sm font-medium transition-colors duration-150
              ${activeView === 'scheduled'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
              }`}
          >
            Scheduled
          </button>
          <button
            onClick={() => setActiveView('drafts')}
             className={`whitespace-nowrap px-1 py-3 border-b-2 text-sm font-medium transition-colors duration-150
              ${activeView === 'drafts'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
              }`}
          >
            Drafts
          </button>
        </nav>
      </div>

      {/* Conditional Rendering based on activeView */}
      {activeView === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Creation Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Create New Post</h2>
              {/* Text Area Placeholder */}
              <textarea 
                rows={6} 
                placeholder="What's on your mind?"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
              />
              {/* Attachment Placeholder */}
              <div className="mt-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors">
                <Upload className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500" />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Drag & drop files or <span className="font-medium text-indigo-600 dark:text-indigo-400">click to upload</span></p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Images, Videos up to 50MB</p>
              </div>
              {/* Platform Selection Buttons */}
              <div className="mt-6">
                <h3 className="text-md font-medium mb-3 text-gray-900 dark:text-white">Select Platforms to Post</h3>
                <div className="flex flex-wrap gap-3">
                  {platforms.map(({ id, label, Icon, color }) => {
                    const isSelected = selectedPlatforms.includes(id);
                    return (
                      <button
                        key={id}
                        type="button" // Prevent form submission if inside a form
                        onClick={() => {
                          setSelectedPlatforms(prev =>
                            isSelected ? prev.filter(p => p !== id) : [...prev, id]
                          );
                        }}
                        style={isSelected ? { backgroundColor: color, borderColor: color } : { borderColor: '#d1d5db' /* gray-300 */ }}
                        className={`flex items-center px-3 py-1.5 rounded-full border text-sm font-medium transition-all duration-150 
                          ${isSelected
                            ? 'text-white shadow-md'
                            : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                      >
                        <Icon className={`w-4 h-4 mr-1.5 ${isSelected ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
               {/* Scheduling Section */}
              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                 <h3 className="text-md font-medium mb-3 text-gray-900 dark:text-white">Scheduling</h3>
                 <div className="flex items-center mb-3">
                   {/* Basic Toggle Switch Placeholder */}
                   <button
                     type="button"
                     onClick={() => setIsScheduling(!isScheduling)}
                     className={`${isScheduling ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800`}
                     role="switch"
                     aria-checked={isScheduling}
                   >
                     <span className="sr-only">Enable scheduling</span>
                     <span
                       aria-hidden="true"
                       className={`${isScheduling ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                     />
                   </button>
                   <span className="ml-3 text-sm text-gray-600 dark:text-gray-300">Schedule post for later</span>
                 </div>
                 {/* Date/Time Picker Placeholder - Appears when scheduling is enabled */}
                 {isScheduling && (
                   <div className="relative mt-2">
                     <input 
                        type="text" 
                        readOnly 
                        value={ 'Select date and time'} // Removed scheduledDateTime
                        // onClick={() => alert('Date/Time Picker Placeholder Clicked!')} // Removed placeholder action
                        placeholder="Select date and time" 
                        className="w-full cursor-pointer pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      />
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500"/>
                     </div>
                   </div>
                 )}
              </div>
              {/* Action Buttons Placeholder */}
              <div className="mt-6 flex justify-end space-x-3">
                 <button className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                   <Save className="h-4 w-4 inline-block mr-1.5"/>
                   Save Draft
                 </button>
                 <button className="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800">
                   <Send className="h-4 w-4 inline-block mr-1.5"/>
                   Post Now
                 </button>
              </div>
            </div>
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-1 space-y-6">
             <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 sticky top-[calc(4rem+2rem)]"> {/* Adjust sticky top based on TopBar height */}
               <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Post Preview</h2>
               {/* Platform Tabs - Styled like main view tabs */}
               <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                  <nav className="-mb-px flex space-x-3 overflow-x-auto" aria-label="Preview Tabs">
                     {/* TODO: Make these dynamic based on selected platforms? Add state for active preview */}
                     {/* TODO: Use platform icons */}
                    <button className="whitespace-nowrap px-2 py-2 border-b-2 border-indigo-500 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      Instagram
                    </button>
                    <button className="whitespace-nowrap px-2 py-2 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600">
                      X
                    </button>
                    <button className="whitespace-nowrap px-2 py-2 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600">
                      Facebook
                    </button>
                     <button className="whitespace-nowrap px-2 py-2 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600">
                      LinkedIn
                    </button>
                  </nav>
               </div>
               {/* Preview Content Placeholder */}
               <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-4 min-h-[200px] text-sm text-gray-700 dark:text-gray-300 overflow-y-auto max-h-[400px]">
                 <p className="whitespace-pre-wrap break-words">{postContent || "Your post preview will appear here..."}</p>
                 {/* TODO: Add image/video preview */}
               </div>
             </div>
          </div>
        </div>
      )}
      
      {/* --- Scheduled Posts View --- */}
      {activeView === 'scheduled' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Scheduled Posts</h2>
          <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 text-center border border-dashed border-gray-300 dark:border-gray-600">
             <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3"/>
             <p className="font-medium text-gray-700 dark:text-gray-300">No posts scheduled yet.</p>
             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create and schedule a post using the &apos;Create Post&apos; tab.</p>
          </div>
        </div>
      )}

      {/* --- Drafts View --- */}
      {activeView === 'drafts' && (
         <div className="space-y-6">
           <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Draft Posts</h2>
           <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 text-center border border-dashed border-gray-300 dark:border-gray-600">
             <Save className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3"/>
             <p className="font-medium text-gray-700 dark:text-gray-300">No drafts saved yet.</p>
             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create a post and use the &apos;Save Draft&apos; button.</p>
          </div>
         </div>
      )}
    </div>
  );
}
