import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FaUsers, FaBook, FaCalendarAlt, FaEnvelope, FaEdit, FaTrash, FaPlus, FaFilePdf } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/AdminDashboard.css';
import { isTimeInSlot } from '../utils/timeUtils';


const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  // États pour la gestion des emplois du temps
  const [userListType, setUserListType] = useState('enseignants');
  const [filterNiveau, setFilterNiveau] = useState('');
  const [filterGroupe, setFilterGroupe] = useState('');
  const [scheduleType, setScheduleType] = useState('classe');
  const [selectedNiveau, setSelectedNiveau] = useState('');
  const [selectedGroupe, setSelectedGroupe] = useState('');
  const [selectedEnseignant, setSelectedEnseignant] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [newCourse, setNewCourse] = useState({
    titre: '',
    jour: 'Lundi',
    heureDebut: '',
    heureFin: '',
    salle: '',
    enseignant: '',
    niveau: '',
    groupe: ''
  });
  const [enseignants, setEnseignants] = useState([]);
  const [timeSlots, setTimeSlots] = useState([
    { start: '08:30', end: '10:00' },
    { start: '10:15', end: '11:45' },
    { start: '12:00', end: '13:30' },
    { start: '13:45', end: '15:15' },
    { start: '15:30', end: '17:00' },
  ]);




  // Fetch user data from localStorage on component mount
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUsername(userData.username || userData.nom);
    }
    
    fetchUsers();
    fetchCourses();
    fetchSchedules();
    fetchMessages();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/cours', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Erreur lors du chargement des cours');
    }
  };

 

 // Add these state variables
 const [showMessageForm, setShowMessageForm] = useState(false);
 const [newMessage, setNewMessage] = useState({
  title: '',
  text: '',
  image: '',
  type: '',
  target: ''
 });

 // Function to handle message submission
 const handleSendMessage = async (e) => {
  e.preventDefault();
  
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.post('http://localhost:5001/api/message', newMessage, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Add the new message to the messages array
    setMessages([response.data, ...messages]);
    
    // Reset form and close it
    setNewMessage({
      title: '',
      text: '',
      image: '',
      type: '',
      target: ''
    });
    setShowMessageForm(false);
    
    toast.success('Message envoyé avec succès');
  } catch (error) {
    console.error('Error sending message:', error);
    toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi du message');
  }
 };
  
  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/message', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Erreur lors du chargement des messages');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5001/api/auth/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(users.filter(user => user._id !== userId));
        toast.success('Utilisateur supprimé avec succès');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Erreur lors de la suppression de l\'utilisateur');
      }
    }
  };
  // Filtrer les emplois du temps en fonction des sélections
  const filteredSchedules = useMemo(() => {
    if (scheduleType === 'classe' && selectedNiveau && selectedGroupe) {
      return schedules.filter(
        schedule => schedule.niveau === selectedNiveau && schedule.groupe === selectedGroupe
      );
    } else if (scheduleType === 'enseignant' && selectedEnseignant) {
      return schedules.filter(
        schedule => schedule.enseignant === selectedEnseignant
      );
    }
    return [];
  }, [schedules, scheduleType, selectedNiveau, selectedGroupe, selectedEnseignant]);
  
  // Fonction pour récupérer la liste des enseignants
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
  
  // Fonction pour ajouter un nouveau cours
  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Préparer les données selon le type d'emploi du temps et adapter aux noms de champs du backend
      const courseData = {
        day: newCourse.jour,
        start_time: newCourse.heureDebut,
        end_time: newCourse.heureFin,
        matiere: newCourse.titre,
        salle: newCourse.salle,
        // Si on ajoute un cours pour une classe, on utilise les valeurs sélectionnées
        niveau: scheduleType === 'classe' ? selectedNiveau : newCourse.niveau,
        groupe: scheduleType === 'classe' ? selectedGroupe : newCourse.groupe,
        // Si on ajoute un cours pour un enseignant, on utilise l'enseignant sélectionné
        enseignant: scheduleType === 'enseignant' ? selectedEnseignant : newCourse.enseignant
      };
      
      const response = await axios.post('http://localhost:5001/api/schedule', courseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Adapter le format de la réponse pour correspondre à notre format d'affichage
      const newScheduleItem = {
        _id: response.data.schedule._id,
        jour: response.data.schedule.day,
        heureDebut: response.data.schedule.start_time,
        heureFin: response.data.schedule.end_time,
        titre: response.data.schedule.matiere,
        niveau: response.data.schedule.niveau,
        groupe: response.data.schedule.groupe,
        enseignant: response.data.schedule.enseignant,
        salle: response.data.schedule.salle // Ajouter la salle si nécessaire
      };
      
      // Ajouter le nouveau cours à la liste
      setSchedules([...schedules, newScheduleItem]);
      
      // Réinitialiser le formulaire
      setNewCourse({
        titre: '',
        jour: 'Lundi',
        heureDebut: '',
        heureFin: '',
        salle: '',
        enseignant: '',
        niveau: '',
        groupe: ''
      });
      
      setShowAddForm(false);
      toast.success('Cours ajouté avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du cours:', error);
      toast.error('Erreur lors de l\'ajout du cours');
    }
  };
  
  // Fonction pour modifier un cours
  const handleUpdateSchedule = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Adapter les noms de champs pour correspondre au backend
      const updateData = {
        day: editingSchedule.jour,
        start_time: editingSchedule.heureDebut,
        end_time: editingSchedule.heureFin,
        matiere: editingSchedule.titre,
        niveau: editingSchedule.niveau,
        groupe: editingSchedule.groupe,
        enseignant: editingSchedule.enseignant,
        salle: editingSchedule.salle
      };
      
      await axios.put(`http://localhost:5001/api/schedule/${editingSchedule._id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Mettre à jour la liste des cours
      setSchedules(schedules.map(schedule => 
        schedule._id === editingSchedule._id ? editingSchedule : schedule
      ));
      
      setEditingSchedule(null);
      toast.success('Cours mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du cours:', error);
      toast.error('Erreur lors de la mise à jour du cours');
    }
  };
  
  // Fonction pour supprimer un cours
  const handleDeleteSchedule = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      try {
        const token = localStorage.getItem('token');
        
        await axios.delete(`http://localhost:5001/api/schedule/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Mettre à jour la liste des cours
        setSchedules(schedules.filter(schedule => schedule._id !== id));
        
        toast.success('Cours supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression du cours:', error);
        toast.error('Erreur lors de la suppression du cours');
      }
    }
  };
  
  // Fonction pour éditer un cours
  const handleEditSchedule = (schedule) => {
    setEditingSchedule({...schedule});
  };
  
  // Charger les enseignants au chargement du composant
  useEffect(() => {
    if (activeTab === 'schedules') {
      fetchEnseignants();
    }
  }, [activeTab]);
  
  // Définir la fonction fetchSchedules en dehors du useEffect
const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = 'http://localhost:5001/api/schedule';
      
      // Adapter l'URL selon les routes définies dans le backend
      if (scheduleType === 'classe' && selectedNiveau && selectedGroupe) {
        url = `http://localhost:5001/api/schedule/groupe/${selectedGroupe}/niveau/${selectedNiveau}`;
      } else if (scheduleType === 'enseignant' && selectedEnseignant) {
        url = `http://localhost:5001/api/schedule/enseignant/${selectedEnseignant}`;
      } else {
        // Si aucune sélection complète, ne pas charger les emplois du temps
        return;
      }
      
      const response = await axios.get(url, {
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
    } catch (error) {
      console.error('Erreur lors du chargement des emplois du temps:', error);
      toast.error('Erreur lors du chargement des emplois du temps');
    }
  };
  
  // Puis dans votre useEffect
  useEffect(() => {
    if (activeTab === 'schedules') {
      fetchSchedules();
    }
  }, [activeTab, scheduleType, selectedNiveau, selectedGroupe, selectedEnseignant]);
  

  const handleToggleStatus = async (userId, actif) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5001/api/auth/users/${userId}/toggle-status`,
        { actif: !actif },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.status === 200) {
        // Met à jour la liste des utilisateurs dans le state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId ? { ...user, actif: !actif } : user
          )
        );
        toast.success(`Utilisateur ${!actif ? 'activé' : 'désactivé'} avec succès`);
      }
    } catch (error) {
      console.error('Erreur lors de la modification du statut:', error);
      toast.error('Erreur lors de la modification du statut');
    }
  };
  

  // Fonction pour assigner un groupe à un étudiant
// Fonction pour assigner un groupe à un étudiant
const handleAssignGroup = async (userId, groupe) => {
  try {
    const token = localStorage.getItem('token');
    console.log('Assigning group:', { userId, groupe }); // Log pour déboguer
    
    const response = await axios.put(
      `http://localhost:5001/api/auth/users/${userId}/assign-group`,
      { groupe },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('Response:', response.data); // Log pour déboguer
    
    if (response.status === 200) {
      // Mettre à jour l'utilisateur dans la liste locale
      setUsers(users.map(user => 
        user._id === userId ? { ...user, groupe } : user
      ));
      
      toast.success(`Groupe ${groupe} assigné avec succès`);
    }
  } catch (error) {
    console.error('Erreur lors de l\'assignation du groupe:', error);
    // Afficher plus de détails sur l'erreur
    if (error.response) {
      console.error('Réponse d\'erreur:', error.response.data);
      toast.error(`Erreur: ${error.response.data.message || 'Erreur serveur'}`);
    } else {
      toast.error(`Erreur: ${error.message}`);
    }
  }
};



 // Filtrer les utilisateurs selon le type et les filtres
const filteredUsers = useMemo(() => {
  if (userListType === 'enseignants') {
    return users.filter(user => user.role === 'enseignant');
  } else if (userListType === 'etudiants') {
    return users.filter(user => {
      if (user.role !== 'etudiant') return false;
      
      // Appliquer les filtres de niveau et groupe si définis
      if (filterNiveau && user.niveau !== filterNiveau) return false;
      
      if (filterGroupe) {
        if (filterGroupe === 'null') {
          // Filtrer les étudiants sans groupe
          return !user.groupe;
        } else if (user.groupe !== filterGroupe) {
          return false;
        }
      }
      
      return true;
    });
  } else if (userListType === 'parents') {
    return users.filter(user => user.role === 'parent');
  }
  return [];
}, [users, userListType, filterNiveau, filterGroupe]);



  
  

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <div className="user-info">
          <div className="avatar">
            <span>{username ? username.charAt(0).toUpperCase() : 'A'}</span>
          </div>
          <h3>{username || 'Admin'}</h3>
        </div>
        
        <ul className="nav-links">
          <li 
            className={activeTab === 'users' ? 'active' : ''} 
            onClick={() => setActiveTab('users')}
          >
            <FaUsers className="icon" /> Utilisateurs
          </li>
          <li 
            className={activeTab === 'courses' ? 'active' : ''} 
            onClick={() => setActiveTab('courses')}
          >
            <FaBook className="icon" /> Cours
          </li>
          <li 
            className={activeTab === 'schedules' ? 'active' : ''} 
            onClick={() => setActiveTab('schedules')}
          >
            <FaCalendarAlt className="icon" /> Emplois du temps
          </li>
          <li 
            className={activeTab === 'messages' ? 'active' : ''} 
            onClick={() => setActiveTab('messages')}
          >
            <FaEnvelope className="icon" /> Messages
          </li>
        </ul>
        
        <div className="logout-btn" onClick={handleLogout}>
          Déconnexion
        </div>
      </div>
      
      <div className="main-content">
        <ToastContainer position="top-right" autoClose={3000} />
        
        {activeTab === 'users' && (
  <div className="section">
    <div className="section-header">
      <h2>Gestion des Utilisateurs</h2>
      <div className="user-filter-tabs">
        <button 
          className={`filter-tab ${userListType === 'enseignants' ? 'active' : ''}`}
          onClick={() => setUserListType('enseignants')}
        >
          Enseignants
        </button>
        <button 
          className={`filter-tab ${userListType === 'etudiants' ? 'active' : ''}`}
          onClick={() => setUserListType('etudiants')}
        >
          Étudiants
        </button>
        <button 
          className={`filter-tab ${userListType === 'parents' ? 'active' : ''}`}
          onClick={() => setUserListType('parents')}
        >
          Parents
        </button>
      </div>
    </div>
    
    {loading ? (
      <div className="loading">Chargement...</div>
    ) : (
      <>
        {userListType === 'etudiants' && (
          <div className="student-filters">
            <select 
              value={filterNiveau} 
              onChange={(e) => setFilterNiveau(e.target.value)}
              className="filter-select"
            >
              <option value="">Tous les niveaux</option>
              <option value="4ème">4ème</option>
              <option value="3ème">3ème</option>
              <option value="2ème">2ème</option>
              <option value="1ère">1ère</option>
              <option value="Terminale">Terminale</option>
            </select>
            
            <select 
              value={filterGroupe} 
              onChange={(e) => setFilterGroupe(e.target.value)}
              className="filter-select"
            >
              <option value="">Tous les groupes</option>
              <option value="A">Groupe A</option>
              <option value="B">Groupe B</option>
              <option value="C">Groupe C</option>
              <option value="D">Groupe D</option>
              <option value="null">Sans groupe</option>
            </select>
          </div>
        )}
        
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                {userListType === 'etudiants' && (
                  <>
                    <th>Niveau</th>
                    <th>Groupe</th>
                  </>
                )}
                {userListType === 'enseignants' && (
                  <th>Matières</th>
                )}
                {userListType === 'parents' && (
                  <>
                    <th>Nombre d'enfants</th>
                    <th>Enfants</th>
                  </>
                )}
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  {userListType === 'etudiants' && (
                    <>
                      <td>{user.niveau}</td>
                      <td>
                        {user.groupe ? (
                          user.groupe
                        ) : (
                          <select
                            className="assign-group-select"
                            onChange={(e) => handleAssignGroup(user._id, e.target.value)}
                            defaultValue=""
                          >
                            <option value="" disabled>Assigner un groupe</option>
                            <option value="A">Groupe A</option>
                            <option value="B">Groupe B</option>
                            <option value="C">Groupe C</option>
                            <option value="D">Groupe D</option>
                          </select>
                        )}
                      </td>
                    </>
                  )}
                  {userListType === 'enseignants' && (
                    <td>{user.matieres}</td>
                  )}
                  {userListType === 'parents' && (
                    <>
                      <td>{user.nombreEnfants}</td>
                      <td>
                        {user.enfants && user.enfants.length > 0 
                          ? user.enfants.map(enfant => enfant.username).join(', ') 
                          : 'Aucun enfant'}
                      </td>
                    </>
                  )}
                  <td>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={user.actif} 
                        onChange={() => handleToggleStatus(user._id, user.actif)}
                      />
                      <span className="slider round"></span>
                    </label>
                    <span className="status-text">{user.actif ? 'Actif' : 'Inactif'}</span>
                  </td>
                  <td className="actions">
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDeleteUser(user._id)}
                      title="Supprimer l'utilisateur"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )}
  </div>
)}




        
        {activeTab === 'courses' && (
  <div className="section">
    <div className="section-header">
      <h2>Liste des Cours</h2>
    </div>
    
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Description</th>
            <th>Matière</th>
            <th>Niveau</th>
            <th>Enseignant</th>
            <th>Document</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course._id}>
              <td>{course.title}</td>
              <td>{course.description}</td>
              <td>{course.matiere}</td>
              <td>{course.niveau || 'Non spécifié'}</td>
              <td>{course.enseignant ? course.enseignant : 'Non assigné'}</td>
              <td>
                 {course.file ? (
                   <a
                      href={`http://localhost:5001/uploads/cours/${course.file.path.split('\\').pop().split('/').pop()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-file-btn"
                   >
                     <FaFilePdf /> {course.file.name || 'Voir document'}
                   </a>
                  ) : (
                    'Aucun document'
                  )}
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}


{activeTab === 'schedules' && (
  <div className="section">
    <div className="section-header">
      <h2>Gestion des Emplois du Temps</h2>
      <div className="schedule-filters">
        <select 
          value={scheduleType} 
          onChange={(e) => setScheduleType(e.target.value)}
          className="schedule-type-select"
        >
          <option value="classe">Par Classe</option>
          <option value="enseignant">Par Enseignant</option>
        </select>
        
        {scheduleType === 'classe' && (
          <>
            <select 
              value={selectedNiveau} 
              onChange={(e) => setSelectedNiveau(e.target.value)}
              className="niveau-select"
            >
              <option value="">Sélectionner un niveau</option>
              <option value="4ème">4ème</option>
              <option value="3ème">3ème</option>
              <option value="2ème">2ème</option>
              <option value="1ère">1ère</option>
              <option value="Terminale">Terminale</option>
            </select>
            
            <select 
              value={selectedGroupe} 
              onChange={(e) => setSelectedGroupe(e.target.value)}
              className="groupe-select"
              disabled={!selectedNiveau}
            >
              <option value="">Sélectionner un groupe</option>
              <option value="A">Groupe A</option>
              <option value="B">Groupe B</option>
              <option value="C">Groupe C</option>
              <option value="D">Groupe D</option>
            </select>
          </>
        )}
        
        {scheduleType === 'enseignant' && (
          <select 
            value={selectedEnseignant} 
            onChange={(e) => setSelectedEnseignant(e.target.value)}
            className="enseignant-select"
          >
            <option value="">Sélectionner un enseignant</option>
            {enseignants.map(enseignant => (
              <option key={enseignant._id} value={enseignant._id}>
                {enseignant.username}
              </option>
            ))}
          </select>
        )}
        
        <button className="add-btn" onClick={() => setShowAddForm(true)}>
          <FaPlus /> Ajouter un cours
        </button>
      </div>
    </div>
    
    {showAddForm && (
      <div className="schedule-form-modal">
        <div className="schedule-form-content">
          <h3>Ajouter un cours</h3>
          <form onSubmit={handleAddCourse}>
            <div className="form-group">
              <label>Matière</label>
              <input
                type="text"
                value={newCourse.titre || ''}
                onChange={(e) => setNewCourse({...newCourse, titre: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Jour</label>
              <select
                value={newCourse.jour || 'Lundi'}
                onChange={(e) => setNewCourse({...newCourse, jour: e.target.value})}
                required
              >
                <option value="Lundi">Lundi</option>
                <option value="Mardi">Mardi</option>
                <option value="Mercredi">Mercredi</option>
                <option value="Jeudi">Jeudi</option>
                <option value="Vendredi">Vendredi</option>
                <option value="Samedi">Samedi</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Heure de début</label>
              <input
                type="time"
                value={newCourse.heureDebut || ''}
                onChange={(e) => setNewCourse({...newCourse, heureDebut: e.target.value})}
                step="60"
                min="00:00"
                max="23:59"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Heure de fin</label>
              <input
                type="time"
                value={newCourse.heureFin || ''}
                onChange={(e) => setNewCourse({...newCourse, heureFin: e.target.value})}
                step="60"
                min="00:00"
                max="23:59"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Salle</label>
              <input
                type="text"
                value={newCourse.salle || ''}
                onChange={(e) => setNewCourse({...newCourse, salle: e.target.value})}
                required
              />
            </div>
            
            {scheduleType === 'classe' ? (
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
            ) : (
              <div className="form-group">
                <label>Classe</label>
                <div className="classe-select-group">
                  <select
                    value={newCourse.niveau || ''}
                    onChange={(e) => setNewCourse({...newCourse, niveau: e.target.value})}
                    required
                  >
                    <option value="">Niveau</option>
                    <option value="4ème">4ème</option>
                    <option value="3ème">3ème</option>
                    <option value="2ème">2ème</option>
                    <option value="1ère">1ère</option>
                    <option value="Terminale">Terminale</option>
                  </select>
                  <select
                    value={newCourse.groupe || ''}
                    onChange={(e) => setNewCourse({...newCourse, groupe: e.target.value})}
                    required
                  >
                    <option value="">Groupe</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
              </div>
            )}
            
            <div className="form-actions">
              <button type="submit" className="save-btn">Ajouter</button>
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => setShowAddForm(false)}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    
    {editingSchedule && (
      <div className="schedule-form-modal">
        <div className="schedule-form-content">
          <h3>Modifier le cours</h3>
          <form onSubmit={handleUpdateSchedule}>
            <div className="form-group">
              <label>Matière</label>
              <input
                type="text"
                value={editingSchedule.titre || ''}
                onChange={(e) => setEditingSchedule({...editingSchedule, titre: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Jour</label>
              <select
                value={editingSchedule.jour || 'Lundi'}
                onChange={(e) => setEditingSchedule({...editingSchedule, jour: e.target.value})}
              >
                <option value="Lundi">Lundi</option>
                <option value="Mardi">Mardi</option>
                <option value="Mercredi">Mercredi</option>
                <option value="Jeudi">Jeudi</option>
                <option value="Vendredi">Vendredi</option>
                <option value="Samedi">Samedi</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Heure de début</label>
              <input
                type="time"
                value={editingSchedule.heureDebut || ''}
                onChange={(e) => setEditingSchedule({...editingSchedule, heureDebut: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Heure de fin</label>
              <input
                type="time"
                value={editingSchedule.heureFin || ''}
                onChange={(e) => setEditingSchedule({...editingSchedule, heureFin: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Salle</label>
              <input
                type="text"
                value={editingSchedule.salle || ''}
                onChange={(e) => setEditingSchedule({...editingSchedule, salle: e.target.value})}
                required
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="save-btn">Enregistrer</button>
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => setEditingSchedule(null)}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    
    <div className="timetable-container">
      <h3 className="timetable-title">
        {scheduleType === 'classe' 
          ? (selectedNiveau && selectedGroupe 
              ? `Emploi du temps: ${selectedNiveau} ${selectedGroupe}` 
              : 'Veuillez sélectionner une classe')
          : (selectedEnseignant 
              ? `Emploi du temps: ${enseignants.find(e => e._id === selectedEnseignant)?.username || 'Enseignant'}` 
              : 'Veuillez sélectionner un enseignant')
        }
      </h3>
      
      {((scheduleType === 'classe' && selectedNiveau && selectedGroupe) || 
        (scheduleType === 'enseignant' && selectedEnseignant)) && (
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
                const course = filteredSchedules.find(schedule => 
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
                        {scheduleType === 'classe' && (
                          <div className="course-teacher">
                            {enseignants.find(e => e._id === course.enseignant)?.username || 'Enseignant'}
                          </div>
                        )}
                        {scheduleType === 'enseignant' && (
                          <div className="course-class">
                            {course.niveau} {course.groupe}
                          </div>
                        )}
                        <div className="course-actions">
                          <button 
                            className="edit-btn-small" 
                            onClick={() => handleEditSchedule(course)}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="delete-btn-small" 
                            onClick={() => handleDeleteSchedule(course._id)}
                          >
                            <FaTrash />
                          </button>
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
  </div>
)}


{activeTab === 'messages' && (
  <div className="section">
    <div className="section-header">
      <h2>Messages</h2>
      <button className="add-btn" onClick={() => setShowMessageForm(true)}><FaPlus /> Nouveau Message</button>
    </div>
    
    {showMessageForm && (
      <div className="message-form-container">
        <h3>Créer un nouveau message</h3>
        <form onSubmit={handleSendMessage}>
          <div className="form-group">
            <label>Titre</label>
            <input 
              type="text" 
              value={newMessage.title || ''} 
              onChange={(e) => setNewMessage({...newMessage, title: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Contenu du message</label>
            <textarea 
              value={newMessage.text || ''} 
              onChange={(e) => setNewMessage({...newMessage, text: e.target.value})}
              required
              rows="5"
            />
          </div>
          <div className="form-group">
            <label>Type de message</label>
            <select
              value={newMessage.type || ''}
              onChange={(e) => setNewMessage({...newMessage, type: e.target.value})}
              required
            >
              <option value="">Sélectionner un type</option>
              <option value="absence">absence</option>
              <option value="announcement">announcement</option>
              <option value="event">event</option>
            </select>
          </div>
          <div className="form-group">
            <label>Destinataires</label>
            <select
              value={newMessage.target || ''}
              onChange={(e) => setNewMessage({...newMessage, target: e.target.value})}
              required
            >
              <option value="">Sélectionner les destinataires</option>
              <option value="tous">Tous les utilisateurs</option>
              <option value="enseignant">Enseignants</option>
              <option value="etudiant">Étudiants</option>
              <option value="parent">Parents</option>
            </select>
          </div>
          <div className="form-group">
            <label>URL de l'image (optionnel)</label>
            <input 
              type="text" 
              value={newMessage.image || ''} 
              onChange={(e) => setNewMessage({...newMessage, image: e.target.value})}
              placeholder="https://exemple.com/image.jpg"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="save-btn">Envoyer</button>
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={() => setShowMessageForm(false)}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    )}
    
    <div className="messages-container">
      {messages.length === 0 ? (
        <div className="no-messages">Aucun message disponible</div>
      ) : (
        messages.map(message => (
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
            <div className="message-target">
              Destinataires: {message.target === 'tous' ? 'Tous les utilisateurs' : 
                message.target === 'enseignant' ? 'Enseignants' : 
                message.target === 'etudiant' ? 'Étudiants' : 
                message.target === 'parent' ? 'Parents' : message.target}
            </div>
          </div>
        ))
      )}
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default AdminDashboard;

