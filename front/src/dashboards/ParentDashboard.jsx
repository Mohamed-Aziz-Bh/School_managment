import React, { useState, useEffect } from 'react';
import { FaUser, FaBook, FaCalendarAlt, FaEnvelope, FaSignOutAlt, FaClipboardList, FaUserClock, FaChild, FaExchangeAlt } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../api';
import '../styles/ParentDashboard.css';

const ParentDashboard = () => {
  // État utilisateur
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // État pour la navigation
  const [activeTab, setActiveTab] = useState('profile');
  
  // États pour la section profil
  const [profileFormData, setProfileFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  
  // États pour les enfants
  const [enfants, setEnfants] = useState([]);
  const [selectedEnfant, setSelectedEnfant] = useState(null);
  const [enfantsLoading, setEnfantsLoading] = useState(true);
  
  // États pour les notes
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [notesError, setNotesError] = useState(null);
  
  // États pour les absences
  const [absences, setAbsences] = useState([]);
  const [absencesLoading, setAbsencesLoading] = useState(true);
  const [absencesError, setAbsencesError] = useState(null);
  
  // États pour les messages
  const [messages, setMessages] = useState([]);
  const [messageLoading, setMessageLoading] = useState(true);
  const [messageError, setMessageError] = useState(null);

  // États pour l'emploi du temps
const [schedule, setSchedule] = useState([]);
const [scheduleLoading, setScheduleLoading] = useState(true);
const [scheduleError, setScheduleError] = useState(null);
const [timeSlots, setTimeSlots] = useState([
  { start: '08:30', end: '10:00' },
  { start: '10:15', end: '11:45' },
  { start: '12:00', end: '13:30' },
  { start: '13:45', end: '15:15' },
  { start: '15:30', end: '17:00' },
]);


  // Chargement initial des données utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        if (!userInfo || !userInfo._id) {
          throw new Error('Informations utilisateur non disponibles');
        }
        
        // Utiliser directement les données du localStorage
        setUserData(userInfo);
        
        // Initialiser le formulaire de profil avec les données utilisateur
        setProfileFormData({
          username: userInfo.username || '',
          email: userInfo.email || '',
          password: '',
          confirmPassword: ''
        });
        
        // Charger les informations des enfants
        if (userInfo.enfants && userInfo.enfants.length > 0) {
          setEnfants(userInfo.enfants);
          setSelectedEnfant(userInfo.enfants[0].username);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement des données');
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  // Chargement des données des enfants lorsqu'un enfant est sélectionné
  useEffect(() => {
    if (selectedEnfant) {
      fetchEnfantData(selectedEnfant);
    }
  }, [selectedEnfant]);

  // Chargement des messages
  useEffect(() => {
    if (userData) {
      fetchMessages();
    }
  }, [userData]);

  // Fonction pour récupérer l'emploi du temps d'un étudiant
const fetchSchedule = async (etudiantId, niveau, groupe) => {
    try {
      setScheduleLoading(true);
      // Utiliser le niveau et le groupe pour récupérer l'emploi du temps
      const response = await api.get(`/schedule/groupe/${groupe}/niveau/${niveau}`);
      
      // Adapter le format des données reçues pour correspondre à notre format d'affichage
      const formattedSchedule = response.data.map(item => ({
        _id: item._id,
        jour: item.day,
        heureDebut: item.start_time,
        heureFin: item.end_time,
        titre: item.matiere,
        niveau: item.niveau,
        groupe: item.groupe,
        enseignant: item.enseignant,
        salle: item.salle || 'Non spécifiée'
      }));
      
      setSchedule(formattedSchedule);
      setScheduleError(null);
    } catch (err) {
      setScheduleError(err.response?.data?.message || 'Erreur lors du chargement de l\'emploi du temps');
      toast.error('Erreur lors du chargement de l\'emploi du temps');
    } finally {
      setScheduleLoading(false);
    }
  };
  

  // Fonction pour récupérer les données d'un enfant
const fetchEnfantData = async (username) => {
    try {
      // Récupérer les informations de l'étudiant
      const response = await api.get(`/auth/student/${username}`);
      const etudiantId = response.data._id;
      const niveau = response.data.niveau;
      const groupe = response.data.groupe;
      
      // Récupérer les notes, absences et emploi du temps avec l'ID de l'étudiant
      fetchNotes(etudiantId);
      fetchAbsences(etudiantId);
      fetchSchedule(etudiantId, niveau, groupe);
    } catch (err) {
      toast.error('Erreur lors du chargement des données de l\'enfant');
      console.error(err);
    }
  };
  

  // Fonction pour vérifier si un cours est dans un créneau horaire
const isTimeInSlot = (courseStart, courseEnd, slotStart, slotEnd) => {
    // Convertir les heures en minutes pour faciliter la comparaison
    const convertToMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const courseStartMinutes = convertToMinutes(courseStart);
    const courseEndMinutes = convertToMinutes(courseEnd);
    const slotStartMinutes = convertToMinutes(slotStart);
    const slotEndMinutes = convertToMinutes(slotEnd);
    
    // Un cours est dans un créneau si son début est dans le créneau
    // ou si sa fin est dans le créneau
    // ou si le créneau est entièrement inclus dans le cours
    return (
      (courseStartMinutes >= slotStartMinutes && courseStartMinutes < slotEndMinutes) ||
      (courseEndMinutes > slotStartMinutes && courseEndMinutes <= slotEndMinutes) ||
      (courseStartMinutes <= slotStartMinutes && courseEndMinutes >= slotEndMinutes)
    );
  };
  

  // Fonction pour récupérer les notes d'un étudiant
  const fetchNotes = async (etudiantId) => {
    try {
      setNotesLoading(true);
      const response = await api.get(`/notes/etudiant/${etudiantId}`);
      setNotes(response.data);
      setNotesError(null);
    } catch (err) {
      setNotesError(err.response?.data?.message || 'Erreur lors du chargement des notes');
      toast.error('Erreur lors du chargement des notes');
    } finally {
      setNotesLoading(false);
    }
  };

  // Fonction pour récupérer les absences d'un étudiant
  const fetchAbsences = async (etudiantId) => {
    try {
      setAbsencesLoading(true);
      const response = await api.get(`/absences/etudiant/${etudiantId}`);
      setAbsences(response.data);
      setAbsencesError(null);
    } catch (err) {
      setAbsencesError(err.response?.data?.message || 'Erreur lors du chargement des absences');
      toast.error('Erreur lors du chargement des absences');
    } finally {
      setAbsencesLoading(false);
    }
  };

  // Fonction pour récupérer les messages
  const fetchMessages = async () => {
    try {
      setMessageLoading(true);
      const response = await api.get('/message/for-parents');
      setMessages(response.data);
      setMessageError(null);
    } catch (err) {
      setMessageError(err.response?.data?.message || 'Erreur lors du chargement des messages');
      toast.error('Erreur lors du chargement des messages');
    } finally {
      setMessageLoading(false);
    }
  };

  // Gestion du profil
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage({ type: '', text: '' });
    
    // Vérification des mots de passe
    if (profileFormData.password && profileFormData.password !== profileFormData.confirmPassword) {
      setProfileMessage({ type: 'danger', text: 'Les mots de passe ne correspondent pas' });
      setProfileLoading(false);
      return;
    }
    
    try {
      // Ne pas envoyer le mot de passe s'il est vide
      const dataToUpdate = { ...profileFormData };
      if (!dataToUpdate.password) {
        delete dataToUpdate.password;
        delete dataToUpdate.confirmPassword;
      } else {
        delete dataToUpdate.confirmPassword;
      }
      
      // Ne pas permettre la modification du rôle
      delete dataToUpdate.role;
      
      const response = await api.put(`/auth/users/${userData._id}`, dataToUpdate);
      
      setUserData(response.data);
      setProfileMessage({ type: 'success', text: 'Profil mis à jour avec succès!' });
      
      // Mettre à jour les informations dans le localStorage
      const currentUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        username: response.data.username,
        email: response.data.email
      }));
      
    } catch (error) {
      setProfileMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Erreur lors de la mise à jour du profil'
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (loading) return <div className="loading-container"><div className="loading">Chargement...</div></div>;
  if (error) return <div className="error-container"><div className="error">Erreur: {error}</div></div>;

  return (
    <div className="parent-dashboard">
      <div className="sidebar">
        <div className="user-info">
          <div className="avatar">
            <span>{userData?.username ? userData.username.charAt(0).toUpperCase() : 'P'}</span>
          </div>
          <h3>{userData?.username || 'Parent'}</h3>
        </div>
        
        <ul className="nav-links">
          <li
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser className="icon" /> Mon Profil
          </li>
          <li
            className={activeTab === 'enfants' ? 'active' : ''}
            onClick={() => setActiveTab('enfants')}
          >
            <FaChild className="icon" /> Mes Enfants
          </li>
          <li
            className={activeTab === 'notes' ? 'active' : ''}
            onClick={() => setActiveTab('notes')}
          >
            <FaClipboardList className="icon" /> Notes
          </li>
          <li
            className={activeTab === 'absences' ? 'active' : ''}
            onClick={() => setActiveTab('absences')}
          >
            <FaUserClock className="icon" /> Absences
          </li>
          <li
            className={activeTab === 'schedule' ? 'active' : ''}
            onClick={() => setActiveTab('schedule')}
          >
            <FaCalendarAlt className="icon" /> Emploi du temps
          </li>
          <li
            className={activeTab === 'messages' ? 'active' : ''}
            onClick={() => setActiveTab('messages')}
          >
            <FaEnvelope className="icon" /> Messages
          </li>
        </ul>
        
        <div className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="icon" /> Déconnexion
        </div>
      </div>
      
      <div className="main-content">
        <ToastContainer position="top-right" autoClose={3000} />
        
        {activeTab === 'profile' && (
  <div className="section">
    <div className="section-header">
      <h2>Mon Profil</h2>
    </div>
    
    {loading ? (
      <div className="loading">Chargement...</div>
    ) : (
      <div className="profile-section">
        <div className="profile-info">
          <div className="profile-avatar">
            <span>{userData?.username ? userData.username.charAt(0).toUpperCase() : 'P'}</span>
          </div>
          
          <div className="info-item">
            <div className="info-label">Nom d'utilisateur</div>
            <div className="info-value">{userData?.username}</div>
          </div>
          
          <div className="info-item">
            <div className="info-label">Email</div>
            <div className="info-value">{userData?.email}</div>
          </div>
          
          <div className="info-item">
            <div className="info-label">Rôle</div>
            <div className="info-value">
              <span className="role-badge parent">{userData?.role}</span>
            </div>
          </div>
          
          <div className="info-item">
            <div className="info-label">Nombre d'enfants</div>
            <div className="info-value">{userData?.nombreEnfants || 0}</div>
          </div>
          
          <button 
            className="edit-profile-btn" 
            onClick={() => setShowProfileForm(true)}
          >
            Modifier mon profil
          </button>
        </div>
      </div>
    )}
    
    {/* Popup de modification de profil */}
    {showProfileForm && (
      <div className="profile-form-modal">
        <div className="profile-form-content">
          <div className="profile-form">
            <h3>Modifier mon profil</h3>
            
            {profileMessage.text && (
              <div className={`alert alert-${profileMessage.type}`}>
                {profileMessage.text}
              </div>
            )}
            
            <form onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label>Nom d'utilisateur</label>
                <input
                  type="text"
                  name="username"
                  value={profileFormData.username}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={profileFormData.email}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Nouveau mot de passe (laisser vide pour ne pas changer)</label>
                <input
                  type="password"
                  name="password"
                  value={profileFormData.password}
                  onChange={handleProfileChange}
                />
              </div>
              
              <div className="form-group">
                <label>Confirmer le mot de passe</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={profileFormData.confirmPassword}
                  onChange={handleProfileChange}
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="submit-btn" 
                  disabled={profileLoading}
                >
                  {profileLoading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => {
                    setShowProfileForm(false);
                    setProfileMessage({ type: '', text: '' });
                  }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}
  </div>
)}       
        {activeTab === 'enfants' && (
          <div className="section">
            <div className="section-header">
              <h2>Mes Enfants</h2>
            </div>
            
            {enfants.length === 0 ? (
              <div className="empty-state">
                <FaChild size={48} />
                <p>Aucun enfant n'est associé à votre compte</p>
              </div>
            ) : (
              <div className="enfants-list">
                {enfants.map((enfant, index) => (
                  <div className="enfant-card" key={index}>
                    <div className="enfant-avatar">
                      <span>{enfant.username.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="enfant-info">
                      <h3>{enfant.username}</h3>
                      <button 
                        className="view-btn"
                        onClick={() => {
                          setSelectedEnfant(enfant.username);
                          setActiveTab('notes');
                        }}
                      >
                        Voir les notes
                      </button>
                      <button 
                        className="view-btn"
                        onClick={() => {
                          setSelectedEnfant(enfant.username);
                          setActiveTab('absences');
                        }}
                      >
                        Voir les absences
                      </button>
                      <button 
                        className="view-btn"
                        onClick={() => {
                          setSelectedEnfant(enfant.username);
                          setActiveTab('schedule');
                        }}
                      >
                        Voir l'emploi du temps
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'notes' && (
          <div className="section">
            <div className="section-header">
              <h2>Notes de {selectedEnfant}</h2>
              {enfants.length > 1 && (
                <div className="enfant-selector">
                  <label>Changer d'enfant:</label>
                  <select 
                    value={selectedEnfant || ''}
                    onChange={(e) => setSelectedEnfant(e.target.value)}
                  >
                    {enfants.map((enfant, index) => (
                      <option key={index} value={enfant.username}>
                        {enfant.username}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            {notesLoading ? (
              <div className="loading">Chargement des notes...</div>
            ) : notesError ? (
              <div className="error-message">{notesError}</div>
            ) : notes.length === 0 ? (
              <div className="empty-state">
                <FaClipboardList size={48} />
                <p>Aucune note disponible pour cet élève</p>
              </div>
            ) : (
              <>
                <div className="stats-container">
                  <div className="stat-card">
                    <div className="stat-title">Moyenne générale</div>
                    <div className="stat-value">
                      {(notes.reduce((sum, note) => sum + parseFloat(note.valeur), 0) / notes.length).toFixed(2)}/20
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Meilleure note</div>
                    <div className="stat-value">
                      {Math.max(...notes.map(note => parseFloat(note.valeur)))}/20
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Note la plus basse</div>
                    <div className="stat-value">
                      {Math.min(...notes.map(note => parseFloat(note.valeur)))}/20
                    </div>
                  </div>
                </div>
                
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Matière</th>
                        <th>Évaluation</th>
                        <th>Type</th>
                        <th>Note</th>
                        <th>Date</th>
                        <th>Commentaire</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notes.map(note => (
                        <tr key={note._id}>
                          <td>{note.matiere}</td>
                          <td>{note.titre}</td>
                          <td>
                            <span className={`badge ${note.type}`}>
                              {note.type}
                            </span>
                          </td>
                          <td className="note-value">{note.valeur}/20</td>
                          <td>{new Date(note.date).toLocaleDateString('fr-FR')}</td>
                          <td>{note.commentaire || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
        
        {activeTab === 'absences' && (
          <div className="section">
            <div className="section-header">
              <h2>Absences de {selectedEnfant}</h2>
              {enfants.length > 1 && (
                <div className="enfant-selector">
                  <label>Changer d'enfant:</label>
                  <select 
                    value={selectedEnfant || ''}
                    onChange={(e) => setSelectedEnfant(e.target.value)}
                  >
                    {enfants.map((enfant, index) => (
                      <option key={index} value={enfant.username}>
                        {enfant.username}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            {absencesLoading ? (
              <div className="loading">Chargement des absences...</div>
            ) : absencesError ? (
              <div className="error-message">{absencesError}</div>
            ) : absences.length === 0 ? (
              <div className="empty-state">
                <FaUserClock size={48} />
                <p>Aucune absence enregistrée pour cet élève</p>
              </div>
            ) : (
              <>
                <div className="stats-container">
                  <div className="stat-card">
                    <div className="stat-title">Total des absences</div>
                    <div className="stat-value">
                      {absences.reduce((sum, absence) => sum + parseInt(absence.duree), 0)} heures
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Absences justifiées</div>
                    <div className="stat-value">
                      {absences.filter(absence => absence.justifiee).length}
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Absences non justifiées</div>
                    <div className="stat-value">
                      {absences.filter(absence => !absence.justifiee).length}
                    </div>
                  </div>
                </div>
                
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Matière</th>
                        <th>Date</th>
                        <th>Durée</th>
                        <th>Statut</th>
                        <th>Motif</th>
                      </tr>
                    </thead>
                    <tbody>
                      {absences.map(absence => (
                        <tr key={absence._id}>
                          <td>{absence.matiere}</td>
                          <td>{new Date(absence.date).toLocaleDateString('fr-FR')}</td>
                          <td>{absence.duree}h</td>
                          <td>
                            <span className={`badge ${absence.justifiee ? 'justifiee' : 'non-justifiee'}`}>
                              {absence.justifiee ? 'Justifiée' : 'Non justifiée'}
                            </span>
                          </td>
                          <td>{absence.motif || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
        

        {activeTab === 'schedule' && (
  <div className="section">
    <div className="section-header">
      <h2>Emploi du temps de {selectedEnfant}</h2>
      {enfants.length > 1 && (
        <div className="enfant-selector">
          <label>Changer d'enfant:</label>
          <select 
            value={selectedEnfant || ''}
            onChange={(e) => setSelectedEnfant(e.target.value)}
          >
            {enfants.map((enfant, index) => (
              <option key={index} value={enfant.username}>
                {enfant.username}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
    
    {scheduleLoading ? (
      <div className="loading">Chargement de l'emploi du temps...</div>
    ) : scheduleError ? (
      <div className="error-message">{scheduleError}</div>
    ) : schedule.length === 0 ? (
      <div className="empty-state">
        <FaCalendarAlt size={48} />
        <p>Aucun emploi du temps disponible pour cet élève</p>
      </div>
    ) : (
      <div className="timetable-container">
        <div className="timetable">
          <div className="timetable-header">
            <div className="timetable-cell time-column">Horaire</div>
            <div className="timetable-cell">Lundi</div>
            <div className="timetable-cell">Mardi</div>
            <div className="timetable-cell">Mercredi</div>
            <div className="timetable-cell">Jeudi</div>
            <div className="timetable-cell">Vendredi</div>
            <div className="timetable-cell">Samedi</div>
          </div>
          
          {timeSlots.map((timeSlot, index) => (
            <div className="timetable-row" key={index}>
              <div className="timetable-cell time-column">
                {timeSlot.start} - {timeSlot.end}
              </div>
              
              {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(day => {
                const course = schedule.find(item => 
                  item.jour === day && 
                  isTimeInSlot(item.heureDebut, item.heureFin, timeSlot.start, timeSlot.end)
                );
                
                return (
                  <div className={`timetable-cell ${course ? 'has-course' : ''}`} key={day}>
                    {course && (
                      <div className="course-card">
                        <div className="course-title">{course.titre}</div>
                        <div className="course-time">{course.heureDebut} - {course.heureFin}</div>
                        <div className="course-room">Salle: {course.salle}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)}

        {activeTab === 'messages' && (
          <div className="section">
            <div className="section-header">
              <h2>Messages</h2>
            </div>
            
            {messageLoading ? (
              <div className="loading">Chargement des messages...</div>
            ) : messageError ? (
              <div className="error-message">{messageError}</div>
            ) : messages.length === 0 ? (
              <div className="empty-state">
                <FaEnvelope size={48} />
                <p>Aucun message disponible</p>
              </div>
            ) : (
              <div className="messages-container">
                {messages.map(message => (
                  <div className="message-card" key={message._id}>
                    <div className="message-header">
                      <div className="message-title">{message.title}</div>
                      <div className="message-type">{message.type}</div>
                    </div>
                    {message.image && (
                      <div className="message-image">
                        <img src={message.image} alt="Message attachment" />
                      </div>
                    )}
                    <div className="message-content">{message.text}</div>
                    <div className="message-date">
                      {new Date(message.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;

