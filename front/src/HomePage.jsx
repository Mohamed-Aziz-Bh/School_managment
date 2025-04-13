import React from 'react';
import { Link } from 'react-router-dom';
import './styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <header className="hero">
        <div className="overlay"></div>
        <div className="hero-content">
          <h1>Bienvenue à l'École Excellence</h1>
          <p>Une éducation de qualité pour un avenir brillant</p>
          <div className="cta-buttons">
            <Link to="/login" className="btn btn-primary">Connexion</Link>
            <Link to="/register" className="btn btn-secondary">Inscription</Link>
          </div>
        </div>
      </header>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Nos Services</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Gestion des Cours</h3>
              <p>Accédez facilement à tous vos cours et matériels pédagogiques en ligne.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Emplois du Temps</h3>
              <p>Consultez votre emploi du temps personnalisé et recevez des notifications de changements.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Suivi des Notes</h3>
              <p>Suivez vos performances académiques et votre progression tout au long de l'année.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Communication</h3>
              <p>Échangez facilement avec les enseignants, les élèves et l'administration.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2 className="section-title">À Propos de Notre École</h2>
              <p>L'École Excellence est dédiée à fournir une éducation de qualité supérieure dans un environnement stimulant et bienveillant. Notre mission est de préparer les élèves à réussir dans un monde en constante évolution.</p>
              <p>Avec des enseignants qualifiés et des programmes éducatifs innovants, nous nous engageons à développer le plein potentiel de chaque élève.</p>
              <Link to="/about" className="btn btn-outline">En savoir plus</Link>
            </div>
            <div className="about-image">
              <img src="/images/school-building.jpg" alt="École Excellence" />
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials">
        <div className="container">
          <h2 className="section-title">Ce que disent nos élèves et parents</h2>
          <div className="testimonial-slider">
            <div className="testimonial">
              <div className="testimonial-content">
                <p>"L'École Excellence a transformé l'expérience d'apprentissage de mon enfant. Les enseignants sont attentionnés et la plateforme en ligne facilite grandement le suivi de ses progrès."</p>
                <div className="testimonial-author">
                  <span className="name">Marie Dupont</span>
                  <span className="role">Parent d'élève</span>
                </div>
              </div>
            </div>
            <div className="testimonial">
              <div className="testimonial-content">
                <p>"Grâce à la plateforme en ligne, je peux facilement accéder à mes cours et communiquer avec mes professeurs. Cela a vraiment amélioré mon organisation et mes résultats."</p>
                <div className="testimonial-author">
                  <span className="name">Thomas Martin</span>
                  <span className="role">Élève en Terminale</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="news">
        <div className="container">
          <h2 className="section-title">Actualités</h2>
          <div className="news-grid">
            <div className="news-card">
              <div className="news-image">
                <img src="/images/news1.jpg" alt="Événement sportif" />
              </div>
              <div className="news-content">
                <h3>Tournoi sportif inter-écoles</h3>
                <p className="news-date">15 Mai 2023</p>
                <p>Notre école participera au grand tournoi sportif inter-écoles qui se tiendra le mois prochain.</p>
                <a href="#" className="read-more">Lire la suite</a>
              </div>
            </div>
            <div className="news-card">
              <div className="news-image">
                <img src="/images/news2.jpg" alt="Conférence scientifique" />
              </div>
              <div className="news-content">
                <h3>Conférence scientifique</h3>
                <p className="news-date">3 Juin 2023</p>
                <p>Des scientifiques renommés viendront présenter leurs travaux à nos élèves lors d'une conférence exceptionnelle.</p>
                <a href="#" className="read-more">Lire la suite</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <h2>École Excellence</h2>
              <p>Une éducation de qualité pour un avenir brillant</p>
            </div>
            <div className="footer-links">
              <h3>Liens Rapides</h3>
              <ul>
                <li><Link to="/">Accueil</Link></li>
                <li><Link to="/about">À propos</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/login">Connexion</Link></li>
                <li><Link to="/register">Inscription</Link></li>
              </ul>
            </div>
            <div className="footer-contact">
              <h3>Contact</h3>
              <p><i className="icon-location"></i> 123 Rue de l'Éducation, 75000 Paris</p>
              <p><i className="icon-phone"></i> +33 1 23 45 67 89</p>
              <p><i className="icon-email"></i> contact@ecole-excellence.fr</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2023 École Excellence. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
