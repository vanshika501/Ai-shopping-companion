import React, { useState } from 'react';
import { api } from '../api.js';

export default function Dashboard() {
  const [sumInput, setSumInput] = useState({ url: '', title: '', description: '', price: '', features: '' });
  const [sumResult, setSumResult] = useState(null);
  const [cmpItems, setCmpItems] = useState([
    { title: '', price: '', features: '' },
    { title: '', price: '', features: '' },
  ]);
  const [cmpCriteria, setCmpCriteria] = useState({ budget: '', features: '' });
  const [cmpResult, setCmpResult] = useState(null);
  const [history, setHistory] = useState({ summaries: [], comparisons: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const summarize = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const body = sumInput.url
        ? { url: sumInput.url }
        : {
            title: sumInput.title,
            description: sumInput.description,
            price: sumInput.price ? Number(sumInput.price) : undefined,
            features: sumInput.features ? sumInput.features.split(',').map(s => s.trim()).filter(Boolean) : [],
          };
      const res = await api.post('/api/products/summarize', body);
      setSumResult(res);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const compare = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const items = cmpItems.map(i => ({
        title: i.title,
        price: i.price ? Number(i.price) : undefined,
        features: i.features ? i.features.split(',').map(s => s.trim()).filter(Boolean) : [],
      }));
      const criteria = {
        budget: cmpCriteria.budget || undefined,
        features: cmpCriteria.features ? cmpCriteria.features.split(',').map(s => s.trim()).filter(Boolean) : [],
      };
      const res = await api.post('/api/products/compare', { items, criteria });
      setCmpResult(res);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const suggest = async () => {
    setError(''); setLoading(true);
    try {
      const items = cmpItems.map(i => ({
        title: i.title,
        price: i.price ? Number(i.price) : undefined,
        features: i.features ? i.features.split(',').map(s => s.trim()).filter(Boolean) : [],
      }));
      const res = await api.post('/api/products/suggest', { items, criteria: cmpCriteria });
      setCmpResult(res);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const loadHistory = async () => {
    setError(''); setLoading(true);
    try {
      const [s, c] = await Promise.all([
        api.get('/api/products/history/summaries'),
        api.get('/api/products/history/comparisons'),
      ]);
      setHistory({ summaries: s.items || [], comparisons: c.items || [] });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="container">
      <div className="grid">
        <section className="card">
          <h2>Summarize Product</h2>
          <form onSubmit={summarize}>
            <div className="field"><label>Product URL</label><input value={sumInput.url} onChange={e=>setSumInput({...sumInput, url:e.target.value})} placeholder="https://..." /></div>
            <div className="divider">or provide details:</div>
            <div className="field"><label>Title</label><input value={sumInput.title} onChange={e=>setSumInput({...sumInput, title:e.target.value})} /></div>
            <div className="field"><label>Description</label><textarea value={sumInput.description} onChange={e=>setSumInput({...sumInput, description:e.target.value})} /></div>
            <div className="field"><label>Price</label><input type="number" value={sumInput.price} onChange={e=>setSumInput({...sumInput, price:e.target.value})} /></div>
            <div className="field"><label>Features (comma separated)</label><input value={sumInput.features} onChange={e=>setSumInput({...sumInput, features:e.target.value})} /></div>
            <button className="primary" disabled={loading}>{loading ? 'Please wait…' : 'Summarize'}</button>
          </form>
          {sumResult && (
            <div className="result">
              <h3>Summary</h3>
              <ul>
                {(sumResult.bullets || []).map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          )}
        </section>

        <section className="card">
          <h2>Compare / Suggest</h2>
          {cmpItems.map((it, idx) => (
            <div key={idx} className="subcard">
              <h4>Item {idx+1}</h4>
              <div className="field"><label>Title</label><input value={it.title} onChange={e=>{
                const c=[...cmpItems]; c[idx].title=e.target.value; setCmpItems(c);
              }} /></div>
              <div className="field"><label>Price</label><input type="number" value={it.price} onChange={e=>{
                const c=[...cmpItems]; c[idx].price=e.target.value; setCmpItems(c);
              }} /></div>
              <div className="field"><label>Features (comma separated)</label><input value={it.features} onChange={e=>{
                const c=[...cmpItems]; c[idx].features=e.target.value; setCmpItems(c);
              }} /></div>
            </div>
          ))}
          <button onClick={()=>setCmpItems([...cmpItems, { title:'', price:'', features:'' }])}>+ Add Item</button>
          <div className="subcard">
            <h4>Criteria</h4>
            <div className="field"><label>Budget</label><input value={cmpCriteria.budget} onChange={e=>setCmpCriteria({...cmpCriteria, budget:e.target.value})} /></div>
            <div className="field"><label>Desired features (comma separated)</label><input value={cmpCriteria.features} onChange={e=>setCmpCriteria({...cmpCriteria, features:e.target.value})} /></div>
          </div>
          <div className="actions">
            <button onClick={compare} className="primary" disabled={loading}>Compare</button>
            <button onClick={suggest} disabled={loading}>Suggest Best</button>
          </div>
          {cmpResult && (
            <div className="result">
              {cmpResult.best && (
                <div className="best">
                  <h3>Best Option</h3>
                  <div><strong>{cmpResult.best.title}</strong> — {String(cmpResult.best.price ?? 'N/A')}</div>
                  <div>{cmpResult.best.reason}</div>
                </div>
              )}
              <h3>Compared</h3>
              <ul>
                {(cmpResult.compared || []).map((p, i) => (
                  <li key={i}>
                    <div><strong>{p.title || 'Item'}</strong> — {String(p.price ?? 'N/A')}</div>
                    <div>Pros: {(p.pros || []).join(', ') || '—'}</div>
                    <div>Cons: {(p.cons || []).join(', ') || '—'}</div>
                    <div>Bullets:
                      <ul>{(p.bullets || []).map((b, j) => <li key={j}>{b}</li>)}</ul>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="card">
          <h2>History</h2>
          <div className="actions">
            <button onClick={loadHistory} disabled={loading}>Refresh History</button>
          </div>
          <h3>Summaries</h3>
          <ul>
            {history.summaries.map((s) => (
              <li key={s._id}>
                <strong>{s.input?.title || s.input?.sourceUrl || 'Item'}</strong>
                <ul>{(s.bullets || []).map((b, i) => <li key={i}>{b}</li>)}</ul>
              </li>
            ))}
          </ul>
          <h3>Comparisons</h3>
          <ul>
            {history.comparisons.map((c) => (
              <li key={c._id}>
                <div>Inputs: {(c.inputs || []).map(i=>i.title || 'Item').join(', ')}</div>
                <div>Best: {c.summary?.best?.title || '—'}</div>
              </li>
            ))}
          </ul>
        </section>
      </div>
      {error && <div className="error global">{error}</div>}
    </div>
  );
}
