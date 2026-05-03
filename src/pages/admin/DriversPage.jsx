import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCodeLib from 'qrcode';
import { getCorporationSettings, addDriver, deleteDriver, getDetailedDriverStats, updateDriver } from '../../store/reviewsStore';
import { StarRating } from '../../components/ReviewSidebar';
import styles from './DriversPage.module.css';

export default function DriversPage() {
  const [settings, setSettings] = useState(() => getCorporationSettings());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  
  const [newDriver, setNewDriver] = useState({ name: '', phone: '', vehicle: 'Taxi', location: '', pin: '' });
  const [editData, setEditData] = useState({ phone: '', pin: '', name: '', vehicle: 'Taxi', location: '' });
  
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const stats = useMemo(() => {
    if (!selectedDriver) return null;
    return getDetailedDriverStats(selectedDriver.id);
  }, [selectedDriver]);

  const handleAddDriver = (e) => {
    e.preventDefault();
    const pinToSet = newDriver.pin || Math.floor(1000 + Math.random() * 9000).toString();
    const added = addDriver({ ...newDriver, pin: pinToSet });
    setSettings(getCorporationSettings());
    setShowAddModal(false);
    setNewDriver({ name: '', phone: '', vehicle: 'Taxi', location: '', pin: '' });
    setSelectedDriver(added);
    setShowQRModal(true);
  };

  const handleEditDriver = (e) => {
    e.preventDefault();
    const updates = { ...editData };
    if (updates.pin !== selectedDriver.pin) {
      updates.needsPinReset = true;
    }
    updateDriver(selectedDriver.id, updates);
    setSettings(getCorporationSettings());
    setShowEditModal(false);
    setSelectedDriver(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this driver?')) {
      deleteDriver(id);
      setSettings(getCorporationSettings());
    }
  };

  useEffect(() => {
    if (showQRModal && selectedDriver && canvasRef.current) {
      const reviewUrl = `${window.location.origin}/r/${selectedDriver.token}`;
      QRCodeLib.toCanvas(canvasRef.current, reviewUrl, {
        width: 240,
        margin: 1,
        color: { dark: '#1E3A8A', light: '#ffffff' },
      });
    }
  }, [showQRModal, selectedDriver]);

  const handlePrint = () => {
    const reviewUrl = `${window.location.origin}/r/${selectedDriver.token}`;
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Driver QR Card - ${selectedDriver.name}</title>
          <style>
            body { font-family: 'Plus Jakarta Sans', sans-serif; text-align: center; padding: 40px; color: #111827; }
            .card { border: 2px solid #e5e7eb; border-radius: 24px; padding: 40px; max-width: 400px; margin: 0 auto; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
            .corp { font-weight: 800; color: #2563EB; font-size: 14px; text-transform: uppercase; margin-bottom: 20px; letter-spacing: 1px; }
            h1 { font-size: 28px; margin: 0 0 4px 0; }
            .id { font-family: 'JetBrains Mono', monospace; color: #6b7280; margin-bottom: 24px; font-size: 14px; }
            .qr-wrap { margin-bottom: 24px; }
            img { border: 1px solid #e5e7eb; padding: 12px; border-radius: 16px; background: white; }
            .instr { font-weight: 700; font-size: 20px; margin-bottom: 8px; }
            .link-box { background: #f3f4f6; padding: 12px; border-radius: 12px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2563EB; word-break: break-all; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="corp">${settings.name}</div>
            <h1>${selectedDriver.name}</h1>
            <div class="id">${selectedDriver.id}</div>
            <div class="qr-wrap">
              <img src="${canvasRef.current.toDataURL()}" width="220" />
            </div>
            <div class="instr">Scan to rate your ride</div>
            <div class="link-box">${reviewUrl}</div>
          </div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const viewReviews = (driverId) => {
    navigate(`/admin/reviews?driver=${driverId}`);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Drivers & Fleet</h1>
          <p className={styles.subtitle}>Manage your drivers, phone numbers, and PINs.</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowAddModal(true)}>
          <span className="material-icons-round">person_add</span>
          Add New Driver
        </button>
      </header>

      <div className={styles.driverGrid}>
        {settings.drivers?.map(driver => (
          <div key={driver.id} className={styles.driverCard}>
            <div className={styles.cardInfo}>
              <div className={styles.avatar}>
                <span className="material-icons-round">person</span>
              </div>
              <div className={styles.details}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3>{driver.name}</h3>
                  {driver.needsPinReset && <span className={styles.resetBadge}>NEW</span>}
                </div>
                <span className={styles.idMono}>{driver.id} • {driver.phone}</span>
                <div className={styles.meta}>
                  <span className={styles.vehicleTag}>{driver.vehicle}</span>
                  <span className={styles.location}>{driver.location}</span>
                </div>
              </div>
            </div>
            <div className={styles.cardActions}>
              <button 
                className={styles.qrBtn} 
                onClick={() => { setSelectedDriver(driver); setShowQRModal(true); }}
                title="View QR Code"
              >
                <span className="material-icons-round">qr_code_2</span>
                QR
              </button>
              <button 
                className={styles.statsBtn} 
                onClick={() => { setSelectedDriver(driver); setShowStatsModal(true); }}
                title="Performance Stats"
              >
                <span className="material-icons-round">insights</span>
                Stats
              </button>
              <button 
                className={styles.editBtn} 
                onClick={() => { 
                  setSelectedDriver(driver); 
                  setEditData({ phone: driver.phone, pin: driver.pin, name: driver.name, vehicle: driver.vehicle, location: driver.location });
                  setShowEditModal(true); 
                }}
                title="Edit Driver"
              >
                <span className="material-icons-round">edit</span>
              </button>
              <button className={styles.deleteBtn} onClick={() => handleDelete(driver.id)} title="Remove Driver">
                <span className="material-icons-round">delete_outline</span>
              </button>
            </div>
            <div className={styles.credentials}>
              <div className={styles.credItem}>
                <label>PIN</label>
                <span className={styles.mono}>{driver.pin}</span>
              </div>
              <button className={styles.reviewsLink} onClick={() => viewReviews(driver.id)}>
                View Feedback
                <span className="material-icons-round">arrow_forward</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Add New Driver</h2>
              <button onClick={() => setShowAddModal(false)}><span className="material-icons-round">close</span></button>
            </div>
            <form onSubmit={handleAddDriver} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Kofi Mensah" 
                  value={newDriver.name}
                  onChange={e => setNewDriver({...newDriver, name: e.target.value})}
                  required 
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="e.g. 0240000000" 
                    value={newDriver.phone}
                    onChange={e => setNewDriver({...newDriver, phone: e.target.value.replace(/\D/g, '')})}
                    required 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Initial PIN (4 Digits)</label>
                  <input 
                    type="text" 
                    placeholder="Auto-generated if empty" 
                    maxLength={4}
                    className={styles.pinInput}
                    value={newDriver.pin}
                    onChange={e => setNewDriver({...newDriver, pin: e.target.value.replace(/\D/g, '')})}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Vehicle Type</label>
                  <select value={newDriver.vehicle} onChange={e => setNewDriver({...newDriver, vehicle: e.target.value})}>
                    <option>Taxi</option>
                    <option>Ride-hailing</option>
                    <option>Bus</option>
                    <option>Minibus</option>
                    <option>Intercity</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Base Location</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Accra" 
                    value={newDriver.location}
                    onChange={e => setNewDriver({...newDriver, location: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <button type="submit" className={styles.submitBtn}>Create Driver Account</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedDriver && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Edit Driver: {selectedDriver.id}</h2>
              <button onClick={() => setShowEditModal(false)}><span className="material-icons-round">close</span></button>
            </div>
            <form onSubmit={handleEditDriver} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={editData.name}
                  onChange={e => setEditData({...editData, name: e.target.value})}
                  required 
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    value={editData.phone}
                    onChange={e => setEditData({...editData, phone: e.target.value.replace(/\D/g, '')})}
                    required 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Login PIN</label>
                  <input 
                    type="text" 
                    maxLength={4}
                    className={styles.pinInput}
                    value={editData.pin}
                    onChange={e => setEditData({...editData, pin: e.target.value.replace(/\D/g, '')})}
                    required 
                  />
                  <p className={styles.formHint}>Changing PIN here will force the driver to reset it on next login.</p>
                </div>
              </div>
              <div className={styles.formGroup}>
                  <label>Vehicle Type</label>
                  <select value={editData.vehicle} onChange={e => setEditData({...editData, vehicle: e.target.value})}>
                    <option>Taxi</option>
                    <option>Ride-hailing</option>
                    <option>Bus</option>
                    <option>Minibus</option>
                    <option>Intercity</option>
                    <option>Other</option>
                  </select>
                </div>
              <button type="submit" className={styles.submitBtn}>Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {showQRModal && selectedDriver && (
        <div className={styles.modalOverlay} onClick={() => setShowQRModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Driver QR Code</h2>
              <button onClick={() => setShowQRModal(false)}><span className="material-icons-round">close</span></button>
            </div>
            <div className={styles.qrContent}>
              <div className={styles.qrDriverInfo}>
                <span className={styles.qrCorp}>{settings.name}</span>
                <h3>{selectedDriver.name}</h3>
                <span className={styles.idMono}>{selectedDriver.id}</span>
              </div>
              <div className={styles.qrContainer}>
                <canvas ref={canvasRef}></canvas>
              </div>
              <div className={styles.qrUrlBox}>
                <label>Form URL</label>
                <div className={styles.monoUrl}>{`${window.location.origin}/r/${selectedDriver.token}`}</div>
              </div>
              <button className={styles.printBtn} onClick={handlePrint}>
                <span className="material-icons-round">print</span>
                Print QR Card
              </button>
            </div>
          </div>
        </div>
      )}

      {showStatsModal && selectedDriver && stats && (
        <div className={styles.modalOverlay} onClick={() => setShowStatsModal(false)}>
          <div className={`${styles.modal} ${styles.statsModal}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader} style={{ padding: '16px 24px' }}>
              <div>
                <h2 style={{ fontSize: '18px' }}>Driver Performance</h2>
                <div className={styles.idMono}>{selectedDriver.id} • {selectedDriver.name}</div>
              </div>
              <button onClick={() => setShowStatsModal(false)}><span className="material-icons-round">close</span></button>
            </div>
            <div className={styles.statsContent} style={{ padding: '20px' }}>
              <div className={styles.statsOverview} style={{ gap: '16px', marginBottom: '24px' }}>
                 <div className={styles.mainStat} style={{ padding: '16px' }}>
                    <div className={styles.statValBox} style={{ gap: '12px' }}>
                       <span className={styles.bigVal} style={{ fontSize: '36px' }}>{stats.avg}</span>
                       <StarRating rating={Math.round(parseFloat(stats.avg))} />
                    </div>
                    <span className={styles.statTotal}>From {stats.total} reviews</span>
                 </div>
                 <div className={styles.statsGrid_compact} style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    <div className={styles.smallStat} style={{ padding: '10px' }}>
                       <label style={{ fontSize: '9px' }}>Staff</label>
                       <span className={styles.midVal} style={{ fontSize: '14px' }}>{stats.staff}</span>
                    </div>
                    <div className={styles.smallStat} style={{ padding: '10px' }}>
                       <label style={{ fontSize: '9px' }}>Reliability</label>
                       <span className={styles.midVal} style={{ fontSize: '14px' }}>{stats.reliability}</span>
                    </div>
                    <div className={styles.smallStat} style={{ padding: '10px' }}>
                       <label style={{ fontSize: '9px' }}>Respect</label>
                       <span className={styles.midVal} style={{ fontSize: '14px' }}>{stats.respect}</span>
                    </div>
                    <div className={styles.smallStat} style={{ padding: '10px' }}>
                       <label style={{ fontSize: '9px' }}>Loyalty</label>
                       <span className={styles.midVal} style={{ fontSize: '14px' }}>{stats.loyalty}</span>
                    </div>
                    <div className={styles.smallStat} style={{ padding: '10px' }}>
                       <label style={{ fontSize: '9px' }}>Referral</label>
                       <span className={styles.midVal} style={{ fontSize: '14px' }}>{stats.referral}</span>
                    </div>
                 </div>
              </div>

              <div className={styles.statsChartSection} style={{ marginBottom: '24px' }}>
                 <div className={styles.breakdownList} style={{ gap: '4px' }}>
                    {[5,4,3,2,1].map(star => {
                       const count = stats.breakdown[star-1];
                       const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                       return (
                          <div key={star} className={styles.breakdownRow}>
                             <span className={styles.starNum} style={{ width: '35px', fontSize: '11px' }}>{star}★</span>
                             <div className={styles.barTrack}><div className={styles.barFill} style={{ width: `${pct}%`, backgroundColor: star >= 4 ? '#10B981' : star === 3 ? '#F59E0B' : '#EF4444' }}></div></div>
                             <span className={styles.countMono} style={{ fontSize: '11px' }}>{count}</span>
                          </div>
                       )
                    })}
                 </div>
              </div>
              <button className={styles.submitBtn} style={{ height: '44px' }} onClick={() => viewReviews(selectedDriver.id)}>All Feedback</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
