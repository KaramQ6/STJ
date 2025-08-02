import { useState, useEffect } from 'react';
import translations from '../data/translations';

const useTranslation = (language) => {
    const [t, setT] = useState(() => translations[language] || translations['en']);

    useEffect(() => {
        setT(translations[language] || translations['en']);
    }, [language]);

    return t;
};

export default useTranslation;