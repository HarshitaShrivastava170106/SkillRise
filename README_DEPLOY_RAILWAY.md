# Deploy SkillRise on Railway

## Steps

1. Create a Railway account at https://railway.app/
2. Create a new project and choose "Deploy from GitHub" or connect your repository.
3. Add environment variables in Railway project settings:
   - `PORT` = `3000`
   - `MONGO_URI` = `<your MongoDB connection string>`
   - `JWT_SECRET` = `<strong secret>`
   - `OPENAI_API_KEY` = `<your openai api key>`
   - `STRIPE_SECRET_KEY` = `<your stripe secret key>`
   - `CORS_ORIGIN` = `https://your-railway-domain.railway.app`

4. Railway will run `npm install` automatically.
5. Railway will start the app using `npm start`.

## Notes

- If you use Railway's MongoDB plugin, you can copy the generated URI into `MONGO_URI`.
- Do not store secrets in source code.
- Railway provides a public URL for your deployed app.

## Local testing before deploy

```bash
npm install
npm start
```

Then open `http://localhost:3000`.
