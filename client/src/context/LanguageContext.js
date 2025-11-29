import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

const translations = {
    en: {
        welcome: "Welcome",
        dashboard: "Dashboard",
        employees: "Employees",
        payroll: "Payroll",
        settings: "Settings",
        logout: "Logout",
        search: "Search...",
        language: "Language"
    },
    es: {
        welcome: "Bienvenido",
        dashboard: "Tablero",
        employees: "Empleados",
        payroll: "Nómina",
        settings: "Configuración",
        logout: "Cerrar Sesión",
        search: "Buscar...",
        language: "Idioma"
    },
    fr: {
        welcome: "Bienvenue",
        dashboard: "Tableau de bord",
        employees: "Employés",
        payroll: "Paie",
        settings: "Paramètres",
        logout: "Déconnexion",
        search: "Chercher...",
        language: "Langue"
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    const t = (key) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
