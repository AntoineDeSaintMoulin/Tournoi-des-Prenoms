import React from 'react';

interface AvatarProps {
  avatar: string;
  name: string;
  className?: string;
  textClassName?: string;
}

// Un avatar peut être un emoji (nouveaux comptes) ou une URL d'image
// (anciens comptes créés avant ce changement) — ce composant gère les deux.
export const Avatar: React.FC<AvatarProps> = ({
  avatar,
  name,
  className = 'w-8 h-8',
  textClassName = 'text-lg',
}) => {
  const isUrl = avatar?.startsWith('http');

  if (isUrl) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${className} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${className} rounded-full bg-slate-800 flex items-center justify-center shrink-0 leading-none ${textClassName}`}
    >
      {avatar || '🙂'}
    </div>
  );
};
