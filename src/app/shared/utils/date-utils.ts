/**
 * Formats a date as a human-readable string (e.g., "2 hours ago")
 */
export function getTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "just now";
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) 
        return diffInMinutes === 1 ? "1 minute ago" : `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) 
        return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) 
        return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) 
        return diffInWeeks === 1 ? "1 week ago" : `${diffInWeeks} weeks ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) 
        return diffInMonths === 1 ? "1 month ago" : `${diffInMonths} months ago`;
    
    const diffInYears = Math.floor(diffInDays / 365);
    return diffInYears === 1 ? "1 year ago" : `${diffInYears} years ago`;
}

/**
 * Formats a duration string in ISO 8601 format to a human-readable format
 */
export function formatDuration(duration?: string): string {
    if (!duration) return "N/A";
    
    // Match PT1H30M or similar ISO 8601 duration patterns
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = duration.match(regex);
    
    if (!matches) return duration; // Return as-is if pattern doesn't match
    
    const hours = matches[1] ? parseInt(matches[1], 10) : 0;
    const minutes = matches[2] ? parseInt(matches[2], 10) : 0;
    const seconds = matches[3] ? parseInt(matches[3], 10) : 0;
    
    if (hours === 0 && minutes === 0 && seconds === 0) return "0m";
    
    let result = "";
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0 || (hours > 0 && seconds > 0)) result += `${minutes}m `;
    if (seconds > 0) result += `${seconds}s`;
    
    return result.trim();
}