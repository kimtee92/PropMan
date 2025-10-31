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
      portfolioId: z.string().optional().default('default'), 
      propertyId: z.string().optional().default('default'),
    }))
    .middleware(async ({ req, input, files }) => {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        throw new Error('Unauthorized');
      }

      // Create custom file keys with folder structure
      const customKeys = files.map((file) => {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const fileExt = file.name.split('.').pop();
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        return `Portfolio_${input.portfolioId}/Property_${input.propertyId}/documents/${timestamp}_${randomStr}_${cleanFileName}`;
      });

      return { 
        userId: session.user.id, 
        userRole: session.user.role,
        portfolioId: input.portfolioId,
        propertyId: input.propertyId,
        [Symbol.for('uploadthing.custom-id')]: customKeys,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('✅ Document upload complete!');
      console.log('   User:', metadata.userId);
      console.log('   File:', file.name);
      console.log('   URL:', file.url);
      console.log('   Key:', file.key);
      console.log('   Organized: Portfolio', metadata.portfolioId, '> Property', metadata.propertyId, '> documents');
      
      return { 
        uploadedBy: metadata.userId, 
        url: file.url,
      };
    }),
  
  propertyImage: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .input(z.object({ 
      portfolioId: z.string().optional().default('default'), 
      propertyId: z.string().optional().default('default'),
    }))
    .middleware(async ({ req, input, files }) => {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        throw new Error('Unauthorized');
      }

      // Create custom file keys with folder structure
      const customKeys = files.map((file) => {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const fileExt = file.name.split('.').pop();
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        return `Portfolio_${input.portfolioId}/Property_${input.propertyId}/images/${timestamp}_${randomStr}_${cleanFileName}`;
      });

      return { 
        userId: session.user.id, 
        userRole: session.user.role,
        portfolioId: input.portfolioId,
        propertyId: input.propertyId,
        [Symbol.for('uploadthing.custom-id')]: customKeys,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('✅ Property image upload complete!');
      console.log('   User:', metadata.userId);
      console.log('   File:', file.name);
      console.log('   URL:', file.url);
      console.log('   Key:', file.key);
      console.log('   Organized: Portfolio', metadata.portfolioId, '> Property', metadata.propertyId, '> images');
      
      return { 
        uploadedBy: metadata.userId, 
        url: file.url,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;