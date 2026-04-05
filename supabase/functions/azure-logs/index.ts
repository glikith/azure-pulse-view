import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
async function getToken(): Promise<string> {
  const t=Deno.env.get("AZURE_TENANT_ID")!,c=Deno.env.get("AZURE_CLIENT_ID")!,s=Deno.env.get("AZURE_CLIENT_SECRET")!;
  const r=await fetch(`https://login.microsoftonline.com/${t}/oauth2/v2.0/token`,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"client_credentials",client_id:c,client_secret:s,scope:"https://api.loganalytics.io/.default"})});
  const j=await r.json();if(!r.ok)throw{error:true,userMessage:`Azure auth failed: ${j.error_description}`};return j.access_token;
}
serve(async(req)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
  try{
    const{query,workspaceId,timeRange="PT1H"}=await req.json();
    const ws=workspaceId||Deno.env.get("AZURE_LOG_ANALYTICS_WORKSPACE_ID");
    if(!query?.trim())throw{error:true,userMessage:"query is required"};
    if(!ws)throw{error:true,userMessage:"No Log Analytics workspace ID. Set AZURE_LOG_ANALYTICS_WORKSPACE_ID in Supabase secrets or pass workspaceId."};
    const token=await getToken();
    const r=await fetch(`https://api.loganalytics.io/v1/workspaces/${ws}/query`,{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({query,timespan:timeRange})});
    const j=await r.json();if(!r.ok)throw{error:true,userMessage:j.error?.message||j.error?.innererror?.message||"Log Analytics query failed"};
    const table=j.tables?.[0];
    const columns=(table?.columns||[]).map((c:any)=>({name:c.name,type:c.type}));
    const rows=(table?.rows||[]).map((row:any[])=>{const o:Record<string,unknown>={};columns.forEach((col:any,i:number)=>{o[col.name]=row[i];});return o;});
    return new Response(JSON.stringify({columns,rows,rowCount:rows.length,workspaceId:ws,query,timeRange,executedAt:new Date().toISOString()}),{headers:{...cors,"Content-Type":"application/json"}});
  }catch(err:any){return new Response(JSON.stringify({error:true,userMessage:err.userMessage||err.message}),{status:500,headers:{...cors,"Content-Type":"application/json"}});}
});
