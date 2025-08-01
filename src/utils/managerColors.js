// utils/managerColors.js

// Predefined color palette for better visual consistency
const COLOR_PALETTE = [
  '#ef4444', // Red
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#a855f7', // Purple
];

// Simple hash function to convert string to number
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

// Generate lighter shade of a color for backgrounds
const lightenColor = (hex, percent = 20) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16).slice(1);
};

// Main function to get manager badge style
export const getManagerBadgeStyle = (manager) => {
  if (!manager) return { backgroundColor: '#94a3b8', color: 'white', borderColor: '#94a3b8' };
  
  const hash = hashString(manager);
  const colorIndex = hash % COLOR_PALETTE.length;
  const backgroundColor = COLOR_PALETTE[colorIndex];
  
  return {
    backgroundColor,
    color: 'white',
    borderColor: backgroundColor
  };
};

// Function to get manager initials for avatar
export const getManagerInitials = (manager) => {
  if (!manager) return 'M';
  
  // Handle single names and multi-word names
  const words = manager.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  // For multi-word names, take first letter of first two words
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
};

// Function to get lighter avatar background color
export const getAvatarBackgroundColor = (manager) => {
  if (!manager) return '#cbd5e1';
  
  const badgeStyle = getManagerBadgeStyle(manager);
  return lightenColor(badgeStyle.backgroundColor, 15);
};

// Alternative approach using HSL for more control over color variations
export const getManagerBadgeStyleHSL = (manager) => {
  if (!manager) return { backgroundColor: '#94a3b8', color: 'white', borderColor: '#94a3b8' };
  
  const hash = hashString(manager);
  
  // Generate hue based on hash (0-360 degrees)
  const hue = hash % 360;
  
  // Use consistent saturation and lightness for professional look
  const saturation = 65; // 65% saturation
  const lightness = 50;  // 50% lightness
  
  const backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  
  return {
    backgroundColor,
    color: 'white',
    borderColor: backgroundColor
  };
};

// Function to get lighter HSL background for avatars
export const getAvatarBackgroundColorHSL = (manager) => {
  if (!manager) return '#cbd5e1';
  
  const hash = hashString(manager);
  const hue = hash % 360;
  
  // Lighter version for avatar background
  const saturation = 50; // Slightly less saturated
  const lightness = 70;  // Much lighter
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};