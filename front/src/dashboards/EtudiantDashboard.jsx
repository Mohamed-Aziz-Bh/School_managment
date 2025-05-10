import React, { useState, useEffect } from 'react';
import { FaUser, FaBook, FaCalendarAlt, FaEnvelope, FaSignOutAlt, FaPlus, FaEdit, FaTrash, FaFilePdf, FaGraduationCap, FaClipboardList, FaUserClock } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../api';
import '../styles/EnseignantDashboard.css';
import { isTimeInSlot } from '../utils/timeUtils';


const EtudiantDashboard = () => {
  // État utilisateur
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // État pour la navigation
  const [activeTab, setActiveTab] = useState('profile');
  
  // États pour la section profil
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    username: '',
    email: '',
    niveau: '',
    groupe: '',
    image: '',
    password: '',
    confirmPassword: ''
  });
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  
  // États pour la section cours
  const [courses, setCourses] = useState([]);
  const [coursLoading, setCoursLoading] = useState(true);
  const [coursError, setCoursError] = useState(null);
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [currentCours, setCurrentCours] = useState(null);
  const [enseignants, setEnseignants] = useState([]);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    niveau: '',
    file: null
  });
  const [coursMessage, setCoursMessage] = useState({ type: '', text: '' });
  const [coursSubmitLoading, setCoursSubmitLoading] = useState(false);
  
  // États pour la section emploi du temps
  const [schedules, setSchedules] = useState([]);
  const [enseignantsLoading, setEnseignantLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState(null);
  const [timeSlots, setTimeSlots] = useState([
    { start: '08:30', end: '10:00' },
    { start: '10:15', end: '11:45' },
    { start: '12:00', end: '13:30' },
    { start: '13:45', end: '15:15' },
    { start: '15:30', end: '17:00' }
  ]);
  
  // États pour la section messages
  const [messages, setMessages] = useState([]);
  const [messageLoading, setMessageLoading] = useState(true);
  const [messageError, setMessageError] = useState(null);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [newMessage, setNewMessage] = useState({
    title: '',
    text: '',
    type: '',
    target: '',
    image: ''
  });
  
  // États pour les notes et absences
  const [notes, setNotes] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [absencesLoading, setAbsencesLoading] = useState(true);
  const [notesError, setNotesError] = useState(null);
  const [absencesError, setAbsencesError] = useState(null);
  
  // Chargement initial des données utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        if (!userInfo || !userInfo._id) {
          throw new Error('Informations utilisateur non disponibles');
        }
        
        // Utiliser directement les données du localStorage pour éviter l'erreur 404
        setUserData(userInfo);
        
        // Initialiser le formulaire de profil avec les données utilisateur
        setProfileFormData({
          username: userInfo.username || '',
          email: userInfo.email || '',
          niveau: userInfo.niveau || '',
          groupe: userInfo.groupe || '',
          image: userInfo.image || '',
          password: '',
          confirmPassword: ''
        });
        
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement des données');
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Chargement des données selon l'onglet actif
  useEffect(() => {
    if (userData) {
      fetchCourses();
      fetchSchedules();
      fetchMessages();
      fetchEnseignants();
      
      if (activeTab === 'notes') {
        fetchNotes();
      } else if (activeTab === 'absences') {
        fetchAbsences();
      } else if (activeTab === 'resultats') {
        fetchNotes();
        fetchAbsences();
      }
    }
  }, [userData, activeTab]);
  
  // Fonction pour récupérer les cours
  const fetchCourses = async () => {
    try {
      setCoursLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get(`/cours/niveau/${userData.niveau}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(response.data);
      setCoursError(null);
    } catch (err) {
      setCoursError(err.response?.data?.message || 'Erreur lors du chargement des cours');
    } finally {
      setCoursLoading(false);
    }
  };
  
  // Fonction pour récupérer l'emploi du temps
  const fetchSchedules = async () => {
    try {
      setScheduleLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get(`/schedule/groupe/${userData.groupe}/niveau/${userData.niveau}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Adapter le format des données reçues pour correspondre à notre format d'affichage
      const formattedSchedules = response.data.map(item => ({
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
      
      setSchedules(formattedSchedules);
      setScheduleError(null);
    } catch (err) {
      setScheduleError(err.response?.data?.message || 'Erreur lors du chargement de l\'emploi du temps');
    } finally {
      setScheduleLoading(false);
    }
  };
  
  // Fonction pour récupérer la liste des enseignants
  const fetchEnseignants = async () => {
    try {
      setEnseignantLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/auth/enseignants', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnseignants(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des enseignants:', error);
      toast.error('Erreur lors du chargement des enseignants');
    } finally {
      setEnseignantLoading(false);
    }
  };
  
  // Fonction pour récupérer les messages
  const fetchMessages = async () => {
    try {
      setMessageLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/message/for-students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
      setMessageError(null);
    } catch (err) {
      setMessageError(err.response?.data?.message || 'Erreur lors du chargement des messages');
    } finally {
      setMessageLoading(false);
    }
  };
  
  // Fonction pour récupérer les notes
  const fetchNotes = async () => {
    if (!userData || !userData._id) return;
    
    try {
      setNotesLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get(`/notes/etudiant/${userData._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(response.data);
      setNotesError(null);
    } catch (err) {
      setNotesError(err.response?.data?.message || 'Erreur lors du chargement des notes');
      toast.error('Erreur lors du chargement des notes');
    } finally {
      setNotesLoading(false);
    }
  };
  
  // Fonction pour récupérer les absences
  const fetchAbsences = async () => {
    if (!userData || !userData._id) return;
    
    try {
      setAbsencesLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get(`/absences/etudiant/${userData._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAbsences(response.data);
      setAbsencesError(null);
    } catch (err) {
      setAbsencesError(err.response?.data?.message || 'Erreur lors du chargement des absences');
      toast.error('Erreur lors du chargement des absences');
    } finally {
      setAbsencesLoading(false);
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
      
      // Ne pas permettre la modification du rôle, niveau et groupe
      delete dataToUpdate.role;
      
      const token = localStorage.getItem('token');
      const response = await api.put(`/auth/users/${userData._id}`, dataToUpdate, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Mettre à jour les données utilisateur
      setUserData(prev => ({ ...prev, ...response.data }));
      
      // Mettre à jour les informations dans le localStorage
      const currentUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        username: response.data.username,
        email: response.data.email,
        image: response.data.image
      }));
      
      setProfileMessage({ type: 'success', text: 'Profil mis à jour avec succès!' });
      
      // Fermer le popup après une mise à jour réussie
      setTimeout(() => {
        setShowProfileForm(false);
        setProfileMessage({ type: '', text: '' });
      }, 2000);
      
    } catch (error) {
      setProfileMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Erreur lors de la mise à jour du profil'
      });
    } finally {
      setProfileLoading(false);
    }
  };
  
  // Fonction pour se déconnecter
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
  
  // Fonction utilitaire pour vérifier si un cours est dans un créneau horaire
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

  if (loading) return <div className="loading-container"><div className="loading">Chargement...</div></div>;
  if (error) return <div className="error-container"><div className="error">Erreur: {error}</div></div>;

  return (
    <div className="enseignant-dashboard">
      <div className="sidebar">
        <div className="user-info">
          <div className="avatar">
            {userData?.image ? (
              <img src={userData.image} alt="Profile" />
            ) : (
              <span>{userData?.username ? userData.username.charAt(0).toUpperCase() : 'E'}</span>
            )}
          </div>
          <h3>{userData?.username || 'Etudiant'}</h3>
        </div>
        
        <ul className="nav-links">
          <li
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser className="icon" /> Mon Profil
          </li>
          <li
            className={activeTab === 'cours' ? 'active' : ''}
            onClick={() => setActiveTab('cours')}
          >
            <FaBook className="icon" /> Mes Cours
          </li>
          <li
            className={activeTab === 'schedule' ? 'active' : ''}
            onClick={() => setActiveTab('schedule')}
          >
            <FaCalendarAlt className="icon" /> Emploi du Temps
          </li>
          <li
            className={activeTab === 'notes' ? 'active' : ''}
            onClick={() => setActiveTab('notes')}
          >
            <FaClipboardList className="icon" /> Mes Notes
          </li>
          <li
            className={activeTab === 'absences' ? 'active' : ''}
            onClick={() => setActiveTab('absences')}
          >
            <FaUserClock className="icon" /> Mes Absences
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
          {userData?.image ? (
            <img src={userData.image} alt="Profile" className="profile-image" />
          ) : (
            <div className="profile-avatar">
              <span>{userData?.username ? userData.username.charAt(0).toUpperCase() : 'E'}</span>
            </div>
          )}
          
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
              <span className="role-badge etudiant">{userData?.role}</span>
            </div>
          </div>
          
          <div className="info-item">
            <div className="info-label">Niveau</div>
            <div className="info-value">{userData?.niveau || 'Non spécifié'}</div>
          </div>
          
          <div className="info-item">
            <div className="info-label">Groupe</div>
            <div className="info-value">{userData?.groupe || 'Non spécifié'}</div>
          </div>
          
          {/* Bouton pour ouvrir le popup de modification */}
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
                <label>Image de profil (URL)</label>
                <input
                  type="text"
                  name="image"
                  value={profileFormData.image || ''}
                  onChange={handleProfileChange}
                  placeholder="https://exemple.com/image.jpg"
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

        
        {activeTab === 'cours' && (
          <div className="section">
            <div className="section-header">
              <h2>Mes Cours</h2>
            </div>
            
            {loading ? (
              <div className="loading">Chargement...</div>
            ) : (
              <>                
                <div className="cours-list">
                  {courses.length === 0 ? (
                    <div className="empty-state">
                      <FaBook size={48} />
                      <p>Vous n'avez pas encore reçu de cours</p>
                    </div>
                  ) : (
                    courses.map(course => (
                      <div className="cours-card" key={course._id}>
                        <div className="cours-header">
                          <h3 className="cours-title">{course.title}</h3>
                        </div>
                        <div className="cours-body">
                          <div className="cours-info">
                            <FaGraduationCap className="icon" />
                            <span>Niveau: {course.niveau || 'Non spécifié'}</span>
                          </div>
                          <p className="cours-description">{course.matiere}</p>
                          <p className="cours-description">{course.description}</p>
                          <div className="cours-actions">
                            {course.file && (
                              <a
                                href={`http://localhost:5001/uploads/cours/${course.file.path.split('\\').pop().split('/').pop()}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cours-btn view-cours-btn"
                              >
                                <FaFilePdf /> Voir document
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}
        
        {activeTab === 'schedule' && (
  <div className="section">
    <div className="section-header">
      <h2>Mon Emploi du Temps</h2>
    </div>

    {scheduleLoading ? (
      <div className="loading">Chargement...</div>
    ) : (
      <div className="timetable-container">
        <h3 className="timetable-title">
          {userData?.niveau && userData?.groupe
            ? `Emploi du temps: ${userData.niveau} ${userData.groupe}`
            : 'Aucune information sur emploi du temps'}
        </h3>

        {(userData?.niveau && userData?.groupe) && (
          <div className="timetable">
            <div className="timetable-header">
              <div className="timetable-cell time-column">Horaire</div>
              {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(day => (
                <div className="timetable-cell" key={day}>{day}</div>
              ))}
            </div>

            {timeSlots.map((timeSlot, index) => (
              <div className="timetable-row" key={index}>
                <div className="timetable-cell time-column">
                  {timeSlot.start} - {timeSlot.end}
                </div>

                {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(day => {
                  const course = schedules.find(schedule =>
                    schedule.jour === day &&
                    isTimeInSlot(schedule.heureDebut, schedule.heureFin, timeSlot.start, timeSlot.end)
                  );

                  return (
                    <div className={`timetable-cell ${course ? 'has-course' : ''}`} key={day}>
                      {course && (
                        <div className="course-card">
                          <div className="course-title">{course.titre}</div>
                          <div className="course-time">{course.heureDebut} - {course.heureFin}</div>
                          <div className="course-room">Salle: {course.salle}</div>
                          <div className="course-teacher">
                            {enseignants?.find(e => e._id === course.enseignant)?.username || 'Enseignant'}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    )}
  </div>
)}


{activeTab === 'notes' && (
  <div className="section">
    <div className="section-header">
      <h2>Mes Notes</h2>
    </div>
    
    {notesLoading ? (
      <div className="loading">Chargement des notes...</div>
    ) : notesError ? (
      <div className="error-message">{notesError}</div>
    ) : notes.length === 0 ? (
      <div className="empty-state">
        <FaClipboardList size={48} />
        <p>Vous n'avez pas encore de notes enregistrées</p>
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
      <h2>Mes Absences</h2>
    </div>
    
    {absencesLoading ? (
      <div className="loading">Chargement des absences...</div>
    ) : absencesError ? (
      <div className="error-message">{absencesError}</div>
    ) : absences.length === 0 ? (
      <div className="empty-state">
        <FaUserClock size={48} />
        <p>Vous n'avez pas d'absences enregistrées</p>
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

        
        {activeTab === 'messages' && (
          <div className="section">
            <div className="section-header">
              <h2>Messages</h2>
            </div>
            
            {loading ? (
              <div className="loading">Chargement...</div>
            ) : (
              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="no-messages">Aucun message disponible</div>
                ) : (
                  messages.map(message => (
                    <div className="message-card" key={message._id}>
                      <div className="message-header">
                        <div className="message-title">{message.title}</div>
                        <div className={`message-type ${message.type}`}>{message.type}</div>
                      </div>
                      {message.image && (
                        <div className="message-image">
                          <img src={message.image} alt="Message attachment" />
                        </div>
                      )}
                      <div className="message-content">{message.text}</div>
                      <div className="message-date">
                        {new Date(message.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="message-target">
                        Destinataires: {message.target === 'tous' ? 'Tous les utilisateurs' :
                          message.target === 'enseignants' ? 'Enseignants' :
                          message.target === 'etudiants' ? 'Étudiants' :
                          message.target === 'parents' ? 'Parents' : message.target}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}  
export default EtudiantDashboard;
