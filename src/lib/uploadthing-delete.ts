import { UTApi } from 'uploadthing/server';

const utapi = new UTApi({ token: process.env.UPLOADTHING_SECRET });

/**
 * Extract the file key from an UploadThing URL
 * UploadThing URLs typically look like:
 * https://utfs.io/f/abc123-xyz789.pdf
 */
export function extractFileKeyFromUrl(url: string): string | null {
  try {
    // Match the pattern: /f/{fileKey}
    const match = url.match(/\/f\/([^\/\?]+)/);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting file key from URL:', error);
    return null;
  }
}

/**
 * Delete a file from UploadThing by its URL
 * @param fileUrl - The full UploadThing file URL
 * @returns Promise<boolean> - true if deletion was successful, false otherwise
 */
export async function deleteFileFromUploadThing(fileUrl: string): Promise<boolean> {
  try {
    const fileKey = extractFileKeyFromUrl(fileUrl);
    
    if (!fileKey) {
      console.error('Could not extract file key from URL:', fileUrl);
      return false;
    }

    console.log('Deleting file from UploadThing:', fileKey);
    await utapi.deleteFiles(fileKey);
    console.log('Successfully deleted file from UploadThing:', fileKey);
    
    return true;
  } catch (error) {
    console.error('Error deleting file from UploadThing:', error);
    return false;
  }
}

/**
 * Delete multiple files from UploadThing by their URLs
 * @param fileUrls - Array of full UploadThing file URLs
 * @returns Promise<number> - Number of files successfully deleted
 */
export async function deleteFilesFromUploadThing(fileUrls: string[]): Promise<number> {
  try {
    const fileKeys = fileUrls
      .map(url => extractFileKeyFromUrl(url))
      .filter((key): key is string => key !== null);

    if (fileKeys.length === 0) {
      console.error('No valid file keys found in URLs');
      return 0;
    }

    console.log('Deleting files from UploadThing:', fileKeys);
    await utapi.deleteFiles(fileKeys);
    console.log('Successfully deleted files from UploadThing:', fileKeys.length);
    
    return fileKeys.length;
  } catch (error) {
    console.error('Error deleting files from UploadThing:', error);
    return 0;
  }
}
