import { Pipe, PipeTransform } from "@angular/core";

/**
 * Pipe to format file sizes in bytes to a human-readable format
 */
@Pipe({
    name: "fileSize"
})
export class FileSizePipe implements PipeTransform {
    /**
     * Transforms file size in bytes to a human-readable format
     * @param size - Size in bytes
     * @returns Formatted size string (e.g., "1.5 MB")
     */
    transform(size: number | undefined): string {
        if (size === undefined || size === null) {
            return "Unknown size";
        }
        
        if (size === 0) {
            return "0 Bytes";
        }
        
        const units = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(size) / Math.log(1024));
        return `${(size / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
    }
}