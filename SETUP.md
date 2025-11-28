# Quick Setup Guide

## Step 1: Install Dependencies

### Backend
```bash
cd server
npm install
```

### Frontend
```bash
cd client
npm install
```

## Step 2: Configure Environment Variables

### Backend (.env in server folder)
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finsync-pro
CLERK_SECRET_KEY=sk_test_your_key_here
CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
JWT_SECRET=your_secret_key_here
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend (.env in client folder)
```env
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

## Step 3: Create Required Directories

```bash
# In server folder
mkdir uploads
```

## Step 4: Set Up Clerk

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Copy your API keys to the .env files
4. Configure allowed redirect URLs:
   - Development: `http://localhost:5173`
   - Production: Your production URL

## Step 5: Set Up MongoDB

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Replace username and password in the connection string
5. Add the connection string to server/.env

## Step 6: Run the Application

### Terminal 1 - Backend
```bash
cd server
npm run dev
```

### Terminal 2 - Frontend
```bash
cd client
npm run dev
```

## Step 7: Access the Application

Open your browser and navigate to:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/health

## Troubleshooting

### MongoDB Connection Issues
- Check your MongoDB Atlas IP whitelist (add 0.0.0.0/0 for development)
- Verify your connection string has correct username/password
- Ensure your cluster is running

### Clerk Authentication Issues
- Verify your API keys are correct
- Check that redirect URLs are configured in Clerk dashboard
- Ensure CORS is properly configured

### Port Already in Use
- Change PORT in server/.env to a different port
- Update VITE_API_URL in client/.env accordingly

### Module Not Found Errors
- Delete node_modules and package-lock.json
- Run `npm install` again
- Clear npm cache: `npm cache clean --force`

## Next Steps

1. Create your first account by signing up
2. Add some transactions
3. Set up budgets
4. Explore the analytics dashboard

For detailed API documentation, see README.md

