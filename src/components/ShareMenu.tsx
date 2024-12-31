import React, { useState, useRef, useEffect } from 'react';
import { Share2, Twitter, Facebook, Linkedin, Link2, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareMenuProps {
  title: string;
  description: string;
  url: string;
}

export function ShareMenu({ title, description, url }: ShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const shareData = {
          title,
          text: description,
          url
        };
        
        await navigator.share(shareData);
      } catch (error) {
        // If sharing fails, fall back to manual share menu
        if ((error as Error).name === 'AbortError') {
          // User cancelled sharing - do nothing
          return;
        }
        
        // For any other error (including NotAllowedError), show manual menu
        setIsOpen(true);
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied to clipboard!');
      setIsOpen(false);
    });
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`Check out ${title} on Bolt Showcase!`);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleShare}
        className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-purple-400 transition-colors"
        title="Share project"
      >
        <Share2 className="w-5 h-5" />
      </button>

      {isOpen && (
        <div 
          ref={menuRef} 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div className="w-full max-w-md mx-4 bg-gray-900/95 border border-white/10 rounded-xl shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Share Project</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 px-4 py-3 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors w-full"
                onClick={() => setIsOpen(false)}
              >
                <Twitter className="w-4 h-4" />
                <span>Share on Twitter</span>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 px-4 py-3 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors w-full"
                onClick={() => setIsOpen(false)}
              >
                <Facebook className="w-4 h-4" />
                <span>Share on Facebook</span>
              </a>
              <a
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 px-4 py-3 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors w-full"
                onClick={() => setIsOpen(false)}
              >
                <Linkedin className="w-4 h-4" />
                <span>Share on LinkedIn</span>
              </a>
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors"
              >
                <Link2 className="w-4 h-4" />
                <span>Copy Link</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}