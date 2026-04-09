import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const NAME_MAP: Record<string,string> = { "Percentage CPU":"cpuUsage","Available Memory Bytes":"memoryUsage","Network In Total":"networkIn","Network Out Total":"networkOut","Disk Read Operations/Sec":"diskReadOps","Disk Write Operations/Sec":"diskWriteOps","CpuPercentage":"cpuUsage","MemoryPercentage":"memoryUsage","HttpResponseTime":"httpResponseTime","Requests":"httpRequests","Http5xx":"http5xxErrors","node_cpu_usage_percentage":"cpuUsage","node_memory_rss_percentage":"memoryUsage","kube_pod_status_ready":"podsReady","UsedCapacity":"storageUsedCapacity","Transactions":"storageTransactions","Ingress":"storageIngress","Egress":"storageEgress" };
const DURATION: Record<string,{interval:string,ms:number}> = { PT15M:{interval:"PT1M",ms:900000},PT1H:{interval:"PT5M",ms:3600000},PT6H:{interval:"PT15M",ms:21600000},PT24H:{interval:"PT1H",ms:86400000},P7D:{interval:"PT6H",ms:604800000},P30D:{interval:"P1D",ms:2592000000} };

// Storage accounts need longer intervals for certain metrics
const STORAGE_DURATION: Record<string,{interval:string,ms:number}> = { PT15M:{interval:"PT1H",ms:86400000},PT1H:{interval:"PT1H",ms:86400000},PT6H:{interval:"PT1H",ms:86400000},PT24H:{interval:"PT1H",ms:86400000},P7D:{interval:"PT6H",ms:604800000},P30D:{interval:"P1D",ms:2592000000} };

function isStorageAccount(resourceId: string): boolean {
  return resourceId.toLowerCase().includes("microsoft.storage/storageaccounts");
}

async function getToken(): Promise<string> {
  const t=Deno.env.get("AZURE_TENANT_ID")!,c=Deno.env.get("AZURE_CLIENT_ID")!,s=Deno.env.get("AZURE_CLIENT_SECRET")!;
  const r=await fetch(`https://login.microsoftonline.com/${t}/oauth2/v2.0/token`,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"client_credentials",client_id:c,client_secret:s,scope:"https://management.azure.com/.default"})});
  const j=await r.json();if(!r.ok)throw{error:true,userMessage:`Azure auth failed: ${j.error_description}`};return j.access_token;
}
serve(async(req)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
  try{
    const{resourceId,metricNames=[],timeRange="PT1H"}=await req.json();
    if(!resourceId||!metricNames.length)throw{error:true,userMessage:"resourceId and metricNames are required"};
    const token=await getToken();
    const isStorage = isStorageAccount(resourceId);
    const durations = isStorage ? STORAGE_DURATION : DURATION;
    const{interval,ms}=durations[timeRange]||durations["PT1H"];
    const now=new Date(),start=new Date(now.getTime()-ms);
    const url=`https://management.azure.com${resourceId}/providers/Microsoft.Insights/metrics?api-version=2018-01-01&metricnames=${encodeURIComponent(metricNames.join(","))}&interval=${interval}&timespan=${start.toISOString()}/${now.toISOString()}&aggregation=Average,Total,Maximum`;
    console.log(`Fetching metrics for ${resourceId}, interval=${interval}, isStorage=${isStorage}`);
    const r=await fetch(url,{headers:{Authorization:`Bearer ${token}`}});
    const j=await r.json();
    if(!r.ok){
      console.error(`Azure metrics API error ${r.status}:`, JSON.stringify(j.error||j));
      // Return 200 with empty data instead of 500 to not break the dashboard
      return new Response(JSON.stringify({resourceId,dataAvailable:false,metrics:{},timeSeries:[],lastUpdated:new Date().toISOString(),timestamp:new Date().toISOString(),warning:j.error?.message||"Failed to fetch metrics"}),{headers:{...cors,"Content-Type":"application/json"}});
    }
    const metrics:Record<string,any>={};const tsMap:Record<string,any>={};
    for(const m of(j.value||[])){
      const fn=NAME_MAP[m.name?.value]||m.name?.value;
      const pts=m.timeseries?.[0]?.data||[];if(!pts.length)continue;
      const last=[...pts].reverse().find((p:any)=>p.average!=null||p.total!=null||p.maximum!=null);
      const cur=last?.average??last?.total??last?.maximum??null;
      const rec=pts.slice(-3).map((p:any)=>p.average??p.total??p.maximum).filter((v:any)=>v!=null);
      const trend=rec.length<2?"stable":rec[rec.length-1]-rec[0]>2?"rising":rec[rec.length-1]-rec[0]<-2?"falling":"stable";
      metrics[fn]={value:cur!==null?Math.round(cur*100)/100:null,unit:m.unit||"Unknown",trend};
      for(const pt of pts){const ts=pt.timeStamp;if(!tsMap[ts])tsMap[ts]={timestamp:ts};const v=pt.average??pt.total??pt.maximum;if(v!=null)tsMap[ts][fn]=Math.round(v*100)/100;}
    }
    const timeSeries=Object.values(tsMap).sort((a:any,b:any)=>new Date(a.timestamp).getTime()-new Date(b.timestamp).getTime());
    return new Response(JSON.stringify({resourceId,dataAvailable:Object.keys(metrics).length>0,metrics,timeSeries,lastUpdated:new Date().toISOString(),timestamp:new Date().toISOString()}),{headers:{...cors,"Content-Type":"application/json"}});
  }catch(err:any){
    console.error("azure-metrics error:", err);
    // Return 200 with empty data for graceful degradation
    return new Response(JSON.stringify({resourceId:"",dataAvailable:false,metrics:{},timeSeries:[],lastUpdated:new Date().toISOString(),timestamp:new Date().toISOString(),error:true,userMessage:err.userMessage||err.message||"Unknown error"}),{headers:{...cors,"Content-Type":"application/json"}});
  }
});
