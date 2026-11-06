import {defineConfig,loadEnv} from 'vite';
import {createApi} from './server/api.js';
export default defineConfig(({mode})=>{
 const env=loadEnv(mode,process.cwd(),'');
 for(const name of ['GEMINI_API_KEY','GOOGLE_API_KEY','NEWZ_AI_MODEL','VITE_SUPABASE_URL','VITE_SUPABASE_PUBLISHABLE_KEY'])if(!process.env[name]&&env[name])process.env[name]=env[name];
 return {plugins:[{name:'newz-api',configureServer(server){server.middlewares.use(createApi())},configurePreviewServer(server){server.middlewares.use(createApi())}}]};
});
