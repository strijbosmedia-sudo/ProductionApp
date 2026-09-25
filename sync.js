
'use strict';

/* Privacy boundary for future cross-device sync.
   The browser can safely build an encrypted, non-sensitive project envelope.
   A remote transport can be plugged in later without syncing contacts or private notes. */
window.ProductionSync = (() => {
  const VERSION = 1;
  const clone = x => JSON.parse(JSON.stringify(x));

  function buildEnvelope(project){
    return {
      version: VERSION,
      projectId: project.projectId,
      revision: project.revision,
      updatedAt: project.updatedAt,
      settings: {
        title: project.settings.title,
        deadline: project.settings.deadline,
        budgetCap: project.settings.budgetCap,
        uiVersion: project.settings.uiVersion || 2
      },
      tasks: project.tasks.map(t => ({
        id:t.id,title:t.title,brief:t.brief,completion:t.completion,phase:t.phase,category:t.category,
        due:t.due,dueLabel:t.dueLabel,status:t.status,deps:clone(t.deps),review:t.review,
        checklist:clone(t.checklist),archived:t.archived,dayId:t.dayId,offset:t.offset,
        locationId:t.locationId,equipmentIds:clone(t.equipmentIds),sceneIds:clone(t.sceneIds),
        budgetIds:clone(t.budgetIds),requireDayReady:t.requireDayReady
      })),
      days: project.days.map(d => ({
        id:d.id,name:d.name,date:d.date,status:d.status,locationId:d.locationId,
        accessConfirmed:d.accessConfirmed,capacity:d.capacity,reserve:d.reserve,
        equipmentIds:clone(d.equipmentIds)
      })),
      scenes: project.scenes.map(s => ({
        id:s.id,name:s.name,set:s.set,cast:clone(s.cast),hours:s.hours,dayId:s.dayId,status:s.status
      })),
      budget: project.budget.map(b => ({
        id:b.id,name:b.name,estimate:b.estimate,committed:b.committed,actual:b.actual,kind:b.kind
      })),
      locations: project.locations.map(l => ({id:l.id,name:l.name,status:l.status})),
      equipment: project.equipment.map(e => ({
        id:e.id,name:e.name,status:e.status,pickup:e.pickup||'',returnDate:e.returnDate||''
      }))
    };
  }

  function mergeEnvelope(project,envelope){
    if(!envelope || envelope.version!==VERSION || envelope.projectId!==project.projectId) throw Error('Unsupported sync data.');
    const next=clone(project);
    next.settings={...next.settings,...envelope.settings};
    const mergeById=(key,allowed)=>{
      const incoming=new Map((envelope[key]||[]).map(x=>[x.id,x]));
      next[key]=next[key].map(existing=>{
        const remote=incoming.get(existing.id); if(!remote)return existing;
        const out={...existing}; for(const k of allowed)if(k in remote)out[k]=clone(remote[k]); return out;
      });
    };
    mergeById('tasks',['title','brief','completion','phase','category','due','dueLabel','status','deps','review','checklist','archived','dayId','offset','locationId','equipmentIds','sceneIds','budgetIds','requireDayReady']);
    mergeById('days',['name','date','status','locationId','accessConfirmed','capacity','reserve','equipmentIds']);
    mergeById('scenes',['name','set','cast','hours','dayId','status']);
    mergeById('budget',['name','estimate','committed','actual','kind']);
    mergeById('locations',['name','status']);
    mergeById('equipment',['name','status','pickup','returnDate']);
    next.updatedAt=envelope.updatedAt||next.updatedAt;
    return next;
  }

  const bytesToB64 = bytes => btoa(String.fromCharCode(...bytes));
  const b64ToBytes = value => Uint8Array.from(atob(value), c=>c.charCodeAt(0));

  async function keyFromPassphrase(passphrase,salt){
    const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(passphrase),'PBKDF2',false,['deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:180000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
  }
  async function encryptEnvelope(envelope,passphrase){
    if(!passphrase || passphrase.length<10)throw Error('Use a sync passphrase of at least 10 characters.');
    const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
    const key=await keyFromPassphrase(passphrase,salt);
    const plain=new TextEncoder().encode(JSON.stringify(envelope));
    const cipher=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,plain));
    return {v:1,salt:bytesToB64(salt),iv:bytesToB64(iv),data:bytesToB64(cipher)};
  }
  async function decryptEnvelope(packet,passphrase){
    if(!packet || packet.v!==1)throw Error('Unsupported encrypted sync packet.');
    const salt=b64ToBytes(packet.salt),iv=b64ToBytes(packet.iv),cipher=b64ToBytes(packet.data);
    const key=await keyFromPassphrase(passphrase,salt);
    const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv},key,cipher);
    return JSON.parse(new TextDecoder().decode(plain));
  }

  return {buildEnvelope,mergeEnvelope,encryptEnvelope,decryptEnvelope};
})();
