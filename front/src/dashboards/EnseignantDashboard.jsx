import React, { useState, useEffect } from 'react';
import { FaUser, FaBook, FaCalendarAlt, FaEnvelope, FaSignOutAlt, FaPlus, FaEdit, FaTrash, FaFilePdf, FaGraduationCap, FaUserGraduate, FaClipboardList, FaUserClock } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../api';
import '../styles/EnseignantDashboard.css';
import { isTimeInSlot } from '../utils/timeUtils';

const EnseignantDashboard = () => {
  // État utilisateur
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // État pour la navigation
  const [activeTab, setActiveTab] = useState('profile');

  // États pour la section profil
  /*const [profileFormData, setProfileFormData] = useState({
    username: '',
    email: '',
    matieres: '',
    image: '',
    password: '',
    confirmPassword: ''
  });
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(false);*/

  // États pour la gestion du formulaire de profil
const [showProfileForm, setShowProfileForm] = useState(false);
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
  const [enseignantsLoading, setEnseignantLoading] = useState(true);

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

  const [activeSubTab, setActiveSubTab] = useState('notes');
  const [activeGestionTab, setActiveGestionTab] = useState('notes');
const [notes, setNotes] = useState([]);
const [absences, setAbsences] = useState([]);
const [selectedNiveau, setSelectedNiveau] = useState('');
const [selectedGroupe, setSelectedGroupe] = useState('');
const [etudiants, setEtudiants] = useState([]);
const [showAddNoteForm, setShowAddNoteForm] = useState(false);
const [showAddAbsenceForm, setShowAddAbsenceForm] = useState(false);
const [currentNote, setCurrentNote] = useState(null);
const [currentAbsence, setCurrentAbsence] = useState(null);
const [newNote, setNewNote] = useState({
  etudiant: '',
  matiere: userData?.matieres || '',
  valeur: '',
  type: 'devoir',
  titre: '',
  commentaire: '',
  niveau: '',
  groupe: ''
});
const [newAbsence, setNewAbsence] = useState({
  etudiant: '',
  matiere: userData?.matieres || '',
  date: new Date().toISOString().split('T')[0],
  duree: 1,
  motif: '',
  niveau: '',
  groupe: ''
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
      fetchEnseignants();
    }
  }, [userData]);

  // Fonction pour récupérer la liste des enseignants
    const fetchEnseignants = async () => {
      try {
        setEnseignantLoading(true);
        const response = await api.get('/auth/enseignants');
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
      const response = await api.get(`/cours/enseignant/${userData._id}`);
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

// Fonction pour gérer les changements dans le formulaire
const handleProfileChange = (e) => {
  const { name, value } = e.target;
  setProfileFormData(prev => ({ ...prev, [name]: value }));
};

// Fonction pour gérer la soumission du formulaire
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
    // Préparer les données à envoyer
    const dataToUpdate = { ...profileFormData };
    
    // Ne pas envoyer le mot de passe s'il est vide
    if (!dataToUpdate.password || dataToUpdate.password.trim() === '') {
      delete dataToUpdate.password;
    }
    
    // Toujours supprimer confirmPassword car le backend ne le traite pas
    delete dataToUpdate.confirmPassword;
    
    // Ne pas permettre la modification du rôle
    delete dataToUpdate.role;
    
    console.log('Données à envoyer:', dataToUpdate);
    
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token d\'authentification non trouvé');
    }
    
    // Utiliser l'instance API avec la bonne URL
    const response = await api.put(`/auth/users/${userData._id}`, dataToUpdate, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Réponse du serveur:', response.data);
    
    // Mettre à jour les données utilisateur localement
    setUserData(prev => ({ ...prev, ...response.data }));
    
    // Mettre à jour les informations dans le localStorage
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const updatedUser = {
      ...currentUser,
      username: response.data.username || currentUser.username,
      email: response.data.email || currentUser.email,
      matieres: response.data.matieres || currentUser.matieres,
      image: response.data.image || currentUser.image
    };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    setProfileMessage({ type: 'success', text: 'Profil mis à jour avec succès!' });
    
    // Fermer le popup après une mise à jour réussie
    setTimeout(() => {
      setShowProfileForm(false);
      setProfileMessage({ type: '', text: '' });
    }, 2000);
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    
    if (error.response) {
      setProfileMessage({
        type: 'danger',
        text: error.response.data.message || `Erreur ${error.response.status}: Échec de la mise à jour du profil`
      });
    } else {
      setProfileMessage({
        type: 'danger',
        text: error.message || 'Erreur lors de la mise à jour du profil'
      });
    }
  } finally {
    setProfileLoading(false);
  }
};



  // Gestion des cours
  const handleFileChange = (e) => {
    setNewCourse(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCoursSubmitLoading(true);
  
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', newCourse.title);
      formDataToSend.append('description', newCourse.description);
      formDataToSend.append('matiere', newCourse.matiere);
      formDataToSend.append('niveau', newCourse.niveau);
      formDataToSend.append('enseignant', userData._id);
  
      if (newCourse.file) {
        formDataToSend.append('file', newCourse.file);
      }
  
      if (currentCours) {
        // Mode édition
        await api.put(`/cours/${currentCours._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Cours modifié avec succès !');
      } else {
        // Mode ajout
        await api.post('/cours', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Cours ajouté avec succès !');
      }
  
      fetchCourses();
      setShowAddCourseForm(false);
      setNewCourse({
        title: '',
        description: '',
        matiere: '',
        niveau: '',
        enseignant: userData._id,
        file: null
      });
      setCurrentCours(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
    } finally {
      setCoursSubmitLoading(false);
    }
  };
  

  const handleEditCourse = (course) => {
    setCurrentCours(course); // indique qu'on modifie
    setNewCourse({
      title: course.title,
      description: course.description,
      matiere: course.matiere,
      niveau: course.niveau,
      enseignant: course.enseignant || userData._id,
      file: null // on ne préremplit pas le fichier
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


  // Fonction pour récupérer les étudiants d'un niveau et groupe
const fetchEtudiants = async () => {
  if (!selectedNiveau || !selectedGroupe) return;
  
  try {
    const response = await api.get(`/notes/etudiants/niveau/${selectedNiveau}/groupe/${selectedGroupe}`);
    setEtudiants(response.data);
  } catch (error) {
    console.error('Erreur lors de la récupération des étudiants:', error);
    toast.error('Erreur lors du chargement des étudiants');
  }
};

// Fonction pour récupérer les notes
const fetchNotes = async () => {
  if (!selectedNiveau || !selectedGroupe) return;
  
  try {
    const response = await api.get(`/notes/niveau/${selectedNiveau}/groupe/${selectedGroupe}`);
    setNotes(response.data);
  } catch (error) {
    console.error('Erreur lors de la récupération des notes:', error);
    toast.error('Erreur lors du chargement des notes');
  }
};

// Fonction pour récupérer les absences
const fetchAbsences = async () => {
  if (!selectedNiveau || !selectedGroupe) return;
  
  try {
    const response = await api.get(`/absences/niveau/${selectedNiveau}/groupe/${selectedGroupe}`);
    setAbsences(response.data);
  } catch (error) {
    console.error('Erreur lors de la récupération des absences:', error);
    toast.error('Erreur lors du chargement des absences');
  }
};

// Fonction pour ajouter une note
const handleAddNote = async (e) => {
  e.preventDefault();
  try {
    const noteData = {
      ...newNote,
      niveau: selectedNiveau,
      groupe: selectedGroupe,
      matiere: userData.matieres
    };
    
    if (currentNote) {
      // Mode édition
      await api.put(`/notes/${currentNote._id}`, noteData);
      toast.success('Note modifiée avec succès');
    } else {
      // Mode ajout
      await api.post('/notes', noteData);
      toast.success('Note ajoutée avec succès');
    }
    
    // Réinitialiser le formulaire et rafraîchir les données
    setNewNote({
      etudiant: '',
      matiere: userData.matieres,
      valeur: '',
      type: 'devoir',
      titre: '',
      commentaire: '',
      niveau: '',
      groupe: ''
    });
    setShowAddNoteForm(false);
    setCurrentNote(null);
    fetchNotes();
  } catch (error) {
    console.error('Erreur lors de l\'ajout/modification de la note:', error);
    toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
  }
};

// Fonction pour supprimer une note
const handleDeleteNote = async (id) => {
  if (window.confirm('Êtes-vous sûr de vouloir supprimer cette note?')) {
    try {
      await api.delete(`/notes/${id}`);
      toast.success('Note supprimée avec succès');
      fetchNotes();
    } catch (error) {
      console.error('Erreur lors de la suppression de la note:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  }
};

// Fonction pour ajouter une absence
const handleAddAbsence = async (e) => {
  e.preventDefault();
  try {
    const absenceData = {
      ...newAbsence,
      niveau: selectedNiveau,
      groupe: selectedGroupe,
      matiere: userData.matieres
    };
    
    if (currentAbsence) {
      // Mode édition
      await api.put(`/absences/${currentAbsence._id}`, absenceData);
      toast.success('Absence modifiée avec succès');
    } else {
      // Mode ajout
      await api.post('/absences', absenceData);
      toast.success('Absence ajoutée avec succès');
    }
    
    // Réinitialiser le formulaire et rafraîchir les données
    setNewAbsence({
      etudiant: '',
      matiere: userData.matieres,
      date: new Date().toISOString().split('T')[0],
      duree: 1,
      motif: '',
      niveau: '',
      groupe: ''
    });
    setShowAddAbsenceForm(false);
    setCurrentAbsence(null);
    fetchAbsences();
  } catch (error) {
    console.error('Erreur lors de l\'ajout/modification de l\'absence:', error);
    toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
  }
};

// Fonction pour supprimer une absence
const handleDeleteAbsence = async (id) => {
  if (window.confirm('Êtes-vous sûr de vouloir supprimer cette absence?')) {
    try {
      await api.delete(`/absences/${id}`);
      toast.success('Absence supprimée avec succès');
      fetchAbsences();
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'absence:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  }
};

// Fonction pour éditer une note
const handleEditNote = (note) => {
  setCurrentNote(note);
  setNewNote({
    etudiant: note.etudiant._id,
    matiere: note.matiere,
    valeur: note.valeur,
    type: note.type,
    titre: note.titre,
    commentaire: note.commentaire
  });
  setShowAddNoteForm(true);
};

// Fonction pour éditer une absence
const handleEditAbsence = (absence) => {
  setCurrentAbsence(absence);
  setNewAbsence({
    etudiant: absence.etudiant._id,
    matiere: absence.matiere,
    date: new Date(absence.date).toISOString().split('T')[0],
    duree: absence.duree,
    motif: absence.motif,
    justifiee: absence.justifiee
  });
  setShowAddAbsenceForm(true);
};

// Effet pour charger les étudiants, notes et absences quand le niveau et le groupe changent
useEffect(() => {
  if (activeTab === 'gestion' && selectedNiveau && selectedGroupe) {
    fetchEtudiants();
    fetchNotes();
    fetchAbsences();
  }
}, [activeTab, selectedNiveau, selectedGroupe]);


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
            className={activeTab === 'gestion' ? 'active' : ''}
            onClick={() => setActiveTab('gestion')}
          >
            <FaClipboardList className="icon" /> Gestion Classe
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
              <span className="role-badge enseignant">{userData?.role}</span>
            </div>
          </div>
          
          <div className="info-item">
            <div className="info-label">Matières enseignées</div>
            <div className="info-value">{userData?.matieres || 'Non spécifié'}</div>
          </div>
          
          {/* Bouton pour modifier le profil */}
          <button 
            className="edit-profile-btn" 
            onClick={() => setShowProfileForm(true)}
          >
            <FaEdit className="icon-margin-right" /> Modifier mon profil
          </button>
        </div>
      </div>
    )}
    
    {/* Popup de modification de profil */}
    {showProfileForm && (
      <div className="profile-form-modal">
        <div className="profile-form-content">
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
              <label>Matières enseignées</label>
              <input
                type="text"
                name="matieres"
                value={profileFormData.matieres}
                onChange={handleProfileChange}
                placeholder="Ex: Mathématiques, Physique"
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
                className="save-btn" 
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
    )}
  </div>
)}

        
        {activeTab === 'cours' && (
          <div className="section">
            <div className="section-header">
              <h2>Mes Cours</h2>
              <button
                className="add-btn"
                onClick={() => {
                 setCurrentCours(null); // indique qu'on ajoute
                 setNewCourse({
                   title: '',
                   description: '',
                   matiere: '',
                   niveau: '',
                   enseignant: '',
                   file: null
                 });
                 setShowAddCourseForm(true);
                }}
              >
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
      <h3>{currentCours ? 'Modifier le cours' : 'Ajouter un nouveau cours'}</h3>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Titre</label>
          <input
            type="text"
            value={newCourse.title || ''}
            onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={newCourse.description || ''}
            onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
            required
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Matière</label>
          <input
            type="text"
            value={newCourse.matiere || ''}
            onChange={(e) => setNewCourse({ ...newCourse, matiere: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Niveau</label>
          <select
            value={newCourse.niveau || ''}
            onChange={(e) => setNewCourse({ ...newCourse, niveau: e.target.value })}
            required
          >
            <option value="">Sélectionner un niveau</option>
            <option value="4ème">4ème</option>
            <option value="3ème">3ème</option>
            <option value="2ème">2ème</option>
            <option value="1ère">1ère</option>
            <option value="Terminale">Terminale</option>
          </select>
        </div>

        

        <div className="form-group">
          <label>Document du cours (PDF, DOC, etc.)</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.odt"
            onChange={handleFileChange}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn">
            {currentCours ? 'Enregistrer les modifications' : 'Ajouter'}
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => {
              setShowAddCourseForm(false);
              setCurrentCours(null);
            }}
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
                                <div className="course-title">{course.titre}</div>
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

{activeTab === 'gestion' && (
  <div className="section">
    <div className="section-header">
      <h2>Gestion de Classe</h2>
    </div>
    
    <div className="gestion-filters">
      <div className="filter-group">
        <label>Niveau:</label>
        <select 
          value={selectedNiveau} 
          onChange={(e) => setSelectedNiveau(e.target.value)}
        >
          <option value="">Sélectionner un niveau</option>
          <option value="4ème">4ème</option>
          <option value="3ème">3ème</option>
          <option value="2ème">2ème</option>
          <option value="1ère">1ère</option>
          <option value="Terminale">Terminale</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label>Groupe:</label>
        <select 
          value={selectedGroupe} 
          onChange={(e) => setSelectedGroupe(e.target.value)}
          disabled={!selectedNiveau}
        >
          <option value="">Sélectionner un groupe</option>
          <option value="A">Groupe A</option>
          <option value="B">Groupe B</option>
          <option value="C">Groupe C</option>
          <option value="D">Groupe D</option>
        </select>
      </div>
    </div>
    
    {selectedNiveau && selectedGroupe ? (
      <div className="gestion-content">
        <div className="gestion-tabs">
          <div 
            className={`gestion-tab ${activeGestionTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveGestionTab('notes')}
          >
            <FaClipboardList className="icon" /> Notes
          </div>
          <div 
            className={`gestion-tab ${activeGestionTab === 'absences' ? 'active' : ''}`}
            onClick={() => setActiveGestionTab('absences')}
          >
            <FaUserClock className="icon" /> Absences
          </div>
        </div>
        
        {activeGestionTab === 'notes' && (
          <div className="notes-section">
            <div className="section-actions">
              <button 
                className="add-btn"
                onClick={() => {
                  setCurrentNote(null);
                  setNewNote({
                    etudiant: '',
                    matiere: userData.matieres,
                    valeur: '',
                    type: 'devoir',
                    titre: '',
                    commentaire: '',
                    niveau: selectedNiveau,
                    groupe: selectedGroupe
                  });
                  setShowAddNoteForm(true);
                }}
              >
                <FaPlus /> Ajouter une note
              </button>
            </div>
            
            {showAddNoteForm && (
              <div className="form-modal">
                <div className="form-content">
                  <h3>{currentNote ? 'Modifier la note' : 'Ajouter une note'}</h3>
                  <form onSubmit={handleAddNote}>
                    <div className="form-group">
                      <label>Étudiant</label>
                      <select
                        value={newNote.etudiant}
                        onChange={(e) => setNewNote({...newNote, etudiant: e.target.value})}
                        required
                      >
                        <option value="">Sélectionner un étudiant</option>
                        {etudiants.map(etudiant => (
                          <option key={etudiant._id} value={etudiant._id}>
                            {etudiant.username}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Titre de l'évaluation</label>
                      <input
                        type="text"
                        value={newNote.titre}
                        onChange={(e) => setNewNote({...newNote, titre: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Type d'évaluation</label>
                      <select
                        value={newNote.type}
                        onChange={(e) => setNewNote({...newNote, type: e.target.value})}
                        required
                      >
                        <option value="devoir">Devoir</option>
                        <option value="examen">Examen</option>
                        <option value="controle">Contrôle</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Note (sur 20)</label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.25"
                        value={newNote.valeur}
                        onChange={(e) => setNewNote({...newNote, valeur: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Commentaire</label>
                      <textarea
                        value={newNote.commentaire}
                        onChange={(e) => setNewNote({...newNote, commentaire: e.target.value})}
                        rows="3"
                      />
                    </div>
                    
                    <div className="form-actions">
                      <button type="submit" className="save-btn">
                        {currentNote ? 'Enregistrer les modifications' : 'Ajouter la note'}
                      </button>
                      <button 
                        type="button" 
                        className="cancel-btn" 
                        onClick={() => {
                          setShowAddNoteForm(false);
                          setCurrentNote(null);
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {notes.length === 0 ? (
              <div className="empty-state">
                <FaClipboardList size={48} />
                <p>Aucune note enregistrée pour cette classe</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Étudiant</th>
                      <th>Évaluation</th>
                      <th>Type</th>
                      <th>Note</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notes.map(note => (
                      <tr key={note._id}>
                        <td>{note.etudiant.username}</td>
                        <td>{note.titre}</td>
                        <td>
                          <span className={`badge ${note.type}`}>
                            {note.type}
                          </span>
                        </td>
                        <td className="note-value">{note.valeur}/20</td>
                        <td>{new Date(note.date).toLocaleDateString('fr-FR')}</td>
                        <td className="actions">
                          <button 
                            className="edit-btn-small" 
                            onClick={() => handleEditNote(note)}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="delete-btn-small" 
                            onClick={() => handleDeleteNote(note._id)}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {activeGestionTab === 'absences' && (
          <div className="absences-section">
            <div className="section-actions">
              <button 
                className="add-btn"
                onClick={() => {
                  setCurrentAbsence(null);
                  setNewAbsence({
                    etudiant: '',
                    matiere: userData.matieres,
                    date: new Date().toISOString().split('T')[0],
                    duree: 1,
                    motif: '',
                    niveau: selectedNiveau,
                    groupe: selectedGroupe
                  });
                  setShowAddAbsenceForm(true);
                }}
              >
                <FaPlus /> Signaler une absence
              </button>
            </div>
            
            {showAddAbsenceForm && (
              <div className="form-modal">
                <div className="form-content">
                  <h3>{currentAbsence ? 'Modifier l\'absence' : 'Signaler une absence'}</h3>
                  <form onSubmit={handleAddAbsence}>
                    <div className="form-group">
                      <label>Étudiant</label>
                      <select
                        value={newAbsence.etudiant}
                        onChange={(e) => setNewAbsence({...newAbsence, etudiant: e.target.value})}
                        required
                      >
                        <option value="">Sélectionner un étudiant</option>
                        {etudiants.map(etudiant => (
                          <option key={etudiant._id} value={etudiant._id}>
                            {etudiant.username}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Date</label>
                      <input
                        type="date"
                        value={newAbsence.date}
                        onChange={(e) => setNewAbsence({...newAbsence, date: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Durée (heures)</label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        value={newAbsence.duree}
                        onChange={(e) => setNewAbsence({...newAbsence, duree: e.target.value})}
                        required
                      />
                    </div>
                    
                    {currentAbsence && (
                      <div className="form-group">
                        <label>Justifiée</label>
                        <div className="toggle-switch">
                          <input
                            type="checkbox"
                            id="justifiee"
                            checked={newAbsence.justifiee}
                            onChange={(e) => setNewAbsence({...newAbsence, justifiee: e.target.checked})}
                          />
                          <label htmlFor="justifiee"></label>
                        </div>
                      </div>
                    )}
                    
                    <div className="form-group">
                      <label>Motif</label>
                      <textarea
                        value={newAbsence.motif}
                        onChange={(e) => setNewAbsence({...newAbsence, motif: e.target.value})}
                        rows="3"
                      />
                    </div>
                    
                    <div className="form-actions">
                      <button type="submit" className="save-btn">
                        {currentAbsence ? 'Enregistrer les modifications' : 'Signaler l\'absence'}
                      </button>
                      <button 
                        type="button" 
                        className="cancel-btn" 
                        onClick={() => {
                          setShowAddAbsenceForm(false);
                          setCurrentAbsence(null);
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {absences.length === 0 ? (
              <div className="empty-state">
                <FaUserClock size={48} />
                <p>Aucune absence enregistrée pour cette classe</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Étudiant</th>
                      <th>Date</th>
                      <th>Durée</th>
                      <th>Statut</th>
                      <th>Motif</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {absences.map(absence => (
                      <tr key={absence._id}>
                        <td>{absence.etudiant.username}</td>
                        <td>{new Date(absence.date).toLocaleDateString('fr-FR')}</td>
                        <td>{absence.duree}h</td>
                        <td>
                          <span className={`badge ${absence.justifiee ? 'justifiee' : 'non-justifiee'}`}>
                            {absence.justifiee ? 'Justifiée' : 'Non justifiée'}
                          </span>
                        </td>
                        <td>{absence.motif || '-'}</td>
                        <td className="actions">
                          <button 
                            className="edit-btn-small" 
                            onClick={() => handleEditAbsence(absence)}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="delete-btn-small" 
                            onClick={() => handleDeleteAbsence(absence._id)}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    ) : (
      <div className="select-classe-message">
        <FaUserGraduate size={48} />
        <p>Veuillez sélectionner un niveau et un groupe pour gérer les notes et absences</p>
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
