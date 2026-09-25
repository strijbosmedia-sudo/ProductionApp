
'use strict';

/* ProductionApp V2 UI shell.
   Keeps the existing production model and validation, but replaces the everyday interface. */

const V2_COPY = {
 A01:{title:'Check submission requirements',desc:'Confirm exactly what must be submitted, in what format, and when.',steps:['Confirm required files','Confirm runtime guidance','Confirm what level of finish is acceptable','Confirm documentation requirements','Confirm presentation date'],done:'The examination requirements and dates are written down.'},
 A02:{title:'Set the production budget',desc:'Choose the cash ceiling and when that money is actually available.',steps:['Set the maximum cash spend','Note when funds become available','Keep a contingency amount'],done:'A realistic cash ceiling and contingency are set.'},
 A03:{title:'Mark unavailable dates',desc:'Map your own capacity through January before scheduling the production around it.',steps:['Add university commitments','Add paid work','Add personal unavailable dates','Mark realistic weekly production capacity'],done:'Your unavailable dates and weekly capacity are visible.'},
 A04:{title:'Prepare the brand request',desc:'Decide exactly what you are asking the brand for before making contact.',steps:['Define product-use request','Define vending-machine request','Decide whether a cameo is requested','Separate funding/support request','Set a response deadline'],done:'The brand request is short, specific and ready to send.'},
 A05:{title:'Find production support',desc:'Bring in someone who can help coordinate people, dates and logistics.',steps:['Define the role','Choose who to approach','Agree responsibilities and availability'],done:'A coordinator or producing support role is accepted.'},
 A06:{title:'Collect cast & crew availability',desc:'Find the dates people can realistically prep and shoot.',steps:['Ask cast for availability','Ask core crew for availability','Record conflicts','Identify unanswered people'],done:'Availability is recorded for the production window.'},
 A07:{title:'Confirm the brand arrangement',desc:'Get the minimum permissions and review process in writing.',steps:['Confirm what can appear on screen','Confirm any review/approval process','Save written confirmation'],done:'The agreed brand arrangement is documented.'},
 A08:{title:'Resolve the cameo',desc:'Choose how the cameo will work and have a fallback if it cannot happen.',steps:['Confirm performer interest','Confirm viable dates','Confirm capture method','Choose fallback performer or alternative'],done:'The cameo plan and fallback are decided.'},
 A09:{title:'Confirm production permissions',desc:'Make sure participant, location and important asset agreements are covered.',steps:['Check participant agreements','Check location agreement','Check relevant asset/brand permission','Check university production process'],done:'Required production permissions are accounted for.'},
 A10:{title:'Lock the working budget',desc:'Turn estimates and in-kind promises into a budget you can actually produce with.',steps:['Review cash estimates','Review committed costs','Review in-kind support','Set contingency','Approve the working total'],done:'The working production budget is approved.'},
 L01:{title:'Write the location brief',desc:'Define what the main location must provide before looking for places.',steps:['List required rooms','List prep and storage needs','List power requirements','List sound requirements','List blackout/daylight needs','List access dates'],done:'The location requirements fit on one clear brief.'},
 L02:{title:'Build the location shortlist',desc:'Contact realistic leads and identify a preferred option plus fallback.',steps:['Contact location leads','Record responses','Choose shortlist','Name a fallback'],done:'A preferred location and fallback are identified.'},
 L03:{title:'Scout the location',desc:'Visit the shortlisted building and check whether it works practically.',steps:['Photograph key rooms','Measure important distances','Check room tone and noise','Check daylight and blackout','Compare preferred and fallback'],done:'The scout notes are complete enough to choose a location.'},
 L04:{title:'Run the technical scout',desc:'Test whether the preferred location works for camera, sound, power and crew movement.',steps:['Check power','Check sound conditions','Check blackout','Check camera movement','Check vending-machine placement','Check holding/support spaces'],done:'The technical team has identified the location constraints.'},
 L05:{title:'Lock the location',desc:'Confirm the exact access, costs, keys, storage and restoration obligations.',steps:['Confirm shoot and prep dates','Confirm keyholder/access process','Confirm fee','Confirm storage','Confirm dressing permissions','Confirm strike/restoration requirements','Save written confirmation'],done:'The location is booked and usable for the planned dates.'},
 L06:{title:'Plan the vending machines',desc:'Decide how many machines are needed and how they get into position.',steps:['Confirm machine count','Confirm exact positions','Confirm transport','Confirm operation/power needs'],done:'The vending-machine logistics are workable.'},
 L07:{title:'Set the location fallback plan',desc:'Know what happens if the main location or pickup access fails.',steps:['Confirm fallback option','Confirm pickup/re-entry procedure','Record who makes the call'],done:'A usable fallback and pickup procedure exist.'},
 C01:{title:'Write the casting brief',desc:'Define the roles, dates and expectations before approaching performers.',steps:['Define principal roles','Define Richard and alien roles','Include date expectations','Include expense terms'],done:'The casting brief is ready to send.'},
 C02:{title:'Audition the principal cast',desc:'Review the principal performers together where possible.',steps:['Arrange auditions/read','Review chemistry','Record preferred choices','Record fallback choices'],done:'Preferred and fallback principal cast choices are clear.'},
 C03:{title:'Lock the cast',desc:'Confirm performers, date holds and costume measurements.',steps:['Confirm each actor','Confirm shoot-date holds','Confirm expense terms','Collect costume measurements'],done:'Principal cast and required dates are confirmed.'},
 C04:{title:'Run the table read',desc:'Read the film through, time it and flag pacing problems before the shoot.',steps:['Schedule table read','Time the full script','Mark pacing issues','Mark scene-specific notes'],done:'Runtime and pacing notes are captured.'},
 C05:{title:'Create Chloe voice & photo assets',desc:'Record the voice-over and prepare the required photo material.',steps:['Record voice-over','Select or capture photo assets','Back up originals','Link assets to the relevant scenes'],done:'The voice and photo assets are ready for production.'},
 C06:{title:'Rehearse blocking & comedy',desc:'Work through principal blocking, comic timing and the alien performance.',steps:['Rehearse principal blocking','Rehearse comic beats','Rehearse alien movement/performance','Record changes'],done:'Key performance and blocking choices are established.'},
 C07:{title:'Lock wardrobe continuity',desc:'Fit wardrobe, photograph continuity and prepare backup/reset notes.',steps:['Complete fittings','Take continuity photos','Identify backups','Document reset needs'],done:'Wardrobe can be reproduced consistently on set.'}
};

function v2UpgradeContent(){
 if(state.settings.uiVersion>=2)return;
 for(const [id,c] of Object.entries(V2_COPY)){
   const t=getTask(id); if(!t)continue;
   t.title=c.title; t.brief=c.desc; t.completion=c.done;
   if(!t.checklist.length && !['Done','Not applicable'].includes(t.status)) t.checklist=c.steps.map(text=>({text,done:false}));
 }
 state.settings.uiVersion=2;
 try{save()}catch{}
}

function v2Desc(t){
 return (V2_COPY[t.id]?.desc || t.brief || t.context || '').replace(/^Purpose:\s*/,'').split(' Coordinate this')[0];
}
function v2OpenTasks(){
 return state.tasks.filter(t=>!t.archived&&!satisfied(t)&&t.status!=='Not applicable');
}
function v2Status(t){
 const e=effective(t);
 if(e==='Done')return ['Done','good'];
 if(e==='Blocked')return ['Blocked','bad'];
 if(e==='Needs review')return ['Review','warn'];
 if(e==='Waiting')return ['Waiting','warn'];
 if(e==='In progress')return ['Doing',''];
 return ['To do',''];
}
function v2Pill(t){
 const [label,cls]=v2Status(t);
 return '<span class="v2-pill '+cls+'">'+esc(label)+'</span>';
}
function v2TaskRow(t){
 const due=taskDue(t),u=urgency(t);
 return '<div class="v2-task-row"><div class="v2-task-main"><button class="v2-task-title" data-action="task" data-id="'+esc(t.id)+'">'+esc(t.title)+'</button>'+
   '<div class="v2-task-desc">'+esc(v2Desc(t))+'</div><div class="v2-meta"><span>'+esc(t.category)+'</span>'+
   (due?'<span>'+esc(dateLabel(due))+'</span>':'<span>Date open</span>')+
   (u.level==='red'||u.level==='orange'?'<span class="v2-pill '+(u.level==='red'?'bad':'warn')+'">'+esc(u.label)+'</span>':'')+
   '</div></div>'+v2Pill(t)+'</div>';
}
function v2Nav(){
 const items=[['today','Today'],['plan','Plan'],['timeline','Timeline'],['production','Production'],['money','Money']];
 $('nav').innerHTML=items.map(([id,label],i)=>'<a href="#'+id+'" class="'+(route===id?'active':'')+'" '+(route===id?'aria-current="page"':'')+'><span>0'+i+'</span>'+label+'</a>').join('');
}
function v2Header(){
 $('#date').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'});
 $('#undo').disabled=!history.length||conflict;
 $('#save-state').textContent=conflict?'Editing paused':storageOK?'● Saved on this device':'Unsaved locally';
}

function v2Today(){
 const open=v2OpenTasks().sort((a,b)=>(taskDue(a)||'9999').localeCompare(taskDue(b)||'9999'));
 const actionable=open.filter(t=>effective(t)!=='Blocked'&&effective(t)!=='Waiting'&&effective(t)!=='Needs review');
 const next=actionable[0]||open[0];
 const overdue=open.filter(t=>taskDue(t)&&taskDue(t)<today());
 const blocked=open.filter(t=>effective(t)==='Blocked');
 const reviews=open.filter(t=>effective(t)==='Needs review');
 const b=budgetTotals();
 const confirmedCast=state.people.filter(p=>p.commitment==='Confirmed').length;
 const activeDays=state.days.filter(d=>d.status!=='Cancelled');
 const readyDays=activeDays.filter(d=>!dayIssues(d).length&&['Confirmed','Completed'].includes(d.status)).length;
 $('#main').innerHTML=
 '<div class="v2-top"><div><div class="v2-kicker">NIGHT SHIFT / PRODUCTION</div><h1>What needs to happen next?</h1><p class="v2-lede">A working view of the film, not a database of everything that could possibly matter.</p></div><div class="v2-actions"><button data-action="settings">Project</button><button class="v2-primary" data-action="new-task">+ Task</button></div></div>'+
 '<div class="v2-grid"><div class="v2-stack">'+
   '<section class="v2-card v2-next"><div class="v2-kicker">NEXT UP</div>'+(next?
     '<h2>'+esc(next.title)+'</h2><p>'+esc(v2Desc(next))+'</p><div class="v2-meta">'+(taskDue(next)?'<span>'+esc(dateLabel(taskDue(next)))+'</span>':'')+'<span>'+esc(next.category)+'</span>'+v2Pill(next)+'</div><div style="margin-top:18px"><button class="v2-primary" data-action="task" data-id="'+esc(next.id)+'">Open task</button></div>'
     :'<h2>You are caught up.</h2><p>There is no open task that can be acted on right now.</p>')+'</section>'+
   '<section class="v2-card"><div class="v2-section-head"><h2>Up next</h2><a href="#plan">See plan →</a></div><div class="v2-list">'+actionable.slice(1,6).map(v2TaskRow).join('')+(actionable.length<2?'<div class="v2-empty">Nothing else is immediately actionable.</div>':'')+'</div></section>'+
   '<section class="v2-card"><div class="v2-section-head"><h2>Coming up</h2><a href="#timeline">Timeline →</a></div><div class="v2-list">'+open.filter(t=>taskDue(t)&&(!next||t.id!==next.id)).slice(0,6).map(v2TaskRow).join('')+'</div></section>'+
 '</div><div class="v2-stack">'+
   '<section class="v2-card"><h2>Needs attention</h2><div class="v2-alert"><strong>'+overdue.length+'</strong> overdue tasks</div><div class="v2-alert"><strong>'+blocked.length+'</strong> blocked</div><div class="v2-alert"><strong>'+reviews.length+'</strong> need review</div></section>'+
   '<section class="v2-card soft"><h2>Production health</h2><div class="v2-statgrid"><div class="v2-stat"><span class="v2-kicker">CAST / CREW</span><strong>'+confirmedCast+'</strong><span class="muted">confirmed people</span></div><div class="v2-stat"><span class="v2-kicker">SHOOT DAYS</span><strong>'+readyDays+'/'+activeDays.length+'</strong><span class="muted">ready</span></div><div class="v2-stat"><span class="v2-kicker">BUDGET</span><strong>€'+b.exposure.toFixed(0)+'</strong><span class="muted">of €'+state.settings.budgetCap.toFixed(0)+'</span></div><div class="v2-stat"><span class="v2-kicker">SCENES</span><strong>'+state.scenes.filter(s=>s.status==='Complete').length+'/'+state.scenes.length+'</strong><span class="muted">complete</span></div></div></section>'+
   '<section class="v2-sync-note"><span class="v2-dot"></span><div><strong style="color:var(--v2-text)">Private by default</strong><br>Progress is stored on this device. Cross-device sync will only include non-sensitive project state; contacts and private notes remain local.</div></section>'+
 '</div></div>';
}

let v2PlanPhase='all';
function v2Plan(){
 let ts=state.tasks.filter(t=>!t.archived);
 if(v2PlanPhase!=='all')ts=ts.filter(t=>t.phase===v2PlanPhase);
 const open=ts.filter(t=>!satisfied(t)&&t.status!=='Not applicable');
 const sections=[
  ['Right now',open.filter(t=>!['Blocked','Waiting','Needs review'].includes(effective(t)))],
  ['Waiting',open.filter(t=>['Waiting','Blocked','Needs review'].includes(effective(t)))],
  ['Completed',ts.filter(t=>satisfied(t))]
 ];
 $('#main').innerHTML='<div class="v2-top"><div><div class="v2-kicker">PLAN</div><h1>The whole production, without the noise.</h1><p class="v2-lede">Work is grouped by what you can do, what is waiting, and what is already resolved.</p></div><div class="v2-actions"><button class="v2-primary" data-action="new-task">+ Task</button></div></div>'+
 '<div class="v2-tabs">'+[['all','All'],['pre','Pre-production'],['production','Shoot'],['post','Post']].map(([id,l])=>'<button data-action="v2-plan-phase" data-id="'+id+'" class="'+(v2PlanPhase===id?'selected':'')+'">'+l+'</button>').join('')+'</div>'+
 sections.map(([name,items])=>'<section class="v2-section"><div class="v2-section-head"><h2>'+name+'</h2><span class="v2-count">'+items.length+'</span></div><div class="v2-card">'+(items.length?items.slice(0,name==='Completed'?20:100).map(v2TaskRow).join(''):'<div class="v2-empty">Nothing here.</div>')+'</div></section>').join('');
}

function v2Timeline(){
 const dated=state.tasks.filter(t=>!t.archived&&taskDue(t)).sort((a,b)=>taskDue(a).localeCompare(taskDue(b)));
 const milestones=['G01','N05','E03','E06','E07','E08','F03'].map(getTask).filter(Boolean);
 const months=[...new Set(dated.map(t=>taskDue(t).slice(0,7)))].slice(0,10);
 if(!months.length)months.push(today().slice(0,7));
 const label=m=>new Date(m+'-01T12:00:00').toLocaleDateString(undefined,{month:'short',year:'2-digit'});
 function cellsFor(labelText,predicate,renderItem){
   return '<div class="v2-time-cell v2-time-label">'+labelText+'</div>'+months.map(m=>'<div class="v2-time-cell">'+predicate(m).map(renderItem).join('')+'</div>').join('');
 }
 $('#main').innerHTML='<div class="v2-top"><div><div class="v2-kicker">TIMELINE</div><h1>See the film unfold.</h1><p class="v2-lede">Major work, milestones and shoot days in actual calendar context.</p></div></div>'+
 '<div class="v2-timeline"><div class="v2-time-grid"><div class="v2-time-cell header v2-time-label"></div>'+months.map(m=>'<div class="v2-time-cell header">'+label(m)+'</div>').join('')+
 cellsFor('Milestones',m=>milestones.filter(t=>taskDue(t)?.startsWith(m)),t=>'<div class="v2-time-event"><span class="v2-time-dot"></span><button class="v2-task-title" data-action="task" data-id="'+t.id+'">'+esc(t.title)+'</button></div>')+
 cellsFor('Shoot days',m=>state.days.filter(d=>d.date?.startsWith(m)),d=>'<div class="v2-time-event"><span class="v2-time-dot"></span><button class="v2-task-title" data-action="day" data-id="'+d.id+'">'+esc(d.name)+'</button><div class="muted">'+esc(dateLabel(d.date))+'</div></div>')+
 cellsFor('Tasks',m=>dated.filter(t=>taskDue(t).startsWith(m)&&!milestones.some(x=>x.id===t.id)).slice(0,8),t=>'<div class="v2-time-event" style="margin-bottom:9px"><button class="v2-task-title" data-action="task" data-id="'+t.id+'">'+esc(t.title)+'</button><div class="muted">'+esc(dateLabel(taskDue(t)))+'</div></div>')+
 '</div></div>'+
 '<section class="v2-section"><div class="v2-section-head"><h2>Dates still open</h2><span class="v2-count">'+state.tasks.filter(t=>!t.archived&&!satisfied(t)&&!taskDue(t)).length+'</span></div><div class="v2-card">'+state.tasks.filter(t=>!t.archived&&!satisfied(t)&&!taskDue(t)).slice(0,12).map(v2TaskRow).join('')+'</div></section>';
}

function v2Production(){
 const days=state.days.filter(d=>d.status!=='Cancelled');
 $('#main').innerHTML='<div class="v2-top"><div><div class="v2-kicker">PRODUCTION</div><h1>The concrete world of the shoot.</h1><p class="v2-lede">Shoot days, scenes, people, locations and equipment live here. Complex things get complex editors; simple tasks do not.</p></div><div class="v2-actions"><button class="v2-primary" data-action="new-day">+ Shoot day</button></div></div>'+
 '<div class="v2-tabs"><button class="selected">Shoot days</button><a href="#book" style="display:none">legacy</a></div>'+
 '<section class="v2-card">'+days.map(d=>{const issues=dayIssues(d);return '<div class="v2-day-card"><div><div class="v2-kicker">'+esc(dateLabel(d.date))+' / '+esc(d.status)+'</div><h2>'+esc(d.name)+'</h2><div class="v2-meta"><span>'+esc(state.locations.find(l=>l.id===d.locationId)?.name||'Location open')+'</span><span>'+dayHours(d)+' / '+d.capacity+' set hours</span><span>'+state.scenes.filter(s=>s.dayId===d.id).length+' scenes</span></div>'+(issues.length?'<p class="muted" style="margin-top:10px">'+esc(issues.slice(0,2).join(' · '))+'</p>':'')+'</div><div><span class="v2-pill '+(issues.length?'warn':'good')+'">'+(issues.length?issues.length+' issues':'Ready')+'</span><div style="margin-top:10px"><button data-action="day" data-id="'+d.id+'">Open day</button></div></div></div>'}).join('')+'</section>'+
 '<section class="v2-section"><div class="v2-section-head"><h2>Scene register</h2><span class="v2-count">'+state.scenes.length+'</span></div><div class="v2-card">'+state.scenes.map(s=>'<div class="v2-task-row"><div><button class="v2-task-title" data-action="scene" data-id="'+s.id+'">'+esc(s.id+' · '+s.name)+'</button><div class="v2-meta"><span>'+esc(s.set)+'</span><span>'+s.hours+'h</span><span>'+esc(s.dayId||'No shoot day')+'</span></div></div><span class="v2-pill">'+esc(s.status)+'</span></div>').join('')+'</div></section>';
}

function v2Money(){ budgetView(); }

render=function(){
 route=location.hash.slice(1)||'today';
 if(!['today','plan','timeline','production','money'].includes(route))route='today';
 v2Nav();v2Header();
 if(route==='today')v2Today();
 else if(route==='plan')v2Plan();
 else if(route==='timeline')v2Timeline();
 else if(route==='production')v2Production();
 else v2Money();
};

taskEditor=function(id){
 const t=getTask(id);
 if(!t)return originalV2NewTask();
 const [status]=v2Status(t);
 openDialog('<div class="v2-dialog-head"><div><div class="v2-kicker">'+esc(t.category)+' / '+esc(t.phase)+'</div><h2>'+esc(t.title)+'</h2></div><button type="button" data-action="close">✕</button></div>'+
 '<p class="v2-dialog-copy">'+esc(v2Desc(t))+'</p>'+
 '<div class="v2-quick-status">'+['Not started','In progress','Waiting','Done'].map(s=>'<button type="button" data-action="v2-set-status" data-id="'+t.id+'" data-status="'+s+'" class="'+(t.status===s?'selected':'')+'">'+(s==='Not started'?'To do':s==='In progress'?'Doing':s)+'</button>').join('')+'</div>'+
 '<div class="v2-card soft"><div class="v2-section-head"><h3>To do</h3><span class="v2-count">'+t.checklist.filter(c=>c.done).length+'/'+t.checklist.length+'</span></div>'+
 (t.checklist.length?t.checklist.map((c,i)=>'<label class="v2-step"><input type="checkbox" data-action="v2-check" data-id="'+t.id+'" data-index="'+i+'" '+(c.done?'checked':'')+'><span>'+esc(c.text)+'</span></label>').join(''):'<p class="muted">No checklist needed for this task.</p>')+'</div>'+
 '<div class="v2-meta" style="margin-top:18px">'+(taskDue(t)?'<span>Due '+esc(dateLabel(taskDue(t)))+'</span>':'<span>Date open</span>')+(t.owner?'<span>'+esc(t.owner)+'</span>':'')+(blockers(t).length?'<span class="v2-pill bad">'+blockers(t).length+' blocker'+(blockers(t).length===1?'':'s')+'</span>':'')+'</div>'+
 (t.completion?'<p class="hint"><strong>Done when:</strong> '+esc(t.completion)+'</p>':'')+
 '<details class="v2-details"><summary>Details & advanced</summary><label>Notes</label><textarea id="v2-notes">'+esc(t.notes)+'</textarea><label>Target date</label><input id="v2-due" type="date" value="'+esc(t.due)+'"><p class="hint">Dependencies, linked resources and other production logic remain active in the background.</p><button type="button" data-action="v2-save-details" data-id="'+t.id+'">Save details</button></details>'+
 '<div class="form-actions"><button type="button" data-action="close">Close</button></div>',()=>{});
};
const originalV2NewTask=()=>{ location.hash='plan'; setTimeout(()=>toast('New-task editor is still available in the legacy model; V2 creation comes next.'),0); };

document.addEventListener('click',e=>{
 const b=e.target.closest('[data-action]');if(!b)return;
 const id=b.dataset.id;
 if(b.dataset.action==='v2-plan-phase'){v2PlanPhase=id;v2Plan();return}
 if(b.dataset.action==='v2-set-status'){
   const t=getTask(id),s=b.dataset.status;
   if(s==='Done'&&(blockers(t).length||t.checklist.some(c=>!c.done))){toast('Finish the checklist and resolve blockers first.');return}
   mutate('Updated '+t.title,()=>{t.status=s;t.review=false}); if($('#editor').open)taskEditor(id); return;
 }
 if(b.dataset.action==='v2-check'){
   const t=getTask(id),i=Number(b.dataset.index);
   mutate('Updated '+t.title,()=>{t.checklist[i].done=!t.checklist[i].done;if(t.status==='Not started')t.status='In progress'});
   if($('#editor').open)taskEditor(id);return;
 }
 if(b.dataset.action==='v2-save-details'){
   const t=getTask(id),notes=$('#v2-notes').value,due=$('#v2-due').value;
   mutate('Updated '+t.title,()=>{t.notes=notes;t.due=due});toast('Task details saved.');return;
 }
},true);

v2UpgradeContent();
render();
