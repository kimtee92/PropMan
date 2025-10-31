import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const f = createUploadthing();

export const ourFileRouter = {
  propertyDocument: f({
    pdf: { maxFileSize: '8MB', maxFileCount: 10 },
    image: { maxFileSize: '4MB', maxFileCount: 10 },
    'text/plain': { maxFileSize: '2MB', maxFileCount: 5 },
    'application/vnd.ms-excel': { maxFileSize: '4MB', maxFileCount: 5 },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { maxFileSize: '4MB', maxFileCount: 5 },
  })
    .middleware(async ({ req }) => {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        throw new Error('Unauthorized');
      }

      return { userId: session.user.id, userRole: session.user.role };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId);
      console.log('File URL:', file.url);

      // The propertyId should be passed from the client
      // For now, we'll store it in metadata via client-side implementation
      
      return { uploadedBy: metadata.userId, url: file.url };
    }),
  
  propertyImage: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        throw new Error('Unauthorized');
      }

      return { userId: session.user.id, userRole: session.user.role };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Property image upload complete for userId:', metadata.userId);
      console.log('Image URL:', file.url);
      
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;