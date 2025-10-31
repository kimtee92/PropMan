import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const f = createUploadthing({
  /**
   * Custom error formatter for better error messages
   */
  errorFormatter: (err) => {
    console.log("Upload error:", err.message);
    return { message: err.message };
  },
});

export const ourFileRouter = {
  propertyDocument: f({
    pdf: { maxFileSize: '8MB', maxFileCount: 10 },
    image: { maxFileSize: '4MB', maxFileCount: 10 },
    'text/plain': { maxFileSize: '2MB', maxFileCount: 5 },
    'application/vnd.ms-excel': { maxFileSize: '4MB', maxFileCount: 5 },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { maxFileSize: '4MB', maxFileCount: 5 },
  })
    .input(z.object({ 
      portfolioId: z.string(), 
      propertyId: z.string() 
    }))
    .middleware(async ({ req, input }) => {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        throw new Error('Unauthorized');
      }

      // Define the folder path structure
      const folderPath = `Portfolio_${input.portfolioId}/Property_${input.propertyId}/documents`;

      return { 
        userId: session.user.id, 
        userRole: session.user.role,
        portfolioId: input.portfolioId,
        propertyId: input.propertyId,
        folderPath,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('✅ Document upload complete!');
      console.log('   User:', metadata.userId);
      console.log('   File:', file.name);
      console.log('   URL:', file.url);
      console.log('   Path: Portfolio', metadata.portfolioId, '> Property', metadata.propertyId, '> documents');
      
      return { 
        uploadedBy: metadata.userId, 
        url: file.url,
        folderPath: metadata.folderPath,
      };
    }),
  
  propertyImage: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .input(z.object({ 
      portfolioId: z.string(), 
      propertyId: z.string() 
    }))
    .middleware(async ({ req, input }) => {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        throw new Error('Unauthorized');
      }

      // Define the folder path structure
      const folderPath = `Portfolio_${input.portfolioId}/Property_${input.propertyId}/images`;

      return { 
        userId: session.user.id, 
        userRole: session.user.role,
        portfolioId: input.portfolioId,
        propertyId: input.propertyId,
        folderPath,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('✅ Property image upload complete!');
      console.log('   User:', metadata.userId);
      console.log('   File:', file.name);
      console.log('   URL:', file.url);
      console.log('   Path: Portfolio', metadata.portfolioId, '> Property', metadata.propertyId, '> images');
      
      return { 
        uploadedBy: metadata.userId, 
        url: file.url,
        folderPath: metadata.folderPath,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;