import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
async function getToken(): Promise<string> {
  const t=Deno.env.get("AZURE_TENANT_ID")!,c=Deno.env.get("AZURE_CLIENT_ID")!,s=Deno.env.get("AZURE_CLIENT_SECRET")!;
  const r=await fetch(`https://login.microsoftonline.com/${t}/oauth2/v2.0/token`,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"client_credentials",client_id:c,client_secret:s,scope:"https://management.azure.com/.default"})});
  const j=await r.json();if(!r.ok)throw{error:true,userMessage:`Azure auth failed: ${j.error_description}`};return j.access_token;
}
const SEV:Record<string,string>={Sev0:"Critical",Sev1:"Error",Sev2:"Warning",Sev3:"Informational",Sev4:"Verbose"};
serve(async(req)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
  try{
    const{subscriptionId,alertState,severity}=await req.json();
    if(!subscriptionId)throw{error:true,userMessage:"subscriptionId is required"};
    const token=await getToken();
    let url=`https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.AlertsManagement/alerts?api-version=2019-03-01`;
    if(alertState)url+=`&alertState=${alertState}`;if(severity)url+=`&severity=${severity}`;
    const r=await fetch(url,{headers:{Authorization:`Bearer ${token}`}});
    const j=await r.json();if(!r.ok)throw{error:true,userMessage:j.error?.message||"Failed to fetch alerts"};
    const alerts=(j.value||[]).map((a:any)=>{const e=a.properties?.essentials||{};return{alertId:a.id,alertName:a.name,severity:e.severity,severityLabel:SEV[e.severity]||e.severity,alertState:e.alertState,monitorCondition:e.monitorCondition,targetResource:e.targetResource,targetResourceName:e.targetResourceName,targetResourceGroup:e.targetResourceGroup,targetResourceType:e.targetResourceType,subscriptionId:e.subscriptionId,alertRule:e.alertRule,firedTime:e.startDateTime,resolvedTime:e.resolvedDateTime,description:null};});
    const so:Record<string,number>={Sev0:0,Sev1:1,Sev2:2,Sev3:3,Sev4:4};
    alerts.sort((a:any,b:any)=>(so[a.severity]??5)-(so[b.severity]??5));
    return new Response(JSON.stringify({alerts,count:alerts.length,criticalCount:alerts.filter((a:any)=>a.severity==="Sev0"||a.severity==="Sev1").length,timestamp:new Date().toISOString()}),{headers:{...cors,"Content-Type":"application/json"}});
  }catch(err:any){return new Response(JSON.stringify({error:true,userMessage:err.userMessage||err.message}),{status:500,headers:{...cors,"Content-Type":"application/json"}});}
});
