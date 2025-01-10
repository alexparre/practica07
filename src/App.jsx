import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import './App.css';

const translations = {
  en: {
    home: "Home",
    worldNews: "World News",
    sport: "Sport",
    finance: "Finance",
    technology: "Technology",
    entertainment: "Entertainment",
  },
  es: {
    home: "Inicio",
    worldNews: "Noticias del Mundo",
    sport: "Deportes",
    finance: "Finanzas",
    technology: "Tecnología",
    entertainment: "Entretenimiento",
  },
  fr: {
    home: "Accueil",
    worldNews: "Actualités Mondiales",
    sport: "Sport",
    finance: "Finance",
    technology: "Technologie",
    entertainment: "Divertissement",
  },
};

const AuthContext = createContext();
const LangContext = createContext();

function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('user'));

  const login = (username, password) => {
    const storedUsername = 'admin';
    const storedPassword = 'password123';

    if (username === storedUsername && password === storedPassword) {
      localStorage.setItem('user', username);
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function LangProvider({ children }) {
  const [language, setLanguage] = useState('es');

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  return (
    <LangContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LangContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

function useLang() {
  return useContext(LangContext);
}

function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <BrowserRouter>
          <header>
            <div className="logo-container">
              <img src="logo.jpg" alt="Website Logo" className="logo" />
            </div>
            <nav>
              <NavigationLinks />
              <SearchComponent />
              <ProfileComponent />
              <LanguageSelector />

            </nav>
          </header>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/news/:id" element={<Article />} />
            <Route path="/:category" element={<Category />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LangProvider>
  );
}
function LanguageSelector() {
  const { language, changeLanguage } = useLang();

  return (
    <div className="language-selector">
      <select value={language} onChange={(e) => changeLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
      </select>
    </div>
  );
}

function NavigationLinks() {
  const { language } = useLang();

  return (
    <>
      <Link to="/">{translations[language]?.home || "Home"}</Link>
      <Link to="/World%20News">{translations[language]?.worldNews || "World News"}</Link>
      <Link to="/Sport">{translations[language]?.sport || "Sport"}</Link>
      <Link to="/Finance">{translations[language]?.finance || "Finance"}</Link>
      <Link to="/Technology">{translations[language]?.technology || "Technology"}</Link>
      <Link to="/Entertainment">{translations[language]?.entertainment || "Entertainment"}</Link>
    </>
  );
}

function SearchComponent() {
  const { language } = useLang();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }

    fetch('https://news-foniuhqsba-uc.a.run.app/')
      .then(res => res.json())
      .then(data => {
        const filteredResults = data.filter(article =>
          article.translations[language]?.headline.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(filteredResults);
      });
  }, [searchTerm, language]);

  const closeDialog = () => {
    document.querySelector('dialog').close();
  };

  return (
    <div className="search-container">
      <button className="dialog-search" onClick={() => document.querySelector('dialog').showModal()}>🔍</button>
      <dialog>
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            id="site-search"
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="close-btn" type="button" onClick={closeDialog}>Close</button>
        </form>
        <ul id="search-results">
          {searchResults.map(article => (
            <li key={article.id} onClick={closeDialog}>
              <Link to={`/news/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card">
                  <img className="item-image" src={article.image_url} alt={article.translations[language]?.headline || article.headline} />
                  <h3 className="item-title">{article.translations[language]?.headline || article.headline}</h3>
                  <time dateTime={article.date}>{new Date(article.date).toLocaleDateString()}</time>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </dialog>
    </div>
  );
}

function ProfileComponent() {
  const { isLoggedIn, login, logout } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    if (login(username, password)) {
      setShowLoginDialog(false);
    } else {
      alert('Usuario o contraseña incorrectos.');
    }
  };

  return (
    <div className="profile-container">
      {isLoggedIn ? (
        <button className="logout-btn" onClick={logout}>
          Cerrar sesión
        </button>
      ) : (
        <button className="login-btn" onClick={() => setShowLoginDialog(true)}>
          Iniciar sesión
        </button>
      )}

      {showLoginDialog && (
        <dialog open>
          <form onSubmit={handleLogin}>
            <h2>Iniciar sesión</h2>
            <input type="text" name="username" placeholder="Usuario" required />
            <input type="password" name="password" placeholder="Contraseña" required />
            <button type="submit">Ingresar</button>
            <button type="button" className="close-btn" onClick={() => setShowLoginDialog(false)}>
              Cancelar
            </button>
          </form>
        </dialog>
      )}
    </div>
  );
}

function Home() {
  const { language } = useLang();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetch('https://news-foniuhqsba-uc.a.run.app/')
      .then(res => res.json())
      .then(data => setArticles(data.slice(0, 9)));
  }, []);

  return (
    <div className="news-grid">
      {articles.map(article => (
        <div key={article.id} className="news-card">
          <img src={article.image_url} alt={article.headline} />
          <Link to={`/news/${article.id}`}>
            <h2>{article.translations[language]?.headline || article.headline}</h2>
            <p>{article.translations[language]?.abstract || article.abstract}</p>
            <time dateTime={article.date}>{new Date(article.date).toLocaleDateString()}</time>
          </Link>
        </div>
      ))}
    </div>
  );
}

function Article() {
  const { id } = useParams();
  const { language } = useLang();
  const { isLoggedIn } = useAuth();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    fetch(`https://news-foniuhqsba-uc.a.run.app/news/${id}`)
      .then(res => res.json())
      .then(data => setArticle(data));
  }, [id]);

  if (!article) return <p>Loading...</p>;

  const { headline, abstract, body, date, author, translations } = article;
  const localizedHeadline = translations[language]?.headline || headline;
  const localizedBody = translations[language]?.body || body;

  return (
    <custom-article>
      <article>
        <img src={article.image_url} alt={localizedHeadline} />
        <h1>{localizedHeadline}</h1>
        <p><strong>Autor: </strong> {author}</p>
        <time dateTime={date}><strong>Publicado en: </strong> {new Date(date).toLocaleDateString()}</time>
        {isLoggedIn ? (
          <div dangerouslySetInnerHTML={{ __html: localizedBody }}></div>
        ) : (
          <div>
            <p>{(translations[language]?.abstract || abstract).slice(0, 100)}...</p>
            <h3><strong>(Inicia sesión para ver el contenido completo del artículo)</strong></h3>
          </div>
        )}
      </article>
    </custom-article>
  );
}

function Category() {
  const { language } = useLang();
  const { category } = useParams();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetch(`https://news-foniuhqsba-uc.a.run.app/${category}`)
      .then(res => res.json())
      .then(data => setArticles(data));
  }, [category]);

  if (!articles.length) return <p>Loading...</p>;

  return (
    <div className="news-grid">
      {articles.map(article => (
        <div key={article.id} className="news-card">
          <Link to={`/news/${article.id}`}>
            <img src={article.image_url} alt={article.headline} />
            <h2>{article.translations[language]?.headline || article.headline}</h2>
            <p>{article.translations[language]?.abstract || article.abstract}</p>
            <time dateTime={article.date}>{new Date(article.date).toLocaleDateString()}</time>
          </Link>
        </div>
      ))}
    </div>
  );
}

export default App;
