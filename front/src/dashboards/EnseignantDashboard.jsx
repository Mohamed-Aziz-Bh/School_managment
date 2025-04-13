import React, { useState, useEffect } from 'react';
import { FaUser, FaBook, FaCalendarAlt, FaEnvelope, FaSignOutAlt, FaPlus, FaEdit, FaTrash, FaFilePdf, FaGraduationCap } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../api';
import '../styles/EnseignantDashboard.css';

const EnseignantDashboard = () => {
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
    matieres: '',
    image: '',
    password: '',
    confirmPassword: ''
  });
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // États pour la section cours
  const [courses, setCourses] = useState([]); // Renommé de cours à courses pour correspondre au JSX
  const [coursLoading, setCoursLoading] = useState(true);
  const [coursError, setCoursError] = useState(null);
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [currentCours, setCurrentCours] = useState(null);
  const [enseignants, setEnseignants] = useState([]);
  const [newCourse, setNewCourse] = useState({ // Renommé de coursFormData à newCourse
    title: '',
    description: '',
    niveau: '',
    file: null
  });
  const [coursMessage, setCoursMessage] = useState({ type: '', text: '' });
  const [coursSubmitLoading, setCoursSubmitLoading] = useState(false);

  // États pour la section emploi du temps
  const [schedules, setSchedules] = useState([]);
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
          matieres: userInfo.matieres || '',
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

  // Chargement des cours de l'enseignant
  useEffect(() => {
    if (userData) {
      fetchCourses();
      fetchSchedules();
      fetchMessages();
    }
  }, [userData]);
  const fetchEnseignants = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/auth/enseignants', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnseignants(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des enseignants:', error);
      toast.error('Erreur lors du chargement des enseignants');
    }
  };

  // Fonction pour récupérer les cours
  const fetchCourses = async () => { // Renommé de fetchCours à fetchCourses
    try {
      setCoursLoading(true);
      const response = await api.get(`/cours/enseignant/${userData.username}`);
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
      const response = await api.get(`/schedule/enseignant/${userData._id}`);
      setSchedules(response.data);
      setScheduleError(null);
    } catch (err) {
      setScheduleError(err.response?.data?.message || 'Erreur lors du chargement de l\'emploi du temps');
    } finally {
      setScheduleLoading(false);
    }
  };

  // Fonction pour récupérer les messages
  const fetchMessages = async () => {
    try {
      setMessageLoading(true);
      const response = await api.get('/message/for-teachers');
      setMessages(response.data);
      setMessageError(null);
    } catch (err) {
      setMessageError(err.response?.data?.message || 'Erreur lors du chargement des messages');
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

  // Gestion des cours
  const handleFileChange = (e) => {
    setNewCourse(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setCoursSubmitLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', newCourse.title);
      formDataToSend.append('description', newCourse.description);
      formDataToSend.append('niveau', newCourse.niveau);
      formDataToSend.append('enseignant', userData.username);
      
      if (newCourse.file) {
        formDataToSend.append('file', newCourse.file);
      }
      
      await api.post('/cours', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Cours ajouté avec succès!');
      
      // Rafraîchir la liste des cours
      fetchCourses();
      
      // Fermer le formulaire
      setShowAddCourseForm(false);
      
      // Réinitialiser le formulaire
      setNewCourse({
        title: '',
        description: '',
        niveau: '',
        file: null
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout du cours');
    } finally {
      setCoursSubmitLoading(false);
    }
  };

  const handleEditCourse = (course) => {
    setCurrentCours(course);
    setNewCourse({
      title: course.title,
      description: course.description,
      niveau: course.niveau,
      file: null
    });
    setShowAddCourseForm(true);
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours?')) {
      try {
        await api.delete(`/cours/${id}`);
        toast.success('Cours supprimé avec succès!');
        // Rafraîchir la liste des cours
        fetchCourses();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Erreur lors de la suppression du cours');
      }
    }
  };

  // Fonction pour vérifier si un cours est dans un créneau horaire
  const isTimeInSlot = (courseStart, courseEnd, slotStart, slotEnd) => {
    return (courseStart >= slotStart && courseStart < slotEnd) || 
           (courseEnd > slotStart && courseEnd <= slotEnd) ||
           (courseStart <= slotStart && courseEnd >= slotEnd);
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
          <h3>{userData?.username || 'Enseignant'}</h3>
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
                      <span className="role-badge enseignant">Enseignant</span>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-label">Matières enseignées</div>
                    <div className="info-value">{userData?.matieres || 'Non spécifié'}</div>
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
              <button className="add-btn" onClick={() => setShowAddCourseForm(true)}>
                <FaPlus /> Ajouter un cours
              </button>
            </div>
            
            {loading ? (
              <div className="loading">Chargement...</div>
            ) : (
              <>
                {showAddCourseForm && (
                  <div className="schedule-form-modal">
                    <div className="schedule-form-content">
                      <h3>Ajouter un nouveau cours</h3>
                      <form onSubmit={handleAddCourse}>
                        <div className="form-group">
                          <label>Titre</label>
                          <input
                            type="text"
                            value={newCourse.title || ''}
                            onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                            required
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Description</label>
                          <textarea
                            value={newCourse.description || ''}
                            onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                            required
                            rows="4"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Niveau</label>
                          <select
                            value={newCourse.niveau || ''}
                            onChange={(e) => setNewCourse({...newCourse, niveau: e.target.value})}
                            required
                          >
                            <option value="">Sélectionner un niveau</option>
                            <option value="4ème">4ème</option>
                            <option value="3ème">3ème</option>
                            <option value="2nde">2nde</option>
                            <option value="1ère">1ère</option>
                            <option value="Terminale">Terminale</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Enseignant</label>
                          <select
                           value={newCourse.enseignant || ''}
                           onChange={(e) => setNewCourse({...newCourse, enseignant: e.target.value})}
                           required
                          >
                           <option value="">Sélectionner un enseignant</option>
                             {enseignants.map(enseignant => (
                                <option key={enseignant._id} value={enseignant._id}>
                                 {enseignant.username}
                                </option>
                            ))}
                         </select>
                        </div>
                        
                        <div className="form-group">
                          <label>Document du cours (PDF)</label>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.odt"
                            onChange={handleFileChange}
                          />
                        </div>
                        
                        <div className="form-actions">
                          <button type="submit" className="save-btn">Ajouter</button>
                          <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => setShowAddCourseForm(false)}
                          >
                            Annuler
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
                
                <div className="cours-list">
                  {courses.length === 0 ? (
                    <div className="empty-state">
                      <FaBook size={48} />
                      <p>Vous n'avez pas encore ajouté de cours</p>
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
                            <button
                              className="cours-btn edit-cours-btn"
                              onClick={() => handleEditCourse(course)}
                            >
                              <FaEdit /> Modifier
                            </button>
                            <button
                              className="cours-btn delete-cours-btn"
                              onClick={() => handleDeleteCourse(course._id)}
                            >
                              <FaTrash /> Supprimer
                            </button>
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
            
            {loading ? (
              <div className="loading">Chargement...</div>
            ) : (
              <div className="timetable-container">
                <h3 className="timetable-title">Emploi du temps: {userData?.username}</h3>
                
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
                        const course = schedules.find(schedule =>
                          schedule.jour === day &&
                          isTimeInSlot(schedule.heureDebut, schedule.heureFin, timeSlot.start, timeSlot.end)
                        );
                        
                        return (
                          <div className={`timetable-cell ${course ? 'has-course' : ''}`} key={day}>
                            {course && (
                              <div className="course-card">
                                <div className="course-title">{course.title || course.matiere} console.log</div>
                                <div className="course-time">{course.heureDebut} - {course.heureFin}</div>
                                <div className="course-room">Salle: {course.salle}</div>
                                <div className="course-class">
                                  {course.niveau} {course.groupe}
                                </div>
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
export default EnseignantDashboard;
