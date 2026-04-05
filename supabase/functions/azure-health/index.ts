import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
async function getToken(): Promise<string> {
  const t=Deno.env.get("AZURE_TENANT_ID")!,c=Deno.env.get("AZURE_CLIENT_ID")!,s=Deno.env.get("AZURE_CLIENT_SECRET")!;
  const r=await fetch(`https://login.microsoftonline.com/${t}/oauth2/v2.0/token`,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"client_credentials",client_id:c,client_secret:s,scope:"https://management.azure.com/.default"})});
  const j=await r.json();if(!r.ok)throw{error:true,userMessage:`Azure auth failed: ${j.error_description}`};return j.access_token;
}
serve(async(req)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
  try{
    const{subscriptionId,resourceGroupName,resourceType,resourceName}=await req.json();
    if(!subscriptionId||!resourceGroupName||!resourceType||!resourceName)throw{error:true,userMessage:"subscriptionId, resourceGroupName, resourceType, resourceName are all required"};
    const token=await getToken();
    const[provider,...typeParts]=resourceType.split("/");
    const url=`https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/${provider}/${typeParts.join("/")}/${resourceName}/providers/Microsoft.ResourceHealth/availabilityStatuses/current?api-version=2022-10-01`;
    const r=await fetch(url,{headers:{Authorization:`Bearer ${token}`}});
    const j=await r.json();
    if(!r.ok){return new Response(JSON.stringify({resourceId:null,resourceName,availabilityState:"Unknown",summary:"Resource Health not available for this resource type.",detailedStatus:null,reasonType:null,occuredTime:null,reportedTime:null,timestamp:new Date().toISOString()}),{headers:{...cors,"Content-Type":"application/json"}});}
    const p=j.properties||{};
    return new Response(JSON.stringify({resourceId:j.id,resourceName,availabilityState:p.availabilityState||"Unknown",summary:p.summary||null,detailedStatus:p.detailedStatus||null,reasonType:p.reasonType||null,occuredTime:p.occuredTime||null,reportedTime:p.reportedTime||null,timestamp:new Date().toISOString()}),{headers:{...cors,"Content-Type":"application/json"}});
  }catch(err:any){return new Response(JSON.stringify({error:true,userMessage:err.userMessage||err.message}),{status:500,headers:{...cors,"Content-Type":"application/json"}});}
});
