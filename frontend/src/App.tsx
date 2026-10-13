import React, { useState, useEffect } from 'react';
import {
  getPublicConcepts,
  getPublicConceptPackages,
  getPublicGallery,
  submitBooking,
  adminLogin,
  adminLogout,
  getAdminMe,
  getAdminBookings,
  updateBookingStatus
} from './api/client';
import type { Concept, Package, GalleryImage, Booking, BookingResponseData } from './types';

type ViewMode = 'home' | 'concepts' | 'concept-detail' | 'gallery' | 'booking' | 'admin';

export default function App() {
  const [view, setView] = useState<ViewMode>('home');
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [conceptPackages, setConceptPackages] = useState<Package[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

  // Booking Form State
  const [selectedConceptId, setSelectedConceptId] = useState<string>('');
  const [availablePackages, setAvailablePackages] = useState<Package[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [requestedDate, setRequestedDate] = useState<string>('');
  const [requestedTime, setRequestedTime] = useState<string>('09:00');
  const [note, setNote] = useState<string>('');
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<BookingResponseData | null>(null);

  // Admin State
  const [adminUser, setAdminUser] = useState<{ email: string } | null>(null);
  const [adminEmail, setAdminEmail] = useState<string>('admin@moodstu.com');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState<boolean>(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>('ALL');

  // Load initial public concepts & gallery
  useEffect(() => {
    loadPublicData();
    checkAdminSession();
  }, []);

  async function loadPublicData() {
    try {
      const conceptData = await getPublicConcepts();
      setConcepts(conceptData);
      const galleryData = await getPublicGallery();
      setGalleryImages(galleryData);
    } catch (err: any) {
      console.warn('Could not load public data:', err.message);
    }
  }

  async function checkAdminSession() {
    try {
      const me = await getAdminMe();
      if (me && me.email) {
        setAdminUser(me);
        loadAdminBookings();
      }
    } catch {
      // not logged in, ignore
    }
  }

  async function loadAdminBookings(status = bookingFilterStatus) {
    try {
      const data = await getAdminBookings(status);
      setBookings(data);
    } catch (err: any) {
      console.warn('Failed to load bookings:', err.message);
    }
  }

  // Load packages when concept detail is opened
  async function openConceptDetail(concept: Concept) {
    setSelectedConcept(concept);
    setView('concept-detail');
    try {
      const pkgs = await getPublicConceptPackages(concept._id);
      setConceptPackages(pkgs);
    } catch (err: any) {
      console.error(err);
    }
  }

  // Start booking with preselected concept/package
  async function handleBookNow(conceptId?: string, packageId?: string) {
    setBookingSuccess(null);
    setBookingError(null);
    if (conceptId) {
      setSelectedConceptId(conceptId);
      const pkgs = await getPublicConceptPackages(conceptId);
      setAvailablePackages(pkgs);
      if (packageId) {
        setSelectedPackageId(packageId);
      } else if (pkgs.length > 0) {
        setSelectedPackageId(pkgs[0]._id);
      }
    } else if (concepts.length > 0) {
      setSelectedConceptId(concepts[0]._id);
      const pkgs = await getPublicConceptPackages(concepts[0]._id);
      setAvailablePackages(pkgs);
      if (pkgs.length > 0) setSelectedPackageId(pkgs[0]._id);
    }
    setView('booking');
  }

  // Handle concept dropdown change in booking form
  async function handleConceptChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const cId = e.target.value;
    setSelectedConceptId(cId);
    setSelectedPackageId('');
    if (cId) {
      try {
        const pkgs = await getPublicConceptPackages(cId);
        setAvailablePackages(pkgs);
        if (pkgs.length > 0) setSelectedPackageId(pkgs[0]._id);
      } catch (err: any) {
        setBookingError('Không thể tải gói chụp cho concept này: ' + err.message);
      }
    } else {
      setAvailablePackages([]);
    }
  }

  // Submit booking form
  async function handleSubmitBooking(e: React.FormEvent) {
    e.preventDefault();
    setBookingError(null);
    setBookingLoading(true);

    try {
      const res = await submitBooking({
        customerName,
        phone,
        email: email || undefined,
        conceptId: selectedConceptId,
        packageId: selectedPackageId,
        requestedDate,
        requestedTime,
        note
      });

      setBookingSuccess(res);
      // Reset form fields
      setCustomerName('');
      setPhone('');
      setEmail('');
      setNote('');
    } catch (err: any) {
      setBookingError(err.message || 'Lỗi khi gửi yêu cầu đặt lịch.');
    } finally {
      setBookingLoading(false);
    }
  }

  // Admin login handler
  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setAdminError(null);
    setAdminLoading(true);
    try {
      const res = await adminLogin(adminEmail, adminPassword);
      setAdminUser(res.admin);
      setAdminPassword('');
      loadAdminBookings();
    } catch (err: any) {
      setAdminError(err.message || 'Đăng nhập thất bại.');
    } finally {
      setAdminLoading(false);
    }
  }

  // Admin logout handler
  async function handleAdminLogout() {
    try {
      await adminLogout();
    } catch {}
    setAdminUser(null);
    setBookings([]);
  }

  // Admin status transition handler
  async function handleStatusChange(bookingId: string, newStatus: string) {
    const reason = prompt(`Nhập ghi chú Admin cho cập nhật sang trạng thái [${newStatus}] (tùy chọn):`);
    if (reason === null) return; // user cancelled prompt

    try {
      await updateBookingStatus(bookingId, newStatus, reason);
      loadAdminBookings();
    } catch (err: any) {
      alert('Không thể đổi trạng thái: ' + err.message);
    }
  }

  return (
    <div>
      {/* Navigation Bar */}
      <header className="header">
        <div className="container nav">
          <div className="brand" onClick={() => setView('home')} style={{ cursor: 'pointer' }}>
            <span className="brand-title">MOOD STUDIO</span>
            <span className="brand-subtitle">Artistic Photography • TP.HCM</span>
          </div>
          <nav className="nav-links">
            <button
              className={`nav-btn ${view === 'home' ? 'active' : ''}`}
              onClick={() => setView('home')}
            >
              Trang chủ
            </button>
            <button
              className={`nav-btn ${view === 'concepts' || view === 'concept-detail' ? 'active' : ''}`}
              onClick={() => setView('concepts')}
            >
              Concept
            </button>
            <button
              className={`nav-btn ${view === 'gallery' ? 'active' : ''}`}
              onClick={() => setView('gallery')}
            >
              Bộ sưu tập
            </button>
            <button
              className={`nav-btn cta-btn ${view === 'booking' ? 'active' : ''}`}
              onClick={() => handleBookNow()}
            >
              Đặt lịch chụp
            </button>
            <button
              className={`nav-btn ${view === 'admin' ? 'active' : ''}`}
              onClick={() => setView('admin')}
              style={{ fontSize: '0.8rem', opacity: 0.8 }}
            >
              {adminUser ? 'Quản trị (Admin)' : 'Admin Login'}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container">
        {/* VIEW: HOME */}
        {view === 'home' && (
          <div>
            <section className="hero">
              <h1>Lưu Giữ Khoảnh Khắc Nghệ Thuật</h1>
              <p>
                MOOD Studio chuyên chụp ảnh concept cá nhân, ảnh nghệ thuật và cổ trang với phong cách
                nữ tính, thanh lịch và giàu cảm xúc tại TP. Hồ Chí Minh.
              </p>
              <button className="cta-btn" onClick={() => handleBookNow()} style={{ border: 'none', cursor: 'pointer' }}>
                Gửi yêu cầu đặt lịch ngay
              </button>
            </section>

            <div className="section-header">
              <h2>Các Concept Chụp Nổi Bật</h2>
              <p>Mỗi concept là một câu chuyện phong cách được chuẩn bị kỹ lưỡng từ bối cảnh đến ánh sáng</p>
            </div>

            <div className="concept-grid">
              {concepts.map((c) => (
                <div key={c._id} className="concept-card" onClick={() => openConceptDetail(c)}>
                  <div className="card-img-wrap">
                    {c.coverImage ? (
                      <img src={c.coverImage} alt={c.name} className="card-img" />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                        MOOD Studio
                      </div>
                    )}
                    <span className="badge">{c.category || 'Concept'}</span>
                  </div>
                  <div className="card-body">
                    <div>
                      <h3>{c.name}</h3>
                      <p>{c.shortDescription || c.description}</p>
                    </div>
                    <button className="action-btn" style={{ width: '100%', padding: '8px' }}>
                      Xem chi tiết & gói chụp →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: CONCEPTS LIST */}
        {view === 'concepts' && (
          <div>
            <div className="section-header">
              <h2>Tất Cả Concept Chụp Ảnh</h2>
              <p>Khám phá các phong cách ảnh nghệ thuật được thiết kế độc quyền tại MOOD Studio</p>
            </div>
            <div className="concept-grid">
              {concepts.map((c) => (
                <div key={c._id} className="concept-card" onClick={() => openConceptDetail(c)}>
                  <div className="card-img-wrap">
                    {c.coverImage ? (
                      <img src={c.coverImage} alt={c.name} className="card-img" />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                        MOOD Studio
                      </div>
                    )}
                    <span className="badge">{c.category || 'Concept'}</span>
                  </div>
                  <div className="card-body">
                    <div>
                      <h3>{c.name}</h3>
                      <p>{c.shortDescription || c.description}</p>
                    </div>
                    <button className="action-btn" style={{ width: '100%', padding: '8px' }}>
                      Xem chi tiết & gói chụp →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: CONCEPT DETAIL */}
        {view === 'concept-detail' && selectedConcept && (
          <div className="detail-view">
            <button className="back-btn" onClick={() => setView('concepts')}>
              ← Quay lại danh sách Concept
            </button>
            <div className="detail-header">
              <div>
                {selectedConcept.coverImage ? (
                  <img src={selectedConcept.coverImage} alt={selectedConcept.name} className="detail-img" />
                ) : (
                  <div style={{ background: '#eee', height: '300px', borderRadius: '10px' }} />
                )}
              </div>
              <div>
                <span className="badge" style={{ position: 'static' }}>{selectedConcept.category}</span>
                <h1 style={{ fontSize: '2rem', margin: '12px 0' }}>{selectedConcept.name}</h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px', fontSize: '1.05rem' }}>
                  {selectedConcept.shortDescription}
                </p>
                <p style={{ lineHeight: '1.8' }}>{selectedConcept.description}</p>
              </div>
            </div>

            <div className="section-header" style={{ textAlign: 'left', marginTop: '30px' }}>
              <h2>Các Gói Chụp Dành Cho Concept Này</h2>
              <p>Bảng giá rõ ràng, bao gồm chi tiết make-up, trang phục và số lượng ảnh chỉnh sửa</p>
            </div>

            <div className="package-list">
              {conceptPackages.map((pkg) => (
                <div key={pkg._id} className="package-card">
                  <div>
                    <h3>{pkg.name}</h3>
                    <div className="package-price">
                      {pkg.price !== null
                        ? `${new Intl.NumberFormat('vi-VN').format(pkg.price)} đ`
                        : 'Liên hệ tư vấn giá'}
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{pkg.description}</p>
                    {pkg.includedItems && pkg.includedItems.length > 0 && (
                      <ul className="package-items">
                        {pkg.includedItems.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <button
                    className="submit-btn"
                    onClick={() => handleBookNow(selectedConcept._id, pkg._id)}
                    style={{ marginTop: '16px' }}
                  >
                    Chọn gói này để đặt lịch
                  </button>
                </div>
              ))}
              {conceptPackages.length === 0 && (
                <p style={{ color: '#888' }}>Chưa có gói chụp nào đang hoạt động cho concept này.</p>
              )}
            </div>
          </div>
        )}

        {/* VIEW: GALLERY */}
        {view === 'gallery' && (
          <div>
            <div className="section-header">
              <h2>Bộ Sưu Tập MOOD Studio</h2>
              <p>Những khoảnh khắc nghệ thuật được thực hiện chân thực tại studio</p>
            </div>
            <div className="gallery-grid">
              {galleryImages.map((img) => (
                <div key={img._id} className="gallery-item">
                  <img src={img.imageUrl} alt={img.caption || 'MOOD Studio Photo'} />
                  {img.caption && <div className="caption">{img.caption}</div>}
                </div>
              ))}
              {galleryImages.length === 0 && (
                <p style={{ textAlign: 'center', gridColumn: '1 / -1', color: '#888', padding: '40px' }}>
                  Bộ sưu tập đang được cập nhật thêm hình ảnh mới.
                </p>
              )}
            </div>
          </div>
        )}

        {/* VIEW: BOOKING FORM */}
        {view === 'booking' && (
          <div className="form-card">
            <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Gửi Yêu Cầu Đặt Lịch Chụp</h2>
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
              Vui lòng điền thông tin bên dưới. MOOD Studio sẽ liên hệ xác nhận thời gian chính thức qua điện thoại.
            </p>

            {bookingSuccess ? (
              <div className="success-box">
                <h3>✓ Đã Gửi Yêu Cầu Thành Công!</h3>
                <p>Mã đặt lịch của bạn:</p>
                <div className="booking-code">{bookingSuccess.bookingCode}</div>
                <p style={{ fontSize: '0.9rem', color: '#555', margin: '12px 0' }}>
                  Khách hàng: <strong>{bookingSuccess.customerName}</strong><br />
                  Gói chụp: <strong>{bookingSuccess.packageNameSnapshot}</strong><br />
                  Giá tạm tính:{' '}
                  <strong>
                    {bookingSuccess.priceSnapshot !== null
                      ? `${new Intl.NumberFormat('vi-VN').format(bookingSuccess.priceSnapshot)} đ`
                      : 'Liên hệ xác nhận'}
                  </strong><br />
                  Ngày giờ mong muốn: <strong>{bookingSuccess.requestedDate} lúc {bookingSuccess.requestedTime}</strong>
                </p>
                <div style={{ background: '#fff', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', color: '#666', border: '1px solid #ddd' }}>
                  ⚠️ <em>Lưu ý quan trọng:</em> Đây là <strong>yêu cầu chờ xác nhận</strong>. Lịch chụp chưa được tự động giữ chỗ cho đến khi Studio gọi điện thoại xác nhận với bạn.
                </div>
                <button
                  className="submit-btn"
                  onClick={() => setBookingSuccess(null)}
                  style={{ marginTop: '20px' }}
                >
                  Gửi một yêu cầu khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitBooking}>
                {bookingError && <div className="alert-error">{bookingError}</div>}

                <div className="form-group">
                  <label>Họ và tên khách hàng *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Ví dụ: Nguyễn Phương Linh"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Số điện thoại liên hệ *</label>
                    <input
                      type="tel"
                      required
                      className="form-input"
                      placeholder="0901234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email (không bắt buộc)</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Chọn Concept *</label>
                  <select
                    className="form-select"
                    required
                    value={selectedConceptId}
                    onChange={handleConceptChange}
                  >
                    <option value="">-- Chọn concept bạn muốn chụp --</option>
                    {concepts.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Chọn Gói chụp *</label>
                  <select
                    className="form-select"
                    required
                    value={selectedPackageId}
                    onChange={(e) => setSelectedPackageId(e.target.value)}
                    disabled={!selectedConceptId}
                  >
                    <option value="">-- Chọn gói dịch vụ --</option>
                    {availablePackages.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} {p.price !== null ? `(${new Intl.NumberFormat('vi-VN').format(p.price)} đ)` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Ngày mong muốn chụp *</label>
                    <input
                      type="date"
                      required
                      className="form-input"
                      value={requestedDate}
                      onChange={(e) => setRequestedDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Giờ mong muốn chụp *</label>
                    <input
                      type="time"
                      required
                      className="form-input"
                      value={requestedTime}
                      onChange={(e) => setRequestedTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Ghi chú thêm (yêu cầu layout make-up, phong cách mong muốn...)</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    placeholder="Nhập ghi chú cho studio nếu có..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>

                <button type="submit" className="submit-btn" disabled={bookingLoading}>
                  {bookingLoading ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu đặt lịch'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* VIEW: ADMIN PANEL */}
        {view === 'admin' && (
          <div>
            {!adminUser ? (
              <div className="form-card" style={{ maxWidth: '420px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Đăng Nhập Quản Trị</h2>
                <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
                  Dành cho quản trị viên MOOD Studio
                </p>

                {adminError && <div className="alert-error">{adminError}</div>}

                <form onSubmit={handleAdminLogin}>
                  <div className="form-group">
                    <label>Email Admin</label>
                    <input
                      type="email"
                      required
                      className="form-input"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mật khẩu</label>
                    <input
                      type="password"
                      required
                      className="form-input"
                      placeholder="Nhập mật khẩu admin"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="submit-btn" disabled={adminLoading}>
                    {adminLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="admin-card">
                <div className="admin-header">
                  <div>
                    <h2>Quản Lý Yêu Cầu Đặt Lịch (Bookings)</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      Đăng nhập với email: <strong>{adminUser.email}</strong>
                    </p>
                  </div>
                  <button className="back-btn" onClick={handleAdminLogout} style={{ margin: 0 }}>
                    Đăng xuất
                  </button>
                </div>

                {/* Filter bar */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Lọc theo trạng thái:</label>
                  <select
                    className="form-select"
                    style={{ width: 'auto', padding: '6px 12px' }}
                    value={bookingFilterStatus}
                    onChange={(e) => {
                      setBookingFilterStatus(e.target.value);
                      loadAdminBookings(e.target.value);
                    }}
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="PENDING">PENDING (Chờ duyệt)</option>
                    <option value="CONFIRMED">CONFIRMED (Đã xác nhận)</option>
                    <option value="COMPLETED">COMPLETED (Hoàn tất)</option>
                    <option value="REJECTED">REJECTED (Từ chối)</option>
                    <option value="CANCELLED">CANCELLED (Hủy)</option>
                  </select>
                  <button
                    className="action-btn"
                    onClick={() => loadAdminBookings()}
                    style={{ padding: '6px 14px' }}
                  >
                    Làm mới ↻
                  </button>
                </div>

                {/* Bookings Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table className="booking-table">
                    <thead>
                      <tr>
                        <th>Mã Booking</th>
                        <th>Khách hàng</th>
                        <th>Số điện thoại</th>
                        <th>Gói chụp</th>
                        <th>Giá snapshot</th>
                        <th>Ngày & Giờ</th>
                        <th>Trạng thái</th>
                        <th>Ghi chú Admin</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b._id}>
                          <td><strong>{b.bookingCode}</strong></td>
                          <td>{b.customerName}</td>
                          <td>{b.phone}</td>
                          <td>{b.packageNameSnapshot}</td>
                          <td>
                            {b.priceSnapshot !== null
                              ? `${new Intl.NumberFormat('vi-VN').format(b.priceSnapshot)} đ`
                              : 'Chưa có'}
                          </td>
                          <td>{b.requestedDate} {b.requestedTime}</td>
                          <td>
                            <span className={`status-badge status-${b.status}`}>
                              {b.status}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#666', maxWidth: '150px' }}>
                            {b.adminNote || '—'}
                          </td>
                          <td>
                            {b.status === 'PENDING' && (
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  className="action-btn"
                                  style={{ color: 'green', borderColor: 'green' }}
                                  onClick={() => handleStatusChange(b._id, 'CONFIRMED')}
                                >
                                  Xác nhận
                                </button>
                                <button
                                  className="action-btn"
                                  style={{ color: 'red', borderColor: 'red' }}
                                  onClick={() => handleStatusChange(b._id, 'REJECTED')}
                                >
                                  Từ chối
                                </button>
                              </div>
                            )}

                            {b.status === 'CONFIRMED' && (
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  className="action-btn"
                                  style={{ color: 'blue', borderColor: 'blue' }}
                                  onClick={() => handleStatusChange(b._id, 'COMPLETED')}
                                >
                                  Hoàn tất
                                </button>
                                <button
                                  className="action-btn"
                                  style={{ color: 'gray', borderColor: 'gray' }}
                                  onClick={() => handleStatusChange(b._id, 'CANCELLED')}
                                >
                                  Hủy lịch
                                </button>
                              </div>
                            )}

                            {['REJECTED', 'CANCELLED', 'COMPLETED'].includes(b.status) && (
                              <span style={{ fontSize: '0.8rem', color: '#999' }}>Đã đóng</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                            Chưa có yêu cầu đặt lịch nào trong bộ lọc này.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p><strong>MOOD Studio</strong> — Chụp ảnh nghệ thuật, concept cá nhân & cổ trang</p>
          <p style={{ marginTop: '4px' }}>TP. Hồ Chí Minh • Hotline/Zalo: Liên hệ tư vấn • Messenger: MOOD Studio</p>
        </div>
      </footer>
    </div>
  );
}
