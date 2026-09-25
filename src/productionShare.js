import { supabase } from './supabaseClient.js';

export const SHARE_TYPES = { GENERAL:'general', LIST:'list', SEAMSTRESS:'seamstress' };

export async function createProductionShare({shareType='general',listId=null,costureira=null,startDate=null,endDate=null}){
  if(!supabase) throw new Error('Supabase não configurado.');
  const {data,error}=await supabase.rpc('create_workneo_share',{
    p_share_type:shareType,p_list_id:listId||null,p_costureira:costureira||null,
    p_start_date:startDate||null,p_end_date:endDate||null
  });
  if(error) throw error;
  return data;
}

export async function listProductionShares(){
  if(!supabase) return [];
  const {data,error}=await supabase.rpc('list_workneo_shares');
  if(error) throw error;
  return Array.isArray(data)?data:[];
}

export async function revokeProductionShare(shareId){
  if(!supabase) throw new Error('Supabase não configurado.');
  const {data,error}=await supabase.rpc('revoke_workneo_share',{p_share_id:shareId});
  if(error) throw error;
  return data;
}

export async function loadPublicProductionShare(token){
  if(!supabase) throw new Error('Supabase não configurado.');
  const {data,error}=await supabase.rpc('get_workneo_share',{p_token:token});
  if(error) throw error;
  return data;
}

export function filterProductionRows(share,filters){
  const reports=Array.isArray(share?.reports)?share.reports:[];
  const start=filters.startDate||'0000-01-01', end=filters.endDate||'9999-12-31';
  const rows=[];
  for(const r of reports){
    const date=String(r.date||'');
    if(date<start||date>end) continue;
    if(filters.costureira && r.costureira!==filters.costureira) continue;
    if(filters.listId && r.listId!==filters.listId) continue;
    for(const item of (r.items||[])){
      if(filters.product && item.product!==filters.product) continue;
      const sentQty=Number(item.qty)||0;const returnedQty=Number(item.returnedQty)||0;rows.push({date,costureira:r.costureira,createdBy:r.createdBy||{},listId:r.listId,listName:r.listName,product:item.product,color:item.color||'',pedido:item.pedido||'',cliente:item.cliente||r.cliente||item.customer||r.customer||'',tracking:item.tracking||item.codigoAcompanhamento||r.tracking||r.codigoAcompanhamento||'',qty:sentQty,returnedQty,sewingQty:Math.max(0,sentQty-returnedQty)});
    }
  }
  return rows;
}
