import {createClient} from '@supabase/supabase-js';
const url=import.meta.env.VITE_SUPABASE_URL,key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase=url&&key?createClient(url,key):null;
let session=null,mode='login',recovery=false;
export async function authHeaders(){if(!supabase)throw Error('Account service is not configured yet.');const {data,error}=await supabase.auth.getSession();if(error)throw error;if(!data.session){openAccount();throw Error('Please log in to use AI.')}return {Authorization:`Bearer ${data.session.access_token}`}}
export function openAccount(){document.querySelector('#account-dialog').showModal();renderForm()}
function renderForm(){
 const host=document.querySelector('#account-body');host.replaceChildren();
 const title=document.createElement('h2');title.textContent=session&&!recovery?'Your account':({login:'Welcome back',signup:'Create your account',forgot:'Reset your password',reset:'Choose a new password'})[mode];host.append(title);
 if(session&&!recovery){const name=document.createElement('p');name.textContent=session.user.email;host.append(name);const out=document.createElement('button');out.className='primary';out.textContent='Log out';out.onclick=async()=>{const {error}=await supabase.auth.signOut();if(error)message(error.message);else document.querySelector('#account-dialog').close()};host.append(out);return}
 const note=document.createElement('p');note.textContent='Your perspective, saved in one place.';host.append(note);
 if(!supabase){note.textContent='Accounts will be available when Supabase is connected by the site owner.';return}
 const form=document.createElement('form');form.className='account-form';
 const field=(label,type,name,autocomplete)=>{const el=document.createElement('label');el.textContent=label;const input=document.createElement('input');Object.assign(input,{type,name,required:true,autocomplete});if(type==='password')input.minLength=8;el.append(input);form.append(el)};
 if(mode==='signup')field('Your name','text','name','name');
 if(mode!=='reset')field('Email address','email','email','email');
 if(mode!=='forgot')field('Password (at least 8 characters)','password','password',mode==='login'?'current-password':'new-password');
 const submit=document.createElement('button');submit.className='primary';submit.textContent=({login:'Log in',signup:'Create account',forgot:'Send reset email',reset:'Update password'})[mode];form.append(submit);host.append(form);
 form.onsubmit=async e=>{e.preventDefault();submit.disabled=true;message('Please wait…');const data=new FormData(form);try{let result;const redirect=location.origin+'/';if(mode==='login')result=await supabase.auth.signInWithPassword({email:data.get('email'),password:data.get('password')});if(mode==='signup')result=await supabase.auth.signUp({email:data.get('email'),password:data.get('password'),options:{data:{full_name:data.get('name')},emailRedirectTo:redirect}});if(mode==='forgot')result=await supabase.auth.resetPasswordForEmail(data.get('email'),{redirectTo:redirect});if(mode==='reset')result=await supabase.auth.updateUser({password:data.get('password')});if(result.error)throw result.error;if(mode==='signup'&&!result.data.session)message('Check your email to confirm your account, then log in.');else if(mode==='forgot')message('If an account exists, a reset link will arrive by email.');else{recovery=false;message('Success.');document.querySelector('#account-dialog').close()}}catch(err){message(err.message)}finally{submit.disabled=false}};
 if(!recovery){const links=document.createElement('div');links.className='account-links';for(const [m,label] of (mode==='login'?[['signup','Create an account'],['forgot','Forgot password?']]:[['login','Back to login']])){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{mode=m;renderForm()};links.append(b)}host.append(links)}
}
function message(text){document.querySelector('#account-message').textContent=text}
export function initAccount(onSession){
 document.body.insertAdjacentHTML('beforeend','<dialog id="account-dialog"><button class="close" aria-label="Close account">×</button><div id="account-body"></div><p id="account-message" role="status" aria-live="polite"></p></dialog>');
 const dialog=document.querySelector('#account-dialog');dialog.querySelector('.close').onclick=()=>dialog.close();dialog.onclick=e=>{if(e.target===dialog)dialog.close()};
 const update=s=>{session=s;const name=s?.user.user_metadata?.full_name||s?.user.email?.split('@')[0]||'Guest reader';const initials=s?name.split(/\s+/).map(p=>p[0]).slice(0,2).join('').toUpperCase():'↗';document.querySelectorAll('.avatar').forEach(e=>e.textContent=initials);const profile=document.querySelector('.profile');profile.replaceChildren();const avatar=document.createElement('span');avatar.className='avatar';avatar.textContent=initials;const text=document.createElement('div');text.append(document.createTextNode(name));const sub=document.createElement('small');sub.textContent=s?'Manage account':'Log in / Sign up';text.append(sub);profile.append(avatar,text);profile.setAttribute('role','button');profile.tabIndex=0;profile.onclick=openAccount;profile.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openAccount()}};document.querySelector('header .avatar').onclick=openAccount;onSession(s);};
 update(null);if(supabase){supabase.auth.onAuthStateChange((event,s)=>{update(s);if(event==='PASSWORD_RECOVERY'){mode='reset';recovery=true;openAccount()}});supabase.auth.getSession().then(({data,error})=>{if(!error)update(data.session)})}
}
