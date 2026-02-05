import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LayoutDashboard, BriefcaseBusiness, Sparkles, Plus, Search, Trash2, ArrowRight, RefreshCw, X, CheckCircle2, Clock3, BarChart3 } from 'lucide-react';
import { api } from './api';
import type { Application, ApplicationInput, Summary, Breakdown, Status, Answer } from './types';
import './styles.css';

type Page = 'overview' | 'applications' | 'advisor';
const statuses: Status[] = ['APPLIED','ASSESSMENT','INTERVIEW','OFFER','REJECTED','WITHDRAWN'];
const emptyInput = (): ApplicationInput => ({ company:'', role:'', location:'', status:'APPLIED', appliedOn:new Date().toISOString().slice(0,10), resumeVersion:'Backend v1', jobUrl:'', jobDescription:'', notes:'' });
const pretty = (status: string) => status.charAt(0) + status.slice(1).toLowerCase();

function App() {
  const [page, setPage] = useState<Page>('overview');
  const [items,setItems] = useState<Application[]>([]);
  const [summary,setSummary] = useState<Summary | null>(null);
  const [roles,setRoles] = useState<Breakdown[]>([]);
  const [resumes,setResumes] = useState<Breakdown[]>([]);
  const [followUps,setFollowUps] = useState<Application[]>([]);
  const [modal,setModal] = useState(false);
  const [editing,setEditing] = useState<number | null>(null);
  const [draft,setDraft] = useState<ApplicationInput>(emptyInput());
  const [filter,setFilter] = useState('');
  const [question,setQuestion] = useState('Which roles are getting better responses?');
  const [answer,setAnswer] = useState<Answer | null>(null);
  const [loading,setLoading] = useState(false);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');

  async function refresh() {
    try {
      const [applications,stats,roleGroups,resumeGroups,followupList] = await Promise.all([
        api.applications(),api.summary(),api.roles(),api.resumes(),api.followUps()
      ]);
      setItems(applications); setSummary(stats); setRoles(roleGroups); setResumes(resumeGroups); setFollowUps(followupList); setError('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not connect to the server.'); }
  }
  useEffect(() => { void refresh(); }, []);

  function openNew() { setEditing(null); setDraft(emptyInput()); setModal(true); }
  function openEdit(item: Application) { setEditing(item.id); const { id: _id, ...input } = item; void _id; setDraft(input); setModal(true); }
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true);
    try { if (editing === null) await api.create(draft); else await api.update(editing,draft);
      setModal(false); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Save failed.'); }
    finally { setBusy(false); }
  }
  async function remove(item: Application) {
    if (!window.confirm(`Delete the application at ${item.company}?`)) return;
    try { await api.remove(item.id); await refresh(); } catch (e) { setError(String(e)); }
  }
  async function seed() {
    setBusy(true);
    try { const result = await api.loadDemo(); if (result.message) setError(result.message); await refresh(); }
    catch (e) { setError(String(e)); } finally { setBusy(false); }
  }
  async function ask(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setAnswer(null);
    try { setAnswer(await api.ask(question)); setError(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Advisor unavailable.'); }
    finally { setLoading(false); }
  }
  const filtered = items.filter(a => `${a.company} ${a.role} ${a.status}`.toLowerCase().includes(filter.toLowerCase()));
  const nav: { id: Page; label: string; icon: React.ReactNode }[] = [
    {id:'overview',label:'Overview',icon:<LayoutDashboard size={18}/>},
    {id:'applications',label:'Applications',icon:<BriefcaseBusiness size={18}/>},
    {id:'advisor',label:'AI advisor',icon:<Sparkles size={18}/>}
  ];
  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-logo">a<span>.</span></span><div><strong>applywise</strong><small>Job search workspace</small></div></div>
      <div className="menu-label">WORKSPACE</div>
      <nav>{nav.map(n => <button key={n.id} className={`nav-item ${page===n.id?'active':''}`} onClick={()=>setPage(n.id)}>{n.icon}{n.label}</button>)}</nav>
      <div className="sidebar-bottom"><div className="mini-mark"><CheckCircle2 size={16}/> Built for thoughtful job searches</div><span>Private local workspace · v0.1</span></div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> {page==='overview'?'Overview':page==='applications'?'Applications':'AI advisor'}</div><div className="top-actions"><span className="today">{new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span><button className="icon-button" title="Refresh data" onClick={()=>void refresh()}><RefreshCw size={16}/></button></div></header>
      <div className="content">
        {error && <div className="alert">{error}<button onClick={()=>setError('')}><X size={15}/></button></div>}
        {page==='overview' && <>
          <div className="page-intro"><div><div className="eyebrow">YOUR JOB SEARCH, AT A GLANCE</div><h1>Know where you stand.</h1><p>Track applications, spot patterns, and decide what to do next.</p></div><button className="primary" onClick={openNew}><Plus size={17}/> Add application</button></div>
          <div className="stats">
            <Stat label="Total applications" value={summary?.total??'—'} caption="All tracked roles" icon={<BriefcaseBusiness size={18}/>} />
            <Stat label="Positive responses" value={summary?.responses??'—'} caption="Assessment or further" icon={<CheckCircle2 size={18}/>} />
            <Stat label="Interview stages" value={summary?.interviews??'—'} caption="Including offers" icon={<BarChart3 size={18}/>} />
            <Stat label="Response rate" value={summary?`${summary.responseRate}%`:'—'} caption="Of tracked applications" icon={<ArrowRight size={18}/>} />
          </div>
          {items.length===0 ? <div className="empty-large"><BriefcaseBusiness size={30}/><h3>Start with a clearer picture</h3><p>Add your first application, or explore the dashboard with sample data.</p><div className="button-row"><button className="primary" onClick={openNew}>Add application</button><button className="secondary" disabled={busy} onClick={()=>void seed()}>Load demo data</button></div></div> : <>
            <div className="two-col"><section className="panel"><PanelTitle title="Responses by role" subtitle="Compare where you are hearing back"/><BreakdownBars groups={roles}/></section><section className="panel"><PanelTitle title="Resume performance" subtitle="Compare outcomes by version"/><BreakdownBars groups={resumes}/></section></div>
            <div className="two-col lower"><section className="panel"><PanelTitle title="Recent applications" subtitle="Your latest activity" action={<button className="text-button" onClick={()=>setPage('applications')}>View all <ArrowRight size={14}/></button>}/><div className="compact-list">{items.slice(0,5).map(item=><div className="compact-row" key={item.id}><div className="company-mark">{item.company.charAt(0)}</div><div className="compact-name"><strong>{item.company}</strong><small>{item.role}</small></div><StatusPill status={item.status}/></div>)}</div></section><section className="panel"><PanelTitle title="Follow-up queue" subtitle="Applied 14+ days ago without a recorded response"/><div className="compact-list">{followUps.length?followUps.slice(0,5).map(item=><div className="compact-row" key={item.id}><Clock3 size={17} className="muted-icon"/><div className="compact-name"><strong>{item.company}</strong><small>Applied {new Date(item.appliedOn+'T12:00:00').toLocaleDateString()}</small></div><span className="small-tag">Review</span></div>):<p className="quiet">Nothing to follow up on right now.</p>}</div></section></div>
          </>}
        </>}
        {page==='applications' && <><div className="page-intro"><div><div className="eyebrow">APPLICATION TRACKER</div><h1>All applications</h1><p>Keep your job search organized in one place.</p></div><button className="primary" onClick={openNew}><Plus size={17}/> Add application</button></div><section className="panel table-panel"><div className="panel-toolbar"><span><strong>{items.length}</strong> applications tracked</span><div className="search"><Search size={16}/><input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Search company, role, status"/></div></div><div className="table-scroll"><table><thead><tr><th>Company / Role</th><th>Applied</th><th>Resume</th><th>Status</th><th></th></tr></thead><tbody>{filtered.map(item=><tr key={item.id}><td><div className="table-company"><div className="company-mark">{item.company.charAt(0)}</div><div><strong>{item.company}</strong><small>{item.role}</small></div></div></td><td>{item.appliedOn}</td><td>{item.resumeVersion||'Default'}</td><td><StatusPill status={item.status}/></td><td><div className="table-actions"><button onClick={()=>openEdit(item)}>Edit</button><button title="Delete" onClick={()=>void remove(item)}><Trash2 size={15}/></button></div></td></tr>)}</tbody></table></div>{filtered.length===0&&<div className="empty-table">{items.length?'No matches. Try another search.':'No applications yet. Add one or load demo data.'}</div>}</section></>}
        {page==='advisor' && <><div className="page-intro"><div><div className="eyebrow">APPLICATION INTELLIGENCE</div><h1>Your AI advisor</h1><p>Ask questions about your applications and get answers grounded in your records.</p></div></div><div className="advisor-layout"><section className="panel advisor-panel"><div className="advisor-heading"><div className="sparkle"><Sparkles size={22}/></div><div><h2>Ask ApplyWise</h2><p>I'll use your tracked data to look for patterns.</p></div></div><div className="suggestions">{['Which roles get the most responses?','Compare my resume versions','Which applications need follow-up?','How is my job search going?'].map(q=><button key={q} onClick={()=>setQuestion(q)}>{q}</button>)}</div><form onSubmit={e=>void ask(e)} className="ask-form"><label htmlFor="question">Your question</label><textarea id="question" maxLength={600} value={question} onChange={e=>setQuestion(e.target.value)} rows={3}/><button disabled={loading||!question.trim()} className="primary">{loading?'Analyzing...':'Analyze my applications'} <ArrowRight size={16}/></button></form>{answer&&<div className="answer"><div className="answer-label"><Sparkles size={15}/> Analysis <span>{answer.source==='ai'?'AI assisted':'Local insights'} · {answer.toolUsed}</span></div><p>{answer.answer}</p></div>}</section><aside className="panel how-panel"><h3>How this works</h3><div className="guide-step"><span>01</span><div><strong>Read your question</strong><p>Choose the relevant analytics query.</p></div></div><div className="guide-step"><span>02</span><div><strong>Query your data</strong><p>Count real outcomes and compare groups.</p></div></div><div className="guide-step"><span>03</span><div><strong>Explain the findings</strong><p>Offer a next step without guessing why employers rejected you.</p></div></div><div className="notice">Runs with local insights for free. Add an API key to enable model-based tool selection and explanations.</div></aside></div></>}
      </div>
    </main>
    {modal&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false)}}><div className="modal"><div className="modal-head"><div><h2>{editing===null?'Add application':'Edit application'}</h2><p>Keep the details useful, not complicated.</p></div><button className="icon-button" onClick={()=>setModal(false)}><X size={20}/></button></div><form onSubmit={e=>void save(e)}><div className="form-grid"><Field label="Company" required><input required value={draft.company} onChange={e=>setDraft({...draft,company:e.target.value})} placeholder="e.g. Acme"/></Field><Field label="Job title" required><input required value={draft.role} onChange={e=>setDraft({...draft,role:e.target.value})} placeholder="e.g. Java Developer"/></Field><Field label="Location"><input value={draft.location||''} onChange={e=>setDraft({...draft,location:e.target.value})} placeholder="e.g. Houston, TX"/></Field><Field label="Status"><select value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value as Status})}>{statuses.map(s=><option key={s} value={s}>{pretty(s)}</option>)}</select></Field><Field label="Applied on"><input type="date" required value={draft.appliedOn} onChange={e=>setDraft({...draft,appliedOn:e.target.value})}/></Field><Field label="Resume version"><input value={draft.resumeVersion||''} onChange={e=>setDraft({...draft,resumeVersion:e.target.value})} placeholder="Backend v2"/></Field><div className="full"><Field label="Job posting link"><input type="url" value={draft.jobUrl||''} onChange={e=>setDraft({...draft,jobUrl:e.target.value})} placeholder="https://..."/></Field></div><div className="full"><Field label="Notes"><textarea rows={3} value={draft.notes||''} onChange={e=>setDraft({...draft,notes:e.target.value})} placeholder="Recruiter name, follow-up details..."/></Field></div></div><div className="modal-footer"><button type="button" className="secondary" onClick={()=>setModal(false)}>Cancel</button><button disabled={busy} className="primary" type="submit">{busy?'Saving...':'Save application'}</button></div></form></div></div>}
  </div>;
}
function Field({label,required,children}:{label:string;required?:boolean;children:React.ReactNode}) {return <label className="field"><span>{label}{required?' *':''}</span>{children}</label>}
function StatusPill({status}:{status:Status}) {return <span className={`status status-${status.toLowerCase()}`}>{pretty(status)}</span>}
function PanelTitle({title,subtitle,action}:{title:string;subtitle:string;action?:React.ReactNode}) {return <div className="panel-head"><div><h2>{title}</h2><p>{subtitle}</p></div>{action}</div>}
function Stat({label,value,caption,icon}:{label:string;value:string|number;caption:string;icon:React.ReactNode}) {return <div className="stat"><div className="stat-top"><span>{label}</span>{icon}</div><strong>{value}</strong><small>{caption}</small></div>}
function BreakdownBars({groups}:{groups:Breakdown[]}) {return <div className="bars">{groups.length===0?<p className="quiet">No results yet.</p>:groups.map(g=><div className="bar-row" key={g.name}><div className="bar-label"><strong>{g.name}</strong><span>{g.responses}/{g.applied} responses · {g.responseRate}%</span></div><div className="track"><div style={{width:`${g.responseRate}%`}}/></div></div>)}<p className="footnote">Response = assessment, interview, or offer. Rejections without a prior positive response aren't counted.</p></div>}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
